import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './components/Login'
import MovieListing from './pages/MovieListing'
import MovieDetail from './pages/MovieDetail'
import SeatSelection from './pages/SeatSelection'
import BookingHistory from './pages/BookingHistory'
import AdminMovies from './pages/admin/AdminMovies'
import AddMovie from './pages/admin/AddMovie'
import AdminShows from './pages/admin/AdminShows'
import AddShow from './pages/admin/AddShow'

// Protected route wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
    if (!user) return <Navigate to="/login" replace />
    if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
    return children
}

const AppRoutes = () => {
    const { user } = useAuth()
    return (
        <>
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

                {/* User Routes */}
                <Route path="/" element={<ProtectedRoute><MovieListing /></ProtectedRoute>} />
                <Route path="/movies/:id" element={<ProtectedRoute><MovieDetail /></ProtectedRoute>} />
                <Route path="/seat-selection/:showId" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
                <Route path="/bookings" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/movies" element={<ProtectedRoute adminOnly><AdminMovies /></ProtectedRoute>} />
                <Route path="/admin/movies/add" element={<ProtectedRoute adminOnly><AddMovie /></ProtectedRoute>} />
                <Route path="/admin/shows" element={<ProtectedRoute adminOnly><AdminShows /></ProtectedRoute>} />
                <Route path="/admin/shows/add" element={<ProtectedRoute adminOnly><AddShow /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </BrowserRouter>
)

export default App
