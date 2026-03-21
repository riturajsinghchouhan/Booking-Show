import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, AlertTriangle, CheckCircle, Lock, Ticket, MapPin, ChevronRight } from 'lucide-react'
import { showAPI, bookingAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import './SeatSelection.css'

const LOCK_DURATION = 120

const getSeatPrice = (n) => { if (n <= 10) return 150; if (n <= 20) return 180; return 200 }

const TIERS = [
    { label: 'Economy', range: [1, 10], price: 150, color: '#64748b' },
    { label: 'Premium', range: [11, 20], price: 180, color: '#f59e0b' },
    { label: 'VIP', range: [21, 30], price: 200, color: '#a78bfa' },
]

const SeatSelection = () => {
    const { showId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [show, setShow] = useState(null)
    const [selectedSeats, setSelectedSeats] = useState([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState('')
    const [step, setStep] = useState('select')
    const [booking, setBooking] = useState(null)
    const [countdown, setCountdown] = useState(0)
    const [isLocked, setIsLocked] = useState(false)
    const [timerRef, setTimerRef] = useState(null)

    const fetchShow = useCallback(async () => {
        try {
            const res = await showAPI.getById(showId)
            setShow(res.data.show)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load show')
        } finally { setLoading(false) }
    }, [showId])

    useEffect(() => { fetchShow() }, [fetchShow])

    useEffect(() => {
        if (!isLocked) return
        setCountdown(LOCK_DURATION)
        const iv = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(iv)
                    setIsLocked(false); setSelectedSeats([]); setStep('select')
                    setError('Lock expired — please select seats again')
                    fetchShow()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        setTimerRef(iv)
        return () => clearInterval(iv)
    }, [isLocked])

    const getSeatStatus = (seat) => {
        if (seat.isBooked) return 'booked'
        if (seat.lockedBy && seat.lockedBy !== user?.id) return 'locked'
        if (selectedSeats.includes(seat.seatNumber)) return 'selected'
        return 'available'
    }

    const toggleSeat = (seat) => {
        if (isLocked) return
        const status = getSeatStatus(seat)
        if (status === 'booked' || status === 'locked') return
        setSelectedSeats((prev) =>
            prev.includes(seat.seatNumber) ? prev.filter((s) => s !== seat.seatNumber) : [...prev, seat.seatNumber]
        )
        setError('')
    }

    const totalPrice = selectedSeats.reduce((acc, s) => acc + getSeatPrice(s), 0)
    const fmtTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

    const handleLock = async () => {
        if (!user) return navigate('/login')
        if (!selectedSeats.length) return setError('Select at least one seat first')
        setActionLoading(true); setError('')
        try {
            await bookingAPI.lockSeats({ showId, seats: selectedSeats, userId: user.id })
            setIsLocked(true); setStep('confirm')
        } catch (err) {
            const conflicts = err.response?.data?.conflicts
            setError(conflicts
                ? `Conflict: ${conflicts.map((c) => `Seat ${c.seat} (${c.reason})`).join(', ')}`
                : err.response?.data?.message || 'Failed to lock seats')
            fetchShow()
        } finally { setActionLoading(false) }
    }

    const handleBook = async () => {
        setActionLoading(true); setError('')
        try {
            const res = await bookingAPI.book({ showId, seats: selectedSeats, userId: user.id })
            clearInterval(timerRef)
            setBooking(res.data.booking); setStep('success')
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed')
            setIsLocked(false); setSelectedSeats([]); setStep('select'); fetchShow()
        } finally { setActionLoading(false) }
    }

    if (loading) return <div className="spinner-wrap"><div className="spinner" /><span className="spinner-text">Loading seats...</span></div>
    if (!show) {
        return (
            <div className="page seat-page">
                <div className="empty-state anim-fade">
                    <div className="empty-icon"><AlertTriangle size={48} color="var(--error)" /></div>
                    <h2>Show Not Found</h2>
                    <p>The show you are looking for may have been moved or the database was recently updated.</p>
                    <div className="empty-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            View Movies
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const movie = show.movieId

    /* Success */
    if (step === 'success' && booking) {
        return (
            <div className="seat-page page">
                <div className="booking-success anim-slide-up">
                    <div className="success-circle">
                        <CheckCircle size={44} strokeWidth={1.5} />
                    </div>
                    <h2>Booking Confirmed</h2>
                    <p>Enjoy <strong>{movie?.title}</strong>!</p>
                    <div className="success-details">
                        <div className="success-row"><span>Booking ID</span><strong>#{booking._id?.slice(-8).toUpperCase()}</strong></div>
                        <div className="success-row"><span>Seats</span><strong>{booking.seats.join(', ')}</strong></div>
                        <div className="success-row"><span>Total Paid</span><strong className="price-text">₹{booking.totalPrice}</strong></div>
                        <div className="success-row"><span>Show</span><strong>{new Date(show.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>
                    </div>
                    <div className="success-actions">
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/bookings')}>
                            <Ticket size={16} /> View Bookings
                        </button>
                        <button className="btn btn-ghost btn-lg" onClick={() => navigate('/')}>Browse More</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="seat-page page">
            {/* Header */}
            <div className="seat-header">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
                    <ArrowLeft size={15} strokeWidth={2} /> Back
                </button>
                <div className="seat-movie-info">
                    <h1 className="seat-movie-title">{movie?.title}</h1>
                    <p className="seat-show-meta">
                        <Clock size={12} strokeWidth={2} />
                        {new Date(show.time).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        &nbsp;·&nbsp;
                        {new Date(show.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        <MapPin size={12} strokeWidth={2} />
                        {show.venue} · {show.screen}
                    </p>
                </div>
                {isLocked && (
                    <div className={`lock-countdown ${countdown < 30 ? 'urgent' : ''}`}>
                        <Clock size={14} strokeWidth={2} />
                        <span className="lock-timer-val">{fmtTimer(countdown)}</span>
                        <span className="lock-timer-lbl">to confirm</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    <AlertTriangle size={15} strokeWidth={2} /> {error}
                </div>
            )}

            {/* Screen viz */}
            <div className="screen-section">
                <div className="screen-bar" />
                <p className="screen-label">Screen this way</p>
            </div>

            {/* Legend */}
            <div className="seat-legend">
                {[['available', 'Available'], ['selected', 'Selected'], ['booked', 'Booked'], ['locked', 'Locked']].map(([s, l]) => (
                    <div key={s} className="legend-item">
                        <div className={`legend-dot ${s}`} />
                        <span>{l}</span>
                    </div>
                ))}
            </div>

            {/* Seat grid by tier */}
            <div className="tiers-container">
                {TIERS.map((tier) => (
                    <div key={tier.label} className="tier-block">
                        <div className="tier-header">
                            <span className="tier-label" style={{ color: tier.color }}>{tier.label}</span>
                            <span className="tier-price">₹{tier.price} per seat</span>
                            <div className="tier-line" style={{ background: tier.color }} />
                        </div>
                        <div className="seat-row">
                            {show.seats
                                .filter((s) => s.seatNumber >= tier.range[0] && s.seatNumber <= tier.range[1])
                                .map((seat) => {
                                    const status = getSeatStatus(seat)
                                    return (
                                        <button
                                            key={seat.seatNumber}
                                            className={`seat seat-${status}`}
                                            onClick={() => toggleSeat(seat)}
                                            disabled={status === 'booked' || status === 'locked' || isLocked}
                                            aria-label={`Seat ${seat.seatNumber}, ${status}`}
                                            title={`Seat ${seat.seatNumber} — ₹${getSeatPrice(seat.seatNumber)}`}
                                        >
                                            {seat.seatNumber}
                                        </button>
                                    )
                                })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Booking bar */}
            {(selectedSeats.length > 0 || isLocked) && (
                <div className="booking-bar anim-slide-up">
                    <div className="booking-bar-left">
                        <div className="bar-seats">{selectedSeats.sort((a, b) => a - b).join(', ')}</div>
                        <div className="bar-price">₹{totalPrice} <span className="bar-seats-count">({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})</span></div>
                    </div>
                    {step === 'select' ? (
                        <button className="btn btn-primary btn-lg" onClick={handleLock} disabled={actionLoading}>
                            {actionLoading ? <span className="btn-spinner" /> : <Lock size={15} strokeWidth={2} />}
                            {actionLoading ? 'Locking...' : 'Lock Seats'}
                        </button>
                    ) : (
                        <div className="confirm-row">
                            <button className="btn btn-ghost" onClick={() => { clearInterval(timerRef); setIsLocked(false); setStep('select'); setSelectedSeats([]); fetchShow() }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary btn-lg" onClick={handleBook} disabled={actionLoading}>
                                {actionLoading ? <><span className="btn-spinner" /> Booking...</> : <>Confirm <ChevronRight size={16} /></>}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SeatSelection
