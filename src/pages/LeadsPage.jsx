import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadFormModal from '../components/leads/LeadFormModal';
import { PIPELINE_STAGES, LEAD_SOURCES, PRIORITIES, EMPLOYEES } from '../services/mockData';
import crmApi from '../services/api';
import {
  Search,
  Plus,
  ArrowUpDown,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react';

export const LeadsPage = () => {
  const { leads, deleteLead, showToast, refreshData } = useCRM();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filters State
  const initialUrlSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialUrlSearch);
  const [selectedStage, setSelectedStage] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');

  // Sorting State
  const [sortField, setSortField] = useState('createdDate');
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadToArchive, setLeadToArchive] = useState(null);

  // Sync with search parameter changes
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery !== null && urlQuery !== searchTerm) {
      setSearchTerm(urlQuery);
    }
  }, [searchParams, searchTerm]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('All');
    setSelectedPriority('All');
    setSelectedSource('All');
    setSelectedEmployee('All');
    setSearchParams({});
    setCurrentPage(1);
  };

  const fileInputRef = React.useRef(null);

  const handleExport = (format = 'csv') => {
    try {
      const filters = {};
      if (selectedStage !== 'All') filters.stage = selectedStage;
      if (selectedPriority !== 'All') filters.priority = selectedPriority;
      if (selectedSource !== 'All') filters.source = selectedSource;
      if (selectedEmployee !== 'All') filters.employee = selectedEmployee;
      const url = crmApi.getExportLeadsUrl(format, filters);
      window.open(url, '_blank');
      showToast(`Exporting leads (${format.toUpperCase()})...`, 'info');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Processing lead import...', 'info');
      const report = await crmApi.importLeads(file, false, false);
      await refreshData();
      showToast(`Import completed: ${report.inserted} inserted, ${report.skippedDuplicates} duplicates skipped, ${report.rejectedErrors} rejected.`, 'success');
    } catch (err) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const hasActiveFilters = searchTerm || selectedStage !== 'All' || selectedPriority !== 'All' || selectedSource !== 'All' || selectedEmployee !== 'All';

  // Filter and Sort leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        (lead.fullName && lead.fullName.toLowerCase().includes(searchLower)) ||
        (lead.company && lead.company.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.phone && lead.phone.toLowerCase().includes(searchLower)) ||
        (lead.id && lead.id.toLowerCase().includes(searchLower))
      );

      // Filters
      const matchesStage = selectedStage === 'All' || lead.pipelineStage === selectedStage;
      const matchesPriority = selectedPriority === 'All' || lead.priority === selectedPriority;
      const matchesSource = selectedSource === 'All' || lead.leadSource === selectedSource;
      const matchesEmployee = selectedEmployee === 'All' || lead.assignedEmployee === selectedEmployee;

      return matchesSearch && matchesStage && matchesPriority && matchesSource && matchesEmployee;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'expectedValue') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, searchTerm, selectedStage, selectedPriority, selectedSource, selectedEmployee, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Lead Management</span>
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
              {filteredLeads.length} Total
            </span>
          </h1>
          <p className="page-subtitle">
            Manage prospective fintech accounts, pipeline progression, and lead ownership.
          </p>
        </div>

        <div className="page-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".csv, .xlsx"
            onChange={handleFileImport}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            title="Import leads from CSV or Excel file"
          >
            <Upload size={15} />
            <span>Import</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleExport('csv')}
            title="Export filtered leads to CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddLeadOpen(true)}
            id="leads-add-lead-btn"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="crm-card"
        style={{ padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
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
              placeholder="Search name, company, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Stage Filter */}
          <select
            className="form-select"
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            className="form-select"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p} Priority</option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            className="form-select"
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Sources</option>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Assignee Filter */}
          <select
            className="form-select"
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Assignees</option>
            {EMPLOYEES.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
              title="Clear all filters"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table of Leads */}
      <div className="crm-card">
        {filteredLeads.length === 0 ? (
          <EmptyState
            title="No matching leads found"
            description={hasActiveFilters ? "Try clearing your search query or relaxing your filter options." : "No leads are currently registered. Add your first lead to begin."}
            actionLabel={hasActiveFilters ? "Clear All Filters" : "Add New Lead"}
            onAction={hasActiveFilters ? handleResetFilters : () => setIsAddLeadOpen(true)}
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th className="sortable" onClick={() => handleSort('company')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Company & Contact</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th>Stage</th>
                    <th className="sortable" onClick={() => handleSort('priority')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Priority</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th>Source</th>
                    <th className="sortable" onClick={() => handleSort('expectedValue')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Value ($)</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th>Assigned To</th>
                    <th className="sortable" onClick={() => handleSort('nextFollowUpDate')}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>Next Follow-up</span>
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeads.map(lead => (
                    <tr key={lead.id}>
                      {/* Company & Contact */}
                      <td>
                        <div
                          style={{ fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}
                          onClick={() => setSelectedLead(lead)}
                        >
                          {lead.company}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                          <span>{lead.fullName}</span> • <span>{lead.email}</span>
                        </div>
                      </td>

                      {/* Stage */}
                      <td>
                        <Badge type={lead.pipelineStage} />
                      </td>

                      {/* Priority */}
                      <td>
                        <Badge type={lead.priority} />
                      </td>

                      {/* Source */}
                      <td>
                        <Badge type={lead.leadSource} />
                      </td>

                      {/* Value */}
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        ${(lead.expectedValue || 0).toLocaleString()}
                      </td>

                      {/* Assignee */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem' }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.65rem',
                              fontWeight: 700
                            }}
                          >
                            {lead.assignedEmployee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{lead.assignedEmployee}</span>
                        </div>
                      </td>

                      {/* Next Follow-up */}
                      <td>
                        {lead.nextFollowUpDate ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8125rem', color: '#475569' }}>
                            <Calendar size={13} color="#64748b" />
                            <span>{lead.nextFollowUpDate}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>None set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setSelectedLead(lead)}
                            title="Inspect Client Profile"
                          >
                            <Eye size={15} color="#2563eb" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setEditingLead(lead)}
                            title="Edit Lead"
                          >
                            <Edit2 size={15} color="#475569" />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm"
                            onClick={() => setLeadToArchive(lead)}
                            title="Archive Lead"
                          >
                            <Trash2 size={15} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0f172a', padding: '0 8px' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
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

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(leadToArchive)}
        onClose={() => setLeadToArchive(null)}
        onConfirm={() => {
          if (leadToArchive) {
            deleteLead(leadToArchive.id);
            setLeadToArchive(null);
          }
        }}
        title="Archive Lead"
        message={`Are you sure you want to archive lead record "${leadToArchive?.company}"?`}
        confirmText="Archive Lead"
        isDanger={true}
      />
    </div>
  );
};

export default LeadsPage;
