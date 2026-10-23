import React, { useState, useMemo } from 'react';
import { useCRM } from '../context/CRMContext';
import KanbanColumn from '../components/pipeline/KanbanColumn';
import LeadDetailModal from '../components/leads/LeadDetailModal';
import LeadFormModal from '../components/leads/LeadFormModal';
import { PIPELINE_STAGES, PRIORITIES, LEAD_SOURCES, EMPLOYEES } from '../services/mockData';
import {
  Search,
  Plus,
  RotateCcw
} from 'lucide-react';

export const PipelinePage = () => {
  const { leads, updateLeadStage, metrics } = useCRM();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState('All');

  // Modals
  const [selectedLead, setSelectedLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
        (lead.fullName && lead.fullName.toLowerCase().includes(searchLower)) ||
        (lead.company && lead.company.toLowerCase().includes(searchLower))
      );

      const matchesPriority = selectedPriority === 'All' || lead.priority === selectedPriority;
      const matchesSource = selectedSource === 'All' || lead.leadSource === selectedSource;
      const matchesEmployee = selectedEmployee === 'All' || lead.assignedEmployee === selectedEmployee;

      return matchesSearch && matchesPriority && matchesSource && matchesEmployee;
    });
  }, [leads, searchTerm, selectedPriority, selectedSource, selectedEmployee]);

  const hasActiveFilters = searchTerm || selectedPriority !== 'All' || selectedSource !== 'All' || selectedEmployee !== 'All';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedPriority('All');
    setSelectedSource('All');
    setSelectedEmployee('All');
  };

  const handleMoveStage = (leadId, newStage) => {
    updateLeadStage(leadId, newStage);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            <span>Sales Pipeline Kanban</span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)'
              }}
            >
              ${(metrics?.activePipelineValue || 0).toLocaleString()} Active Pipeline
            </span>
          </h1>
          <p className="page-subtitle">
            Track deals across 8 sales stages from discovery to closing.
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsAddLeadOpen(true)}
            id="pipeline-add-lead-btn"
          >
            <Plus size={16} />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Zero Deals Quick Prompt */}
      {leads.length === 0 && (
        <div
          style={{
            marginBottom: 18,
            padding: '12px 18px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#1d4ed8' }}>
            No active deals in the pipeline. Click <strong>+ Add Lead</strong> to populate your first sales stage.
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddLeadOpen(true)}
          >
            <Plus size={14} />
            <span>Add Lead</span>
          </button>
        </div>
      )}

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
              placeholder="Search cards by name/company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: 150, fontSize: '0.8125rem' }}
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 150, fontSize: '0.8125rem' }}
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
          >
            <option value="All">All Sources</option>
            {LEAD_SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="form-select"
            style={{ width: 170, fontSize: '0.8125rem' }}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="All">All Assignees</option>
            {EMPLOYEES.map(emp => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong>{filteredLeads.length}</strong> of {leads.length} deals
        </div>
      </div>

      {/* Horizontal Scrollable Kanban Board */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          overflowX: 'auto',
          paddingBottom: 20,
          minHeight: 'calc(100vh - 280px)',
          scrollBehavior: 'smooth'
        }}
      >
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = filteredLeads.filter(l => l.pipelineStage === stage.id);
          return (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={stageLeads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onMoveStage={handleMoveStage}
            />
          );
        })}
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

export default PipelinePage;
