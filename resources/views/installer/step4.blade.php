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
        .progress-bar { height: 8px; background: var(--accent); border-radius: 4px; margin-bottom: 20px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--primary); width: 100%; transition: width 0.3s; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; color: #a0a0a0; }
        input[type="text"], input[type="email"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--accent); color: var(--text); }
        .btn { display: inline-block; padding: 12px 24px; background: var(--primary); color: #fff; text-decoration: none; border-radius: 6px; border: none; cursor: pointer; font-size: 1em; transition: background 0.2s; }
        .btn:hover { background: #009688; }
        .btn-block { display: block; width: 100%; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Create Admin Account</h1>
            <div class="progress-bar"><div class="progress-fill"></div></div>
            <form method="POST" action="{{ route('installer.admin.post') }}">
                @csrf
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" name="name" id="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" name="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <input type="password" name="password_confirmation" id="password_confirmation" required>
                </div>
                @if($errors->any())
                    <div style="background:rgba(248,113,113,0.2);color:#f87171;padding:10px;border-radius:6px;margin-top:10px;">{{ $errors->first('error') ?: $errors->first() }}</div>
                @endif
                <button type="submit" class="btn btn-block">Install Now</button>
            </form>
        </div>
    </div>
</body>
</html>
