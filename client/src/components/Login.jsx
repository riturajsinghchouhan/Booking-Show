import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ChevronRight, Clapperboard, Shield, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'
import './Login.css'

const Login = () => {
    const [isRegister, setIsRegister] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = isRegister
                ? await authAPI.register(form)
                : await authAPI.login({ email: form.email, password: form.password })
            const { token, user } = res.data
            login(token, user)
            navigate(user.role === 'admin' ? '/admin/movies' : '/')
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = () => { setIsRegister(!isRegister); setError(''); setForm({ name: '', email: '', password: '', role: 'user' }); setShowPassword(false) }

    return (
        <div className="login-page">
            <div className="login-bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
            </div>

            <div className="login-card anim-slide-up">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <Clapperboard size={22} strokeWidth={1.8} />
                    </div>
                    <div className="login-brand-text">
                        <span className="login-brand-name">BookMyShow</span>
                        <span className="login-brand-tag">Lite++</span>
                    </div>
                </div>

                <h1 className="login-heading">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
                <p className="login-sub">{isRegister ? 'Start booking your favourite movies' : 'Sign in to continue booking'}</p>

                {/* Tabs */}
                <div className="login-tabs">
                    <button className={`login-tab ${!isRegister ? 'active' : ''}`} onClick={() => { if (isRegister) switchMode() }}>Sign In</button>
                    <button className={`login-tab ${isRegister ? 'active' : ''}`} onClick={() => { if (!isRegister) switchMode() }}>Register</button>
                </div>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-icon-wrap">
                                <User size={15} className="input-icon" strokeWidth={2} />
                                <input id="name" type="text" name="name" value={form.name} onChange={handleChange}
                                    className="form-control has-icon" placeholder="Your full name" required />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-icon-wrap">
                            <Mail size={15} className="input-icon" strokeWidth={2} />
                            <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                                className="form-control has-icon" placeholder="you@example.com" required />
                        </div>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                        <label className="form-label">Password</label>
                        <div className="input-icon-wrap">
                            <Lock size={15} className="input-icon" strokeWidth={2} />
                            <input id="password" type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                className="form-control has-icon has-toggle" placeholder="Min. 6 characters" required />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}
                                title={showPassword ? 'Hide password' : 'Show password'}>
                                {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
                            </button>
                        </div>
                    </div>

                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">Account Type</label>
                            <div className="role-selector">
                                <button type="button" className={`role-option ${form.role === 'user' ? 'active' : ''}`}
                                    onClick={() => setForm(p => ({ ...p, role: 'user' }))}>
                                    <User size={16} strokeWidth={2} />
                                    <div>
                                        <div className="role-name">User</div>
                                        <div className="role-desc">Browse &amp; book tickets</div>
                                    </div>
                                </button>
                                <button type="button" className={`role-option ${form.role === 'admin' ? 'active' : ''}`}
                                    onClick={() => setForm(p => ({ ...p, role: 'admin' }))}>
                                    <Shield size={16} strokeWidth={2} />
                                    <div>
                                        <div className="role-name">Admin</div>
                                        <div className="role-desc">Manage movies &amp; shows</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error anim-slide-up">
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full login-submit" disabled={loading}>
                        {loading
                            ? <><span className="btn-spinner" /> {isRegister ? 'Creating account...' : 'Signing in...'}</>
                            : <>{isRegister ? 'Create Account' : 'Sign In'} <ChevronRight size={16} /></>}
                    </button>
                </form>

                <p className="login-footer">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button type="button" className="login-switch" onClick={switchMode}>
                        {isRegister ? 'Sign In' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    )
}

export default Login
