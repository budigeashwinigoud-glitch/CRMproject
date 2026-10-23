import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';
import crmApi from '../services/api';

const CRMContext = createContext(null);

export const CRMProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('belvo_crm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Toast notification helper
  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Reload all state from Backend or Fallback DataService
  const refreshData = useCallback(async () => {
    try {
      // Probe backend health first
      const health = await crmApi.checkHealth().catch(() => null);
      if (health && health.status === 'healthy') {
        const [backendLeads, backendFollowUps, backendActivities, backendMetrics] = await Promise.all([
          crmApi.getLeads(),
          crmApi.getFollowUps(),
          crmApi.getActivities(),
          crmApi.getDashboardMetrics()
        ]);

        setLeads(backendLeads || []);
        setFollowUps(backendFollowUps || []);
        setActivities(backendActivities || []);
        setMetrics(backendMetrics || null);
        setBackendConnected(true);
        setIsDemoMode(false);
      } else {
        // Fallback to local storage dataService
        const currentLeads = dataService.getLeads();
        const currentFollowUps = dataService.getFollowUps();
        const currentActivities = dataService.getActivities();
        const currentMetrics = dataService.getDashboardMetrics();

        setLeads(currentLeads);
        setFollowUps(currentFollowUps);
        setActivities(currentActivities);
        setMetrics(currentMetrics);
        setBackendConnected(false);
        setIsDemoMode(true);
      }
    } catch (err) {
      console.warn('Backend unavailable, using local data service fallback:', err);
      const currentLeads = dataService.getLeads();
      const currentFollowUps = dataService.getFollowUps();
      const currentActivities = dataService.getActivities();
      const currentMetrics = dataService.getDashboardMetrics();

      setLeads(currentLeads);
      setFollowUps(currentFollowUps);
      setActivities(currentActivities);
      setMetrics(currentMetrics);
      setBackendConnected(false);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    dataService.init();
    refreshData();
  }, [refreshData]);

  // Lead Actions
  const addLead = useCallback(async (leadData) => {
    try {
      let newLead;
      if (backendConnected) {
        newLead = await crmApi.createLead(leadData);
      } else {
        newLead = dataService.createLead(leadData);
      }
      await refreshData();
      showToast(`Lead for "${newLead.company}" successfully created!`, 'success');
      return newLead;
    } catch (err) {
      showToast(err.message || 'Failed to create lead', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const updateLead = useCallback(async (id, leadData) => {
    try {
      let updated;
      if (backendConnected) {
        updated = await crmApi.updateLead(id, leadData);
      } else {
        updated = dataService.updateLead(id, leadData);
      }
      await refreshData();
      showToast(`Lead "${updated.company}" updated successfully.`, 'success');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update lead', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const updateLeadStage = useCallback(async (id, stage) => {
    try {
      let updated;
      if (backendConnected) {
        updated = await crmApi.updateLeadStage(id, stage);
      } else {
        updated = dataService.updateLeadStage(id, stage);
      }
      await refreshData();
      showToast(`Moved ${updated.company} to ${stage}`, 'info');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update pipeline stage', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const deleteLead = useCallback(async (id) => {
    try {
      if (backendConnected) {
        await crmApi.deleteLead(id);
      } else {
        dataService.deleteLead(id);
      }
      await refreshData();
      showToast('Lead archived and removed from pipeline.', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to archive lead', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const getLeadById = useCallback((id) => {
    return leads.find(l => String(l.id) === String(id)) || dataService.getLeadById(id);
  }, [leads]);

  // Follow-up Actions
  const addFollowUp = useCallback(async (followUpData) => {
    try {
      let newFU;
      if (backendConnected) {
        newFU = await crmApi.createFollowUp(followUpData);
      } else {
        newFU = dataService.createFollowUp(followUpData);
      }
      await refreshData();
      showToast(`Scheduled follow-up: "${newFU.title}"`, 'success');
      return newFU;
    } catch (err) {
      showToast(err.message || 'Failed to create follow-up', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const updateFollowUpStatus = useCallback(async (id, status) => {
    try {
      let updated;
      if (backendConnected) {
        updated = await crmApi.updateFollowupStatus(id, status);
      } else {
        updated = dataService.updateFollowUpStatus(id, status);
      }
      await refreshData();
      showToast(`Follow-up marked as ${status}`, 'info');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update follow-up', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  const deleteFollowUp = useCallback(async (id) => {
    try {
      if (backendConnected) {
        await crmApi.deleteFollowUp(id);
      } else {
        dataService.deleteFollowUp(id);
      }
      await refreshData();
      showToast('Follow-up deleted.', 'info');
      return true;
    } catch (err) {
      showToast('Failed to delete follow-up', 'error');
      throw err;
    }
  }, [backendConnected, refreshData, showToast]);

  // Activity Actions
  const logActivity = useCallback(async (activityData) => {
    try {
      let newAct;
      if (backendConnected) {
        newAct = await crmApi.createActivity(activityData);
      } else {
        newAct = dataService.createActivity(activityData);
      }
      await refreshData();
      return newAct;
    } catch (err) {
      console.error(err);
      showToast('Failed to log activity', 'error');
    }
  }, [backendConnected, refreshData, showToast]);

  // Reset demo data
  const resetDemoData = useCallback(async () => {
    dataService.resetToDefaults();
    await refreshData();
    showToast('Demo data restored to initial state.', 'success');
  }, [refreshData, showToast]);

  const value = {
    leads,
    followUps,
    activities,
    metrics,
    loading,
    toasts,
    isDemoMode,
    setIsDemoMode,
    backendConnected,
    currentUser,
    setCurrentUser,
    showToast,
    removeToast,
    refreshData,
    addLead,
    updateLead,
    updateLeadStage,
    deleteLead,
    getLeadById,
    addFollowUp,
    updateFollowUpStatus,
    deleteFollowUp,
    logActivity,
    resetDemoData
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export default CRMContext;
