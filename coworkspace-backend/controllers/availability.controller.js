const pool = require('../db');

// Ottieni tutti gli slot disponibili per uno spazio in una data specifica
exports.getAvailableSlots = async (req, res) => {
    const { space_id, date } = req.query;

    try {
        if (!space_id || !date) {
            return res.status(400).json({
                message: 'Parametri mancanti: space_id e date richiesti'
            });
        }

        // 1. Verifica se lo spazio esiste
        const spaceCheck = await pool.query(
            'SELECT id, location_id FROM spaces WHERE id = $1',
            [space_id]
        );

        if (spaceCheck.rows.length === 0) {
            return res.status(404).json({
                message: 'Spazio non trovato'
            });
        }

        // 2.

        const openingTime =  '08:00';
        const closingTime = '22:00';
        const slotDuration = 60; // durata slot in minuti

        // 3. Recupera tutte le prenotazioni CONFERMATE per questo spazio nella data specificata
        const existingReservations = await pool.query(
            `SELECT start_time, end_time FROM reservations 
             WHERE space_id = $1 
             AND date = $2 
             AND status = 'confirmed'
             ORDER BY start_time`,
            [space_id, date]
        );

        // 4. Genera tutti gli slot possibili della giornata
        const allSlots = generateTimeSlots(openingTime, closingTime, slotDuration);

        // 5. Filtra gli slot disponibili (rimuovi quelli già prenotati)
        const availableSlots = allSlots.filter(slot => {
            return !isSlotBooked(slot, existingReservations.rows);
        });

        res.json({
            space_id: parseInt(space_id),
            date: date,
            opening_time: openingTime,
            closing_time: closingTime,
            available_slots: availableSlots,
            total_slots: allSlots.length,
            booked_slots: existingReservations.rows.length
        });

    } catch (error) {
        console.error('Errore recupero slot disponibili:', error);
        res.status(500).json({
            message: 'Errore nel recupero degli slot disponibili',
            error: error.message
        });
    }
};

// Funzione per generare gli slot orari
function generateTimeSlots(openingTime, closingTime, durationMinutes) {
    const slots = [];

    // Converti gli orari in minuti dalla mezzanotte
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    let currentMinutes = openMinutes;

    while (currentMinutes + durationMinutes <= closeMinutes) {
        const startHour = Math.floor(currentMinutes / 60);
        const startMinute = currentMinutes % 60;

        const endMinutes = currentMinutes + durationMinutes;
        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;

        const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        slots.push({
            start_time: startTime,
            end_time: endTime,
            duration: durationMinutes
        });

        currentMinutes += durationMinutes;
    }

    return slots;
}

// Funzione per verificare se uno slot è già prenotato
function isSlotBooked(slot, existingReservations) {
    const slotStart = convertToMinutes(slot.start_time);
    const slotEnd = convertToMinutes(slot.end_time);

    return existingReservations.some(reservation => {
        const reservationStart = convertToMinutes(reservation.start_time);
        const reservationEnd = convertToMinutes(reservation.end_time);

        // Controlla se c'è sovrapposizione
        return (slotStart < reservationEnd && slotEnd > reservationStart);
    });
}

// Funzione helper per convertire "HH:MM" in minuti
function convertToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Verifica disponibilità per uno slot specifico
exports.checkAvailability = async (req, res) => {
    const { space_id, date, start_time, end_time } = req.query;

    try {
        if (!space_id || !date || !start_time || !end_time) {
            return res.status(400).json({
                message: 'Parametri mancanti: space_id, date, start_time, end_time richiesti'
            });
        }

        // Verifica se lo slot è già prenotato
        const existingReservation = await pool.query(
            `SELECT id FROM reservations
             WHERE space_id = $1
               AND date = $2
               AND (
                 (start_time < $4 AND end_time > $3) OR
                 (start_time >= $3 AND start_time < $4) OR
                 (end_time > $3 AND end_time <= $4)
                 )`,
            [space_id, date, start_time, end_time]
        );

        const isAvailable = (existingReservation.rows.length === 0);

        res.json({
            available: isAvailable,
            conflicting_reservations: isAvailable ? [] : existingReservation.rows
        });

    } catch (error) {
        console.error('Errore controllo disponibilità:', error);
        res.status(500).json({
            message: 'Errore nel controllo della disponibilità',
            error: error.message
        });
    }
};

// Opzionale: endpoint per ottenere tutte le prenotazioni di uno spazio in un intervallo di date
exports.getSpaceReservations = async (req, res) => {
    const { space_id, start_date, end_date } = req.query;

    try {
        if (!space_id || !start_date || !end_date) {
            return res.status(400).json({
                message: 'Parametri mancanti: space_id, start_date, end_date richiesti'
            });
        }

        const reservations = await pool.query(
            `SELECT id, date, start_time, end_time, status, user_id 
             FROM reservations 
             WHERE space_id = $1 
             AND date BETWEEN $2 AND $3
             ORDER BY date, start_time`,
            [space_id, start_date, end_date]
        );

        res.json({
            space_id: parseInt(space_id),
            start_date: start_date,
            end_date: end_date,
            reservations: reservations.rows
        });

    } catch (error) {
        console.error('Errore recupero prenotazioni spazio:', error);
        res.status(500).json({
            message: 'Errore nel recupero delle prenotazioni',
            error: error.message
        });
    }
};