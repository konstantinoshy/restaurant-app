const express = require('express');
const router = express.Router();

const reservations = [];
let nextReservationId = 1;

const OPENING_HOUR = 11;
const CLOSING_HOUR = 23;

// POST /api/reservations  { name, email, date, time, partySize }
router.post('/', (req, res) => {
    const { name, email, date, time, partySize } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'a valid email is required' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    }
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: 'time is required (HH:MM)' });
    }

    const hour = Number(time.slice(0, 2));
    if (hour < OPENING_HOUR || hour >= CLOSING_HOUR) {
        return res.status(400).json({ error: `Reservations are available between ${OPENING_HOUR}:00 and ${CLOSING_HOUR}:00` });
    }

    const size = Number(partySize);
    if (!Number.isInteger(size) || size < 1 || size > 20) {
        return res.status(400).json({ error: 'partySize must be between 1 and 20' });
    }

    const requested = new Date(`${date}T${time}:00`);
    if (Number.isNaN(requested.getTime()) || requested < new Date()) {
        return res.status(400).json({ error: 'Reservation must be for a future date and time' });
    }

    const reservation = {
        id: nextReservationId++,
        name: name.trim(),
        email,
        date,
        time,
        partySize: size,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    reservations.push(reservation);
    res.status(201).json(reservation);
});

// GET /api/reservations?date=YYYY-MM-DD
router.get('/', (req, res) => {
    const { date } = req.query;
    if (date) {
        return res.json(reservations.filter(r => r.date === date));
    }
    res.json(reservations);
});

// DELETE /api/reservations/:id
router.delete('/:id', (req, res) => {
    const index = reservations.findIndex(r => r.id === Number(req.params.id));
    if (index === -1) {
        return res.status(404).json({ error: 'Reservation not found' });
    }
    reservations[index].status = 'cancelled';
    res.json(reservations[index]);
});

module.exports = router;
