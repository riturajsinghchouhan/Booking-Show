import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Film } from 'lucide-react'
import { movieAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import './Admin.css'

const AdminMovies = () => {
    const { isAdmin } = useAuth()
    const navigate = useNavigate()
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return }
        loadMovies()
    }, [])

    const loadMovies = async () => {
        setLoading(true)
        try { const res = await movieAPI.getAllAdmin(); setMovies(res.data.movies) }
        catch { } finally { setLoading(false) }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this movie? This cannot be undone.')) return
        setDeleteId(id)
        try { await movieAPI.delete(id); loadMovies() } catch { } finally { setDeleteId(null) }
    }

    return (
        <div className="page">
            <div className="flex-between admin-page-header">
                <div>
                    <h1 className="section-title">Movies <span>Library</span></h1>
                    <p className="section-subtitle">{movies.length} movies in database</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/admin/movies/add')}>
                    <Plus size={15} strokeWidth={2.5} /> Add Movie
                </button>
            </div>

            {loading ? (
                <div className="spinner-wrap"><div className="spinner" /></div>
            ) : movies.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon"><Film size={44} strokeWidth={1} /></div>
                    <h3>No movies yet</h3>
                    <p>Start by adding your first movie</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/admin/movies/add')}>
                        <Plus size={15} /> Add Movie
                    </button>
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Movie</th>
                                <th className="hide-mobile">Genre</th>
                                <th className="hide-mobile">Language</th>
                                <th className="hide-mobile">Duration</th>
                                <th className="hide-mobile">Release</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {movies.map((m, i) => (
                                <tr key={m._id} className="anim-slide-up" style={{ animationDelay: `${i * 0.03}s` }}>
                                    <td>
                                        <div className="table-movie-cell">
                                            {m.poster
                                                ? <img
                                                    src={m.poster}
                                                    alt=""
                                                    className="table-poster"
                                                    referrerPolicy="no-referrer"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=100";
                                                    }}
                                                />
                                                : <div className="table-poster-ph"><Film size={16} strokeWidth={1.5} /></div>}
                                            <span className="table-movie-name">{m.title}</span>
                                        </div>
                                    </td>
                                    <td className="hide-mobile">
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            {m.genre?.slice(0, 2).map((g) => <span key={g} className="badge badge-info" style={{ fontSize: '0.68rem' }}>{g}</span>)}
                                        </div>
                                    </td>
                                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.language}</td>
                                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.duration}m</td>
                                    <td className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('en-IN') : '—'}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm table-delete-btn" onClick={() => handleDelete(m._id)} disabled={deleteId === m._id} title="Delete movie">
                                            {deleteId === m._id ? <span className="btn-spinner" style={{ borderTopColor: 'var(--error)' }} /> : <Trash2 size={14} strokeWidth={2} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminMovies
