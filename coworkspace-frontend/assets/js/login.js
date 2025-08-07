$('#login-form').on('submit', function (e) {
    e.preventDefault();

    const email = $('#email').val();
    const password = $('#password').val();

    $.ajax({
        url: 'http://localhost:3000/auth/login',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function (data) {
            localStorage.setItem('jwt_token', data.token);
            window.location.href = 'dashboard.html';
        },
        error: function () {
            $('#error-msg').removeClass('d-none');
        }
    });
});
