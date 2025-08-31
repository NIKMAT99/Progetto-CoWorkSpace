const pool = require('../db');

exports.createSpace = async (req, res) => {
    const { location_id, type, description, services, price, cover_image_url = null } = req.body;
    try {
        await pool.query(
            'INSERT INTO spaces (location_id, type, description, services, price, cover_image_url) ' +
            'VALUES ($1, $2, $3, $4, $5, $6)',
            [location_id, type, description, services, price, cover_image_url ]
        );
        res.status(201).json({ message: 'Spazio creato' });
    } catch (err) {
        res.status(500).json({ message: 'Errore creazione spazio', error: err.message });
    }
}

exports.getSpaces = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM spaces');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero spazi', error: err.message });
    }
};