import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';

const CRMContext = createContext(null);

export const CRMProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [activities, setActivities] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(true);

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

  // Reload all state from data service
  const refreshData = useCallback(() => {
    try {
      const currentLeads = dataService.getLeads();
      const currentFollowUps = dataService.getFollowUps();
      const currentActivities = dataService.getActivities();
      const currentMetrics = dataService.getDashboardMetrics();

      setLeads(currentLeads);
      setFollowUps(currentFollowUps);
      setActivities(currentActivities);
      setMetrics(currentMetrics);
    } catch (err) {
      console.error('Failed to load CRM data:', err);
      showToast('Error loading CRM data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    dataService.init();
    refreshData();
  }, [refreshData]);

  // Lead Actions
  const addLead = useCallback((leadData) => {
    try {
      const newLead = dataService.createLead(leadData);
      refreshData();
      showToast(`Lead for "${newLead.company}" successfully created!`, 'success');
      return newLead;
    } catch (err) {
      showToast(err.message || 'Failed to create lead', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const updateLead = useCallback((id, leadData) => {
    try {
      const updated = dataService.updateLead(id, leadData);
      refreshData();
      showToast(`Lead "${updated.company}" updated successfully.`, 'success');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update lead', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const updateLeadStage = useCallback((id, stage) => {
    try {
      const updated = dataService.updateLeadStage(id, stage);
      refreshData();
      showToast(`Moved ${updated.company} to ${stage}`, 'info');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update pipeline stage', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const deleteLead = useCallback((id) => {
    try {
      dataService.deleteLead(id);
      refreshData();
      showToast('Lead archived and removed from pipeline.', 'success');
      return true;
    } catch (err) {
      showToast(err.message || 'Failed to archive lead', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const getLeadById = useCallback((id) => {
    return dataService.getLeadById(id);
  }, []);

  // Follow-up Actions
  const addFollowUp = useCallback((followUpData) => {
    try {
      const newFU = dataService.createFollowUp(followUpData);
      refreshData();
      showToast(`Scheduled follow-up: "${newFU.title}"`, 'success');
      return newFU;
    } catch (err) {
      showToast(err.message || 'Failed to create follow-up', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const updateFollowUpStatus = useCallback((id, status) => {
    try {
      const updated = dataService.updateFollowUpStatus(id, status);
      refreshData();
      showToast(`Follow-up marked as ${status}`, 'info');
      return updated;
    } catch (err) {
      showToast(err.message || 'Failed to update follow-up', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  const deleteFollowUp = useCallback((id) => {
    try {
      dataService.deleteFollowUp(id);
      refreshData();
      showToast('Follow-up deleted.', 'info');
      return true;
    } catch (err) {
      showToast('Failed to delete follow-up', 'error');
      throw err;
    }
  }, [refreshData, showToast]);

  // Activity Actions
  const logActivity = useCallback((activityData) => {
    try {
      const newAct = dataService.createActivity(activityData);
      refreshData();
      return newAct;
    } catch (err) {
      console.error(err);
      showToast('Failed to log activity', 'error');
    }
  }, [refreshData, showToast]);

  // Reset demo data
  const resetDemoData = useCallback(() => {
    dataService.resetToDefaults();
    refreshData();
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
