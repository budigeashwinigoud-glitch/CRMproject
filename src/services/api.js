/**
 * Belvo CRM API Integration Layer
 * 
 * Provides clean HTTP client methods for backend teammate integration.
 * Automatically handles API base URL configuration via VITE_API_BASE_URL.
 * When backend is unavailable or when running in Demo Mode, dataService acts as the local store.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Standard fetch helper with error handling & token attachment
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('belvo_crm_token');

  const headers = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

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

  // Auth Endpoints
  login: async (email, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data?.access_token) {
      localStorage.setItem('belvo_crm_token', data.access_token);
      localStorage.setItem('belvo_crm_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('belvo_crm_token');
    localStorage.removeItem('belvo_crm_user');
  },

  getMe: async () => {
    return request('/auth/me');
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

  archiveLead: async (id) => {
    return request(`/leads/${id}/archive`, {
      method: 'POST'
    });
  },

  restoreLead: async (id) => {
    return request(`/leads/${id}/restore`, {
      method: 'POST'
    });
  },

  updateLeadStage: async (id, newStage) => {
    return request(`/leads/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage: newStage })
    });
  },

  reassignLead: async (id, assignedEmployee, assignedUserId = null) => {
    return request(`/leads/${id}/assignment`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedEmployee, assignedUserId })
    });
  },

  checkDuplicates: async (leadData) => {
    return request('/leads/duplicates/check', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  },

  // Pipeline Stages
  getPipelineStages: async () => {
    return request('/pipeline/stages');
  },

  // Dashboard & Metrics
  getDashboardMetrics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/dashboard/metrics${query ? `?${query}` : ''}`);
  },

  getEmployeeMetrics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/dashboard/employee-metrics${query ? `?${query}` : ''}`);
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

  updateFollowupStatus: async (id, status) => {
    return request(`/follow-ups/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  deleteFollowUp: async (id) => {
    return request(`/follow-ups/${id}`, {
      method: 'DELETE'
    });
  },

  // Activity Logs & Notes
  getActivities: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activities${query ? `?${query}` : ''}`);
  },

  createActivity: async (activityData) => {
    return request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData)
    });
  },

  getLeadNotes: async (leadId) => {
    return request(`/leads/${leadId}/notes`);
  },

  createLeadNote: async (leadId, noteData) => {
    return request(`/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  },

  // CSV & Excel Import / Export
  importLeads: async (file, dryRun = false, updateDuplicates = false) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/import/leads?dry_run=${dryRun}&update_duplicates=${updateDuplicates}`, {
      method: 'POST',
      body: formData
    });
  },

  getExportLeadsUrl: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams({ format, ...filters }).toString();
    return `${API_BASE_URL}/export/leads?${query}`;
  }
};


export default crmApi;
