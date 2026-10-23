import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LeadFormModal from '../components/leads/LeadFormModal';
import { PIPELINE_STAGES } from '../services/mockData';
import {
  ArrowLeft,
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

export const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    leads,
    updateLeadStage,
    deleteLead,
    followUps,
    activities,
    updateFollowUpStatus,
    addFollowUp
  } = useCRM();

  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [newFUTitle, setNewFUTitle] = useState('');
  const [newFUType, setNewFUType] = useState('Call');
  const [newFUDate, setNewFUDate] = useState(() => new Date().toISOString().split('T')[0]);

  const lead = leads.find(l => String(l.id) === String(id));

  if (!lead) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Lead Not Found</h2>
        <p style={{ color: '#64748b', marginTop: 8 }}>The requested lead record does not exist or was archived.</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate('/leads')}
        >
          <ArrowLeft size={16} />
          Back to Leads
        </button>
      </div>
    );
  }

  const leadFollowUps = followUps.filter(f => String(f.leadId) === String(lead.id));
  const leadActivities = activities.filter(a => String(a.leadId) === String(lead.id));

  const handleStageChange = (newStage) => {
    updateLeadStage(lead.id, newStage);
  };

  const handleArchive = () => {
    deleteLead(lead.id);
    navigate('/leads');
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
    <div>
      {/* Back button & Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: '#ef4444' }}
            onClick={() => setIsConfirmArchiveOpen(true)}
          >
            <Trash2 size={14} />
            Archive Lead
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2 size={14} />
            Edit Profile
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Banner */}
        <div className="crm-card" style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                {lead.fullName}
              </h1>
              <Badge type={lead.priority} />
              <Badge type={lead.leadSource} />
            </div>
            <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Building size={16} />
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{lead.company}</span> • <span style={{ color: '#0284c7' }}>{lead.leadCategory}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Deal Value
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
              ${(lead.expectedValue || 0).toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>USD</span>
            </div>
          </div>
        </div>

        {/* Pipeline Stage Progression Selector */}
        <div className="crm-card" style={{ padding: 18 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 12 }}>
            Current Pipeline Stage (Click to advance)
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {PIPELINE_STAGES.map((st) => {
              const isActive = lead.pipelineStage === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => handleStageChange(st.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: isActive ? `2px solid ${st.color}` : '1px solid #e2e8f0',
                    backgroundColor: isActive ? st.color : '#f8fafc',
                    color: isActive ? '#ffffff' : '#475569',
                    fontSize: '0.8125rem',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          {/* Left Col: Contact Info & Notes */}
          <div className="crm-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: 8 }}>
              Account & Contact Details
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <Mail size={16} color="#64748b" />
              <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', fontWeight: 500 }}>
                {lead.email}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <Phone size={16} color="#64748b" />
              <span style={{ color: '#334155' }}>{lead.phone}</span>
            </div>

            {lead.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <MapPin size={16} color="#64748b" />
                <span style={{ color: '#334155' }}>{lead.location}</span>
              </div>
            )}

            {lead.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
                <Globe size={16} color="#64748b" />
                <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
                  {lead.website}
                </a>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <Calendar size={16} color="#64748b" />
              <span style={{ color: '#64748b' }}>Assigned to: <strong style={{ color: '#0f172a' }}>{lead.assignedEmployee}</strong></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.9rem' }}>
              <Clock size={16} color="#64748b" />
              <span style={{ color: '#64748b' }}>Registered: {lead.createdDate}</span>
            </div>

            <div style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 14 }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                Discovery Notes
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#475569', backgroundColor: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                {lead.notes || 'No discovery notes recorded yet.'}
              </p>
            </div>
          </div>

          {/* Right Col: AI & Follow-ups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* AI Card */}
            <div
              className="crm-card"
              style={{
                padding: 18,
                backgroundColor: '#f5f3ff',
                borderColor: '#ddd6fe'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6d28d9', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={18} />
                  <span>AI Predictive Lead Readiness</span>
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, backgroundColor: '#8b5cf6', color: '#ffffff', padding: '2px 10px', borderRadius: 12 }}>
                  Score: {lead.aiScore || 85}/100
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#5b21b6', lineHeight: 1.5 }}>
                {lead.aiSummary || 'High propensity to close based on creative agency engagement and brand scope requirements.'}
              </p>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: 10, fontStyle: 'italic' }}>
                * Integration ready for AI/ML teammate lead scoring models
              </div>
            </div>

            {/* Follow-ups */}
            <div className="crm-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Follow-ups ({leadFollowUps.length})
                </h4>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAddFollowUpOpen(!isAddFollowUpOpen)}
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>

              {isAddFollowUpOpen && (
                <form onSubmit={handleCreateFollowUp} style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Follow-up task title..."
                      className="form-input"
                      value={newFUTitle}
                      onChange={(e) => setNewFUTitle(e.target.value)}
                      required
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
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
                      <button type="submit" className="btn btn-primary btn-sm">Save</button>
                    </div>
                  </div>
                </form>
              )}

              {leadFollowUps.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No follow-ups scheduled.</p>
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
                          padding: '8px 10px',
                          backgroundColor: isCompleted ? '#f8fafc' : '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: 6
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => updateFollowUpStatus(fu.id, isCompleted ? 'Pending' : 'Completed')}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            {isCompleted ? <CheckCircle2 size={16} color="#10b981" /> : <Circle size={16} color="#94a3b8" />}
                          </button>
                          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: isCompleted ? '#94a3b8' : '#0f172a', textDecoration: isCompleted ? 'line-through' : 'none' }}>
                            {fu.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{fu.dueDate}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="crm-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 14 }}>
            Interaction & Stage History
          </h3>
          {leadActivities.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No activity history logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {leadActivities.map(act => (
                <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: '0.85rem' }}>
                  <div
                    style={{
                      width: 26,
                      height: 26,
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
                    <ActivityIcon size={14} />
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontWeight: 600 }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>
                      {act.performedBy} • {act.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <LeadFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        leadToEdit={lead}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmArchiveOpen}
        onClose={() => setIsConfirmArchiveOpen(false)}
        onConfirm={handleArchive}
        title="Archive Lead"
        message={`Are you sure you want to archive lead record "${lead.company}"?`}
        confirmText="Archive Lead"
        isDanger={true}
      />
    </div>
  );
};

export default LeadDetailPage;
