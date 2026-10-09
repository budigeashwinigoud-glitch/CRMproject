import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import { EMPLOYEES } from '../services/mockData';
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Trash2,
  Eye
} from 'lucide-react';

export const FollowUpsPage = () => {
  const {
    followUps,
    leads,
    addFollowUp,
    updateFollowUpStatus,
    deleteFollowUp
  } = useCRM();

  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Overdue' | 'Today' | 'Upcoming' | 'Completed'
  const [selectedType, setSelectedType] = useState('All');
  const [selectedAssignee, setSelectedAssignee] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectingLead, setInspectingLead] = useState(null);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // New Follow-up Form State
  const [newForm, setNewForm] = useState({
    leadId: '',
    title: '',
    type: 'Call',
    dueDate: today,
    dueTime: '10:00',
    priority: 'Medium',
    assignedEmployee: 'Ashwini Sharma',
    notes: ''
  });

  const filteredFollowUps = useMemo(() => {
    return followUps.filter(fu => {
      // Tab filter
      const isCompleted = fu.status === 'Completed';
      const isOverdue = !isCompleted && (fu.status === 'Overdue' || fu.dueDate < today);
      const isToday = !isCompleted && fu.dueDate === today;
      const isUpcoming = !isCompleted && fu.dueDate > today;

      if (activeTab === 'Overdue' && !isOverdue) return false;
      if (activeTab === 'Today' && !isToday) return false;
      if (activeTab === 'Upcoming' && !isUpcoming) return false;
      if (activeTab === 'Completed' && !isCompleted) return false;

      // Type filter
      if (selectedType !== 'All' && fu.type !== selectedType) return false;

      // Assignee filter
      if (selectedAssignee !== 'All' && fu.assignedEmployee !== selectedAssignee) return false;

      return true;
    }).sort((a, b) => {
      if (a.status === 'Completed' && b.status !== 'Completed') return 1;
      if (a.status !== 'Completed' && b.status === 'Completed') return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [followUps, activeTab, selectedType, selectedAssignee, today]);

  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    if (!newForm.title.trim()) return;

    const matchedLead = leads.find(l => String(l.id) === String(newForm.leadId));

    addFollowUp({
      ...newForm,
      leadName: matchedLead ? matchedLead.fullName : 'General Task',
      company: matchedLead ? matchedLead.company : 'General Activity'
    });

    setIsAddModalOpen(false);
    setNewForm({
      leadId: '',
      title: '',
      type: 'Call',
      dueDate: today,
      dueTime: '10:00',
      priority: 'Medium',
      assignedEmployee: 'Ashwini Sharma',
      notes: ''
    });
  };

  const overdueCount = followUps.filter(f => f.status !== 'Completed' && (f.status === 'Overdue' || f.dueDate < today)).length;
  const todayCount = followUps.filter(f => f.status !== 'Completed' && f.dueDate === today).length;
  const upcomingCount = followUps.filter(f => f.status !== 'Completed' && f.dueDate > today).length;
  const completedCount = followUps.filter(f => f.status === 'Completed').length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Follow-ups & Activities</span>
            {overdueCount > 0 && (
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid #fecaca'
                }}
              >
                {overdueCount} Overdue
              </span>
            )}
          </h1>
          <p className="page-subtitle">
            Schedule calls, demos, and contract reviews linked directly to client accounts.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Tabs and Filters Navigation */}
      <div
        className="crm-card"
        style={{ padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { id: 'All', label: 'All Follow-ups', count: followUps.length },
            { id: 'Overdue', label: 'Overdue', count: overdueCount, alert: overdueCount > 0 },
            { id: 'Today', label: 'Due Today', count: todayCount },
            { id: 'Upcoming', label: 'Upcoming', count: upcomingCount },
            { id: 'Completed', label: 'Completed', count: completedCount }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1d4ed8' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: tab.alert ? '#ef4444' : isActive ? '#2563eb' : '#f1f5f9',
                    color: tab.alert || isActive ? '#ffffff' : '#64748b'
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="form-select"
            style={{ width: 140, fontSize: '0.8125rem' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Call">Call</option>
            <option value="Meeting">Meeting</option>
            <option value="Email">Email</option>
            <option value="Task">Task</option>
          </select>

          <select
            className="form-select"
            style={{ width: 160, fontSize: '0.8125rem' }}
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
          >
            <option value="All">All Assignees</option>
            {EMPLOYEES.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Follow-up Items Table */}
      <div className="crm-card">
        {filteredFollowUps.length === 0 ? (
          <EmptyState
            title="No follow-ups found in this view"
            description="You are completely caught up or no items match your selected filter."
            actionLabel="Schedule Follow-up"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="table-responsive">
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Status</th>
                  <th>Task & Description</th>
                  <th>Client / Company</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Due Date & Time</th>
                  <th>Assignee</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowUps.map(item => {
                  const isCompleted = item.status === 'Completed';
                  const isOverdue = !isCompleted && (item.status === 'Overdue' || item.dueDate < today);
                  const matchedLead = leads.find(l => String(l.id) === String(item.leadId));

                  return (
                    <tr
                      key={item.id}
                      style={{ backgroundColor: isCompleted ? '#fafafa' : isOverdue ? '#fffdfd' : '#ffffff' }}
                    >
                      {/* Checkbox Toggle */}
                      <td>
                        <button
                          type="button"
                          onClick={() => updateFollowUpStatus(item.id, isCompleted ? 'Pending' : 'Completed')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                          title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={20} color="#10b981" />
                          ) : (
                            <Circle size={20} color={isOverdue ? '#ef4444' : '#94a3b8'} />
                          )}
                        </button>
                      </td>

                      {/* Title & Notes */}
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            color: isCompleted ? '#94a3b8' : '#0f172a',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                          }}
                        >
                          {item.title}
                        </div>
                        {item.notes && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Lead / Company */}
                      <td>
                        {matchedLead ? (
                          <div
                            style={{ cursor: 'pointer', color: '#2563eb', fontWeight: 600 }}
                            onClick={() => setInspectingLead(matchedLead)}
                            title="Click to view client profile"
                          >
                            {matchedLead.company}
                          </div>
                        ) : (
                          <span style={{ color: '#64748b' }}>{item.company || 'General'}</span>
                        )}
                      </td>

                      {/* Type */}
                      <td>
                        <Badge type={item.type} />
                      </td>

                      {/* Priority */}
                      <td>
                        <Badge type={item.priority} />
                      </td>

                      {/* Due Date */}
                      <td>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            color: isOverdue ? '#dc2626' : '#475569',
                            fontWeight: isOverdue ? 700 : 500,
                            fontSize: '0.8125rem'
                          }}
                        >
                          <Calendar size={14} />
                          <span>{item.dueDate} {item.dueTime ? `at ${item.dueTime}` : ''}</span>
                        </div>
                      </td>

                      {/* Assignee */}
                      <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        {item.assignedEmployee.split(' ')[0]}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          {matchedLead && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-icon btn-sm"
                              onClick={() => setInspectingLead(matchedLead)}
                              title="Inspect Client Profile"
                            >
                              <Eye size={15} color="#2563eb" />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => deleteFollowUp(item.id)}
                            title="Delete Task"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule New Follow-up Action"
        size="md"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateFollowUp}
            >
              Schedule Follow-up
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateFollowUp}>
          <div className="form-group">
            <label className="form-label">
              Related Client Lead <span className="required">*</span>
            </label>
            <select
              className="form-select"
              value={newForm.leadId}
              onChange={(e) => setNewForm({ ...newForm, leadId: e.target.value })}
              required
            >
              <option value="">-- Select Client Account --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.company} ({l.fullName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Task Title <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Technical sandbox follow-up call"
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Activity Type</label>
              <select
                className="form-select"
                value={newForm.type}
                onChange={(e) => setNewForm({ ...newForm, type: e.target.value })}
              >
                <option value="Call">Call</option>
                <option value="Meeting">Meeting</option>
                <option value="Email">Email</option>
                <option value="Task">Task</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={newForm.priority}
                onChange={(e) => setNewForm({ ...newForm, priority: e.target.value })}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Due Date <span className="required">*</span></label>
              <input
                type="date"
                className="form-input"
                value={newForm.dueDate}
                onChange={(e) => setNewForm({ ...newForm, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={newForm.dueTime}
                onChange={(e) => setNewForm({ ...newForm, dueTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Assigned Owner</label>
            <select
              className="form-select"
              value={newForm.assignedEmployee}
              onChange={(e) => setNewForm({ ...newForm, assignedEmployee: e.target.value })}
            >
              {EMPLOYEES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Agenda / Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Key talking points, agenda, or materials to prepare..."
              value={newForm.notes}
              onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Inspect Lead Profile */}
      <LeadDetailModal
        isOpen={Boolean(inspectingLead)}
        onClose={() => setInspectingLead(null)}
        lead={inspectingLead}
        onEditLead={() => {}}
      />
    </div>
  );
};

export default FollowUpsPage;
