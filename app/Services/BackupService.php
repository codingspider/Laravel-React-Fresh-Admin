<?php

namespace App\Services;

use App\Models\DatabaseBackup;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use PDO;
use Throwable;

/**
 * Creates, restores, lists and removes database backups.
 *
 * The implementation is pure PHP (PDO) so it works on any shared host
 * without requiring shell access or external binaries such as mysqldump.
 */
class BackupService
{
    protected ?PDO $pdo = null;

    /**
     * Paginated backup list.
     *
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = DatabaseBackup::query();

        $query->when(!empty($filters['search']), function ($q) use ($filters) {
            $q->where('filename', 'like', "%{$filters['search']}%");
        });

        return $query->with('creator:id,name')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a full database dump and persist a backup record.
     *
     * @throws Throwable
     */
    public function create(?User $user = null, string $type = 'manual'): DatabaseBackup
    {
        $filename = $this->buildFilename();
        $folder = (string) config('backup.folder', 'backups');
        $path = $folder . '/' . $filename;
        $fullPath = Storage::disk((string) config('backup.disk', 'local'))->path($path);

        File::ensureDirectoryExists(dirname($fullPath));

        $backup = DatabaseBackup::create([
            'filename' => $filename,
            'path' => $path,
            'size' => 0,
            'status' => 'running',
            'type' => $type,
            'created_by' => $user?->id,
        ]);

        try {
            $this->writeDump($fullPath);

            $backup->update([
                'status' => 'completed',
                'size' => File::size($fullPath),
            ]);
        } catch (Throwable $e) {
            File::delete($fullPath);
            $backup->update(['status' => 'failed']);
            throw $e;
        }

        return $backup->fresh();
    }

    /**
     * Restore the database from a stored backup file.
     *
     * @throws Throwable
     */
    public function restore(DatabaseBackup $backup): void
    {
        $fullPath = $this->fullPath($backup);

        if (!File::exists($fullPath)) {
            throw new \RuntimeException(trans('message.backup_file_missing'));
        }

        $this->executeDump((string) File::get($fullPath));

        $backup->update(['restored_at' => now()]);
    }

    /**
     * Restore the database from an uploaded SQL file.
     *
     * @throws Throwable
     */
    public function restoreFromUpload(UploadedFile $file): void
    {
        $this->validateUpload($file);

        $this->executeDump((string) $file->get());
    }

    /**
     * Delete a backup file and its record.
     */
    public function destroy(DatabaseBackup $backup): void
    {
        File::delete($this->fullPath($backup));

        $backup->delete();
    }

    /**
     * Resolve the absolute path of a stored backup file.
     */
    public function fullPath(DatabaseBackup $backup): string
    {
        return Storage::disk((string) config('backup.disk', 'local'))->path($backup->path);
    }

    /**
     * Stream a full dump of the current database to the given file.
     */
    protected function writeDump(string $fullPath): void
    {
        $pdo = $this->pdo();
        $handle = fopen($fullPath, 'w');

        if ($handle === false) {
            throw new \RuntimeException('Unable to open backup file for writing.');
        }

        fwrite($handle, "-- Restaurant Database Backup\n");
        fwrite($handle, '-- Generated: ' . now()->toDateTimeString() . "\n");
        fwrite($handle, "-- Database: " . (string) $pdo->query('SELECT DATABASE()')->fetchColumn() . "\n\n");
        fwrite($handle, "SET FOREIGN_KEY_CHECKS=0;\n");
        fwrite($handle, "SET NAMES utf8mb4;\n\n");

        foreach ($this->tables($pdo) as $table) {
            fwrite($handle, "DROP TABLE IF EXISTS `{$table}`;\n");
            fwrite($handle, $this->createStatement($pdo, $table) . ";\n\n");

            $rows = $pdo->query("SELECT * FROM `{$table}`");
            $rows->setFetchMode(PDO::FETCH_ASSOC);

            $first = true;
            foreach ($rows as $row) {
                if ($first) {
                    $columns = array_map(static fn ($column) => "`{$column}`", array_keys($row));
                    fwrite($handle, "INSERT INTO `{$table}` (" . implode(', ', $columns) . ") VALUES\n");
                    $first = false;
                } else {
                    fwrite($handle, ",\n");
                }

                $values = array_map(fn ($value) => $this->quoteValue($value), array_values($row));
                fwrite($handle, '(' . implode(', ', $values) . ')');
            }

            if (!$first) {
                fwrite($handle, ";\n\n");
            }
        }

        fwrite($handle, "SET FOREIGN_KEY_CHECKS=1;\n");

        fclose($handle);
    }

    /**
     * Execute the statements of a SQL dump file.
     */
    protected function executeDump(string $sql): void
    {
        $pdo = $this->pdo();
        $pdo->exec('SET FOREIGN_KEY_CHECKS=0');

        try {
            foreach ($this->splitSql($sql) as $statement) {
                $statement = trim($statement);
                if ($statement === '') {
                    continue;
                }
                $pdo->exec($statement);
            }
        } finally {
            $pdo->exec('SET FOREIGN_KEY_CHECKS=1');
        }
    }

    /**
     * Split a SQL dump into individual statements, respecting quoted strings,
     * backtick identifiers and comments.
     *
     * @return string[]
     */
    public function splitSql(string $sql): array
    {
        $statements = [];
        $current = '';
        $length = strlen($sql);
        $i = 0;

        while ($i < $length) {
            $char = $sql[$i];

            // -- line comment
            if ($char === '-' && substr($sql, $i, 2) === '--') {
                $newline = strpos($sql, "\n", $i);
                $i = $newline === false ? $length : $newline + 1;
                continue;
            }

            // /* block comment */ — keep executable /*! ... */ comments
            if ($char === '/' && substr($sql, $i, 2) === '/*') {
                $isExecutable = ($sql[$i + 2] ?? '') === '!';
                $end = strpos($sql, '*/', $i + 2);

                if ($isExecutable && $end !== false) {
                    $current .= substr($sql, $i, $end + 2 - $i);
                    $i = $end + 2;
                    continue;
                }

                $i = $end === false ? $length : $end + 2;
                continue;
            }

            // Quoted string or backtick identifier
            if ($char === "'" || $char === '"' || $char === '`') {
                $current .= $this->consumeQuoted($sql, $i, $char);
                continue;
            }

            // Statement terminator
            if ($char === ';') {
                $statements[] = trim($current . ';');
                $current = '';
                $i++;
                continue;
            }

            $current .= $char;
            $i++;
        }

        if (trim($current) !== '') {
            $statements[] = trim($current);
        }

        return $statements;
    }

    /**
     * Consume a quoted/backticked segment starting at $start and advance $start
     * past the closing delimiter. Handles backslash escapes and doubled
     * delimiters ('' and ``).
     */
    protected function consumeQuoted(string $sql, int &$start, string $delimiter): string
    {
        $length = strlen($sql);
        $out = $delimiter;
        $i = $start + 1;

        while ($i < $length) {
            $char = $sql[$i];

            if ($char === '\\' && $delimiter !== '`' && $i + 1 < $length) {
                $out .= $char . $sql[$i + 1];
                $i += 2;
                continue;
            }

            if ($char === $delimiter) {
                if (($sql[$i + 1] ?? '') === $delimiter) {
                    $out .= $char . $char;
                    $i += 2;
                    continue;
                }

                $out .= $char;
                $start = $i + 1;
                return $out;
            }

            $out .= $char;
            $i++;
        }

        $start = $length;
        return $out;
    }

    /**
     * @return string[]
     */
    protected function tables(PDO $pdo): array
    {
        return $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
            ->fetchAll(PDO::FETCH_COLUMN);
    }

    protected function createStatement(PDO $pdo, string $table): string
    {
        $row = $pdo->query("SHOW CREATE TABLE `{$table}`")->fetch(PDO::FETCH_ASSOC);

        return (string) ($row['Create Table'] ?? '');
    }

    /**
     * Quote a value for a SQL dump. Strings that are not plain ASCII are
     * hex-encoded to preserve binary and multi-byte data safely.
     */
    protected function quoteValue($value): string
    {
        if ($value === null) {
            return 'NULL';
        }

        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        $value = (string) $value;

        if ($value === '') {
            return "''";
        }

        if (preg_match('/^[\x09\x0A\x0D\x20-\x7E]+$/', $value) !== 1) {
            return '0x' . bin2hex($value);
        }

        return "'" . str_replace(['\\', "'"], ['\\\\', "''"], $value) . "'";
    }

    protected function pdo(): PDO
    {
        return $this->pdo ??= DB::connection()->getPdo();
    }

    /**
     * Generate a unique backup filename.
     */
    protected function buildFilename(): string
    {
        $base = (string) config('backup.prefix', 'database-backup') . '-' . now()->format('Y-m-d-His');
        $filename = $base . '.sql';
        $counter = 1;

        while (DatabaseBackup::where('filename', $filename)->exists()) {
            $filename = $base . '-' . $counter++ . '.sql';
        }

        return $filename;
    }

    protected function validateUpload(UploadedFile $file): void
    {
        if (strtolower((string) $file->getClientOriginalExtension()) !== 'sql') {
            throw new \InvalidArgumentException(trans('message.backup_invalid_file'));
        }

        $handle = $file->openFile('r');
        $head = $handle->fread(512);

        if ($head !== false && str_contains($head, "\x00")) {
            throw new \InvalidArgumentException(trans('message.backup_invalid_file'));
        }
    }
}
