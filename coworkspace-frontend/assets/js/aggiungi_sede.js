// Aggiorna l'anno corrente solo se l'elemento esiste
document.addEventListener('DOMContentLoaded', function() {
    const currentYearEl = document.getElementById('current-year');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }

    // Verifica se l'elemento file input esiste prima di aggiungere l'event listener
    const fileInput = document.getElementById('location-image');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (this.files.length > 0) {
                const fileName = this.files[0].name;
                const label = this.closest('.file-upload').querySelector('.file-upload-label');
                if (label) {
                    label.innerHTML = `<i class="fas fa-check-circle me-2"></i>${fileName}`;
                }
            }
        });
    }

    // Gestione form
    const locationForm = document.getElementById('location-form');
    if (locationForm) {
        locationForm.addEventListener('submit', handleFormSubmit);
    }
});

async function uploadImageIfAny(fileInputEl) {
    if (!fileInputEl || !fileInputEl.files || fileInputEl.files.length === 0) {
        console.log('Nessun file selezionato per l\'upload');
        return null;
    }

    console.log('File selezionato:', fileInputEl.files[0].name, 'Tipo:', fileInputEl.files[0].type, 'Dimensione:', fileInputEl.files[0].size);

    // Controllo dimensione file (max 5MB)
    if (fileInputEl.files[0].size > 5 * 1024 * 1024) {
        throw new Error('Il file è troppo grande. Dimensione massima: 5MB');
    }

    const fd = new FormData();
    fd.append('cover_image_url', fileInputEl.files[0]);

    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('Token di autenticazione non trovato');
        }

        const upRes = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: fd
        });

        console.log('Status upload:', upRes.status);

        if (!upRes.ok) {
            const errorText = await upRes.text();
            console.error('Errore upload:', errorText);
            throw new Error(`Upload fallito: ${errorText}`);
        }

        const result = await upRes.json();
        console.log('Risposta upload:', result);

        return result.url || null;
    } catch (error) {
        console.error('Errore completo upload:', error);
        throw error;
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
            cover_image_url = await uploadImageIfAny(document.getElementById('location-image'));
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

        // Aggiungi descrizione se presente
        const description = document.getElementById('description').value;
        if (description) {
            payload.description = description;
        }

        console.log('Payload completo:', payload);

        // 3. Invia al backend
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            throw new Error('Token di autenticazione non trovato');
        }

        const response = await fetch('http://localhost:3000/locations', {
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
            }, 1500);
        } else {
            const errorText = await response.text();
            console.error('Errore backend:', errorText);
            showMessage('Errore nella creazione della sede: ' + errorText, 'error');
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

function showMessage(message, type) {
    const msgDiv = document.getElementById('msg');
    if (msgDiv) {
        msgDiv.textContent = message;
        msgDiv.className = `form-message mt-4 ${type}`;
        msgDiv.style.display = 'block';

        // Scrolla fino al messaggio
        msgDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}