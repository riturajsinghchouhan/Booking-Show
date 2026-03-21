import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Movie from './models/Movie.js';
import Show from './models/Show.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const movies = [
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        duration: 166,
        genre: ["Action", "Adventure", "Sci-Fi"],
        language: "English",
        releaseDate: "2024-03-01",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        poster: "https://image.tmdb.org/t/p/original/8uVKfR6VoBovss00S30D96KyQK6.jpg",
        rating: 8.8
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        genre: ["Drama", "History", "Biography"],
        language: "English",
        releaseDate: "2023-07-21",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
        poster: "https://image.tmdb.org/t/p/original/8Gxv2mYrsUicMfevVZNGqSsqRz2.jpg",
        rating: 8.4
    }
];

const seed = async () => {
    try {
        console.log('🚀 [ESM] Starting seed process...');
        if (!process.env.MONGO_URI) throw new Error('MONGO_URI not found');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Movie.deleteMany({});
        await Show.deleteMany({});
        await User.deleteMany({ email: { $in: ['admin@bms.com', 'user@bms.com'] } });

        const createdMovies = await Movie.insertMany(movies);
        console.log(`✅ Created ${createdMovies.length} movies`);

        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        await User.create([
            { name: 'Admin User', email: 'admin@bms.com', password: adminPassword, role: 'admin' },
            { name: 'Regular User', email: 'user@bms.com', password: userPassword, role: 'user' }
        ]);
        console.log('✅ Created: admin@bms.com / user@bms.com');

        console.log('🎉 Seeding completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ FATAL SEED ERROR:', err.message);
        process.exit(1);
    }
};

seed();
