<?php

namespace Tests\Unit;

use App\Services\BackupService;
use PHPUnit\Framework\TestCase;

class BackupServiceSplitTest extends TestCase
{
    protected BackupService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new BackupService();
    }

    public function test_splits_simple_statements(): void
    {
        $statements = $this->service->splitSql("SELECT 1;\nSELECT 2;");

        $this->assertSame(['SELECT 1;', 'SELECT 2;'], $statements);
    }

    public function test_semicolon_inside_single_quotes_is_not_a_delimiter(): void
    {
        $statements = $this->service->splitSql("INSERT INTO t VALUES ('a;b');");

        $this->assertCount(1, $statements);
        $this->assertSame("INSERT INTO t VALUES ('a;b');", $statements[0]);
    }

    public function test_doubled_single_quotes_are_respected(): void
    {
        $statements = $this->service->splitSql("INSERT INTO t VALUES ('it''s; fine');");

        $this->assertCount(1, $statements);
        $this->assertSame("INSERT INTO t VALUES ('it''s; fine');", $statements[0]);
    }

    public function test_backslash_escaped_quote_is_respected(): void
    {
        $statements = $this->service->splitSql("INSERT INTO t VALUES ('a\\';b');");

        $this->assertCount(1, $statements);
        $this->assertSame("INSERT INTO t VALUES ('a\\';b');", $statements[0]);
    }

    public function test_backtick_identifiers_are_respected(): void
    {
        $statements = $this->service->splitSql("SELECT `a;b`, `c``d` FROM t;");

        $this->assertCount(1, $statements);
        $this->assertSame("SELECT `a;b`, `c``d` FROM t;", $statements[0]);
    }

    public function test_line_comments_are_removed(): void
    {
        $statements = $this->service->splitSql("SELECT 1; -- note; here\nSELECT 2;");

        $this->assertSame(['SELECT 1;', 'SELECT 2;'], $statements);
    }

    public function test_block_comments_are_removed(): void
    {
        $statements = $this->service->splitSql("SELECT /* keep ; this */ 1;");

        $this->assertCount(1, $statements);
        $this->assertSame('SELECT  1;', $statements[0]);
    }

    public function test_executable_comments_are_preserved(): void
    {
        $statements = $this->service->splitSql("/*!40101 SET NAMES utf8 */;");

        $this->assertSame(['/*!40101 SET NAMES utf8 */;'], $statements);
    }

    public function test_dump_footer_roundtrip(): void
    {
        $sql = "-- Restaurant Database Backup\nSET FOREIGN_KEY_CHECKS=0;\nCREATE TABLE `users` (\n  `id` bigint unsigned NOT NULL AUTO_INCREMENT,\n  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL\n) ENGINE=InnoDB;\nINSERT INTO `users` (`id`, `name`) VALUES\n(1, 'Alice'),\n(2, 'Bob; O''Brien');\nSET FOREIGN_KEY_CHECKS=1;\n";

        $statements = $this->service->splitSql($sql);

        $this->assertCount(4, $statements);
        $this->assertSame('SET FOREIGN_KEY_CHECKS=0;', $statements[0]);
        $this->assertSame('SET FOREIGN_KEY_CHECKS=1;', $statements[3]);
    }

    public function test_hex_literals_are_treated_as_part_of_statement(): void
    {
        $statements = $this->service->splitSql("INSERT INTO t (`data`) VALUES (0x3b3b3b);");

        $this->assertCount(1, $statements);
        $this->assertSame('INSERT INTO t (`data`) VALUES (0x3b3b3b);', $statements[0]);
    }
}
