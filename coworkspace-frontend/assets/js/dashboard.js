$(document).ready(function () {
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Recupero profilo utente
    $.ajax({
        url: 'http://localhost:3000/users/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        },
            success: function (data) {
                $('#user-name').text(data.full_name);
                $('#user-email').text(data.email);
                $('#user-role').text(data.role);

                // Mostra opzioni admin/gestore
                if (data.role === 'admin' || data.role === 'gestore') {
                    $('.admin-only').removeClass('d-none');
                }
        },
        error: function () {
            alert('Errore nel caricamento del profilo.');
        }
    });

    // Recupero prenotazioni utente
    $.ajax({
        url: 'http://localhost:3000/reservations/me',
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        },
        success: function (data) {
            const container = $('#reservation-list');
            container.empty();

            if (data.length === 0) {
                container.html('<p>Nessuna prenotazione trovata.</p>');
            } else {
                data.forEach(r => {
                    container.append(`
            <div class="card mb-3">
              <div class="card-body">
                <strong>Spazio:</strong> ${r.space_id} <br>
                <strong>Data:</strong> ${r.date} <br>
                <strong>Ora:</strong> ${r.start_time} - ${r.end_time} <br>
                <strong>Stato:</strong> ${r.status}
              </div>
            </div>
          `);
                });
            }
        },
        error: function () {
            $('#reservation-list').html('<p class="text-danger">Errore nel recupero delle prenotazioni.</p>');
        }
    });

    // Logout
    $('#logout-btn').click(function () {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    });
});
