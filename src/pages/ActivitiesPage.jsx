import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import EmptyState from '../components/common/EmptyState';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import { EMPLOYEES } from '../services/mockData';
import {
  Search,
  ArrowRightLeft,
  UserPlus,
  FileText,
  Mail,
  CheckSquare,
  Eye
} from 'lucide-react';

export const ActivitiesPage = () => {
  const { activities, leads } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPerformer, setSelectedPerformer] = useState('All');
  const [inspectingLead, setInspectingLead] = useState(null);

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        (act.description && act.description.toLowerCase().includes(searchLower)) ||
        (act.company && act.company.toLowerCase().includes(searchLower)) ||
        (act.leadName && act.leadName.toLowerCase().includes(searchLower))
      );

      const matchesType = selectedType === 'All' || act.type === selectedType;
      const matchesPerformer = selectedPerformer === 'All' || act.performedBy === selectedPerformer;

      return matchesSearch && matchesType && matchesPerformer;
    });
  }, [activities, searchTerm, selectedType, selectedPerformer]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'stage_change':
        return <ArrowRightLeft size={15} color="#2563eb" />;
      case 'lead_created':
        return <UserPlus size={15} color="#10b981" />;
      case 'email':
        return <Mail size={15} color="#8b5cf6" />;
      case 'task':
        return <CheckSquare size={15} color="#f59e0b" />;
      case 'note':
      default:
        return <FileText size={15} color="#64748b" />;
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Activity Audit & Timeline</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {filteredActivities.length} Events
            </span>
          </h1>
          <p className="page-subtitle">
            Unified chronological audit trail of all sales stage movements, notes, and outreach.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="crm-card"
        style={{ padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <div style={{ position: 'relative', width: 280 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 32, fontSize: '0.8125rem' }}
              placeholder="Search audit descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 170, fontSize: '0.8125rem' }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Event Types</option>
            <option value="stage_change">Stage Changes</option>
            <option value="lead_created">New Leads</option>
            <option value="note">Notes & Updates</option>
            <option value="task">Follow-up Tasks</option>
            <option value="email">Emails</option>
          </select>

          <select
            className="form-select"
            style={{ width: 170, fontSize: '0.8125rem' }}
            value={selectedPerformer}
            onChange={(e) => setSelectedPerformer(e.target.value)}
          >
            <option value="All">All Team Members</option>
            {EMPLOYEES.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="crm-card">
        {filteredActivities.length === 0 ? (
          <EmptyState
            title="No activity history matches filters"
            description="Clear search or filter criteria to view company CRM audit logs."
          />
        ) : (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredActivities.map(item => {
                const matchedLead = leads.find(l => String(l.id) === String(item.leadId));

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: 14,
                      backgroundColor: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e2e8f0',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    {/* Icon Bubble */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getActivityIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {item.timestamp}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6, fontSize: '0.78rem', color: '#64748b' }}>
                        <span>Performed by: <strong style={{ color: '#334155' }}>{item.performedBy}</strong></span>
                        {item.company && (
                          <span>• Account: <strong style={{ color: '#0f172a' }}>{item.company}</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Quick Profile Inspector CTA */}
                    {matchedLead && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setInspectingLead(matchedLead)}
                      >
                        <Eye size={13} />
                        <span>Inspect</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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

export default ActivitiesPage;
