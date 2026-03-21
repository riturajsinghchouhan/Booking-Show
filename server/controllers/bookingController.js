const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { getSeatPrice, releaseExpiredLocks } = require('./showController');

// @desc  Book seats
// @route POST /api/book
// @access Private (User)
const bookSeats = async (req, res, next) => {
    try {
        const { showId, seats, userId } = req.body;

        // Validation
        if (!showId) return res.status(400).json({ success: false, message: 'showId is required' });
        if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
        if (!seats || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one seat must be selected' });
        }

        const invalidSeats = seats.filter((s) => s < 1 || s > 30);
        if (invalidSeats.length > 0) {
            return res.status(400).json({ success: false, message: `Invalid seat numbers: ${invalidSeats.join(', ')}` });
        }

        const show = await Show.findById(showId).populate('movieId');
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }

        // Release expired locks
        releaseExpiredLocks(show);

        const now = new Date();
        const conflicts = [];

        // Validate all seats
        for (const seatNum of seats) {
            const seat = show.seats.find((s) => s.seatNumber === seatNum);
            if (!seat) {
                return res.status(400).json({ success: false, message: `Seat ${seatNum} does not exist` });
            }
            if (seat.isBooked) {
                conflicts.push({ seat: seatNum, reason: 'already booked' });
            } else if (!seat.lockedBy) {
                conflicts.push({ seat: seatNum, reason: 'seat not locked, please lock first' });
            } else if (seat.lockedBy.toString() !== userId.toString()) {
                conflicts.push({ seat: seatNum, reason: 'locked by another user' });
            } else if (seat.lockExpiry && seat.lockExpiry < now) {
                conflicts.push({ seat: seatNum, reason: 'lock has expired, please lock again' });
            }
        }

        if (conflicts.length > 0) {
            return res.status(409).json({ success: false, message: 'Booking conflict', conflicts });
        }

        // Calculate total price on backend (never trust frontend)
        const totalPrice = seats.reduce((acc, seatNum) => acc + getSeatPrice(seatNum), 0);

        // Mark seats as booked
        for (const seatNum of seats) {
            const seat = show.seats.find((s) => s.seatNumber === seatNum);
            seat.isBooked = true;
            seat.lockedBy = null;
            seat.lockExpiry = null;
        }

        await show.save();

        // Create booking record
        const booking = await Booking.create({
            showId: show._id,
            movieId: show.movieId._id,
            userId,
            seats,
            totalPrice,
        });

        // Populate for response
        await booking.populate([
            { path: 'showId', select: 'time venue screen' },
            { path: 'movieId', select: 'title poster language genre' },
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking confirmed!',
            booking,
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get bookings for a user
// @route GET /api/bookings/:userId
// @access Private
const getUserBookings = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const bookings = await Booking.find({ userId })
            .populate('movieId', 'title poster language genre duration')
            .populate('showId', 'time venue screen')
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        next(error);
    }
};

module.exports = { bookSeats, getUserBookings };
