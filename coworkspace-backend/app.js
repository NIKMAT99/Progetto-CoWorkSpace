const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const spaceRoutes = require('./routes/space.routes');
const availabilityRoutes = require('./routes/availability.routes');
const reservationRoutes = require('./routes/reservation.routes');
const paymentRoutes = require('./routes/payment.routes');
const locationRoutes = require('./routes/location.routes');
const uploadRoutes = require('./routes/upload.routes');

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());
app.use('uploads', express.static(path.join(__dirname,'..', 'uploads')));


const FRONTEND_DIR = path.join(__dirname, '..', 'coworkspace-frontend');
console.log('📂 Static dir:', FRONTEND_DIR, 'exists:', fs.existsSync(FRONTEND_DIR));
app.use(express.static(FRONTEND_DIR));




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
    console.log(`✅ Server su http://localhost:${PORT}`);
});

