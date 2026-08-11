<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restaurant POS - Installer</title>
    <style>
        :root {
            --bg: #1a1a2e;
            --card-bg: #16213e;
            --text: #e0e0e0;
            --accent: #0f3460;
            --primary: #00adb5;
            --border: #0f3460;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { max-width: 800px; width: 100%; margin: 0 auto; padding: 20px; }
        .card { background: var(--card-bg); border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid var(--border); }
        h1 { color: var(--primary); margin-bottom: 20px; font-size: 1.8em; }
        h2 { color: var(--primary); margin-bottom: 15px; font-size: 1.2em; }
        .section { margin-bottom: 25px; }
        .section:last-child { margin-bottom: 0; }
        .checks { list-style: none; }
        .checks li { padding: 10px; margin-bottom: 8px; background: var(--accent); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .status-ok { color: #4ade80; font-weight: bold; }
        .status-fail { color: #f87171; font-weight: bold; }
        .btn { display: inline-block; padding: 12px 24px; background: var(--primary); color: #fff; text-decoration: none; border-radius: 6px; border: none; cursor: pointer; font-size: 1em; transition: background 0.2s; }
        .btn:hover { background: #009688; }
        .btn-block { display: block; width: 10%; margin: 0 auto; }
        .progress-bar { height: 8px; background: var(--accent); border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); width: 50%; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Folder Permissions</h1>
            <div class="progress-bar"><div class="progress-fill"></div></div>
            <div class="section">
                <h2>Writable Directories</h2>
                <ul class="checks">
                    @foreach($dirs as $dir => $ok)
                        <li>{{ $dir }} <span class="status-{{ $ok ? 'ok' : 'fail' }}">{{ $ok ? 'OK' : 'FAIL' }}</span></li>
                    @endforeach
                </ul>
            </div>
            <form method="POST" action="{{ route('installer.permissions.post') }}">
                @csrf
                <button type="submit" class="btn btn-block">Next &raquo;</button>
            </form>
        </div>
    </div>
</body>
</html>
