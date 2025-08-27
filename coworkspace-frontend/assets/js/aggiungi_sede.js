// Aggiorna l'anno nel footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Gestione upload immagine
document.getElementById('location-image').addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const fileName = this.files[0].name;
        const label = this.closest('.file-upload').querySelector('.file-upload-label');
        label.innerHTML = `<i class="fas fa-check-circle me-2"></i>${fileName}`;
    }
});

// Gestione form
document.getElementById('location-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value
    };

    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage('Devi essere loggato per creare una sede', 'error');
            return;
        }

        const response = await fetch('http://localhost:3000/locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showMessage('Sede creata con successo!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage('Errore nella creazione della sede', 'error');
        }
    } catch (error) {
        showMessage('Errore di connessione', 'error');
    }
});

function showMessage(message, type) {
    const msgDiv = document.getElementById('msg');
    msgDiv.textContent = message;
    msgDiv.className = `form-message mt-4 ${type}`;
    msgDiv.style.display = 'block';
}
