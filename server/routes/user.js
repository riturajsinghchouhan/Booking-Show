const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById } = require('../controllers/movieController');
const { getShowsByMovie, getShowById, lockSeats } = require('../controllers/showController');
const { bookSeats, getUserBookings } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public movie routes
router.get('/movies', getAllMovies);
router.get('/movies/:id', getMovieById);

// Show routes
router.get('/shows/:movieId', getShowsByMovie);
router.get('/shows/detail/:showId', getShowById);

// Protected routes (require login)
router.post('/seats/lock', protect, lockSeats);
router.post('/book', protect, bookSeats);
router.get('/bookings/:userId', protect, getUserBookings);

module.exports = router;
