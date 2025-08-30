$(document).ready(function () {
    const token = getAuthToken();

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Recupero profilo utente
    $.ajax({
        url: `${window.API_URL}/users/me`,
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

    // Logout
    $('#logout-btn').click(function () {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    });
    function loadReservations() {
        $.ajax({
            url: `${window.API_URL}/reservations/me`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            success: function (reservations) {
                const container = $('#reservation-list');
                container.empty();

                if (reservations.length === 0) {
                    container.html('<p>Nessuna prenotazione trovata.</p>');
                    return;
                }

                reservations.forEach(r => {
                    const card = $(`
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <strong>Spazio:</strong> ${r.space_type || r.space_id} <br>
                                        <strong>Data:</strong> ${new Date(r.date).toLocaleDateString('it-IT')} <br>
                                        <strong>Ora:</strong> ${r.start_time} - ${r.end_time} <br>
                                        <strong>Stato:</strong> <span class="badge bg-info">${r.status}</span>
                                    </div>
                                    <button class="btn btn-danger btn-sm delete-btn" data-id="${r.id}" title="Cancella prenotazione">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `);

                    card.find('.delete-btn').click(function () {
                        const reservationId = $(this).data('id');
                        if (confirm('Sei sicuro di voler cancellare questa prenotazione?')) {
                            $.ajax({
                                url: `${window.API_URL}/reservations/${reservationId}`,
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` },
                                success: function () {
                                    alert('Prenotazione cancellata con successo.');
                                    loadReservations(); // Ricarica la lista
                                },
                                error: function (err) {
                                    const errorMsg = err.responseJSON ? err.responseJSON.message : 'Errore nella cancellazione della prenotazione.';
                                    alert(errorMsg);
                                }
                            });
                        }
                    });

                    container.append(card);
                });
            },
            error: function () {
                $('#reservation-list').html('<p class="text-danger">Errore nel recupero delle prenotazioni.</p>');
            }
        });
    }

    loadReservations();

});
