import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadFormModal from '../components/leads/LeadFormModal';
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  Activity,
  AlertCircle,
  UploadCloud,
  Building2,
  Sparkles,
  Zap,
  Filter,
  CheckCircle2,
  Layers,
  BarChart3
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { leads, metrics, activities, followUps } = useCRM();

  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [dealFilter, setDealFilter] = useState('all'); // 'all' | 'high' | 'enterprise'

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const overdueList = useMemo(() => {
    return followUps.filter(f => f.status === 'Overdue' || (f.status === 'Pending' && f.dueDate < todayStr));
  }, [followUps, todayStr]);

  // Funnel calculations
  const funnelStages = useMemo(() => {
    const discoveryStages = ['New', 'Contacted'];
    const qualificationStages = ['Qualified', 'Meeting'];
    const proposalStages = ['Proposal', 'Negotiation'];
    const wonStages = ['Won'];

    const discoveryCount = leads.filter(l => discoveryStages.includes(l.pipelineStage)).length;
    const qualificationCount = leads.filter(l => qualificationStages.includes(l.pipelineStage)).length;
    const proposalCount = leads.filter(l => proposalStages.includes(l.pipelineStage)).length;
    const wonCount = leads.filter(l => wonStages.includes(l.pipelineStage)).length;

    const discoveryVal = leads.filter(l => discoveryStages.includes(l.pipelineStage)).reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
    const qualificationVal = leads.filter(l => qualificationStages.includes(l.pipelineStage)).reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
    const proposalVal = leads.filter(l => proposalStages.includes(l.pipelineStage)).reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);
    const wonVal = leads.filter(l => wonStages.includes(l.pipelineStage)).reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);

    return [
      { id: 'discovery', label: '1. Discovery & Outreach', count: discoveryCount, value: discoveryVal, color: '#38bdf8' },
      { id: 'qualification', label: '2. Demo & Technical Fit', count: qualificationCount, value: qualificationVal, color: '#6366f1' },
      { id: 'proposal', label: '3. Proposal & Negotiation', count: proposalCount, value: proposalVal, color: '#a855f7' },
      { id: 'won', label: '4. Closed Won Revenue', count: wonCount, value: wonVal, color: '#10b981' }
    ];
  }, [leads]);

  const filteredProspects = useMemo(() => {
    let list = leads.slice();
    if (dealFilter === 'high') {
      list = list.filter(l => l.priority === 'High');
    } else if (dealFilter === 'enterprise') {
      list = list.filter(l => Number(l.expectedValue) >= 50000);
    }
    return list.slice(0, 5);
  }, [leads, dealFilter]);

  if (!metrics) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <span>Loading executive analytics...</span>
      </div>
    );
  }

  const isZeroState = leads.length === 0;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Executive Dashboard</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #bfdbfe'
              }}
            >
              Belvo Open Finance
            </span>
          </h1>
          <p className="page-subtitle">
            Real-time pipeline analytics, deal velocity, and client engagement metrics across LatAm operations.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/pipeline')}
          >
            <span>Kanban Board</span>
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddLeadOpen(true)}
            style={{ boxShadow: '0 2px 6px -1px rgba(37, 99, 235, 0.35)' }}
          >
            <Plus size={16} />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Zero State Onboarding Hero Banner */}
      {isZeroState && (
        <div
          style={{
            marginBottom: 24,
            padding: '24px 28px',
            backgroundColor: '#0f172a',
            backgroundImage: 'radial-gradient(at 100% 0%, rgba(37, 99, 235, 0.28) 0px, transparent 55%), radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.22) 0px, transparent 55%)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20
          }}
        >
          <div style={{ maxWidth: 580 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <Sparkles size={15} />
              Welcome to Belvo CRM
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#ffffff' }}>
              Zero-clutter workspace ready for client pipeline
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
              No hardcoded mock companies or dummy leads. Add your first fintech lead directly or import your existing records via Excel or CSV.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}
              onClick={() => navigate('/leads')}
            >
              <UploadCloud size={15} />
              <span>Import Leads</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddLeadOpen(true)}
            >
              <Plus size={15} />
              <span>Add First Lead</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Overdue Follow-up Alert Banner if any */}
      {overdueList.length > 0 && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 18px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} color="#ef4444" />
            <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 600 }}>
              You have {overdueList.length} overdue follow-up action{overdueList.length === 1 ? '' : 's'} requiring immediate attention.
            </span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: '#ffffff', color: '#b91c1c', borderColor: '#fca5a5' }}
            onClick={() => navigate('/follow-ups')}
          >
            Review Follow-ups
          </button>
        </div>
      )}

      {/* Stat Metric Cards Grid */}
      <div className="stat-card-grid">
        <StatCard
          label="Total Active Leads"
          value={metrics.totalLeads}
          subtext="in CRM pipeline"
          icon={Users}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          onClick={() => navigate('/leads')}
        />

        <StatCard
          label="Active Pipeline"
          value={`$${(metrics.activePipelineValue || 0).toLocaleString()}`}
          subtext="Excluding Won/Lost"
          icon={DollarSign}
          iconColor="#0284c7"
          iconBg="#e0f2fe"
          onClick={() => navigate('/pipeline')}
        />

        <StatCard
          label="Won Revenue"
          value={`$${(metrics.wonValue || 0).toLocaleString()}`}
          subtext={`${metrics.wonLeads || 0} deals closed`}
          icon={Trophy}
          iconColor="#10b981"
          iconBg="#ecfdf5"
          trend={`${metrics.wonLeads || 0} deals`}
          trendPositive={true}
        />

        <StatCard
          label="Conversion Rate"
          value={`${metrics.conversionRate || 0}%`}
          subtext="Won vs Closed Deals"
          icon={TrendingUp}
          iconColor="#8b5cf6"
          iconBg="#f5f3ff"
        />

        <StatCard
          label="Scheduled Follow-ups"
          value={metrics.upcomingFollowUps || 0}
          subtext={metrics.overdueFollowUps > 0 ? `${metrics.overdueFollowUps} overdue` : 'All on track'}
          icon={Clock}
          iconColor={metrics.overdueFollowUps > 0 ? '#ef4444' : '#f59e0b'}
          iconBg={metrics.overdueFollowUps > 0 ? '#fef2f2' : '#fffbeb'}
          onClick={() => navigate('/follow-ups')}
        />
      </div>

      {/* Pipeline Funnel Velocity Bar */}
      <div className="crm-card" style={{ marginBottom: 24, padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="#2563eb" />
            <h3 className="card-title" style={{ margin: 0 }}>Sales Pipeline Velocity Funnel</h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            ${(metrics.totalPipelineValue || 0).toLocaleString()} Total Pipeline Volume
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {funnelStages.map(fn => (
            <div
              key={fn.id}
              style={{
                padding: '12px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${fn.color}`
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                {fn.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {fn.count} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>deals</span>
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  ${fn.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Analytics Grid: Stage Progression & Lead Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Pipeline Stage Distribution */}
        <div className="crm-card">
          <div className="card-header">
            <h3 className="card-title">Pipeline Stage Distribution</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>
              {leads.length} Active Records
            </span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {metrics.stageBreakdown.map(st => (
                <div key={st.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: st.color
                        }}
                      />
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{st.label}</span>
                      <span style={{ color: '#64748b' }}>({st.count} leads)</span>
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      ${st.value.toLocaleString()} ({st.percentage}%)
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      backgroundColor: '#f1f5f9',
                      borderRadius: 999,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${st.count > 0 ? Math.max(st.percentage, 4) : 0}%`,
                        backgroundColor: st.color,
                        borderRadius: 999,
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Source Breakdown */}
        <div className="crm-card">
          <div className="card-header">
            <h3 className="card-title">Lead Acquisition Sources</h3>
            <span style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 600 }}>By Inbound Channel</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {metrics.sourceBreakdown.map(src => (
                <div key={src.source} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{src.source}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {src.count} ({src.percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      width: '100%',
                      backgroundColor: '#f1f5f9',
                      borderRadius: 999,
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${src.count > 0 ? Math.max(src.percentage, 4) : 0}%`,
                        backgroundColor: '#2563eb',
                        borderRadius: 999
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Leads & Activity Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        {/* Recent High-Priority Prospects */}
        <div className="crm-card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 className="card-title">High-Value Prospects</h3>
              {leads.length > 0 && (
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'high', label: 'High Priority' },
                    { id: 'enterprise', label: '$50k+' }
                  ].map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setDealFilter(f.id)}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: dealFilter === f.id ? '#2563eb' : '#e2e8f0',
                        backgroundColor: dealFilter === f.id ? '#eff6ff' : '#ffffff',
                        color: dealFilter === f.id ? '#2563eb' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {leads.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/leads')}
              >
                View All Leads
              </button>
            )}
          </div>
          {leads.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
              <Building2 size={32} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>No prospects registered yet</div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 14px' }}>
                Create your first lead to start tracking engagement and deal stages.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setIsAddLeadOpen(true)}
              >
                <Plus size={14} />
                <span>Add Lead</span>
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Value</th>
                    <th>Assignee</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProspects.map(lead => (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{lead.company}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{lead.fullName}</div>
                      </td>
                      <td>
                        <Badge type={lead.pipelineStage} />
                      </td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        ${(lead.expectedValue || 0).toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        {lead.assignedEmployee.split(' ')[0]}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Interaction Audit Stream */}
        <div className="crm-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity Audit</h3>
            {activities.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/activities')}
              >
                All Logs
              </button>
            )}
          </div>
          <div className="card-body" style={{ maxHeight: 360, overflowY: 'auto' }}>
            {activities.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Activity size={28} color="#cbd5e1" style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, color: '#64748b', fontSize: '0.875rem' }}>No activity logged yet</div>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
                  Pipeline moves, notes, and tasks will generate an automatic audit log.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activities.slice(0, 6).map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
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
                      <Activity size={14} />
                    </div>
                    <div style={{ flex: 1, fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
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
      </div>

      {/* Lead Detail / Client Profile Modal */}
      <LeadDetailModal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onEditLead={(lead) => setEditingLead(lead)}
      />

      {/* Add / Edit Lead Modal */}
      <LeadFormModal
        isOpen={isAddLeadOpen || Boolean(editingLead)}
        onClose={() => {
          setIsAddLeadOpen(false);
          setEditingLead(null);
        }}
        leadToEdit={editingLead}
      />
    </div>
  );
};

export default DashboardPage;
