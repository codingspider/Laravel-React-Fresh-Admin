@extends('installer::installer.layout')

@section('content')
<div class="installer-card">
    @include('installer::installer.partials.steps', ['current' => 2])

    <div class="step-description">Verify that the required directories are writable.</div>

    @foreach($dirs as $dir => $writable)
        <div class="list-item {{ $writable ? 'ok' : 'fail' }}">
            <span class="list-item-name">{{ $dir }}</span>
            <span class="list-item-status">
                {{ $writable ? '755' : '' }}
                <span class="{{ $writable ? 'check-icon' : 'cross-icon' }}">{!! $writable ? '&#10003;' : '&#10007;' !!}</span>
            </span>
        </div>
    @endforeach

    <div class="actions">
        <div></div>
        <form method="POST" action="{{ route('installer.permissions.post') }}">
            @csrf
            <button type="submit" class="btn btn-primary">Next</button>
        </form>
    </div>
</div>
@endsection
