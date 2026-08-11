<div class="steps">
    @php
        $steps = [
            ['num' => 1, 'label' => 'Server Requirements'],
            ['num' => 2, 'label' => 'Permissions'],
            ['num' => 3, 'label' => 'Environment'],
            ['num' => 4, 'label' => 'Application Settings'],
        ];
    @endphp
    @foreach($steps as $i => $step)
        @if($i > 0)
            <div class="step-connector" style="background: {{ $current > $step['num'] - 1 ? '#0d9488' : '#e2e8f0' }};"></div>
        @endif
        <div class="step {{ $current == $step['num'] ? 'active' : '' }} {{ $current > $step['num'] ? 'completed' : '' }}">
            <div class="step-number">
                @if($current > $step['num'])
                    {!! '&#10003;' !!}
                @else
                    {{ str_pad($step['num'], 2, '0', STR_PAD_LEFT) }}
                @endif
            </div>
            <span class="step-label">{{ $step['label'] }}</span>
        </div>
    @endforeach
</div>
