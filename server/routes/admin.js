const express = require('express');
const router = express.Router();
const {
    createMovie,
    getAllMoviesAdmin,
    getMovieById,
    deleteMovie,
} = require('../controllers/movieController');
const { createShow, getAllShowsAdmin } = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/auth');

// Movie admin routes
router.post('/movies', protect, adminOnly, createMovie);
router.get('/movies', protect, adminOnly, getAllMoviesAdmin);
router.delete('/movies/:id', protect, adminOnly, deleteMovie);

// Show admin routes
router.post('/shows', protect, adminOnly, createShow);
router.get('/shows', protect, adminOnly, getAllShowsAdmin);

module.exports = router;
