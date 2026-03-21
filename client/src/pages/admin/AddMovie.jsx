import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Film, Plus } from 'lucide-react'
import { movieAPI } from '../../api'
import './Admin.css'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Adventure', 'Documentary']

const AddMovie = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({ title: '', description: '', duration: '', genre: [], language: 'English', releaseDate: '', cast: '', poster: '', rating: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleChange = (e) => { setForm((p) => ({ ...p, [e.target.name]: e.target.value })); setError('') }
    const toggleGenre = (g) => setForm((p) => ({ ...p, genre: p.genre.includes(g) ? p.genre.filter(x => x !== g) : [...p.genre, g] }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title || !form.description || !form.duration || !form.releaseDate || !form.genre.length) {
            return setError('Please fill all required fields and pick at least one genre.')
        }
        setLoading(true); setError('')
        try {
            await movieAPI.create({ ...form, duration: parseInt(form.duration), rating: form.rating ? parseFloat(form.rating) : 0, cast: form.cast ? form.cast.split(',').map(c => c.trim()).filter(Boolean) : [] })
            setSuccess('Movie added!')
            setTimeout(() => navigate('/admin/movies'), 1200)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create movie')
        } finally { setLoading(false) }
    }

    return (
        <div className="page">
            <div className="flex-between admin-page-header">
                <div>
                    <h1 className="section-title">Add <span>Movie</span></h1>
                    <p className="section-subtitle">Fill in the movie details below</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/movies')}><ArrowLeft size={15} /> Back</button>
            </div>

            <div className="admin-form-card anim-slide-up">
                {success && <div className="alert alert-success">{success}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input name="title" value={form.title} onChange={handleChange} className="form-control" placeholder="Movie title" required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duration (minutes) *</label>
                            <input name="duration" type="number" value={form.duration} onChange={handleChange} className="form-control" placeholder="e.g. 135" min="1" required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description *</label>
                        <textarea name="description" value={form.description} onChange={handleChange} className="form-control" rows="3" placeholder="Short movie synopsis..." required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Genre * <span style={{ color: 'var(--text-muted)', fontSize: '0.75em', textTransform: 'none', fontWeight: 400 }}>— select all that apply</span></label>
                        <div className="genre-select">
                            {GENRES.map((g) => (
                                <button type="button" key={g} onClick={() => toggleGenre(g)} className={`genre-chip ${form.genre.includes(g) ? 'active' : ''}`}>{g}</button>
                            ))}
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Language</label>
                            <select name="language" value={form.language} onChange={handleChange} className="form-control">
                                {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'].map(l => <option key={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Release Date *</label>
                            <input name="releaseDate" type="date" value={form.releaseDate} onChange={handleChange} className="form-control" required />
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-group">
                            <label className="form-label">Rating (0–10)</label>
                            <input name="rating" type="number" value={form.rating} onChange={handleChange} className="form-control" placeholder="e.g. 8.2" min="0" max="10" step="0.1" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Poster URL</label>
                            <input name="poster" value={form.poster} onChange={handleChange} className="form-control" placeholder="https://..." />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Cast <span style={{ color: 'var(--text-muted)', fontSize: '0.75em', textTransform: 'none', fontWeight: 400 }}>— comma separated</span></label>
                        <input name="cast" value={form.cast} onChange={handleChange} className="form-control" placeholder="Actor 1, Actor 2, ..." />
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                        <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/movies')}><ArrowLeft size={14} /> Cancel</button>
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? <><span className="btn-spinner" /> Adding...</> : <><Plus size={15} strokeWidth={2.5} /> Add Movie</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddMovie
