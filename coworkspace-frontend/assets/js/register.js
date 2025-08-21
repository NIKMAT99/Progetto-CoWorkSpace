$('#register-form').on('submit', function (e) {
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#password').val();
    const full_name = $('#full_name').val();
    const role = $('#role').val(); // Assicurati di avere un campo select/input nel form

    $.ajax({
        url: 'http://localhost:3000/auth/register',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password, full_name, role }),
        success: function (data) {
            alert(data.message || "Registrazione completata!");
            // Dopo registrazione → reindirizza al login
            window.location.href = 'logit.html';
        },
        error: function (xhr) {
            const msg = xhr.responseJSON?.message || "Errore nella registrazione.";
            $('#error-msg').removeClass('d-none').text(msg);
        }
    });
});
