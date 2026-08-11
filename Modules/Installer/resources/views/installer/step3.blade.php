@extends('installer::installer.layout')

@section('content')
<div class="installer-card">
    @include('installer::installer.partials.steps', ['current' => 3])

    <div class="step-description">Configure your application and database settings.</div>

    @if($errors->any())
        <div class="alert-error">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="{{ route('installer.environment.post') }}">
        @csrf

        <div class="form-group">
            <label>App Name <span class="required">*</span></label>
            <input type="text" name="APP_NAME" value="{{ old('APP_NAME', $envData['APP_NAME']) }}" required>
        </div>

        <div class="form-group">
            <label>App URL <span class="required">*</span></label>
            <input type="url" name="APP_URL" value="{{ old('APP_URL', $envData['APP_URL']) }}" required>
        </div>

        <div class="form-group">
            <label>Database Host <span class="required">*</span></label>
            <input type="text" name="DB_HOST" value="{{ old('DB_HOST', $envData['DB_HOST']) }}" required>
        </div>

        <div class="form-group">
            <label>Database Port <span class="required">*</span></label>
            <input type="number" name="DB_PORT" value="{{ old('DB_PORT', $envData['DB_PORT']) }}" required>
        </div>

        <div class="form-group">
            <label>Database Name <span class="required">*</span></label>
            <input type="text" name="DB_DATABASE" value="{{ old('DB_DATABASE', $envData['DB_DATABASE']) }}" required>
        </div>

        <div class="form-group">
            <label>Database Username <span class="required">*</span></label>
            <input type="text" name="DB_USERNAME" value="{{ old('DB_USERNAME', $envData['DB_USERNAME']) }}" required>
        </div>

        <div class="form-group">
            <label>Database Password</label>
            <input type="password" name="DB_PASSWORD" value="{{ old('DB_PASSWORD', $envData['DB_PASSWORD']) }}">
        </div>

        <div class="actions">
            <div></div>
            <button type="submit" class="btn btn-primary">Next</button>
        </div>
    </form>
</div>
@endsection
