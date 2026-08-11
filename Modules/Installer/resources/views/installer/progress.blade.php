<script>
    const timer = setInterval(async () => {

        const response = await fetch('/installer/status');
        const data = await response.json();

        if (data.status === 'completed') {
            clearInterval(timer);
            window.location.href = "{{ route('installer.admin') }}";
        }

        if (data.status === 'error') {
            clearInterval(timer);
            alert(data.message);
        }

    }, 2000);
</script>