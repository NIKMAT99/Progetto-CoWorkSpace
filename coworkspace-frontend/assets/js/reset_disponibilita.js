$(function () {

    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    $('#reset-form').submit(function (e) {
        e.preventDefault();

        const data = {
            space_id: $('#space-id').val(),
            date: $('#date').val(),
            start_time: $('#start-time').val(),
            end_time: $('#end-time').val()
        };

        $.ajax({
            url: `${window.API_URL}/availability/reset`,
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: () => $('#msg').html('<p class="text-success">Slot ripristinato!</p>'),
            error: () => $('#msg').html('<p class="text-danger">Errore nel reset</p>')
        });
    });
});
