const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { email, password, full_name, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    try {
        await pool.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4)',
            [email, hashed, full_name, role]
        );
        res.status(201).json({ message: 'Utente registrato' });
    } catch (err) {
        res.status(400).json({ message: 'Errore nella registrazione', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Credenziali non valide' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Errore login', error: err.message });
    }
};