const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
        },
        duration: {
            type: Number, // in minutes
            required: [true, 'Duration is required'],
        },
        genre: {
            type: [String],
            required: [true, 'Genre is required'],
        },
        releaseDate: {
            type: Date,
            required: [true, 'Release date is required'],
        },
        cast: {
            type: [String],
            default: [],
        },
        language: {
            type: String,
            required: [true, 'Language is required'],
            default: 'English',
        },
        poster: {
            type: String,
            default: '',
        },
        rating: {
            type: Number,
            min: 0,
            max: 10,
            default: 0,
        },
        type: {
            type: String,
            enum: ['movie', 'series'],
            default: 'movie',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
