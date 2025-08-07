const pool = require('../db');

exports.getMe = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [req.user.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero profilo', error: err.message });
    }
};

exports.updateMe = async (req, res) => {
    const { full_name, email } = req.body;
    try {
        await pool.query('UPDATE users SET full_name = $1, email = $2 WHERE id = $3', [full_name, email, req.user.id]);
        res.json({ message: 'Profilo aggiornato' });
    } catch (err) {
        res.status(500).json({ message: 'Errore aggiornamento profilo', error: err.message });
    }
};

exports.deleteMe = async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
        res.json({ message: 'Utente eliminato' });
    } catch (err) {
        res.status(500).json({ message: 'Errore eliminazione', error: err.message });
    }
};