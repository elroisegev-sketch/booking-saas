import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({ baseURL: API_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/register', data);
export const login = (data) => api.post('/login', data);
export const getMe = () => api.get('/me');

// Services
export const getServices = () => api.get('/services');
export const getPublicServices = (slug) => api.get(`/services/public/${slug}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// Appointments
export const getAppointments = (params) => api.get('/appointments', { params });
export const bookAppointment = (data) => api.post('/appointments', data);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });
export const getCustomers = () => api.get('/appointments/customers');
export const getAvailableSlots = (slug, serviceId, date) =>
  api.get(`/appointments/slots/${slug}/${serviceId}/${date}`);

// Availability
export const getAvailability = () => api.get('/availability');
export const updateAvailability = (day, data) => api.put(`/availability/${day}`, data);
export const updateAvailabilityBulk = (days) => api.put('/availability/bulk', { days });

export default api;
