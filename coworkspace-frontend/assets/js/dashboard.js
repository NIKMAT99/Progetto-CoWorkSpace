$(document).ready(function () {
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Recupero profilo utente
    $.ajax({
        url: '${window.API_BASE_URL}/users/me',
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
        url: '${window.API_BASE_URL}/reservations/me',
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
    function loadReservations() {
        $.ajax({
            url: '${window.API_BASE_URL}/reservations/me',
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            success: function (reservations) {
                const tbody = $('#reservation-list');
                tbody.empty();

                reservations.forEach(r => {
                    const row = $(`
          <tr>
            <td>${r.space_type}</td>
            <td>${r.date}</td>
            <td>${r.start_time} - ${r.end_time}</td>
            <td>
              <button class="btn btn-danger btn-sm" data-id="${r.id}">❌ Cancella</button>
            </td>
          </tr>
        `);

                    row.find('button').click(function () {
                        if (confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
                            $.ajax({
                                url: `${window.API_BASE_URL}/reservations/${r.id}`,
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                                success: function () {
                                    alert('Prenotazione cancellata');
                                    loadReservations(); // ricarica lista
                                },
                                error: function () {
                                    alert('Errore nella cancellazione');
                                }
                            });
                        }
                    });

                    tbody.append(row);
                });
            }
        });
    }

    loadReservations();

});
