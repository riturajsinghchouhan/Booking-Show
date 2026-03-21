import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Clock, Calendar, Globe, Users, Ticket, AlertCircle } from 'lucide-react'
import { movieAPI, showAPI } from '../api'
import './MovieDetail.css'

const MovieDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [movie, setMovie] = useState(null)
    const [shows, setShows] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [movieRes, showsRes] = await Promise.all([
                    movieAPI.getById(id),
                    showAPI.getByMovie(id),
                ])
                setMovie(movieRes.data.movie)
                setShows(showsRes.data.shows)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load movie details')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const getAvailableSeats = (show) => show.seats?.filter((s) => !s.isBooked && !s.lockedBy).length ?? 30
    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    if (loading) return <div className="spinner-wrap"><div className="spinner" /><span className="spinner-text">Loading...</span></div>
    if (error) return <div className="page"><div className="alert alert-error"><AlertCircle size={16} /> {error}</div></div>
    if (!movie) return null

    return (
        <div className="movie-detail-page anim-fade">
            {/* Hero Section */}
            <div className="detail-hero">
                {movie.poster && (
                    <div
                        className="detail-hero-bg"
                        style={{ backgroundImage: `url(${movie.poster})` }}
                        referrerPolicy="no-referrer"
                    />
                )}
                <div className="detail-hero-overlay" />
                <div className="detail-hero-content container">
                    <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm back-btn">
                        <ArrowLeft size={15} strokeWidth={2} /> Back
                    </button>

                    <div className="detail-layout">
                        <div className="detail-poster">
                            {movie.poster ? (
                                <img
                                    src={movie.poster}
                                    alt={movie.title}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=1000";
                                    }}
                                />
                            ) : (
                                <div className="detail-poster-ph"><Ticket size={40} strokeWidth={1} /></div>
                            )}
                        </div>

                        <div className="detail-info">
                            <div className="detail-badges">
                                <span className={`badge ${movie.type === 'series' ? 'badge-series' : 'badge-movie'}`}>
                                    {movie.type === 'series' ? 'Series' : 'Movie'}
                                </span>
                                {movie.genre?.map((g) => <span key={g} className="badge badge-primary" style={{ marginRight: '4px' }}>{g}</span>)}
                                <span className="badge badge-info"><Globe size={10} /> {movie.language}</span>
                            </div>

                            <h1 className="detail-title">{movie.title}</h1>

                            <div className="detail-meta-row">
                                {movie.rating > 0 && (
                                    <span className="detail-meta-item">
                                        <Star size={14} fill="var(--accent)" color="var(--accent)" /> {movie.rating.toFixed(1)} / 10
                                    </span>
                                )}
                                <span className="detail-meta-item"><Clock size={14} /> {movie.duration} min</span>
                                {movie.releaseDate && (
                                    <span className="detail-meta-item">
                                        <Calendar size={14} /> {new Date(movie.releaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                )}
                            </div>

                            <p className="detail-desc">{movie.description}</p>

                            {movie.cast?.length > 0 && (
                                <div className="detail-cast">
                                    <div className="detail-cast-label"><Users size={13} strokeWidth={2} /> Cast</div>
                                    <div className="cast-chips">
                                        {movie.cast.map((c) => <span key={c} className="cast-chip">{c}</span>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Shows Section */}
            <div className="container shows-section">
                <h2 className="section-title">Select a <span>Show</span></h2>
                {shows.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><Calendar size={40} strokeWidth={1} /></div>
                        <h3>No upcoming shows</h3>
                        <p>Check back soon for new show timings</p>
                    </div>
                ) : (
                    <div className="shows-grid">
                        {shows.map((show, i) => {
                            const available = getAvailableSeats(show)
                            const isSoldOut = available === 0
                            return (
                                <div key={show._id} className="show-card anim-slide-up" style={{ animationDelay: `${i * 0.06}s` }}>
                                    <div className="show-date-block">
                                        <span className="show-day">{new Date(show.time).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                        <span className="show-dom">{new Date(show.time).getDate()}</span>
                                        <span className="show-month">{new Date(show.time).toLocaleDateString('en-IN', { month: 'short' })}</span>
                                    </div>
                                    <div className="show-info">
                                        <div className="show-time-big">{fmtTime(show.time)}</div>
                                        <div className="show-venue">{show.venue} · {show.screen}</div>
                                        <div className={`show-seats ${isSoldOut ? 'sold-out' : available < 6 ? 'low' : ''}`}>
                                            <Ticket size={12} strokeWidth={2} />
                                            {isSoldOut ? 'Sold Out' : `${available} seats left`}
                                        </div>
                                    </div>
                                    <button
                                        className={`btn ${isSoldOut ? 'btn-ghost' : 'btn-primary'} show-book-btn`}
                                        onClick={() => navigate(`/seat-selection/${show._id}`)}
                                        disabled={isSoldOut}
                                    >
                                        {isSoldOut ? 'Sold Out' : 'Book'}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MovieDetail
