document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        window.location.href = 'dashboard.html';
    }

    // Aggiorna anno corrente
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Validazione password in tempo reale
    document.getElementById('password').addEventListener('input', function() {
        const password = this.value;
        const strengthBar = document.getElementById('password-strength');

        if (password.length === 0) {
            strengthBar.style.width = '0%';
            strengthBar.style.background = 'var(--secondary-color)';
        } else if (password.length < 6) {
            strengthBar.style.width = '33%';
            strengthBar.style.background = '#dc3545';
        } else if (password.length < 8) {
            strengthBar.style.width = '66%';
            strengthBar.style.background = '#ffc107';
        } else {
            strengthBar.style.width = '100%';
            strengthBar.style.background = '#198754';
        }
    });

    // Controlla corrispondenza password
    document.getElementById('confirm-password').addEventListener('input', function() {
        const password = document.getElementById('password').value;
        const confirmPassword = this.value;
        const matchDiv = document.getElementById('password-match');

        if (confirmPassword && password !== confirmPassword) {
            matchDiv.style.display = 'block';
        } else {
            matchDiv.style.display = 'none';
        }
    });

    // Gestione registrazione
    document.getElementById('register-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const role = document.getElementById('role').value;
        const terms = document.getElementById('terms').checked;

        const messageDiv = document.getElementById('register-message');
        messageDiv.style.display = 'none';

        // Validazione
        if (password !== confirmPassword) {
            showMessage('Le password non coincidono', 'error');
            return;
        }

        if (!terms) {
            showMessage('Devi accettare i termini di servizio', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('La password deve essere di almeno 6 caratteri', 'error');
            return;
        }

        // Mostra loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Registrazione in corso...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    full_name: name,
                    role: role
                })
            });

            let data;
            data = await response.json();
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);

        } finally {
            // Ripristina pulsante
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function showMessage(message, type) {
        const messageDiv = document.getElementById('register-message');
        messageDiv.textContent = message;
        messageDiv.className = `form-message mt-3 ${type}`;
        messageDiv.style.display = 'block';

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
});
