import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Info, Plus } from 'lucide-react'
import { movieAPI, showAPI } from '../../api'
import './Admin.css'

const AddShow = () => {
    const navigate = useNavigate()
    const [movies, setMovies] = useState([])
    const [form, setForm] = useState({ movieId: '', time: '', venue: 'Main Auditorium', screen: 'Screen 1' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        movieAPI.getAllAdmin().then((r) => setMovies(r.data.movies)).catch(() => { })
    }, [])

    const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError('') }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.movieId || !form.time) return setError('Select a movie and set a show time.')
        setLoading(true); setError('')
        try {
            await showAPI.create(form)
            setSuccess('Show created with 30 seats!')
            setTimeout(() => navigate('/admin/shows'), 1200)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create show')
        } finally { setLoading(false) }
    }

    return (
        <div className="page">
            <div className="flex-between admin-page-header">
                <div>
                    <h1 className="section-title">Add <span>Show</span></h1>
                    <p className="section-subtitle">30 seats are auto-created</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/shows')}><ArrowLeft size={15} /> Back</button>
            </div>

            <div className="admin-form-card anim-slide-up">
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Movie *</label>
                        <select name="movieId" value={form.movieId} onChange={handleChange} className="form-control" required>
                            <option value="">— Choose a movie —</option>
                            {movies.map((m) => <option key={m._id} value={m._id}>{m.title} ({m.language})</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Show Date &amp; Time *</label>
                        <input name="time" type="datetime-local" value={form.time} onChange={handleChange} className="form-control" required />
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Venue</label>
                            <input name="venue" value={form.venue} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Screen</label>
                            <input name="screen" value={form.screen} onChange={handleChange} className="form-control" />
                        </div>
                    </div>

                    <div className="admin-info-box">
                        <Info size={15} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                        <span>30 seats are auto-generated: Economy (1–10) ₹150 · Premium (11–20) ₹180 · VIP (21–30) ₹200</span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/shows')}><ArrowLeft size={14} /> Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? <><span className="btn-spinner" /> Creating...</> : <><Plus size={15} strokeWidth={2.5} /> Create Show</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddShow
