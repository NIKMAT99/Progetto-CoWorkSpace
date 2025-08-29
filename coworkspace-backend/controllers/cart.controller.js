// coworkspace-backend/controllers/cart.controller.js
const pool = require('../db');

/**
 * GET /cart
 * Ritorna le prenotazioni NON pagate dell'utente loggato.
 * Ogni prenotazione = 1h, importo = prezzo dello spazio.
 */
exports.getCart = async (req, res) => {
    const userId = req.user.id;

    const q = `
        SELECT
            r.id,
            r.space_id,
            r.date,
            r.start_time,
            r.end_time,
            s.price AS amount,
            s.type  AS space_label
        FROM reservations r
                 JOIN spaces s ON s.id = r.space_id
        WHERE r.user_id = $1 AND r.paid = FALSE
        ORDER BY r.date DESC, r.start_time DESC
    `;

    try {
        const { rows } = await pool.query(q, [userId]);
        const total = rows.reduce((acc, it) => acc + Number(it.amount), 0);
        res.json({ items: rows, total: Number(total.toFixed(2)) });
    } catch (err) {
        console.error('GET /cart error:', err); // <— utile per leggere lo stack nel terminale
        res.status(500).json({ message: 'Errore carrello', error: err.message });
    }
};

/**
 * POST /cart/checkout
 * Marca come pagate TUTTE le prenotazioni non pagate dell’utente.
 */
exports.checkout = async (req, res) => {
    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const { rows } = await client.query(
            `UPDATE reservations
             SET paid = TRUE, paid_at = NOW()
             WHERE user_id = $1 AND paid = FALSE
             RETURNING id`,
            [userId]
        );
        await client.query('COMMIT');

        res.json({
            message: 'Pagamento confermato',
            paid_reservations: rows.map(r => r.id)
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('POST /cart/checkout error:', err); // <—
        res.status(500).json({ message: 'Errore durante il checkout', error: err.message });
    } finally {
        client.release();
    }
};
