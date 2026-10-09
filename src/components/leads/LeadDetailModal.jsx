import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ConfirmDialog from '../common/ConfirmDialog';
import { useCRM } from '../../context/CRMContext';
import { PIPELINE_STAGES } from '../../services/mockData';
import {
  Mail,
  Phone,
  Building,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Activity as ActivityIcon
} from 'lucide-react';

export const LeadDetailModal = ({
  isOpen,
  onClose,
  lead,
  onEditLead
}) => {
  const {
    updateLeadStage,
    deleteLead,
    followUps,
    activities,
    updateFollowUpStatus,
    addFollowUp
  } = useCRM();

  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [newFUTitle, setNewFUTitle] = useState('');
  const [newFUType, setNewFUType] = useState('Call');
  const [newFUDate, setNewFUDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!lead) return null;

  const leadFollowUps = followUps.filter(f => String(f.leadId) === String(lead.id));
  const leadActivities = activities.filter(a => String(a.leadId) === String(lead.id));

  const handleStageChange = (newStage) => {
    updateLeadStage(lead.id, newStage);
  };

  const handleArchive = () => {
    deleteLead(lead.id);
    setIsConfirmArchiveOpen(false);
    onClose();
  };

  const handleCreateFollowUp = (e) => {
    e.preventDefault();
    if (!newFUTitle.trim()) return;

    addFollowUp({
      leadId: lead.id,
      leadName: lead.fullName,
      company: lead.company,
      title: newFUTitle.trim(),
      type: newFUType,
      dueDate: newFUDate,
      dueTime: '11:00',
      priority: lead.priority,
      status: 'Pending',
      assignedEmployee: lead.assignedEmployee,
      notes: `Created from Client Profile (${lead.company})`
    });

    setNewFUTitle('');
    setIsAddFollowUpOpen(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Client Profile: ${lead.company}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: '#ef4444' }}
              onClick={() => setIsConfirmArchiveOpen(true)}
            >
              <Trash2 size={14} />
              Archive Lead
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  onEditLead(lead);
                }}
              >
                <Edit2 size={14} />
                Edit Profile
              </button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header Summary Banner */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {lead.fullName}
                </h3>
                <Badge type={lead.priority} />
                <Badge type={lead.leadSource} />
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={14} />
                <span>{lead.company}</span> • <span style={{ color: '#0284c7' }}>{lead.leadCategory || 'Fintech'}</span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Deal Value
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                ${(lead.expectedValue || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>USD</span>
              </div>
            </div>
          </div>

          {/* Pipeline Stage Progression Selector */}
          <div style={{ padding: '12px 16px', backgroundColor: '#ffffff', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
              Current Pipeline Stage
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {PIPELINE_STAGES.map((st) => {
                const isActive = lead.pipelineStage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStageChange(st.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: isActive ? `2px solid ${st.color}` : '1px solid #e2e8f0',
                      backgroundColor: isActive ? st.color : '#f8fafc',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left Col: Contact Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 6 }}>
                Contact & Account Details
              </h4>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Mail size={16} color="#64748b" />
                <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', fontWeight: 500 }}>
                  {lead.email}
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Phone size={16} color="#64748b" />
                <span style={{ color: '#334155' }}>{lead.phone}</span>
              </div>

              {lead.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                  <MapPin size={16} color="#64748b" />
                  <span style={{ color: '#334155' }}>{lead.location}</span>
                </div>
              )}

              {lead.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                  <Globe size={16} color="#64748b" />
                  <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
                    {lead.website}
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem', marginTop: 4 }}>
                <Calendar size={16} color="#64748b" />
                <span style={{ color: '#64748b' }}>Assigned to: <strong style={{ color: '#0f172a' }}>{lead.assignedEmployee}</strong></span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                <Clock size={16} color="#64748b" />
                <span style={{ color: '#64748b' }}>Created: {lead.createdDate || 'Recent'}</span>
              </div>
            </div>

            {/* Right Col: AI Intelligence & Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* AI Placeholder Card */}
              <div
                style={{
                  padding: 14,
                  backgroundColor: '#f5f3ff',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #ddd6fe'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6d28d9', fontWeight: 700, fontSize: '0.8125rem' }}>
                    <Sparkles size={16} />
                    <span>AI Lead Scoring Readiness</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#8b5cf6', color: '#ffffff', padding: '2px 8px', borderRadius: 10 }}>
                    Score: {lead.aiScore || 85}/100
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#5b21b6', lineHeight: 1.4 }}>
                  {lead.aiSummary || 'High propensity to close based on enterprise fintech engagement signals.'}
                </p>
                <div style={{ fontSize: '0.7rem', color: '#7c3aed', marginTop: 6, fontStyle: 'italic' }}>
                  * Integration point ready for AI/ML prediction microservice
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                  Requirements & Notes
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#475569', backgroundColor: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', minHeight: 60 }}>
                  {lead.notes || 'No discovery notes recorded yet.'}
                </p>
              </div>
            </div>
          </div>

          {/* Follow-ups Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Scheduled Follow-ups ({leadFollowUps.length})
              </h4>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsAddFollowUpOpen(!isAddFollowUpOpen)}
              >
                <Plus size={14} />
                Add Follow-up
              </button>
            </div>

            {isAddFollowUpOpen && (
              <form onSubmit={handleCreateFollowUp} style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Follow-up title (e.g. Schedule API demo)"
                    className="form-input"
                    value={newFUTitle}
                    onChange={(e) => setNewFUTitle(e.target.value)}
                    required
                  />
                  <select
                    className="form-select"
                    value={newFUType}
                    onChange={(e) => setNewFUType(e.target.value)}
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Email">Email</option>
                    <option value="Task">Task</option>
                  </select>
                  <input
                    type="date"
                    className="form-input"
                    value={newFUDate}
                    onChange={(e) => setNewFUDate(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save
                  </button>
                </div>
              </form>
            )}

            {leadFollowUps.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No follow-ups scheduled for this client.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {leadFollowUps.map(fu => {
                  const isCompleted = fu.status === 'Completed';
                  return (
                    <div
                      key={fu.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: isCompleted ? '#f8fafc' : '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          type="button"
                          onClick={() => updateFollowUpStatus(fu.id, isCompleted ? 'Pending' : 'Completed')}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={18} color="#10b981" />
                          ) : (
                            <Circle size={18} color="#94a3b8" />
                          )}
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isCompleted ? '#94a3b8' : '#0f172a', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                          {fu.title}
                        </span>
                        <Badge type={fu.type} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Due: {fu.dueDate}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
              Interaction & Activity Timeline
            </h4>
            {leadActivities.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No activity history logged yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leadActivities.map(act => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2
                      }}
                    >
                      <ActivityIcon size={13} />
                    </div>
                    <div>
                      <div style={{ color: '#0f172a', fontWeight: 600 }}>
                        {act.description}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                        {act.performedBy} • {act.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog for Archiving */}
      <ConfirmDialog
        isOpen={isConfirmArchiveOpen}
        onClose={() => setIsConfirmArchiveOpen(false)}
        onConfirm={handleArchive}
        title="Archive Lead"
        message={`Are you sure you want to archive lead record "${lead.company}"? This will remove the lead and all associated follow-ups from the active CRM.`}
        confirmText="Archive Lead"
        isDanger={true}
      />
    </>
  );
};

export default LeadDetailModal;
