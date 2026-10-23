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
  Activity as ActivityIcon,
  Copy,
  Check,
  Send,
  Zap,
  TrendingUp,
  FileText,
  UserCheck
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
    addFollowUp,
    showToast
  } = useCRM();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'timeline' | 'ai'
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);
  const [isAddFollowUpOpen, setIsAddFollowUpOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  // New follow up inputs
  const [newFUTitle, setNewFUTitle] = useState('');
  const [newFUType, setNewFUType] = useState('Call');
  const [newFUDate, setNewFUDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!lead) return null;

  const leadFollowUps = followUps.filter(f => String(f.leadId) === String(lead.id));
  const leadActivities = activities.filter(a => String(a.leadId) === String(lead.id));

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(field);
    showToast(`Copied ${field} to clipboard`, 'info');
    setTimeout(() => setCopiedField(null), 2000);
  };

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

  // AI Composite Calculations
  const calculatedScore = lead.aiScore || (lead.priority === 'High' ? 88 : lead.priority === 'Medium' ? 68 : 45);
  const leadTemperature = calculatedScore >= 75 ? 'Hot' : calculatedScore >= 50 ? 'Warm' : 'Cold';
  const tempBadgeBg = leadTemperature === 'Hot' ? '#fef2f2' : leadTemperature === 'Warm' ? '#fffbeb' : '#f0f9ff';
  const tempBadgeColor = leadTemperature === 'Hot' ? '#dc2626' : leadTemperature === 'Warm' ? '#d97706' : '#0284c7';
  const winProbability = Math.min(Math.round(calculatedScore * 0.92), 95);

  const recommendedAction = lead.pipelineStage === 'New'
    ? 'Schedule discovery qualification call'
    : lead.pipelineStage === 'Contacted'
    ? 'Send Belvo Open Finance API overview deck'
    : lead.pipelineStage === 'Qualified'
    ? 'Set up technical demo with solutions engineer'
    : lead.pipelineStage === 'Meeting'
    ? 'Prepare commercial enterprise proposal'
    : lead.pipelineStage === 'Proposal'
    ? 'Follow up on MSA contract review'
    : lead.pipelineStage === 'Negotiation'
    ? 'Align on pricing discount & final SLA terms'
    : 'Maintain periodic account check-in';

  const aiFollowUpDraft = `Hi ${lead.fullName.split(' ')[0]},\n\nHope your week is going well! Following up on our recent conversation regarding ${lead.company}'s integration with Belvo Open Finance.\n\nWe'd love to schedule a brief 20-minute walk-through of the API platform and sandbox credentials tailored to your use case. Would this Thursday or Friday afternoon work for you?\n\nBest regards,\n${lead.assignedEmployee}\nBelvo Enterprise Team`;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Account: ${lead.company}`}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Top Account Header Card */}
          <div
            style={{
              padding: '18px 22px',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {lead.fullName}
                </h3>
                <Badge type={lead.priority} />
                <Badge type={lead.leadSource} />
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: tempBadgeBg,
                    color: tempBadgeColor,
                    border: `1px solid ${tempBadgeColor}30`,
                    padding: '2px 8px',
                    borderRadius: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Zap size={11} fill={tempBadgeColor} />
                  {leadTemperature} ({calculatedScore}/100)
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building size={14} />
                <strong style={{ color: '#1e293b' }}>{lead.company}</strong>
                <span>•</span>
                <span style={{ color: '#0284c7', fontWeight: 600 }}>{lead.leadCategory || 'Open Finance'}</span>
                {lead.location && (
                  <>
                    <span>•</span>
                    <span>{lead.location}</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estimated Deal Value
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                ${(lead.expectedValue || 0).toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>USD</span>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              gap: 8
            }}
          >
            {[
              { id: 'overview', label: 'Overview & Contacts', icon: Building },
              { id: 'tasks', label: `Follow-ups (${leadFollowUps.length})`, icon: Calendar },
              { id: 'timeline', label: `Activity Audit (${leadActivities.length})`, icon: ActivityIcon },
              { id: 'ai', label: 'AI Intelligence & Drafts', icon: Sparkles }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 14px',
                    fontSize: '0.825rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#2563eb' : '#64748b',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    marginBottom: -1
                  }}
                >
                  <Icon size={15} color={isActive ? '#2563eb' : '#64748b'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Pipeline Stage Progression Selector */}
              <div style={{ padding: '14px 18px', backgroundColor: '#ffffff', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Move Deal Stage
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                    Current: {PIPELINE_STAGES.find(s => s.id === lead.pipelineStage)?.label || lead.pipelineStage}
                  </span>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
                {/* Contact Card */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Contact & Communication
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Mail size={15} color="#64748b" />
                      <a href={`mailto:${lead.email}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                        {lead.email}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(lead.email, 'email')}
                      className="btn btn-ghost btn-sm"
                      title="Copy email"
                    >
                      {copiedField === 'email' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Phone size={15} color="#64748b" />
                      <span style={{ color: '#334155', fontWeight: 500 }}>{lead.phone || 'None provided'}</span>
                    </div>
                    {lead.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.phone, 'phone')}
                        className="btn btn-ghost btn-sm"
                        title="Copy phone"
                      >
                        {copiedField === 'phone' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>

                  {lead.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.875rem' }}>
                      <Globe size={15} color="#64748b" />
                      <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 500 }}>
                        {lead.website}
                      </a>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem', marginTop: 4, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    <UserCheck size={15} color="#64748b" />
                    <span style={{ color: '#64748b' }}>Account Owner: <strong style={{ color: '#0f172a' }}>{lead.assignedEmployee}</strong></span>
                  </div>
                </div>

                {/* Notes & Requirements Card */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-main)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Discovery Notes & Scope
                  </h4>
                  <div
                    style={{
                      fontSize: '0.825rem',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      lineHeight: 1.5,
                      minHeight: 110,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {lead.notes || 'No discovery notes recorded yet. Use Edit Profile to document client requirements and API scope.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Tasks & Follow-ups */}
          {activeTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                  Scheduled Tasks for {lead.company}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsAddFollowUpOpen(!isAddFollowUpOpen)}
                >
                  <Plus size={14} />
                  <span>Schedule Task</span>
                </button>
              </div>

              {isAddFollowUpOpen && (
                <form onSubmit={handleCreateFollowUp} style={{ padding: 14, backgroundColor: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Task action (e.g. Schedule API demo)"
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
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: 8 }}>
                  No follow-ups scheduled for this client. Click "Schedule Task" to add your first reminder.
                </div>
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
                          padding: '10px 14px',
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
                            {isCompleted ? <CheckCircle2 size={18} color="#10b981" /> : <Circle size={18} color="#94a3b8" />}
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
          )}

          {/* Tab 3: Activity Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                Account Audit Trail
              </span>
              {leadActivities.length === 0 ? (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #e2e8f0', borderRadius: 8 }}>
                  No historical interactions recorded for this lead yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {leadActivities.map(act => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '10px 12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0'
                      }}
                    >
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
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.825rem' }}>
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
          )}

          {/* Tab 4: AI Intelligence & Insights */}
          {activeTab === 'ai' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Top AI Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Lead Score Gauge Card */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#7e22ce', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Sparkles size={16} />
                      <span>AI Lead Score</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6b21a8' }}>
                      {calculatedScore} / 100
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ height: 8, width: '100%', backgroundColor: '#f3e8ff', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${calculatedScore}%`, backgroundColor: '#a855f7', borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b21a8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Classification: <strong>{leadTemperature} Prospect</strong></span>
                    <span>High Velocity</span>
                  </div>
                </div>

                {/* Conversion Probability Card */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontWeight: 700, fontSize: '0.85rem' }}>
                      <TrendingUp size={16} />
                      <span>Predicted Win Rate</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#065f46' }}>
                      {winProbability}%
                    </span>
                  </div>
                  <div style={{ height: 8, width: '100%', backgroundColor: '#d1fae5', borderRadius: 999, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${winProbability}%`, backgroundColor: '#10b981', borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#065f46' }}>
                    Calibrated on deal size (${(lead.expectedValue || 0).toLocaleString()}) and LatAm fintech velocity.
                  </div>
                </div>
              </div>

              {/* Recommended Next-Best Action */}
              <div
                style={{
                  padding: 16,
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    AI Recommended Next-Best Action
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                    {recommendedAction}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setActiveTab('tasks');
                    setIsAddFollowUpOpen(true);
                    setNewFUTitle(recommendedAction);
                  }}
                >
                  <Zap size={13} />
                  <span>Execute Action</span>
                </button>
              </div>

              {/* Auto-Generated Follow-up Draft */}
              <div
                style={{
                  padding: 16,
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                    <FileText size={15} color="#2563eb" />
                    <span>Personalized Follow-up Email Draft</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(aiFollowUpDraft, 'AI follow-up draft')}
                  >
                    {copiedField === 'AI follow-up draft' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{copiedField === 'AI follow-up draft' ? 'Copied!' : 'Copy Draft'}</span>
                  </button>
                </div>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: 14,
                    fontSize: '0.8125rem',
                    color: '#334155',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'inherit'
                  }}
                >
                  {aiFollowUpDraft}
                </div>
              </div>
            </div>
          )}
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
