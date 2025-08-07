$(function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    $('#space-form').submit(function (e) {
        e.preventDefault();

        const data = {
            location_id: $('#location-id').val(),
            type: $('#type').val(),
            description: $('#description').val(),
            services: $('#services').val(),
            price: $('#price').val()
        };

        $.ajax({
            url: 'http://localhost:3000/spaces',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: () => $('#msg').html('<p class="text-success">Spazio creato!</p>'),
            error: () => $('#msg').html('<p class="text-danger">Errore creazione spazio</p>')
        });
    });
});
