// assets/js/cart-badge.js
const API_BASE = 'http://localhost:3000';

window.updateCartBadge = function (count) {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    if (!Number.isFinite(count) || count <= 0) {
        badge.textContent = '0';
        badge.classList.add('d-none');
    } else {
        badge.textContent = String(count);
        badge.classList.remove('d-none');
    }
};

window.refreshCartBadge = async function () {
    const btn = document.getElementById('nav-cart-btn');
    const token = typeof getAuthToken === 'function' ? getAuthToken() : null;

    if (!btn) return; // la pagina non ha il bottone

    if (!token) {
        updateCartBadge(0);
        btn.disabled = false; // tienilo cliccabile per mandare al login
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        updateCartBadge(Array.isArray(data.items) ? data.items.length : 0);
    } catch (e) {
        console.error('Cart badge error:', e);
        updateCartBadge(0);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('nav-cart-btn');
    if (!btn) return;

    // Aggiorna badge all’apertura pagina
    refreshCartBadge();

    // Comportamento click: se non loggato → login, altrimenti vai al carrello
    btn.addEventListener('click', () => {
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) window.location.href = 'login.html';
        else window.location.href = 'carrello.html';
    });
});
