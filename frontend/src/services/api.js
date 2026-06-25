// Base URL of the backend REST API (Assignment 2 server).
// All endpoints are served under the /api base path (e.g. /api/auth/login).
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Build request headers, including the simulated-auth headers the backend expects:
//   x-user-role - used by the backend's authorize() middleware
//   x-user-id   - used by GET /users/me and the settings endpoints
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };

  const stored = localStorage.getItem('user');
  if (stored) {
    const user = JSON.parse(stored);
    if (user.role) headers['x-user-role'] = user.role;
    if (user.id !== undefined && user.id !== null) headers['x-user-id'] = String(user.id);
  }

  return headers;
};

// Generic API call helper. Throws an Error with the backend message on failure.
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: getHeaders(),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // POST /auth/login - returns { success, data: { user, token }, error }
  login: (email, password) => apiCall('/auth/login', 'POST', { email, password }),
  logout: () => apiCall('/auth/logout', 'POST'),
};

// Users API
export const usersAPI = {
  getMe: () => apiCall('/users/me'),
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
  getReviews: (id) => apiCall(`/users/${id}/reviews`),
  create: (userData) => apiCall('/users', 'POST', userData),
  update: (id, userData) => apiCall(`/users/${id}`, 'PUT', userData),
  delete: (id) => apiCall(`/users/${id}`, 'DELETE'),
};

// Tickets API
export const ticketsAPI = {
  getAll: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return apiCall(`/tickets${queryParams ? `?${queryParams}` : ''}`);
  },
  getById: (id) => apiCall(`/tickets/${id}`),
  create: (ticketData) => apiCall('/tickets', 'POST', ticketData),
  update: (id, ticketData) => apiCall(`/tickets/${id}`, 'PUT', ticketData),
  delete: (id) => apiCall(`/tickets/${id}`, 'DELETE'),
  // Marketplace workflow actions
  verify: (id) => apiCall(`/tickets/${id}/verify`, 'POST'),
  purchase: (id) => apiCall(`/tickets/${id}/purchase`, 'POST'),
  redeem: (id) => apiCall(`/tickets/${id}/redeem`, 'POST'),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => apiCall('/transactions'),
  getById: (id) => apiCall(`/transactions/${id}`),
  create: (transactionData) => apiCall('/transactions', 'POST', transactionData),
  update: (id, transactionData) => apiCall(`/transactions/${id}`, 'PUT', transactionData),
  delete: (id) => apiCall(`/transactions/${id}`, 'DELETE'),
};

// Dashboard API
export const dashboardAPI = {
  getByUserId: (userId) => apiCall(`/dashboard/${userId}`),
};

// Settings API (connected to the backend: GET/PUT /settings)
export const settingsAPI = {
  get: () => apiCall('/settings'),
  update: (settings) => apiCall('/settings', 'PUT', settings),
};

// AI API (the AI Ticket Advisor - frontend talks only to the backend)
export const aiAPI = {
  // POST /ai/ticket-advice -> { riskLevel, priceRange, recommendation, advice }
  getTicketAdvice: (input) => apiCall('/ai/ticket-advice', 'POST', input),
};

export default apiCall;
