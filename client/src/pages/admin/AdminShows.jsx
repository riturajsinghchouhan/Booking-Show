import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CalendarClock, Ticket } from 'lucide-react'
import { showAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const AdminShows = () => {
    const { isAdmin } = useAuth()
    const navigate = useNavigate()
    const [shows, setShows] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return }
        showAPI.getAllAdmin()
            .then((r) => setShows(r.data.shows))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const getBooked = (s) => s.seats?.filter(x => x.isBooked).length ?? 0
    const getLocked = (s) => {
        const now = new Date()
        return s.seats?.filter(x => !x.isBooked && x.lockedBy && x.lockExpiry && new Date(x.lockExpiry) > now).length ?? 0
    }
    const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

    return (
        <div className="page">
            <div className="flex-between admin-page-header">
                <div>
                    <h1 className="section-title">Show <span>Schedule</span></h1>
                    <p className="section-subtitle">{shows.length} shows total</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/shows/add')}>
                    <Plus size={15} strokeWidth={2.5} /> Add Show
                </button>
            </div>

            {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
            ) : shows.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><CalendarClock size={44} strokeWidth={1} /></div>
                    <h3>No shows scheduled</h3>
                    <p>Create a show for an existing movie</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/shows/add')}>
                        <Plus size={15} /> Add Show
                    </button>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Movie</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th className="hide-mobile">Venue</th>
                                <th>Seats</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shows.map((s, i) => {
                                const booked = getBooked(s)
                                const locked = getLocked(s)
                                const free = 30 - booked
                                return (
                                    <tr key={s._id} className="anim-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                                        <td><strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.movieId?.title || '—'}</strong></td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{fmtDate(s.time)}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{fmtTime(s.time)}</td>
                                        <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{s.venue} · {s.screen}</td>
                                        <td>
                                            <div className="seat-stats">
                                                <span className="seat-stat booked"><Ticket size={10} /> {booked}</span>
                                                {locked > 0 && <span className="seat-stat locked">{locked} locked</span>}
                                                <span className="seat-stat available">{free} free</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminShows
