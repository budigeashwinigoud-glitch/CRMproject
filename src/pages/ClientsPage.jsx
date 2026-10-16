import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadFormModal from '../components/leads/LeadFormModal';
import {
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Eye,
  Edit2
} from 'lucide-react';

export const ClientsPage = () => {
  const { leads } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filteredClients = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      return (
        !searchTerm ||
        (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
        (lead.fullName && lead.fullName.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.location && lead.location.toLowerCase().includes(searchLower))
      );
    });
  }, [leads, searchTerm]);
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

const paginatedClients = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage;

  return filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage
  );
}, [filteredClients, currentPage]);

React.useEffect(() => {
  setCurrentPage(1);
}, [searchTerm]);
  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Client & Account Directory</span>
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
              {filteredClients.length} Accounts
            </span>
          </h1>
          <p className="page-subtitle">
            Enterprise clients, primary contacts, and deal histories across Latin America.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddLeadOpen(true)}
          >
            <Plus size={16} />
            <span>New Client Account</span>
          </button>
        </div>
      </div>

      {/* Search Header */}
      <div className="crm-card" style={{ padding: 14, marginBottom: 20 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search company, contact person, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description="Try searching with a different keyword or create a new client account."
          actionLabel="Add Client Account"
          onAction={() => setIsAddLeadOpen(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {paginatedClients.map(client => (
            <div
              key={client.id}
              className="crm-card"
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 14
              }}
            >
              <div>
                {/* Header: Company & Stage */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      {client.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                        {client.company}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {client.leadCategory || 'Fintech'}
                      </span>
                    </div>
                  </div>
                  <Badge type={client.pipelineStage} />
                </div>

                {/* Primary Contact Info */}
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>
                    {client.fullName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                    <Mail size={13} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {client.email}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                    <Phone size={13} />
                    <span>{client.phone}</span>
                  </div>
                  {client.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b' }}>
                      <MapPin size={13} />
                      <span>{client.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Value and Footer Actions */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                    Deal Value
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    ${(client.expectedValue || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingLead(client)}
                    title="Edit client"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedLead(client)}
                  >
                    <Eye size={13} />
                    <span>Profile</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
{filteredClients.length > 0 && (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      padding: '16px 4px',
      flexWrap: 'wrap'
    }}
  >
    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
      Showing {(currentPage - 1) * itemsPerPage + 1}–
      {Math.min(currentPage * itemsPerPage, filteredClients.length)}
      {' '}of {filteredClients.length} clients
    </span>

    <div style={{ display: 'flex', gap: 8 }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(page => page - 1)}
      >
        Previous
      </button>

      <span style={{ alignSelf: 'center', fontSize: '0.875rem' }}>
        Page {currentPage} of {Math.max(totalPages, 1)}
      </span>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={currentPage >= totalPages}
        onClick={() => setCurrentPage(page => page + 1)}
      >
        Next
      </button>
    </div>
  </div>
)}
      {/* Lead Detail Modal */}
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

export default ClientsPage;
