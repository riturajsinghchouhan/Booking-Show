require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const Show = require('./models/Show');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: '🎬 BookMyShow Lite++ API is running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

// Periodic lock cleanup (every minute)
setInterval(async () => {
    try {
        const now = new Date();
        const result = await Show.updateMany(
            { 'seats.lockExpiry': { $lt: now }, 'seats.isBooked': false },
            {
                $set: {
                    'seats.$[expired].lockedBy': null,
                    'seats.$[expired].lockExpiry': null,
                },
            },
            {
                arrayFilters: [
                    { 'expired.lockExpiry': { $lt: now }, 'expired.isBooked': false },
                ],
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`🔓 Released expired locks on ${result.modifiedCount} show(s)`);
        }
    } catch (err) {
        console.error('Lock cleanup error:', err.message);
    }
}, 60 * 1000); // every 60 seconds

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
