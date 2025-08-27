const pool = require('../db');

exports.createReservation = async (req, res) => {
    const { space_id, date, start_time, end_time } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
            'INSERT INTO reservations (user_id, space_id, date, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5, $6)',
            [req.user.id, space_id, date, start_time, end_time, 'confermata']
        );

        await client.query('COMMIT');
        res.status(201).json({ message: 'Prenotazione creata e disponibilità aggiornata' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: 'Errore prenotazione', error: err.message });
    } finally {
        client.release();
    }
};

exports.getMyReservations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reservations WHERE user_id = $1', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero prenotazioni', error: err.message });
    }
};

exports.deleteReservation = async (req, res) => {
    const reservationId = req.params.id;
    const userId = req.user.id; // preso dal token JWT

    try {
        // Verifica che la prenotazione appartenga all'utente
        const check = await db.query(
            'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
            [reservationId, userId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Prenotazione non trovata' });
        }

        await db.query('DELETE FROM reservations WHERE id = $1', [reservationId]);

        res.json({ message: 'Prenotazione cancellata' });
    } catch (err) {
        res.status(500).json({ message: 'Errore durante la cancellazione', error: err });
    }
};
