const pool = require('../db');

// Calcolo dinamico degli slot disponibili
exports.getDynamicAvailability = async (req, res) => {
    const { space_id, date } = req.query;
    if (!space_id || !date) return res.status(400).json({ message: 'space_id e date obbligatori' });

    try {
        const result = await pool.query(`
      SELECT start_time, end_time
      FROM reservation
      WHERE space_id = $1 AND date = $2
    `, [space_id, date]);

        const booked = result.rows;

        const allSlots = [];
        for (let h = 8; h < 24; h++) {
            const start = `${String(h).padStart(2, '0')}:00`;
            const end = `${String(h + 1).padStart(2, '0')}:00`;

            const conflict = booked.some(b => b.start_time === start && b.end_time === end);
            if (!conflict) {
                allSlots.push({ start_time: start, end_time: end });
            }
        }

        res.json(allSlots);
    } catch (err) {
        res.status(500).json({ message: 'Errore nel calcolo disponibilità', error: err });
    }
};
