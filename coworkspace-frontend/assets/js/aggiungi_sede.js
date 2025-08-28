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

async function uploadImageIfAny(fileInputEl) {
    if (!fileInputEl || !fileInputEl.files || fileInputEl.files.length === 0) return null;
    const fd = new FormData();
    fd.append('image', fileInputEl.files[0]); // il field name DEVE essere "image"
    const upRes = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: fd
    });
    if (!upRes.ok) throw new Error('Upload immagine fallito');
    const { url } = await upRes.json();
    return url || null;
}

// Gestione form
document.getElementById('location-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        city: document.getElementById('city').value,
        address: document.getElementById('address').value,
        description: document.getElementById('description').value,
    };

    const fileInputEl = document.getElementById('location-image');

    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            showMessage('Devi essere loggato per creare una sede', 'error');
            return;
        }

        let image_url = null;
        try{
            image_url = await uploadImageIfAny(fileInputEl);
        }catch (err) {
            console.error(err);
            showMessage('caricamento immagine fallito', 'error');
            return;
        }

        const payload = {
            name: formData.name,
            city: formData.city,
            address: formData.address,
            description: formData.description
        };
        if (image_url) payload.image_url = image_url;

        const response = await fetch('http://localhost:3000/locations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            showMessage('Sede creata con successo!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            let msg = 'Errore nella creazione della sede';
            try {
                const errJson = await response.json();
                if (errJson && errJson.message) msg = errJson.message;
            } catch (_) {}
            showMessage(msg, 'error');
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
