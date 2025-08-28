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
        };

        const fileInput = $('#space-image')[0];
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            try {
                const fd = new FormData();
                fd.append('image', fileInput.files[0]); // il field name DEVE essere "image"

                // chiamata a /upload che restituisce { url: 'http://localhost:3000/uploads/...' }
                const uploadRes = await $.ajax({
                    url: 'http://localhost:3000/upload',
                    method: 'POST',
                    data: fd,
                    processData: false,   // [AGGIUNTA] necessario per FormData
                    contentType: false    // [AGGIUNTA] necessario per FormData
                    // (niente header JSON qui)
                });

                if (uploadRes && uploadRes.url) {
                    payload.image_url = uploadRes.url; // [AGGIUNTA] mettiamo l'URL nel payload
                }
            } catch (err) {
                console.error('Upload immagine fallito:', err);
                $('#msg').html('<p class="text-danger">Caricamento immagine fallito</p>');
                return; // interrompi la submit se vuoi rendere l’immagine obbligatoria; rimuovi se vuoi proseguire senza
            }
        }


        $.ajax({
            url: 'http://localhost:3000/spaces',
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


