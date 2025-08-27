$(document).ready(function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    let allSpaces = [];

    // Carica tutte le location
    $.get('http://localhost:3000/locations', function (locations) {
        const select = $('#location-select');
        select.append('<option value="">-- Seleziona sede --</option>');

        locations.forEach(loc => {
            select.append(`<option value="${loc.id}">${loc.name} - ${loc.city}</option>`);
        });
    });

    // Quando seleziono una location → carica spazi
    $('#location-select').on('change', function () {
        const locationId= $(this).val();

        if (!locationId) {
            $('#space-select-container').addClass('d-none');
            $('#date-container').addClass('d-none');
            return;
        }

        // Carica tutti gli spazi
        $.get('http://localhost:3000/spaces/getSpaces', function (spaces) {

            //allSpaces = spaces.filter(s => s.location_id === locationId);
            allSpaces = spaces.filter(s => String(s.location_id) === locationId);

            const select = $('#space-select');
            select.empty();
            select.append('<option value="">-- Seleziona spazio --</option>');

            allSpaces.forEach(space => {
                select.append(`<option value="${space.id}">${space.type} - €${space.price}</option>`);
            });

            $('#space-select-container').removeClass('d-none');
            $('#date-container').addClass('d-none');
            $('#time-slots').empty();
        });
    });

    // Quando seleziono uno spazio
    $('#space-select').on('change', function () {
        if ($(this).val()) {
            $('#date-container').removeClass('d-none');
            $('#time-slots').empty();
        } else {
            $('#date-container').addClass('d-none');
        }
    });

    // Quando clicco su "Controlla disponibilità"
    $('#check-availability').click(function () {
        const space_id = $('#space-select').val();
        const date = $('#reservation-date').val();

        if (!space_id || !date) return alert('Inserisci tutti i dati.');

        $.ajax({
            url: `http://localhost:3000/availability?space_id=${space_id}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            success: function (data) {
                const slots = data.filter(s => s.date === date);
                renderSlots(slots, space_id, date);
            },
            error: function () {
                $('#time-slots').html('<p class="text-danger">Errore nel caricamento degli orari.</p>');
            }
        });
    });

    function renderSlots(slots, space_id, date) {
        const container = $('#time-slots');
        container.empty();

        if (slots.length === 0) {
            container.html('<p class="text-warning">Nessuno slot disponibile.</p>');
            return;
        }

        slots.forEach(slot => {
            container.append(`
        <div class="card my-2">
          <div class="card-body d-flex justify-content-between align-items-center">
            <span><strong>${slot.start_time}</strong> → <strong>${slot.end_time}</strong></span>
            <button class="btn btn-success btn-sm" onclick="prenota(${space_id}, '${date}', '${slot.start_time}', '${slot.end_time}')">
              Prenota
            </button>
          </div>
        </div>
      `);
        });
    }
});

function prenota(space_id, date, start, end) {
    const token = getAuthToken();
    $.ajax({
        url: 'http://localhost:3000/reservations',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ space_id: space_id, date, start_time: start, end_time: end }),
        success: () => {
            alert('Prenotazione effettuata!');
            window.location.href = 'dashboard.html';
        },
        error: () => {
            alert('Errore nella prenotazione.');
        }
    });
}

document.getElementById('confirm-btn').addEventListener('click', async function() {
    if (!selectedLocation || !selectedSpace || !selectedDate) {
        showMessage('Completa tutti i campi obbligatori', 'error');
        return;
    }

    // Slot fisso 08:00 - 00:00
    const start_time = '08:00';
    const end_time = '00:00';

    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3000/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                space_id: parseInt(selectedSpace, 10), // <-- snake_case
                date: selectedDate,
                start_time,                             // <-- snake_case
                end_time                                // <-- snake_case
            })
        });

        if (response.ok) {
            const data = await response.json(); // { message, id }
            // opzionale: se vuoi checkout
            // window.location.href = `checkout.html?rid=${data.id}`;
            showMessage('Prenotazione creata con successo!', 'success');
            setTimeout(() => window.location.href = 'dashboard.html', 1200);
        } else {
            const error = await response.json().catch(() => ({}));
            showMessage(error.message || 'Errore nella prenotazione', 'error');
        }
    } catch (err) {
        showMessage('Errore di connessione', 'error');
    }
});

