import React, { useEffect, useState } from 'react';
import crmApi from '../services/api';
import EmptyState from '../components/common/EmptyState';
import { Archive, RotateCcw, RefreshCw, AlertCircle, CheckCircle2, Building, Mail, User } from 'lucide-react';

export default function ArchivedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadArchivedLeads = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await crmApi.getLeads({ include_archived: true });
      const allLeads = Array.isArray(data) ? data : [];
      const archivedLeads = allLeads.filter(
        (lead) => lead.isArchived === true || lead.is_archived === true || lead.archived === true
      );
      setLeads(archivedLeads);
    } catch (err) {
      setError(err.message || 'Could not load archived leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchivedLeads();
  }, []);

  const handleRestore = async (id, companyName) => {
    try {
      setRestoringId(id);
      setError('');
      setMessage('');

      await crmApi.restoreLead(id);

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setMessage(`Lead "${companyName || id}" has been restored to active pipeline.`);
    } catch (err) {
      setError(err.message || 'Could not restore this lead.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title-group">
          <h1>
            <span>Archived Commercial Leads</span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              {leads.length} Archived
            </span>
          </h1>
          <p className="page-subtitle">
            Historical inactive or closed leads preserved for audit retention. One-click restore to active sales pipeline.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={loadArchivedLeads}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: '0.875rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="crm-card" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
          Loading archived records...
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No archived leads found"
          description="Your active pipeline is clean. When leads are archived or soft-deleted, they will be preserved here."
        />
      ) : (
        <div className="crm-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table">
              <thead>
                <tr>
                  <th style={{ width: 100 }}>Lead ID</th>
                  <th>Company & Contact</th>
                  <th>Contact Email</th>
                  <th>Category / Source</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const company = lead.company || '—';
                  const contact = lead.fullName || lead.full_name || '—';

                  return (
                    <tr key={lead.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#94a3b8' }}>
                        {lead.id}
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Building size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                              {company}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                              {contact}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#334155' }}>
                          <Mail size={14} color="#94a3b8" />
                          <span>{lead.email || '—'}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                          {lead.leadCategory || lead.lead_category || lead.leadSource || 'Commercial'}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleRestore(lead.id, company)}
                          disabled={restoringId === lead.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.78rem',
                            color: '#0284c7'
                          }}
                        >
                          <RotateCcw size={13} className={restoringId === lead.id ? 'animate-spin' : ''} />
                          <span>{restoringId === lead.id ? 'Restoring...' : 'Restore Lead'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
