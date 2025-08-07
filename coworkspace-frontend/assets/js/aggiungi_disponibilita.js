$(document).ready(function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    $('#add-availability-form').submit(function (e) {
        e.preventDefault();

        const data = {
            space_id: $('#space-id').val(),
            date: $('#date').val(),
            start_time: $('#start-time').val(),
            end_time: $('#end-time').val()
        };

        $.ajax({
            url: 'http://localhost:3000/availability',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: function () {
                $('#response-msg').html('<p class="text-success">Disponibilità aggiunta con successo!</p>');
            },
            error: function (xhr) {
                $('#response-msg').html('<p class="text-danger">Errore: ' + xhr.responseJSON?.message + '</p>');
            }
        });
    });
});
