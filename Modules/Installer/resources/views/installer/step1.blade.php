@extends('installer::installer.layout')

@section('content')
    <div class="installer-card">
        @include('installer::installer.partials.steps', ['current' => 1])

        <div class="step-description">Check that your server meets the requirements.</div>

        <div class="list-item {{ $phpVersionOk ? 'ok' : 'fail' }}">
            <span class="list-item-name">PHP Version</span>
            <span class="list-item-status">
                PHP {{ config('installer.required_php_version', '8.2.0') }} or higher
                <span class="{{ $phpVersionOk ? 'check-icon' : 'cross-icon' }}">{!! $phpVersionOk ? '&#10003;' : '&#10007;' !!}</span>
            </span>
        </div>

        @foreach ($extensions as $ext => $ok)
            <div class="list-item {{ $ok ? 'ok' : 'fail' }}">
                <span class="list-item-name">{{ ucfirst($ext) }}</span>
                <span class="list-item-status">
                    <span class="{{ $ok ? 'check-icon' : 'cross-icon' }}">{!! $ok ? '&#10003;' : '&#10007;' !!}</span>
                </span>
            </div>
        @endforeach

        <div class="actions">
            <div></div>
            @if ($phpVersionOk && !in_array(false, $extensions))
                <form method="POST" action="{{ route('installer.requirements.post') }}">
                    @csrf
                    <button type="submit" class="btn btn-primary">Next</button>
                </form>
            @else
                <button type="button" class="btn btn-primary" disabled>Next</button>
            @endif
        </div>
    </div>
@endsection
