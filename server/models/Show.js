const mongoose = require('mongoose');

// Seat schema embedded in Show
const seatSchema = new mongoose.Schema(
    {
        seatNumber: {
            type: Number,
            required: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
        },
        lockedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        lockExpiry: {
            type: Date,
            default: null,
        },
    },
    { _id: false }
);

const showSchema = new mongoose.Schema(
    {
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Movie ID is required'],
        },
        time: {
            type: Date,
            required: [true, 'Show time is required'],
        },
        totalSeats: {
            type: Number,
            default: 30,
        },
        seats: {
            type: [seatSchema],
            default: [],
        },
        venue: {
            type: String,
            default: 'Main Auditorium',
        },
        screen: {
            type: String,
            default: 'Screen 1',
        },
    },
    { timestamps: true }
);

// Auto-generate 30 seats before save
showSchema.pre('save', function () {
    if (this.isNew && this.seats.length === 0) {
        this.seats = Array.from({ length: 30 }, (_, i) => ({
            seatNumber: i + 1,
            isBooked: false,
            lockedBy: null,
            lockExpiry: null,
        }));
    }
});

module.exports = mongoose.model('Show', showSchema);
