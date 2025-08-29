$(async function () {
    const token = getAuthToken();
    if (!token) return window.location.href = 'login.html';

    function euro(n) {
        return '€ ' + Number(n).toFixed(2).replace('.', ',');
    }

    async function loadCart() {
        try {
            const res = await fetch(`${window.API_URL}/cart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('HTTP ' + res.status);

            const data = await res.json();
            renderCart(data.items, data.total);
        } catch (e) {
            console.error(e);
            $('#cart-empty').removeClass('d-none').text('Errore nel caricamento del carrello.');
            $('#cart-card').addClass('d-none');
        }
    }

    function renderCart(items, total) {
        const tbody = $('#cart-tbody').empty();

        if (!items || items.length === 0) {
            $('#cart-empty').removeClass('d-none');
            $('#cart-card').addClass('d-none');
            $('#cart-total').text('€ 0,00');
            return;
        }

        $('#cart-empty').addClass('d-none');
        $('#cart-card').removeClass('d-none');

        for (const it of items) {
            // NB: nel backend la tabella reservations ha campi separati: date, start_time, end_time
            const d = it.date ? new Date(it.date) : null;
            const start = it.start_time ? it.start_time : '';
            const end = it.end_time ? it.end_time : '';

            const row = $(`
        <tr>
          <td>${it.id}</td>
          <td>${it.space_label ?? it.space_id}</td>
          <td>${d ? d.toLocaleDateString() : '-'}</td>
          <td>${start}</td>
          <td>${end}</td>
          <td><strong>${euro(it.amount)}</strong></td>
        </tr>
      `);
            tbody.append(row);
        }

        $('#cart-total').text(euro(total));
    }

    async function payAll() {
        const ok = confirm('Confermi il pagamento?');
        if (!ok) return;

        try {
            const res = await fetch(`${window.API_URL}/cart/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || ('HTTP ' + res.status));
            }

            alert('Pagamento effettuato con successo.');
            // Ricarico la pagina carrello: ora risulterà vuota (tutto pagato)
            window.location.href = 'carrello.html';
        } catch (e) {
            alert('Errore durante il pagamento: ' + e.message);
            console.error(e);
        }
    }

    $('#pay-all').on('click', payAll);
    await loadCart();
});
