const pool = require('../db');

exports.getSpaces = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM spaces');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero spazi', error: err.message });
    }
};

exports.createSpace = async (req, res) => {
    const { location_id, type, description, services, price } = req.body;
    try {
        await pool.query(
            'INSERT INTO spaces (location_id, type, description, services, price) VALUES ($1, $2, $3, $4, $5)',
            [location_id, type, description, services, price]
        );
        res.status(201).json({ message: 'Spazio creato' });
    } catch (err) {
        res.status(500).json({ message: 'Errore creazione spazio', error: err.message });
    }
};
