import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

// Attach auth token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bms_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// Auth
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
}

// Movies
export const movieAPI = {
    getAll: (params) => api.get('/movies', { params }),
    getById: (id) => api.get(`/movies/${id}`),
    // Admin
    create: (data) => api.post('/admin/movies', data),
    delete: (id) => api.delete(`/admin/movies/${id}`),
    getAllAdmin: (params) => api.get('/admin/movies', { params }),
}

// Shows
export const showAPI = {
    getByMovie: (movieId) => api.get(`/shows/${movieId}`),
    getById: (showId) => api.get(`/shows/detail/${showId}`),
    // Admin
    create: (data) => api.post('/admin/shows', data),
    getAllAdmin: () => api.get('/admin/shows'),
}

// Seats & Bookings
export const bookingAPI = {
    lockSeats: (data) => api.post('/seats/lock', data),
    book: (data) => api.post('/book', data),
    getUserBookings: (userId) => api.get(`/bookings/${userId}`),
}

export default api
