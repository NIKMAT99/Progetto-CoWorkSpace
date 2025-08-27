const pool = require('../db');

exports.getLocations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM locations');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero sedi', error: err.message });
    }
};

exports.createLocation = async (req, res) => {
    const { city, address, name } = req.body;
    try {
        await pool.query(
            'INSERT INTO locations (city, address, name) VALUES ($1, $2, $3)',
            [city, address, name]
        );
        res.status(201).json({ message: 'Sede creata' });
    } catch (err) {
        res.status(500).json({ message: 'Errore creazione sede', error: err.message });
    }
};
exports.getLocationById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Sede non trovata' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Errore recupero sede', error: err.message });
    }
};
