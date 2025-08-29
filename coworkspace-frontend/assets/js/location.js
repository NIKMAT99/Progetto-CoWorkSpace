// Caricamento dati
document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const locationId = parseInt(urlParams.get('id'), 10);
    console.log("Caricamento location con ID:", locationId);

    if (!locationId) {
        document.getElementById('location-name').textContent = 'ID sede non specificato.';
        document.getElementById('address').textContent = '';
        document.getElementById('location-description').textContent = '';
        document.getElementById('spaces-container').innerHTML = '';
        return;
    }

    try {
        // 1. Carica la location specifica
        const location = await fetch(`${window.API_URL}/locations/${locationId}`)
            .then(res => res.json());

        // 2. Aggiorna header
        document.getElementById('location-name').textContent = location.name;
        document.getElementById('address').textContent = `${location.address}, ${location.city}`;

        // 3. Aggiorna immagine
        const mainImageEl = document.getElementById('main-image');
        if (location.cover_image_url) {
            let imageUrl = location.cover_image_url;

            if (!imageUrl.startsWith('http')) {
                if (!imageUrl.startsWith('uploads/')) {
                    imageUrl = `uploads/${imageUrl}`;
                }
                imageUrl = `${window.API_URL}/${imageUrl}`;
            }

            mainImageEl.src = imageUrl;
            mainImageEl.alt = location.name;
            mainImageEl.classList.remove('d-none');

            // Gestione errori di caricamento immagine
            mainImageEl.onerror = function() {
                console.error("Errore nel caricamento dell'immagine:", imageUrl);
                mainImageEl.classList.add('d-none');
            };
        } else {
            mainImageEl.classList.add('d-none');
            console.log("Nessuna immagine disponibile per questa location");
        }
        // 4. Aggiorna descrizione
        document.getElementById('location-description').textContent =
            location.description || 'Questa sede offre spazi di coworking moderni e ben attrezzati, ideali per professionisti e team.';

        // 5. Carica TUTTI gli spazi e filtra per locationId
        const allSpaces = await fetch(`${window.API_URL}/spaces`)
            .then(res => res.json());

        const spaces = allSpaces.filter(space => space.location_id === Number(locationId));

        // 6.Render spazi
        const container = document.getElementById('spaces-container');
        if (spaces.length === 0) {
            container.innerHTML = `
                        <div class="col-12 text-center py-4">
                            <i class="fas fa-door-open fa-3x text-muted mb-3"></i>
                            <h4>Nessuno spazio disponibile</h4>
                            <p class="text-muted">Non ci sono spazi in questa sede al momento.</p>
                        </div>
                    `;
        } else {
            /*container.innerHTML = spaces.map(space => `
                        <div class="col-md-6">
                            <div class="card h-100">
                                <img src="assets/img/spaces/${space.id}.jpg" class="card-img-top" alt="${space.type}" style="height: 200px; object-fit: cover;">
                                <div class="card-body">
                                    <h5 class="card-title">${space.type}</h5>
                                    <p class="card-text">${space.description || 'Spazio confortevole e ben attrezzato'}</p>
                                    <p class="text-primary fw-bold">${space.price}€/ora</p>
                                </div>
                            </div>
                        </div>
            `).join('');*/
            container.innerHTML = spaces.map(space => {
                // usa SOLO image_url dal DB; se manca, NIENTE <img>
                const spaceImg = space.image_url
                    ? `<img src="${space.image_url}" class="card-img-top" alt="${space.type}" style="height: 200px; object-fit: cover;">`
                    : '';

                return `
                    <div class="col-md-6">
                      <div class="card h-100">
                        ${spaceImg} <!-- << immagine solo se c'è -->
                        <div class="card-body">
                          <h5 class="card-title">${space.type}</h5>
                          <p class="card-text">${space.description || 'Spazio confortevole e ben attrezzato'}</p>
                          <p class="text-primary fw-bold">${Number(space.price).toFixed(2)}€/ora</p>
                        </div>
                      </div>
                    </div>`;
            }).join('');
        }
        // Popola dropdown prenotazione
        const bookingSelect = document.getElementById('booking-space');
        bookingSelect.innerHTML = spaces.map(space =>
            `<option value="${space.id}">${space.type} - ${space.price}€/ora</option>`
        ).join('');

        // 7. Gestione autenticazione
        const token = localStorage.getItem('jwt_token');
        if (token) {
            document.getElementById('auth-message').classList.add('d-none');
            document.getElementById('booking-form').classList.remove('d-none');

            // Imposta data minima (oggi)
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('booking-date').min = today;
        }

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('spaces-container').innerHTML = `
                    <div class="col-12">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Errore nel caricamento dei dati
                        </div>
                    </div>
                `;
    }
});
