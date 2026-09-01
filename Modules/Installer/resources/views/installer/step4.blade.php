@extends('installer::installer.layout')

@section('content')
    <div class="installer-card">
        @include('installer::installer.partials.steps', ['current' => 4])

        <div class="step-description">Create admin account, restaurant owner, and complete the installation.</div>

        @if ($errors->any())
            <div class="alert-error">{{ $errors->first() }}</div>
        @endif

        <form method="POST" action="{{ route('installer.admin.post') }}" id="installForm">
            @csrf

            {{-- Super Admin Section --}}
            <div
                style="margin-bottom: 8px; font-size: 15px; font-weight: 600; color: #0d9488; border-bottom: 1px solid #e0f2f1; padding-bottom: 6px;">
                Super Admin</div>

            <div class="form-group">
                <label>Name <span class="required">*</span></label>
                <input type="text" name="name" value="{{ old('name') }}" required>
            </div>

            <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <input type="email" name="email" value="{{ old('email') }}" required>
            </div>

            <div class="form-group">
                <label>Password <span class="required">*</span></label>
                <input type="password" name="password" required minlength="8">
            </div>

            <div class="form-group">
                <label>Confirm Password <span class="required">*</span></label>
                <input type="password" name="password_confirmation" required minlength="8">
            </div>

            {{-- Restaurant Owner Section --}}
            <div
                style="margin-top: 24px; margin-bottom: 8px; font-size: 15px; font-weight: 600; color: #0d9488; border-bottom: 1px solid #e0f2f1; padding-bottom: 6px;">
                Restaurant Owner</div>

            <div class="form-group">
                <label>Restaurant Name</label>
                <input type="text" name="restaurant_name" value="{{ old('restaurant_name') }}"
                    placeholder="My Restaurant">
            </div>

            <div class="form-group">
                <label>Owner Name <span class="required">*</span></label>
                <input type="text" name="owner_name" value="{{ old('owner_name', old('name')) }}" required>
            </div>

            <div class="form-group">
                <label>Owner Email <span class="required">*</span></label>
                <input type="email" name="owner_email" value="{{ old('owner_email') }}" required>
            </div>

            <div class="form-group">
                <label>Owner Password <span class="required">*</span></label>
                <input type="password" name="owner_password" required minlength="8">
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
