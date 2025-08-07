const pool = require('../db');

exports.createPayment = async (req, res) => {
    const { reservation_id, amount, method } = req.body;
    try {
        await pool.query(
            'INSERT INTO payments (reservation_id, amount, method, status) VALUES ($1, $2, $3, $4)',
            [reservation_id, amount, method, 'completato']
        );
        res.status(201).json({ message: 'Pagamento completato' });
    } catch (err) {
        res.status(500).json({ message: 'Errore pagamento', error: err.message });
    }
};

exports.getPaymentByReservation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM payments WHERE reservation_id = $1', [id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero pagamento', error: err.message });
    }
};