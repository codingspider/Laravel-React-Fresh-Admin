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
        .card { background: var(--card-bg); border-radius: 12px; padding: 30px; margin-bottom: 20px; border: 1px solid var(--border); text-align: center; }
        h1 { color: var(--primary); margin-bottom: 20px; font-size: 1.8em; }
        .btn { display: inline-block; padding: 12px 24px; background: var(--primary); color: #fff; text-decoration: none; border-radius: 6px; border: none; cursor: pointer; font-size: 1em; transition: background 0.2s; }
        .btn:hover { background: #009688; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Installation Complete!</h1>
            <p style="margin-bottom: 20px;">Your application has been installed successfully.</p>
            <p style="margin-bottom: 20px;">You can now access the admin panel and start using the application.</p>
            <a href="/" class="btn">Go to Application</a>
        </div>
    </div>
</body>
</html>
