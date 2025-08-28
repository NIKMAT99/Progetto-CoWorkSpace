// Variabili globali
let selectedLocation = null;
let selectedSpace = null;
let selectedDate = null;
let selectedStartTime = null;
let selectedEndTime = null;
let availableSlots = [];
let existingReservations = [];

// Controllo autenticazione
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Aggiorna anno corrente
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Imposta data minima (oggi)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservation-date').min = today;

    // Carica le location
    loadLocations();

    // Carica le prenotazioni esistenti
    loadExistingReservations();
});

// Carica le prenotazioni esistenti
async function loadExistingReservations() {
    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3000/reservations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            existingReservations = await response.json();
        }
    } catch (error) {
        console.error('Errore nel caricamento prenotazioni:', error);
    }
}
async function refreshReservations() {
    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3000/reservations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            existingReservations = await response.json();
        }
    } catch (error) {
        console.error('Errore nel caricamento prenotazioni:', error);
    }
}

// Carica le location
async function loadLocations() {
    try {
        const response = await fetch('http://localhost:3000/locations');
        const locations = await response.json();

        const select = document.getElementById('location-select');
        select.innerHTML = '<option value="">-- Seleziona sede --</option>';

        locations.forEach(loc => {
            const option = document.createElement('option');
            option.value = loc.id;
            option.textContent = `${loc.name} - ${loc.city}`;
            select.appendChild(option);
        });

    } catch (error) {
        showMessage('Errore nel caricamento delle sedi', 'error');
    }
}

// Quando cambia la sede
document.getElementById('location-select').addEventListener('change', async function() {
    selectedLocation = this.value;
    selectedSpace = null;
    selectedDate = null;
    selectedStartTime = null;
    selectedEndTime = null;

    if (!selectedLocation) {
        hideElement('space-selection');
        hideElement('date-selection');
        hideElement('time-selection');
        hideElement('confirmation');
        return;
    }

    await loadSpaces(selectedLocation);
    showElement('space-selection');
    hideElement('date-selection');
    hideElement('time-selection');
    hideElement('confirmation');
    updateSelectionInfo();
});

// Carica spazi per location
async function loadSpaces(locationId) {
    try {
        const response = await fetch('http://localhost:3000/spaces');
        const allSpacesData = await response.json();
        const spaces = allSpacesData.filter(space => space.location_id === Number(locationId));

        const container = document.getElementById('spaces-container');
        container.innerHTML = '';

        if (spaces.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-4">
                    <i class="fas fa-door-open fa-3x text-muted mb-3"></i>
                    <h5>Nessuno spazio disponibile</h5>
                    <p class="text-muted">Non ci sono spazi in questa sede al momento.</p>
                </div>
            `;
            return;
        }

        spaces.forEach(space => {
            const spaceCard = document.createElement('div');
            spaceCard.className = 'col-md-6 mb-3';
            spaceCard.innerHTML = `
                <div class="space-card card h-100" data-space-id="${space.id}">
                    <div class="card-body">
                        <h5 class="card-title">${space.type}</h5>
                        <p class="card-text mb-1">${space.description || 'Spazio confortevole'}</p>
                        <p class="text-primary fw-bold">${space.price}€/ora</p>
                        <button class="btn btn-outline-primary btn-sm select-space-btn">
                            Seleziona
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(spaceCard);
        });

        // Aggiungi event listener ai pulsanti
        document.querySelectorAll('.select-space-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const spaceCard = this.closest('.space-card');
                const spaceId = spaceCard.dataset.spaceId;

                // Rimuovi selezione precedente
                document.querySelectorAll('.space-card').forEach(card => {
                    card.classList.remove('selected');
                    card.classList.remove('border-primary');
                });

                // Aggiungi selezione corrente
                spaceCard.classList.add('selected');
                spaceCard.classList.add('border-primary');
                selectedSpace = spaceId;

                showElement('date-selection');
                hideElement('time-selection');
                hideElement('confirmation');
                updateSelectionInfo();
            });
        });

    } catch (error) {
        showMessage('Errore nel caricamento degli spazi', 'error');
    }
}

// Quando cambia la data
document.getElementById('reservation-date').addEventListener('change', async function() {
    selectedDate = this.value;
    selectedStartTime = null;
    selectedEndTime = null;

    await refreshReservations();

    if (selectedDate) {
        // Carica gli slot disponibili per questa data
        await loadAvailableSlots();
        showElement('time-selection');
        hideElement('confirmation');
        updateSelectionInfo();
    } else {
        hideElement('time-selection');
        hideElement('confirmation');
    }
});
async function loadSpaceReservations(spaceId, date) {
    try {
        const response = await fetch(
            `http://localhost:3000/availability/getSpaceReservations?space_id=${spaceId}&start_date=${date}&end_date=${date}`
        );
        if (response.ok) {
            const data = await response.json();
            return data.reservations || [];
        }
    } catch (error) {
        console.error('Errore nel recupero prenotazioni spazio:', error);
    }
    return [];
}

// Carica gli slot disponibili usando il tuo endpoint
async function loadAvailableSlots() {
    if (!selectedSpace || !selectedDate) return;

    try {
        // Recupera gli slot disponibili
        const response = await fetch(`http://localhost:3000/availability/slots?space_id=${selectedSpace}&date=${selectedDate}`);
        // Recupera le prenotazioni esistenti per lo spazio e la data
        const reservations = await loadSpaceReservations(selectedSpace, selectedDate);

        if (response.ok) {
            const data = await response.json();
            availableSlots = data.available_slots || [];
            renderTimeSlotsWithReservations(reservations);
        } else {
            showMessage('Errore nel caricamento della disponibilità', 'error');
            renderNoSlotsAvailable();
        }
    } catch (error) {
        showMessage('Errore di connessione', 'error');
        renderNoSlotsAvailable();
    }
}
function renderTimeSlotsWithReservations(reservations) {
    const slotsGrid = document.getElementById('time-slots-grid');
    slotsGrid.innerHTML = '';

    if (availableSlots.length === 0) {
        renderNoSlotsAvailable();
        return;
    }

    availableSlots.forEach(slot => {
        // Verifica se lo slot si sovrappone a una prenotazione
        const isBooked = reservations.some(res => {
            return (
                slot.start_time < res.end_time &&
                slot.end_time > res.start_time
            );
        });

        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot' + (isBooked ? ' booked' : ' available');
        slotDiv.dataset.start = slot.start_time;
        slotDiv.dataset.end = slot.end_time;

        slotDiv.innerHTML = `
            <div class="time">${slot.start_time}</div>
            <div class="status">${isBooked ? 'Prenotato' : 'Disponibile'}</div>
        `;

        if (!isBooked) {
            slotDiv.addEventListener('click', function() {
                document.querySelectorAll('.time-slot.selected').forEach(s => {
                    s.classList.remove('selected');
                });
                this.classList.add('selected');
                selectedStartTime = this.dataset.start;
                selectedEndTime = this.dataset.end;
                showElement('confirmation');
                updateSelectionInfo();
                document.getElementById('confirm-btn').disabled = false;
            });
        } else {
            slotDiv.style.cursor = 'not-allowed';
        }

        slotsGrid.appendChild(slotDiv);
    });
}


// Mostra messaggio quando non ci sono slot disponibili
function renderNoSlotsAvailable() {
    const slotsGrid = document.getElementById('time-slots-grid');
    slotsGrid.innerHTML = `
        <div class="col-12 text-center py-4">
            <i class="fas fa-clock fa-3x text-muted mb-3"></i>
            <h5>Nessuno slot disponibile</h5>
            <p class="text-muted">Non ci sono orari disponibili per questa data.</p>
        </div>
    `;
    document.getElementById('confirm-btn').disabled = true;
}

// Verifica disponibilità prima della prenotazione
async function checkAvailabilityBeforeBooking() {
    try {

        // Controlla anche nella lista delle prenotazioni esistenti
        const response = await fetch(
            `http://localhost:3000/availability/check?space_id=${selectedSpace}&date=${selectedDate}&start_time=${selectedStartTime}&end_time=${selectedEndTime}`
        );

        if (response.ok) {
            const data = await response.json();
            return data.available;
        }
        return false;
    } catch (error) {
        console.error('Errore controllo disponibilità:', error);
        return false;
    }
}

// Conferma prenotazione
document.getElementById('confirm-btn').addEventListener('click', async function() {
    if (!selectedLocation || !selectedSpace || !selectedDate || !selectedStartTime || !selectedEndTime) {
        showMessage('Completa tutti i campi obbligatori', 'error');
        return;
    }

    // Verifica finale della disponibilità
    const isAvailable = await checkAvailabilityBeforeBooking();
    if (!isAvailable) {
        showMessage('Questo orario non è più disponibile. Si prega di scegliere un altro orario.', 'error');
        // Ricarica gli slot disponibili
        await loadAvailableSlots();
        return;
    }

    try {
        const token = localStorage.getItem('jwt_token');
        const response = await fetch('http://localhost:3000/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                space_id: parseInt(selectedSpace),
                date: selectedDate,
                start_time: selectedStartTime,
                end_time: selectedEndTime
            })
        });

        if (response.ok) {
            showMessage('Prenotazione creata con successo!', 'success');

            // Aggiorna la lista delle prenotazioni
            const newReservation = await response.json();
            existingReservations.push(newReservation);

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            const error = await response.json();
            showMessage(error.message || 'Errore nella prenotazione', 'error');
        }

    } catch (error) {
        showMessage('Errore di connessione', 'error');
    }
});

// Funzioni di utilità
function showElement(id) {
    document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}

function showMessage(message, type) {
    const msgDiv = document.getElementById('booking-message');
    msgDiv.textContent = message;
    msgDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} mt-4`;
    msgDiv.style.display = 'block';

    // Nascondi il messaggio dopo 5 secondi
    setTimeout(() => {
        msgDiv.style.display = 'none';
    }, 5000);
}

function updateSelectionInfo() {
    const infoDiv = document.getElementById('selected-info');
    let info = '';

    if (selectedLocation) {
        const locationSelect = document.getElementById('location-select');
        const locationName = locationSelect.options[locationSelect.selectedIndex].text;
        info += `Sede: ${locationName}`;
    }

    if (selectedSpace) {
        const spaceCard = document.querySelector(`[data-space-id="${selectedSpace}"]`);
        const spaceName = spaceCard.querySelector('.card-title').textContent;
        info += ` | Spazio: ${spaceName}`;
    }

    if (selectedDate) {
        info += ` | Data: ${new Date(selectedDate).toLocaleDateString('it-IT')}`;
    }

    if (selectedStartTime && selectedEndTime) {
        info += ` | Orario: ${selectedStartTime} - ${selectedEndTime}`;
    } else {
        info += ' | Orario: Non selezionato';
    }

    infoDiv.textContent = info;
}