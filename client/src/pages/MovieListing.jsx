import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X, Star, Clock, Globe, TrendingUp } from 'lucide-react'
import { movieAPI } from '../api'
import './MovieListing.css'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation']

const MovieCard = ({ movie, index }) => {
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ''
    return (
        <Link
            to={`/movies/${movie._id}`}
            className="movie-card anim-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <div className="movie-poster-wrap">
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster-img"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=500";
                        }}
                    />
                ) : (
                    <div className="movie-poster-placeholder">
                        <TrendingUp size={40} strokeWidth={1} style={{ color: 'var(--text-muted)' }} />
                    </div>
                )}
                <div className="movie-type-badge">
                    {movie.type === 'series' ? 'Series' : 'Movie'}
                </div>
                {movie.rating > 0 && (
                    <div className="movie-rating-badge">
                        <Star size={11} fill="currentColor" /> {movie.rating.toFixed(1)}
                    </div>
                )}
                <div className="movie-language-badge">
                    <Globe size={10} strokeWidth={2} /> {movie.language}
                </div>
                <div className="movie-card-overlay">
                    <span className="movie-book-label">Book Tickets</span>
                </div>
            </div>
            <div className="movie-card-body">
                <h3 className="movie-card-title">{movie.title}</h3>
                <div className="movie-card-meta">
                    <span className="meta-chip"><Clock size={11} strokeWidth={2} /> {movie.duration}m</span>
                    {year && <span className="meta-chip">{year}</span>}
                </div>
                <div className="movie-genres">
                    {movie.genre?.slice(0, 2).map((g) => (
                        <span key={g} className="badge badge-info">{g}</span>
                    ))}
                </div>
            </div>
        </Link>
    )
}

const MovieListing = () => {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [genre, setGenre] = useState('')
    const [type, setType] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({})

    const fetchMovies = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await movieAPI.getAll({ search, genre, type, page, limit: 12 })
            setMovies(res.data.movies)
            setPagination(res.data.pagination)
        } catch {
            setError('Failed to load movies. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMovies()
    }, [search, genre, type, page])

    const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
    const handleGenre = (g) => { setGenre(genre === g ? '' : g); setPage(1) }

    return (
        <div className="page movie-listing-page">
            {/* Hero */}
            <div className="listing-hero">
                <p className="listing-eyebrow">What's running now</p>
                <h1 className="section-title listing-title">Find your next <span>great watch</span></h1>

                <div className="search-wrap">
                    <Search size={16} className="search-icon-svg" strokeWidth={2} />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search by title..."
                        className="search-input"
                    />
                    {search && (
                        <button className="search-clear" onClick={() => { setSearch(''); setPage(1) }} aria-label="Clear search">
                            <X size={14} strokeWidth={2.5} />
                        </button>
                    )}
                </div>

                <div className="type-pills">
                    <button onClick={() => { setType(''); setPage(1) }} className={`type-pill ${type === '' ? 'active' : ''}`}>All</button>
                    <button onClick={() => { setType('movie'); setPage(1) }} className={`type-pill ${type === 'movie' ? 'active' : ''}`}>Movies</button>
                    <button onClick={() => { setType('series'); setPage(1) }} className={`type-pill ${type === 'series' ? 'active' : ''}`}>Series</button>
                </div>

                <div className="genre-pills">
                    {GENRES.map((g) => (
                        <button key={g} onClick={() => handleGenre(g)} className={`genre-pill ${genre === g ? 'active' : ''}`}>
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {!loading && !error && (
                <div className="results-bar">
                    <span className="results-count">
                        {pagination.total > 0 ? `${pagination.total} movies` : 'No movies found'}
                    </span>
                    {genre && (
                        <button className="filter-clear" onClick={() => setGenre('')}>
                            <X size={12} strokeWidth={2.5} /> {genre}
                        </button>
                    )}
                </div>
            )}

            {loading ? (
                <div className="spinner-wrap">
                    <div className="spinner" />
                    <span className="spinner-text">Loading movies...</span>
                </div>
            ) : error ? (
                <div className="alert alert-error">{error}</div>
            ) : movies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><Search size={40} strokeWidth={1} /></div>
                    <h3>No movies found</h3>
                    <p>Try a different search or genre</p>
                </div>
            ) : (
                <div className="grid-3">
                    {movies.map((m, i) => <MovieCard key={m._id} movie={m} index={i} />)}
                </div>
            )}

            {pagination.pages > 1 && (
                <div className="pagination">
                    <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <span className="pagination-info">Page {page} / {pagination.pages}</span>
                    <button className="btn btn-ghost btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}
        </div>
    )
}

export default MovieListing
