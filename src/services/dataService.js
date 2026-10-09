import { INITIAL_LEADS, INITIAL_FOLLOW_UPS, INITIAL_ACTIVITIES, PIPELINE_STAGES } from './mockData.js';

const LEADS_KEY = 'belvo_crm_leads_v1';
const FOLLOW_UPS_KEY = 'belvo_crm_followups_v1';
const ACTIVITIES_KEY = 'belvo_crm_activities_v1';

// Helper to safely read from localStorage
function getStoredItem(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return defaultData;
  }
}

// Helper to safely save to localStorage
function saveStoredItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export const dataService = {
  // Initialization & Reset
  init: () => {
    getStoredItem(LEADS_KEY, INITIAL_LEADS);
    getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    getStoredItem(ACTIVITIES_KEY, INITIAL_ACTIVITIES);
  },

  resetToDefaults: () => {
    saveStoredItem(LEADS_KEY, INITIAL_LEADS);
    saveStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    saveStoredItem(ACTIVITIES_KEY, INITIAL_ACTIVITIES);
    return {
      leads: [...INITIAL_LEADS],
      followUps: [...INITIAL_FOLLOW_UPS],
      activities: [...INITIAL_ACTIVITIES]
    };
  },

  // Leads
  getLeads: () => {
    return getStoredItem(LEADS_KEY, INITIAL_LEADS);
  },

  getLeadById: (id) => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    return leads.find(l => String(l.id) === String(id)) || null;
  },

  createLead: (leadData) => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    const newId = `LEAD-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newLead = {
      id: newId,
      fullName: leadData.fullName || '',
      company: leadData.company || '',
      email: leadData.email || '',
      phone: leadData.phone || '',
      leadSource: leadData.leadSource || 'Website',
      leadCategory: leadData.leadCategory || 'General',
      priority: leadData.priority || 'Medium',
      pipelineStage: leadData.pipelineStage || 'New',
      assignedEmployee: leadData.assignedEmployee || 'Ashwini Sharma',
      expectedValue: Number(leadData.expectedValue) || 0,
      notes: leadData.notes || '',
      createdDate: leadData.createdDate || today,
      nextFollowUpDate: leadData.nextFollowUpDate || '',
      website: leadData.website || '',
      location: leadData.location || '',
      aiScore: Math.floor(Math.random() * 40) + 55, // Realistic AI readiness score placeholder
      aiSummary: 'Lead newly registered into CRM pipeline. Ready for discovery engagement.'
    };

    const updated = [newLead, ...leads];
    saveStoredItem(LEADS_KEY, updated);

    // Create activity record
    dataService.createActivity({
      leadId: newLead.id,
      leadName: newLead.fullName,
      company: newLead.company,
      type: 'lead_created',
      description: `New lead created (${newLead.company}) with priority ${newLead.priority}`,
      performedBy: newLead.assignedEmployee
    });

    // Create follow-up if date is specified
    if (newLead.nextFollowUpDate) {
      dataService.createFollowUp({
        leadId: newLead.id,
        leadName: newLead.fullName,
        company: newLead.company,
        title: `Initial outreach for ${newLead.company}`,
        type: 'Call',
        dueDate: newLead.nextFollowUpDate,
        dueTime: '10:00',
        priority: newLead.priority,
        status: 'Pending',
        assignedEmployee: newLead.assignedEmployee,
        notes: `Follow up regarding: ${newLead.notes || 'Initial inquiry'}`
      });
    }

    return newLead;
  },

  updateLead: (id, leadData) => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    const existingIndex = leads.findIndex(l => String(l.id) === String(id));
    
    if (existingIndex === -1) {
      throw new Error(`Lead with ID ${id} not found.`);
    }

    const currentLead = leads[existingIndex];
    const previousStage = currentLead.pipelineStage;

    const updatedLead = {
      ...currentLead,
      ...leadData,
      id: currentLead.id, // Preserve ID
      expectedValue: Number(leadData.expectedValue !== undefined ? leadData.expectedValue : currentLead.expectedValue) || 0
    };

    leads[existingIndex] = updatedLead;
    saveStoredItem(LEADS_KEY, leads);

    // If stage changed, log activity
    if (previousStage !== updatedLead.pipelineStage) {
      dataService.createActivity({
        leadId: updatedLead.id,
        leadName: updatedLead.fullName,
        company: updatedLead.company,
        type: 'stage_change',
        description: `Stage moved from ${previousStage} → ${updatedLead.pipelineStage} ($${(updatedLead.expectedValue || 0).toLocaleString()})`,
        performedBy: updatedLead.assignedEmployee || 'Ashwini Sharma'
      });
    } else {
      dataService.createActivity({
        leadId: updatedLead.id,
        leadName: updatedLead.fullName,
        company: updatedLead.company,
        type: 'note',
        description: `Lead profile updated for ${updatedLead.company}`,
        performedBy: updatedLead.assignedEmployee || 'Ashwini Sharma'
      });
    }

    return updatedLead;
  },

  updateLeadStage: (id, newStage) => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    const lead = leads.find(l => String(l.id) === String(id));
    if (!lead) throw new Error(`Lead ${id} not found`);

    const oldStage = lead.pipelineStage;
    if (oldStage === newStage) return lead;

    lead.pipelineStage = newStage;
    saveStoredItem(LEADS_KEY, leads);

    dataService.createActivity({
      leadId: lead.id,
      leadName: lead.fullName,
      company: lead.company,
      type: 'stage_change',
      description: `Pipeline stage updated: ${oldStage} → ${newStage}`,
      performedBy: lead.assignedEmployee || 'Ashwini Sharma'
    });

    return lead;
  },

  deleteLead: (id) => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    const leadToDelete = leads.find(l => String(l.id) === String(id));
    const filtered = leads.filter(l => String(l.id) !== String(id));
    saveStoredItem(LEADS_KEY, filtered);

    // Also remove associated follow-ups
    const followUps = getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    const filteredFollowUps = followUps.filter(f => String(f.leadId) !== String(id));
    saveStoredItem(FOLLOW_UPS_KEY, filteredFollowUps);

    if (leadToDelete) {
      dataService.createActivity({
        leadId: id,
        leadName: leadToDelete.fullName,
        company: leadToDelete.company,
        type: 'note',
        description: `Lead record for ${leadToDelete.company} was archived/deleted.`,
        performedBy: 'Ashwini Sharma'
      });
    }

    return true;
  },

  // Follow-ups
  getFollowUps: () => {
    return getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
  },

  createFollowUp: (followUpData) => {
    const followUps = getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    const newId = `FU-${Date.now().toString().slice(-4)}`;

    const newFU = {
      id: newId,
      leadId: followUpData.leadId || '',
      leadName: followUpData.leadName || 'General Follow-up',
      company: followUpData.company || '',
      title: followUpData.title || 'Scheduled Interaction',
      type: followUpData.type || 'Call',
      dueDate: followUpData.dueDate || new Date().toISOString().split('T')[0],
      dueTime: followUpData.dueTime || '10:00',
      priority: followUpData.priority || 'Medium',
      status: followUpData.status || 'Pending',
      assignedEmployee: followUpData.assignedEmployee || 'Ashwini Sharma',
      notes: followUpData.notes || ''
    };

    const updated = [newFU, ...followUps];
    saveStoredItem(FOLLOW_UPS_KEY, updated);

    dataService.createActivity({
      leadId: newFU.leadId,
      leadName: newFU.leadName,
      company: newFU.company,
      type: 'task',
      description: `Scheduled ${newFU.type} task: "${newFU.title}" due ${newFU.dueDate}`,
      performedBy: newFU.assignedEmployee
    });

    return newFU;
  },

  updateFollowUpStatus: (id, newStatus) => {
    const followUps = getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    const item = followUps.find(f => String(f.id) === String(id));
    if (!item) throw new Error(`Follow-up ${id} not found`);

    item.status = newStatus;
    saveStoredItem(FOLLOW_UPS_KEY, followUps);

    dataService.createActivity({
      leadId: item.leadId,
      leadName: item.leadName,
      company: item.company,
      type: 'task',
      description: `Follow-up "${item.title}" marked as ${newStatus}`,
      performedBy: item.assignedEmployee || 'Ashwini Sharma'
    });

    return item;
  },

  deleteFollowUp: (id) => {
    const followUps = getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    const filtered = followUps.filter(f => String(f.id) !== String(id));
    saveStoredItem(FOLLOW_UPS_KEY, filtered);
    return true;
  },

  // Activities
  getActivities: () => {
    return getStoredItem(ACTIVITIES_KEY, INITIAL_ACTIVITIES);
  },

  createActivity: (activityData) => {
    const activities = getStoredItem(ACTIVITIES_KEY, INITIAL_ACTIVITIES);
    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    
    const newActivity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      leadId: activityData.leadId || '',
      leadName: activityData.leadName || '',
      company: activityData.company || '',
      type: activityData.type || 'note',
      description: activityData.description || '',
      timestamp: activityData.timestamp || timestamp,
      performedBy: activityData.performedBy || 'Ashwini Sharma'
    };

    const updated = [newActivity, ...activities];
    saveStoredItem(ACTIVITIES_KEY, updated);
    return newActivity;
  },

  // Calculated Real Metrics for Dashboard
  getDashboardMetrics: () => {
    const leads = getStoredItem(LEADS_KEY, INITIAL_LEADS);
    const followUps = getStoredItem(FOLLOW_UPS_KEY, INITIAL_FOLLOW_UPS);
    const today = new Date().toISOString().split('T')[0];

    const totalLeads = leads.length;
    const newLeads = leads.filter(l => l.pipelineStage === 'New').length;
    const qualifiedLeads = leads.filter(l => l.pipelineStage === 'Qualified').length;
    const inProgressLeads = leads.filter(l => ['Contacted', 'Qualified', 'Meeting', 'Proposal', 'Negotiation'].includes(l.pipelineStage)).length;
    const wonLeads = leads.filter(l => l.pipelineStage === 'Won').length;
    const lostLeads = leads.filter(l => l.pipelineStage === 'Lost').length;

    const totalPipelineValue = leads.reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
    const activePipelineValue = leads
      .filter(l => !['Won', 'Lost'].includes(l.pipelineStage))
      .reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
    const wonValue = leads
      .filter(l => l.pipelineStage === 'Won')
      .reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);

    // Conversion rate: Won / (Won + Lost) or Won / Total
    const closedCount = wonLeads + lostLeads;
    const conversionRate = closedCount > 0 
      ? Math.round((wonLeads / closedCount) * 100) 
      : (totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0);

    // Follow-ups calculations
    const pendingFollowUps = followUps.filter(f => f.status !== 'Completed');
    const overdueFollowUps = pendingFollowUps.filter(f => f.dueDate < today || f.status === 'Overdue').length;
    const upcomingFollowUps = pendingFollowUps.filter(f => f.dueDate >= today).length;
    const completedFollowUps = followUps.filter(f => f.status === 'Completed').length;

    // Stage breakdown
    const stageBreakdown = PIPELINE_STAGES.map(stage => {
      const stageLeads = leads.filter(l => l.pipelineStage === stage.id);
      const count = stageLeads.length;
      const value = stageLeads.reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
      const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
      return {
        ...stage,
        count,
        value,
        percentage
      };
    });

    // Lead source breakdown
    const sourceCounts = {};
    leads.forEach(l => {
      const src = l.leadSource || 'Other';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const sourceBreakdown = Object.keys(sourceCounts).map(source => ({
      source,
      count: sourceCounts[source],
      percentage: totalLeads > 0 ? Math.round((sourceCounts[source] / totalLeads) * 100) : 0
    })).sort((a, b) => b.count - a.count);

    // Priority breakdown
    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    leads.forEach(l => {
      if (priorityCounts[l.priority] !== undefined) {
        priorityCounts[l.priority]++;
      }
    });

    return {
      totalLeads,
      newLeads,
      qualifiedLeads,
      inProgressLeads,
      wonLeads,
      lostLeads,
      totalPipelineValue,
      activePipelineValue,
      wonValue,
      conversionRate,
      overdueFollowUps,
      upcomingFollowUps,
      completedFollowUps,
      stageBreakdown,
      sourceBreakdown,
      priorityCounts
    };
  }
};

export default dataService;
