@extends('installer::installer.layout')

@section('content')
<div class="installer-card">
    @include('installer::installer.partials.steps', ['current' => 4])

    <div class="step-description">Create your admin account and complete the installation.</div>

    @if($errors->any())
        <div class="alert-error">{{ $errors->first() }}</div>
    @endif

    <form method="POST" action="{{ route('installer.admin.post') }}" id="installForm">
        @csrf

        <div class="form-group">
            <label>Admin Name <span class="required">*</span></label>
            <input type="text" name="name" value="{{ old('name') }}" required>
        </div>

        <div class="form-group">
            <label>Admin Email <span class="required">*</span></label>
            <input type="email" name="email" value="{{ old('email') }}" required>
        </div>

        <div class="form-group">
            <label>Admin Password <span class="required">*</span></label>
            <input type="password" name="password" required minlength="8">
        </div>

        <div class="form-group">
            <label>Confirm Password <span class="required">*</span></label>
            <input type="password" name="password_confirmation" required minlength="8">
        </div>

        <div class="actions">
            <div></div>
            <button type="submit" class="btn btn-success" id="installBtn">&#10024; Install</button>
        </div>
    </form>
</div>

<script>
document.getElementById('installForm').addEventListener('submit', function() {
    var btn = document.getElementById('installBtn');
    btn.disabled = true;
    btn.textContent = 'Installing...';
});
</script>
@endsection
