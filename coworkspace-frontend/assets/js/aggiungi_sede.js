document.addEventListener('DOMContentLoaded', function() {
    // Assicurati che l'utente sia un admin prima di fare qualsiasi cos
    const form = document.getElementById('location-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    } else {
        console.error("Elemento form 'location-form' non trovato.");
    }
});

/**
 * Funzione per mostrare messaggi di feedback all'utente.
 * @param {string} message - Il messaggio da mostrare.
 * @param {'success' | 'error'} type - Il tipo di messaggio.
 */
function showMessage(message, type) {
    const msgElement = document.getElementById('msg');
    if (msgElement) {
        msgElement.textContent = message;
        msgElement.className = `form-message mt-4 alert alert-${type === 'success' ? 'success' : 'danger'}`;
    }
}

/**
 * Carica un'immagine se è stata selezionata in un input file.
 * @param {HTMLInputElement} fileInput - L'elemento input di tipo file.
 * @returns {Promise<string|null>} L'URL dell'immagine caricata o null.
 */
async function uploadImageIfAny(fileInput) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        console.log("Nessun file immagine selezionato per l'upload.");
        return null; // Nessun file da caricare
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    // La chiave 'image' deve corrispondere a quella attesa dal middleware Multer nel backend
    formData.append('cover_image_url', file);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        throw new Error("Token di autenticazione non trovato per l'upload dell'immagine.");
    }

    try {
        const response = await fetch(`${window.API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Errore durante il caricamento del file.');
        }

        const result = await response.json();
        // Assumendo che il backend risponda con { imageUrl: 'path/to/image.jpg' }
        return result.url;

    } catch (error) {
        console.error("Errore nella funzione di upload:", error);
        throw error; // Rilancia l'errore per gestirlo nel chiamante
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Form submission iniziato');

    // Disabilita il bottone per evitare doppi click
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Caricamento...';
    submitBtn.disabled = true;

    try {
        // 1. Upload immagine (se presente)
        let cover_image_url = null;
        try {
            const fileInput = document.getElementById('location-image');
            cover_image_url = await uploadImageIfAny(fileInput);
            console.log('URL immagine ottenuto:', cover_image_url);
        } catch (error) {
            console.error('Errore upload immagine:', error);
            showMessage('Errore nel caricamento dell\'immagine: ' + error.message, 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            return;
        }

        // 2. Prepara il payload
        const payload = {
            name: document.getElementById('name').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
            cover_image_url: cover_image_url
        };

        console.log('Payload completo:', payload);

        // 3. Invia al backend
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('Token di autenticazione non trovato');
        }

        const response = await fetch(`${window.API_URL}/locations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        console.log('Status response:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            console.log('Risposta backend:', responseData);
            showMessage('Sede creata con successo!', 'success');

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 15000); // Ridotto il timeout per un reindirizzamento più rapido
        } else {
            const errorData = await response.json();
            console.error('Errore backend:', errorData);
            showMessage('Errore nella creazione della sede: ' + (errorData.message || 'Errore sconosciuto'), 'error');
        }
    } catch (error) {
        console.error('Errore di connessione:', error);
        showMessage('Errore di connessione: ' + error.message, 'error');
    } finally {
        // Riabilita il bottone
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}