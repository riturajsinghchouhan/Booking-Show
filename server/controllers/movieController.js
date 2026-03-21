const Movie = require('../models/Movie');

// @desc  Create a new movie
// @route POST /api/admin/movies
// @access Admin
const createMovie = async (req, res, next) => {
    try {
        const { title, description, duration, genre, releaseDate, cast, language, poster, rating } =
            req.body;

        if (!title || !description || !duration || !genre || !releaseDate || !language) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const movie = await Movie.create({
            title,
            description,
            duration,
            genre: Array.isArray(genre) ? genre : [genre],
            releaseDate,
            cast: cast || [],
            language,
            poster: poster || '',
            rating: rating || 0,
        });

        res.status(201).json({ success: true, message: 'Movie created successfully', movie });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all movies (Admin)
// @route GET /api/admin/movies
// @access Admin
const getAllMoviesAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [movies, total] = await Promise.all([
            Movie.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Movie.countDocuments(),
        ]);

        res.json({
            success: true,
            movies,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get all movies (Public)
// @route GET /api/movies
// @access Public
const getAllMovies = async (req, res, next) => {
    try {
        const { search, genre, language, page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (genre) query.genre = { $in: [genre] };
        if (language) query.language = language;

        const [movies, total] = await Promise.all([
            Movie.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Movie.countDocuments(query),
        ]);

        res.json({
            success: true,
            movies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc  Get a single movie by ID
// @route GET /api/movies/:id
// @access Public
const getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.json({ success: true, movie });
    } catch (error) {
        next(error);
    }
};

// @desc  Delete a movie
// @route DELETE /api/admin/movies/:id
// @access Admin
const deleteMovie = async (req, res, next) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Movie not found' });
        }
        res.json({ success: true, message: 'Movie deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { createMovie, getAllMoviesAdmin, getAllMovies, getMovieById, deleteMovie };
