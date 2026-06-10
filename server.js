const express = require('express');
const path = require('path');

const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const reservationRoutes = require('./routes/reservations');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
