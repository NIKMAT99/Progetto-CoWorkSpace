// assets/js/aggiungi_spazio.js
$(function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    $('#space-form').on('submit', async function (e) {
        e.preventDefault();

        const payload = {
            location_id: Number($('#location-id').val()),
            type: $('#type').val(),
            description: $('#description').val(),
            services: $('#services').val(),
            price: Number($('#price').val()),
            cover_image_url: null
        };


        $.ajax({
            url: `${window.API_URL}/spaces`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(payload),
            success: () => {
                $('#msg').html('<p class="text-success">Spazio creato!</p>');
                setTimeout(() => window.location.href = 'dashboard.html', 1200);
            },
            error: (xhr) => {
                const detail = (xhr.responseJSON && (xhr.responseJSON.detail || xhr.responseJSON.error)) || 'Errore creazione spazio';
                $('#msg').html(`<p class="text-danger">${detail}</p>`);
            }
        });
    });
});


