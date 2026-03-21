const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        showId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Show',
            required: [true, 'Show ID is required'],
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie',
            required: [true, 'Movie ID is required'],
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
        },
        seats: {
            type: [Number],
            required: [true, 'Seats are required'],
            validate: {
                validator: (v) => v.length > 0,
                message: 'At least one seat must be selected',
            },
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        bookedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled'],
            default: 'confirmed',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
