import React, { useState, useMemo, useEffect } from 'react';
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
  Edit2,
  LayoutGrid,
  List,
  Building2,
  DollarSign,
  Briefcase,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

const SERVICE_FILTERS = [
  { id: 'All', label: 'All Accounts' },
  { id: 'Brand', label: 'Brand Building' },
  { id: 'Web', label: 'Web Development' },
  { id: 'UI/UX', label: 'UI/UX Design' },
  { id: 'Marketing', label: 'Performance Ads' },
  { id: 'App', label: 'App Development' }
];

export const ClientsPage = () => {
  const { leads } = useCRM();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter accounts
  const filteredClients = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
        (lead.fullName && lead.fullName.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.location && lead.location.toLowerCase().includes(searchLower)) ||
        (lead.leadCategory && lead.leadCategory.toLowerCase().includes(searchLower));

      const matchesService =
        selectedService === 'All' ||
        (lead.leadCategory && lead.leadCategory.toLowerCase().includes(selectedService.toLowerCase()));

      return matchesSearch && matchesService;
    });
  }, [leads, searchTerm, selectedService]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedService]);

  // Client Directory Metrics
  const totalValue = useMemo(() => {
    return filteredClients.reduce((sum, c) => sum + (Number(c.expectedValue) || 0), 0);
  }, [filteredClients]);

  const avgDeal = useMemo(() => {
    if (filteredClients.length === 0) return 0;
    return Math.round(totalValue / filteredClients.length);
  }, [filteredClients, totalValue]);

  const wonCount = useMemo(() => {
    return filteredClients.filter(c => c.pipelineStage === 'Won').length;
  }, [filteredClients]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Brand & Account Directory</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #bfdbfe'
              }}
            >
              {filteredClients.length} Accounts
            </span>
          </h1>
          <p className="page-subtitle">
            Global brands, key stakeholders, and project deal histories managed by Belvo Creative Agency.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddLeadOpen(true)}
            style={{ boxShadow: '0 2px 6px -1px rgba(37, 99, 235, 0.35)' }}
          >
            <Plus size={16} />
            <span>New Client Account</span>
          </button>
        </div>
      </div>

      {/* Directory Metrics Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 20
        }}
      >
        <div className="crm-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Accounts
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {leads.length}
            </div>
          </div>
        </div>

        <div className="crm-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Portfolio Value
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              ${totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="crm-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Average Deal
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              ${avgDeal.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="crm-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Retainers / Won
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {wonCount}
            </div>
          </div>
        </div>
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div
        className="crm-card"
        style={{
          padding: 14,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap'
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 380 }}>
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
            placeholder="Search brand, client contact, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Service Category Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {SERVICE_FILTERS.map(filter => {
            const isActive = selectedService === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedService(filter.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: isActive ? '#eff6ff' : '#ffffff',
                  color: isActive ? '#1d4ed8' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.775rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: '#f1f5f9', padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: 6,
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
            title="Grid View"
          >
            <LayoutGrid size={15} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: 6,
              backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
              color: viewMode === 'table' ? '#0f172a' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
            }}
            title="Table View"
          >
            <List size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Content Rendering: Empty State vs Grid vs Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          title="No brand accounts found"
          description={
            searchTerm || selectedService !== 'All'
              ? 'No client accounts match your current filter criteria. Try clearing filters or searching for another brand.'
              : 'Your client directory is ready. Add your first brand partner to begin tracking agency projects.'
          }
          actionLabel="Add Client Account"
          onAction={() => setIsAddLeadOpen(true)}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 18 }}>
          {paginatedClients.map(client => (
            <div
              key={client.id}
              className="crm-card"
              style={{
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                position: 'relative',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Header: Avatar, Brand Name, Category, Stage Badge */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                      }}
                    >
                      {(client.company || 'B').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                        {client.company}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                        {client.leadCategory || 'Creative & Digital'}
                      </span>
                    </div>
                  </div>
                  <Badge type={client.pipelineStage} />
                </div>

                {/* Primary Contact Details */}
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 14px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    fontSize: '0.8125rem'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{client.fullName}</span>
                    {client.assignedEmployee && (
                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                        Rep: {client.assignedEmployee}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <Mail size={13} color="#94a3b8" />
                    <a
                      href={`mailto:${client.email}`}
                      style={{ color: '#2563eb', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title="Send email"
                    >
                      {client.email}
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <Phone size={13} color="#94a3b8" />
                    <span>{client.phone}</span>
                  </div>

                  {client.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                      <MapPin size={13} color="#94a3b8" />
                      <span>{client.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Deal Value and Quick Action Buttons */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                    Deal Value
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    ${(Number(client.expectedValue) || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingLead(client)}
                    title="Edit account details"
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
      ) : (
        /* TABLE VIEW */
        <div className="crm-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="crm-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Company</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Contact Person</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Scope / Industry</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Stage</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Deal Value</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Rep</th>
                  <th style={{ padding: '12px 18px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClients.map(client => (
                  <tr
                    key={client.id}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    onClick={() => setSelectedLead(client)}
                    className="hover-row"
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            backgroundColor: '#eff6ff',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8rem'
                          }}
                        >
                          {(client.company || 'B').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                            {client.company}
                          </div>
                          {client.location && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {client.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8125rem' }}>
                        {client.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {client.email}
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#475569' }}>
                      {client.leadCategory || 'Creative & Digital'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge type={client.pipelineStage} />
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                      ${(Number(client.expectedValue) || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.8125rem', color: '#64748b' }}>
                      {client.assignedEmployee || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingLead(client)}
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedLead(client)}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredClients.length > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            padding: '18px 4px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1}–
            {Math.min(currentPage * itemsPerPage, filteredClients.length)} of {filteredClients.length} accounts
          </span>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(page => page - 1)}
            >
              Previous
            </button>

            <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600, padding: '0 6px' }}>
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

      {/* Lead Detail Profile Modal */}
      <LeadDetailModal
        isOpen={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
        onEditLead={(lead) => setEditingLead(lead)}
      />

      {/* Add / Edit Client Modal */}
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
