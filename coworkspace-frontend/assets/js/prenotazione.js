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
        const locationId = $(this).val();

        if (!locationId) {
            $('#space-select-container').addClass('d-none');
            $('#date-container').addClass('d-none');
            return;
        }

        // Carica tutti gli spazi
        $.get('http://localhost:3000/spaces', function (spaces) {
            allSpaces = spaces.filter(s => s.location_id == locationId);
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
        const spaceId = $('#space-select').val();
        const date = $('#reservation-date').val();

        if (!spaceId || !date) return alert('Inserisci tutti i dati.');

        $.ajax({
            url: `http://localhost:3000/availability?space_id=${spaceId}`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            success: function (data) {
                const slots = data.filter(s => s.date === date);
                renderSlots(slots, spaceId, date);
            },
            error: function () {
                $('#time-slots').html('<p class="text-danger">Errore nel caricamento degli orari.</p>');
            }
        });
    });

    function renderSlots(slots, spaceId, date) {
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
            <button class="btn btn-success btn-sm" onclick="prenota(${spaceId}, '${date}', '${slot.start_time}', '${slot.end_time}')">
              Prenota
            </button>
          </div>
        </div>
      `);
        });
    }
});

function prenota(spaceId, date, start, end) {
    const token = getAuthToken();
    $.ajax({
        url: 'http://localhost:3000/reservations',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ space_id: spaceId, date, start_time: start, end_time: end }),
        success: () => {
            alert('Prenotazione effettuata!');
            window.location.href = 'dashboard.html';
        },
        error: () => {
            alert('Errore nella prenotazione.');
        }
    });
}
