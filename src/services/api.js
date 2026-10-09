/**
 * Belvo CRM API Integration Layer
 * 
 * Provides clean HTTP client methods for backend teammate integration.
 * Automatically handles API base URL configuration via VITE_API_BASE_URL.
 * When backend is unavailable or when running in Demo Mode, dataService acts as the local store.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Standard fetch helper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData?.detail || errorData?.message) {
        errorMessage = errorData.detail || errorData.message;
      }
    } catch {
      // Fallback to response status text
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const crmApi = {
  // Backend Health check
  checkHealth: async () => {
    return request('/health');
  },

  // Leads CRUD
  getLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/leads${query ? `?${query}` : ''}`);
  },

  getLeadById: async (id) => {
    return request(`/leads/${id}`);
  },

  createLead: async (leadData) => {
    return request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  },

  updateLead: async (id, leadData) => {
    return request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  },

  deleteLead: async (id) => {
    return request(`/leads/${id}`, {
      method: 'DELETE'
    });
  },

  updateLeadStage: async (id, newStage) => {
    return request(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage })
    });
  },

  // Dashboard & Metrics
  getDashboardMetrics: async () => {
    return request('/dashboard/metrics');
  },

  // Follow-ups
  getFollowUps: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/follow-ups${query ? `?${query}` : ''}`);
  },

  createFollowUp: async (followUpData) => {
    return request('/follow-ups', {
      method: 'POST',
      body: JSON.stringify(followUpData)
    });
  },

  updateFollowUpStatus: async (id, status) => {
    return request(`/follow-ups/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // Activity Logs
  getActivities: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activities${query ? `?${query}` : ''}`);
  },

  createActivity: async (activityData) => {
    return request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  }
};

export default crmApi;
