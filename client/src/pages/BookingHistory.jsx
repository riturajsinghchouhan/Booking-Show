import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket, Film, CalendarDays, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { bookingAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import './BookingHistory.css'

const BookingHistory = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!user) { navigate('/login'); return }
        bookingAPI.getUserBookings(user.id)
            .then((res) => setBookings(res.data.bookings))
            .catch(() => setError('Failed to load bookings'))
            .finally(() => setLoading(false))
    }, [user])

    if (loading) return <div className="spinner-wrap"><div className="spinner" /><span className="spinner-text">Loading bookings...</span></div>

    return (
        <div className="page booking-history-page">
            <div className="bh-header">
                <div>
                    <h1 className="section-title">My <span>Bookings</span></h1>
                    <p className="section-subtitle">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {bookings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><Ticket size={44} strokeWidth={1} /></div>
                    <h3>No bookings yet</h3>
                    <p>Book your first movie ticket to get started</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/')}>
                        Browse Movies
                    </button>
                </div>
            ) : (
                <div className="booking-list">
                    {bookings.map((bk, i) => (
                        <div key={bk._id} className="booking-card anim-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="bk-poster">
                                {bk.movieId?.poster
                                    ? <img
                                        src={bk.movieId.poster}
                                        alt={bk.movieId.title}
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=100";
                                        }}
                                    />
                                    : <div className="bk-poster-ph"><Film size={28} strokeWidth={1} /></div>}
                            </div>
                            <div className="bk-body">
                                <div className="bk-top">
                                    <h3 className="bk-title">{bk.movieId?.title || 'Movie'}</h3>
                                    <span className={`badge badge-${bk.status === 'confirmed' ? 'success' : 'error'}`}>
                                        {bk.status === 'confirmed' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                        {bk.status}
                                    </span>
                                </div>
                                <div className="bk-meta">
                                    {bk.showId?.time && (
                                        <span><CalendarDays size={12} strokeWidth={2} />
                                            {new Date(bk.showId.time).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            &nbsp;·&nbsp;
                                            {new Date(bk.showId.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    )}
                                    {bk.showId?.venue && (
                                        <span><MapPin size={12} strokeWidth={2} /> {bk.showId.venue} · {bk.showId.screen}</span>
                                    )}
                                </div>
                                <div className="bk-seats-row">
                                    <span className="bk-seats-lbl">Seats</span>
                                    {bk.seats.map((s) => <span key={s} className="bk-seat-chip">{s}</span>)}
                                </div>
                                <div className="bk-footer">
                                    <span className="bk-date">Booked {new Date(bk.bookedAt || bk.createdAt).toLocaleDateString('en-IN')}</span>
                                    <span className="bk-total">₹{bk.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BookingHistory
