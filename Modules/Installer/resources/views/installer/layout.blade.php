<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Web Installer</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f0fafb;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 20px;
            color: #333;
        }

        h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 30px;
            color: #0d9488;
        }

        .installer-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(13, 148, 136, 0.08);
            border: 1px solid #e0f2f1;
            max-width: 700px;
            width: 100%;
            padding: 30px;
        }

        .steps {
            display: flex;
            margin-bottom: 30px;
            border-bottom: 1px solid #e0f2f1;
            padding-bottom: 20px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        .step {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 0;
        }

        .step-number {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            border: 2px solid #cbd5e1;
            color: #94a3b8;
            margin-right: 10px;
            flex-shrink: 0;
            transition: all 0.2s;
        }

        .step.active .step-number {
            border-color: #0d9488;
            color: #0d9488;
        }

        .step.completed .step-number {
            background: #0d9488;
            border-color: #0d9488;
            color: #fff;
        }

        .step-label {
            font-size: 13px;
            color: #94a3b8;
            font-weight: 500;
        }

        .step.active .step-label {
            color: #0d9488;
            font-weight: 600;
        }

        .step.completed .step-label {
            color: #0d9488;
        }

        .step-connector {
            flex: 0;
            width: 30px;
            height: 1px;
            background: #e2e8f0;
            margin: 0 5px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 6px;
            color: #334155;
        }

        .form-group label .required {
            color: #ef4444;
            margin-left: 2px;
        }

        .form-group input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #0d9488;
            box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
        }

        .list-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border: 1px solid #e0f2f1;
            border-radius: 8px;
            margin-bottom: 10px;
            background: #f8fffe;
        }

        .list-item-name {
            font-size: 14px;
            color: #334155;
            font-weight: 500;
        }

        .list-item-status {
            font-size: 13px;
            color: #94a3b8;
        }

        .list-item.ok .list-item-status {
            color: #0d9488;
        }

        .list-item.fail .list-item-status {
            color: #ef4444;
        }

        .btn {
            padding: 10px 28px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }

        .btn-primary {
            background: #0d9488;
            color: #fff;
        }

        .btn-primary:hover {
            background: #0f766e;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }

        .btn-primary:disabled {
            background: #94a3b8;
            cursor: not-allowed;
            box-shadow: none;
        }

        .btn-success {
            background: #0d9488;
            color: #fff;
        }

        .btn-success:hover {
            background: #0f766e;
            box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
        }

        .actions {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }

        .alert-error {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .check-icon {
            color: #0d9488;
            font-size: 18px;
        }

        .cross-icon {
            color: #ef4444;
            font-size: 18px;
        }

        .complete-card {
            text-align: center;
            padding: 40px;
        }

        .complete-card .success-icon {
            width: 80px;
            height: 80px;
            background: #0d9488;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            color: #fff;
            margin-bottom: 20px;
        }

        .complete-card h2 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #0d9488;
        }

        .complete-card p {
            color: #64748b;
            margin-bottom: 30px;
        }

        .step-description {
            margin-bottom: 15px;
            color: #64748b;
            font-size: 14px;
        }

        @media (max-width: 640px) {
            body {
                padding: 20px 12px;
            }

            h1 {
                font-size: 22px;
                margin-bottom: 20px;
            }

            .installer-card {
                padding: 20px 16px;
                border-radius: 8px;
            }

            .steps {
                flex-wrap: nowrap;
                padding-bottom: 15px;
                margin-bottom: 20px;
                gap: 0;
            }

            .step {
                flex: 0 0 auto;
                min-width: auto;
            }

            .step-number {
                width: 32px;
                height: 32px;
                font-size: 12px;
                margin-right: 6px;
            }

            .step-label {
                font-size: 11px;
                white-space: nowrap;
            }

            .step-connector {
                width: 16px;
                margin: 0 2px;
            }

            .list-item {
                padding: 12px 14px;
            }

            .list-item-name {
                font-size: 13px;
            }

            .list-item-status {
                font-size: 12px;
            }

            .form-group input {
                padding: 9px 12px;
                font-size: 13px;
            }

            .btn {
                padding: 9px 20px;
                font-size: 13px;
            }

            .complete-card {
                padding: 30px 10px;
            }

            .complete-card .success-icon {
                width: 64px;
                height: 64px;
                font-size: 32px;
            }

            .complete-card h2 {
                font-size: 20px;
            }
        }

        @media (max-width: 400px) {
            .steps {
                flex-wrap: wrap;
                gap: 8px;
                border-bottom: none;
                padding-bottom: 0;
            }

            .step-connector {
                display: none;
            }

            .step {
                flex: 0 0 calc(50% - 4px);
            }

            .step-number {
                width: 28px;
                height: 28px;
                font-size: 11px;
                margin-right: 6px;
            }

            .step-label {
                font-size: 10px;
            }
        }
    </style>
</head>

<body>
    <h1>Web Installer</h1>
    @yield('content')
</body>

</html>
