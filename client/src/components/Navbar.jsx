import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Clapperboard, Film, Ticket, LayoutDashboard, Plus, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => { logout(); navigate('/login') }
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to={isAdmin ? '/admin/movies' : '/'} className="navbar-brand">
                    <div className="navbar-logo-box">
                        <Clapperboard size={18} strokeWidth={1.8} />
                    </div>
                    <span className="navbar-title">BookMyShow <sup className="navbar-sup">Lite++</sup></span>
                </Link>

                <div className="navbar-links">
                    {!isAdmin && user && (
                        <>
                            <Link to="/" className={`navbar-link ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
                                <Film size={15} strokeWidth={2} /> Movies
                            </Link>
                            <Link to="/bookings" className={`navbar-link ${isActive('/bookings') ? 'active' : ''}`}>
                                <Ticket size={15} strokeWidth={2} /> My Bookings
                            </Link>
                        </>
                    )}
                    {isAdmin && (
                        <>
                            <Link to="/admin/movies" className={`navbar-link ${isActive('/admin/movies') ? 'active' : ''}`}>
                                <LayoutDashboard size={15} strokeWidth={2} /> Movies
                            </Link>
                            <Link to="/admin/shows" className={`navbar-link ${isActive('/admin/shows') ? 'active' : ''}`}>
                                <Film size={15} strokeWidth={2} /> Shows
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <div className="navbar-user-pill hide-mobile">
                                <div className="navbar-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                                <div className="navbar-user-meta">
                                    <span className="navbar-user-name">{user.name}</span>
                                    <span className={`navbar-role ${isAdmin ? 'admin' : 'user'}`}>{isAdmin ? 'Admin' : 'User'}</span>
                                </div>
                            </div>
                            {isAdmin && (
                                <Link to="/admin/movies/add" className="btn btn-primary btn-sm hide-mobile">
                                    <Plus size={14} strokeWidth={2.5} /> Add Movie
                                </Link>
                            )}
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm navbar-logout" title="Sign out">
                                <LogOut size={15} strokeWidth={2} />
                                <span className="hide-mobile">Sign out</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar
