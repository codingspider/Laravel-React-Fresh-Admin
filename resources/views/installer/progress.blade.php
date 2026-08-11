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
        .spinner { width: 60px; height: 60px; border: 4px solid var(--accent); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .status-text { font-size: 1.1em; margin-bottom: 10px; }
        .error-msg { background: rgba(248,113,113,0.2); color: #f87171; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: left; white-space: pre-wrap; }
        .btn { display: inline-block; padding: 12px 24px; background: var(--primary); color: #fff; text-decoration: none; border-radius: 6px; border: none; cursor: pointer; font-size: 1em; transition: background 0.2s; }
        .btn:hover { background: #009688; }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Installing...</h1>
            <div class="spinner"></div>
            <p class="status-text">Running database migrations and seeding...</p>
            <p id="error-message" style="display:none;" class="error-msg"></p>
        </div>
    </div>

    <script>
    let installationStarted = false;

    const startInstallation = () => {
        if (installationStarted) {
            return;
        }

        installationStarted = true;

        fetch('{{ route('installer.start') }}', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': '{{ csrf_token() }}',
                'Accept': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Installation started:', data);

                checkProgress();
            })
            .catch(error => {
                console.error('Failed to start installation:', error);
                installationStarted = false;
            });
    };

    const checkProgress = () => {
        fetch('{{ route('installer.progress.check') }}', {
            cache: 'no-store',
            headers: {
                'Accept': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Installation status:', data);

                if (data.status === 'completed') {
                    window.location.href = '{{ route('installer.admin') }}';
                    return;
                }

                if (data.status === 'error') {
                    document.querySelector('h1').textContent = 'Installation Failed';

                    const errorEl = document.getElementById('error-message');

                    errorEl.style.display = 'block';
                    errorEl.textContent = data.message;

                    return;
                }

                setTimeout(checkProgress, 2000);
            })
            .catch(error => {
                console.error(error);
                setTimeout(checkProgress, 2000);
            });
    };

    // Progress page is already loaded.
    // Now start the installation.
    startInstallation();
</script>
</body>
</html>
