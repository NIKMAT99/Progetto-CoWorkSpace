const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const spaceRoutes = require('./routes/space.routes');
const availabilityRoutes = require('./routes/availability.routes');
const reservationRoutes = require('./routes/reservation.routes');
const paymentRoutes = require('./routes/payment.routes');
const locationRoutes = require('./routes/location.routes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/spaces', spaceRoutes);
app.use('/availability', availabilityRoutes);
app.use('/reservations', reservationRoutes);
app.use('/payments', paymentRoutes);
app.use('/locations', locationRoutes);

app.get('/', (req, res) => {
    res.send('CoWorkSpace API attiva');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});

