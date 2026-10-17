
import React, { useEffect, useState } from 'react';
import crmApi from '../services/api';

export default function ArchivedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [error, setError] = useState('');

  const loadArchivedLeads = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await crmApi.getLeads({ include_archived: true });

      const allLeads = Array.isArray(data) ? data : [];

      const archivedLeads = allLeads.filter(
        (lead) =>
          lead.isArchived === true ||
          lead.is_archived === true ||
          lead.archived === true
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

  const handleRestore = async (id) => {
    try {
      setRestoringId(id);
      setError('');

      await crmApi.restoreLead(id);

      setLeads((previousLeads) =>
        previousLeads.filter((lead) => lead.id !== id)
      );
    } catch (err) {
      setError(err.message || 'Could not restore this lead.');
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: '24px' }}>Loading archived leads...</p>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Archived Leads</h1>
      <p>View archived leads and restore them to the active pipeline.</p>

      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}
        </p>
      )}

      <button onClick={loadArchivedLeads}>Refresh</button>

      {leads.length === 0 ? (
        <p>No archived leads found.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  Name
                </th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  Company
                </th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  Email
                </th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {lead.fullName || lead.full_name || '—'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {lead.company || '—'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    {lead.email || '—'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <button
                      onClick={() => handleRestore(lead.id)}
                      disabled={restoringId === lead.id}
                    >
                      {restoringId === lead.id ? 'Restoring...' : 'Restore'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
