const API_BASE_URL = 'http://localhost:3000';

// Helper function to get headers with user role
const getHeaders = () => {
  const user = localStorage.getItem('user');
  let role = 'user';
  
  if (user) {
    const userData = JSON.parse(user);
    role = userData.role || 'user';
  }

  return {
    'Content-Type': 'application/json',
    'x-user-role': role,
  };
};

// Helper function for API calls
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

// Users API
export const usersAPI = {
  getMe: () => apiCall('/users/1'),
  getAll: () => apiCall('/users'),
  getById: (id) => apiCall(`/users/${id}`),
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

// Settings API (Mock - using localStorage)
export const settingsAPI = {
  get: () => {
    const settings = localStorage.getItem('userSettings');
    return Promise.resolve({
      success: true,
      data: settings ? JSON.parse(settings) : getDefaultSettings(),
    });
  },
  update: (settings) => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    return Promise.resolve({
      success: true,
      data: settings,
    });
  },
};

const getDefaultSettings = () => ({
  theme: 'light',
  notifications: true,
  language: 'en',
});

export default apiCall;
