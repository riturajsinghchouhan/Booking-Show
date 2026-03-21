const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Movie = require('./models/Movie');
const Show = require('./models/Show');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const logFile = 'seed_detailed.log';
const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

if (fs.existsSync(logFile)) fs.unlinkSync(logFile);

const data = [
    /* MOVIES */
    {
        title: "Dune: Part Two",
        description: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
        duration: 166,
        genre: ["Action", "Adventure", "Sci-Fi"],
        language: "English",
        releaseDate: "2024-03-01",
        cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
        poster: "https://image.tmdb.org/t/p/w500/8uVKfR6VoBovss00S30D96KyQK6.jpg",
        rating: 8.8,
        type: "movie"
    },
    {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.",
        duration: 180,
        genre: ["Drama", "History", "Biography"],
        language: "English",
        releaseDate: "2023-07-21",
        cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon"],
        poster: "https://image.tmdb.org/t/p/w500/8Gxv2mYrsUicMfevVZNGqSsqRz2.jpg",
        rating: 8.4,
        type: "movie"
    },
    {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        duration: 148,
        genre: ["Action", "Sci-Fi", "Adventure"],
        language: "English",
        releaseDate: "2010-07-16",
        cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
        poster: "https://image.tmdb.org/t/p/w500/edv3bs1vYvHcsuIISbjyY97Q1S2.jpg",
        rating: 8.8,
        type: "movie"
    },
    {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
        duration: 140,
        genre: ["Animation", "Action", "Adventure"],
        language: "English",
        releaseDate: "2023-06-02",
        cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
        poster: "https://image.tmdb.org/t/p/w500/8Vtbb9rs9tA116STu0qxAbvB0I6.jpg",
        rating: 8.9,
        type: "movie"
    },
    {
        title: "The Shawshank Redemption",
        description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
        duration: 142,
        genre: ["Drama"],
        language: "English",
        releaseDate: "1994-09-22",
        cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
        poster: "https://image.tmdb.org/t/p/w500/lypBY9sS78PkqXCNqOD9h9nPk7j.jpg",
        rating: 9.3,
        type: "movie"
    },
    {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        duration: 152,
        genre: ["Action", "Crime", "Drama"],
        language: "English",
        releaseDate: "2008-07-18",
        cast: ["Christian Bale", "Health Ledger", "Aaron Eckhart"],
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6ixuV79UMm9VrnCqS0qYuN.jpg",
        rating: 9.0,
        type: "movie"
    },
    {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        duration: 169,
        genre: ["Adventure", "Drama", "Sci-Fi"],
        language: "English",
        releaseDate: "2014-11-07",
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6EwfVDxCzs25QsyI6UZ.jpg",
        rating: 8.7,
        type: "movie"
    },
    {
        title: "Fight Club",
        description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
        duration: 139,
        genre: ["Drama"],
        language: "English",
        releaseDate: "1999-10-15",
        cast: ["Brad Pitt", "Edward Norton", "Meat Loaf"],
        poster: "https://image.tmdb.org/t/p/w500/pB8BM7pdv9ovvyhNKV76pIyaHG3.jpg",
        rating: 8.8,
        type: "movie"
    },

    /* SERIES */
    {
        title: "Money Heist",
        description: "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.",
        duration: 45,
        genre: ["Crime", "Drama", "Thriller"],
        language: "Spanish",
        releaseDate: "2017-05-02",
        cast: ["Úrsula Corberó", "Álvaro Morte", "Itziar Ituño"],
        poster: "https://image.tmdb.org/t/p/w500/reEMJA1uzpG3SZ0KGv7Gz97MEo9.jpg",
        rating: 8.2,
        type: "series"
    },
    {
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
        duration: 50,
        genre: ["Drama", "Fantasy", "Horror"],
        language: "English",
        releaseDate: "2016-07-15",
        cast: ["Winona Ryder", "David Harbour", "Millie Bobby Brown"],
        poster: "https://image.tmdb.org/t/p/w500/49WJfev9mUvSzoRmqrFj39j7YvM.jpg",
        rating: 8.7,
        type: "series"
    },
    {
        title: "The Mandalorian",
        description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
        duration: 40,
        genre: ["Action", "Adventure", "Sci-Fi"],
        language: "English",
        releaseDate: "2019-11-12",
        cast: ["Pedro Pascal", "Katee Sackhoff", "Carl Weathers"],
        poster: "https://image.tmdb.org/t/p/w500/eU1i6eHXlzhZ6pPaR18Zviabaqw.jpg",
        rating: 8.7,
        type: "series"
    },
    {
        title: "Breaking Bad",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        duration: 47,
        genre: ["Crime", "Drama", "Thriller"],
        language: "English",
        releaseDate: "2008-01-20",
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
        poster: "https://image.tmdb.org/t/p/w500/ggFHnq968U9qLszq3uY2DSTjb4n.jpg",
        rating: 9.5,
        type: "series"
    },
    {
        title: "The Last of Us",
        description: "After a global pandemic destroys civilization, a hardened survivor takes charge of a 14-year-old girl who may be humanity's last hope.",
        duration: 50,
        genre: ["Drama", "Action", "Adventure"],
        language: "English",
        releaseDate: "2023-01-15",
        cast: ["Pedro Pascal", "Bella Ramsey", "Anna Torv"],
        poster: "https://image.tmdb.org/t/p/w500/uKvH56B29GFAmD8tz1B4CfkFzEq.jpg",
        rating: 8.8,
        type: "series"
    },
    {
        title: "Succession",
        description: "The Roy family is known for controlling the biggest media and entertainment company in the world. However, their world changes when their father steps down from the company.",
        duration: 60,
        genre: ["Drama"],
        language: "English",
        releaseDate: "2018-06-03",
        cast: ["Brian Cox", "Jeremy Strong", "Sarah Snook"],
        poster: "https://image.tmdb.org/t/p/w500/yk7N2E8l1mOn15I8N5GfW6L6j0r.jpg",
        rating: 8.9,
        type: "series"
    },
    {
        title: "Ted Lasso",
        description: "American college football coach Ted Lasso heads to London to manage AFC Richmond, a struggling English Premier League football team.",
        duration: 30,
        genre: ["Comedy", "Drama", "Sport"],
        language: "English",
        releaseDate: "2020-08-14",
        cast: ["Jason Sudeikis", "Hannah Waddingham", "Jeremy Swift"],
        poster: "https://image.tmdb.org/t/p/w500/378S7B6t9OEqSpx66I67pW0asnM.jpg",
        rating: 8.8,
        type: "series"
    },
    {
        title: "Arcane",
        description: "Set in utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions-and the power that will tear them apart.",
        duration: 40,
        genre: ["Animation", "Action", "Adventure"],
        language: "English",
        releaseDate: "2021-11-06",
        cast: ["Hailee Steinfeld", "Ella Purnell", "Kevin Alejandro"],
        poster: "https://image.tmdb.org/t/p/w500/fqld9yqyVFSvS9979tgy3MvGvKy.jpg",
        rating: 9.0,
        type: "series"
    }
];

const seed = async () => {
    try {
        log('Starting seeding...');
        await mongoose.connect(process.env.MONGO_URI);
        log('Connected to MongoDB...');

        await Movie.deleteMany({});
        await Show.deleteMany({});
        await User.deleteMany({ email: { $in: ['admin@bms.com', 'user@bms.com'] } });
        log('Cleared existing data.');

        const createdItems = await Movie.insertMany(data);
        log(`Created ${createdItems.length} items (8 Movies, 8 Series).`);

        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        await User.create([
            { name: 'Admin User', email: 'admin@bms.com', password: adminPassword, role: 'admin' },
            { name: 'Regular User', email: 'user@bms.com', password: userPassword, role: 'user' }
        ]);
        log('Created test accounts: admin@bms.com / user@bms.com');

        const venues = ['PVR Cinemas', 'IMAX Big Screen', 'Cineplex', 'Galaxy Cinemas', 'Regent Theatre', 'Miraj Cinema'];
        const screens = ['Screen 1', 'Screen 2', 'Premium 3', 'Gold Class', 'Atmos Hall', 'IMAX 1'];

        let showCount = 0;
        for (const item of createdItems) {
            log(`Populating shows for: ${item.title}`);
            for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
                const slots = [10, 14, 18, 22];
                for (const hour of slots) {
                    const showTime = new Date();
                    showTime.setHours(hour, 0, 0, 0);
                    if (dayOffset === 1) showTime.setDate(showTime.getDate() + 1);

                    await Show.create({
                        movieId: item._id,
                        time: showTime,
                        venue: venues[Math.floor(Math.random() * venues.length)],
                        screen: screens[Math.floor(Math.random() * screens.length)],
                        totalSeats: 30
                    });
                    showCount++;
                }
            }
        }
        log(`Populated ${showCount} total shows.`);

        log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        log('Seeding error: ' + err.stack);
        process.exit(1);
    }
};

seed();
