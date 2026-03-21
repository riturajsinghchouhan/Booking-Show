const Show = require('../models/Show');
const Movie = require('../models/Movie');

const LOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes

// Helper: calculate price for a seat
const getSeatPrice = (seatNumber) => {
    if (seatNumber >= 1 && seatNumber <= 10) return 150;
    if (seatNumber >= 11 && seatNumber <= 20) return 180;
    if (seatNumber >= 21 && seatNumber <= 30) return 200;
    return 0;
};

// Helper: release expired locks (lazy check)
const releaseExpiredLocks = (show) => {
    const now = new Date();
    show.seats.forEach((seat) => {
        if (!seat.isBooked && seat.lockedBy && seat.lockExpiry && seat.lockExpiry < now) {
            seat.lockedBy = null;
            seat.lockExpiry = null;
        }
    });
};

// @desc  Create a new show
// @route POST /api/admin/shows
// @access Admin
const createShow = async (req, res, next) => {
    try {
        const { movieId, time, venue, screen } = req.body;

        if (!movieId || !time) {
            return res.status(400).json({ success: false, message: 'movieId and time are required' });
        }

        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        const show = await Show.create({ movieId, time, venue, screen });

        res.status(201).json({ success: true, message: 'Show created successfully', show });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all shows (Admin)
// @route GET /api/admin/shows
// @access Admin
const getAllShowsAdmin = async (req, res, next) => {
    try {
        const shows = await Show.find()
            .populate('movieId', 'title genre language duration poster')
            .sort({ time: 1 });
        res.json({ success: true, shows });
    } catch (error) {
        next(error);
    }
};

// @desc  Get shows for a specific movie
// @route GET /api/shows/:movieId
// @access Public
const getShowsByMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.movieId);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }

        const shows = await Show.find({
            movieId: req.params.movieId,
            time: { $gte: new Date() },
        })
            .populate('movieId', 'title genre language duration poster')
            .sort({ time: 1 });

        res.json({ success: true, shows });
    } catch (error) {
        next(error);
    }
};

// @desc  Get a single show by ID
// @route GET /api/shows/detail/:showId
// @access Public
const getShowById = async (req, res, next) => {
    try {
        const show = await Show.findById(req.params.showId).populate(
            'movieId',
            'title genre language duration poster description cast rating'
        );
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }

        // Release expired locks lazily
        releaseExpiredLocks(show);
        await show.save();

        res.json({ success: true, show });
    } catch (error) {
        next(error);
    }
};

// @desc  Lock seats for a user (2 minutes)
// @route POST /api/seats/lock
// @access Private (User)
const lockSeats = async (req, res, next) => {
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
            return res
                .status(400)
                .json({ success: false, message: `Invalid seat numbers: ${invalidSeats.join(', ')}` });
        }

        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ success: false, message: 'Show not found' });
        }

        // Release expired locks
        releaseExpiredLocks(show);

        const now = new Date();
        const lockExpiry = new Date(now.getTime() + LOCK_DURATION_MS);
        const conflicts = [];

        // Check each seat
        for (const seatNum of seats) {
            const seat = show.seats.find((s) => s.seatNumber === seatNum);
            if (!seat) {
                return res.status(400).json({ success: false, message: `Seat ${seatNum} does not exist` });
            }
            if (seat.isBooked) {
                conflicts.push({ seat: seatNum, reason: 'already booked' });
            } else if (seat.lockedBy && seat.lockedBy.toString() !== userId.toString()) {
                conflicts.push({ seat: seatNum, reason: 'locked by another user' });
            }
        }

        if (conflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Seat conflict detected',
                conflicts,
            });
        }

        // Lock the seats
        for (const seatNum of seats) {
            const seat = show.seats.find((s) => s.seatNumber === seatNum);
            seat.lockedBy = userId;
            seat.lockExpiry = lockExpiry;
        }

        await show.save();

        const totalPrice = seats.reduce((acc, seatNum) => acc + getSeatPrice(seatNum), 0);

        res.json({
            success: true,
            message: 'Seats locked successfully',
            lockExpiry,
            totalPrice,
            seats,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createShow, getAllShowsAdmin, getShowsByMovie, getShowById, lockSeats, getSeatPrice, releaseExpiredLocks };
