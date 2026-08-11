@extends('installer::installer.layout')

@section('content')
<div class="installer-card">
    <div class="complete-card">
        <div class="success-icon">{!! '&#10003;' !!}</div>
        <h2>Installation Complete!</h2>
        <p>Your application has been installed successfully.</p>
        <a href="{{ url('/') }}" class="btn btn-primary">Go to Homepage</a>
    </div>
</div>
@endsection
