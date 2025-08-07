$(function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    $('#location-form').submit(function (e) {
        e.preventDefault();

        const data = {
            name: $('#name').val(),
            city: $('#city').val(),
            address: $('#address').val()
        };

        $.ajax({
            url: 'http://localhost:3000/locations',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(data),
            success: () => $('#msg').html('<p class="text-success">Sede creata!</p>'),
            error: () => $('#msg').html('<p class="text-danger">Errore creazione sede</p>')
        });
    });
});
