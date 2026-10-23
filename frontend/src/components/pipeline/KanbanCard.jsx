import React from 'react';
import Badge from '../common/Badge';
import { PIPELINE_STAGES } from '../../services/mockData';
import { Calendar, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

export const KanbanCard = ({ lead, onClick, onMoveStage }) => {
  const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === lead.pipelineStage);
  const prevStage = currentIndex > 0 ? PIPELINE_STAGES[currentIndex - 1] : null;
  const nextStage = currentIndex < PIPELINE_STAGES.length - 1 ? PIPELINE_STAGES[currentIndex + 1] : null;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header: Company & Priority */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
            {lead.company}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
            {lead.fullName}
          </div>
        </div>
        <Badge type={lead.priority} />
      </div>

      {/* Value and Source */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          ${(lead.expectedValue || 0).toLocaleString()}
        </div>
        <Badge type={lead.leadSource} />
      </div>

      {/* Footer Info: Assignee & Next Follow-up */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: 10,
          fontSize: '0.75rem',
          color: '#64748b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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
          <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
            {lead.assignedEmployee.split(' ')[0]}
          </span>
        </div>

        {lead.nextFollowUpDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569', fontWeight: 500 }}>
            <Calendar size={13} color="#64748b" />
            <span>{lead.nextFollowUpDate.slice(5)}</span>
          </div>
        )}
      </div>

      {/* Quick Move Action Bar */}
      <div
        style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {prevStage && (
            <button
              type="button"
              onClick={() => onMoveStage(lead.id, prevStage.id)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2 }}
              title={`Move back to ${prevStage.label}`}
            >
              <ChevronLeft size={12} />
              <span>Back</span>
            </button>
          )}
          {nextStage && (
            <button
              type="button"
              onClick={() => onMoveStage(lead.id, nextStage.id)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 6px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 2, color: '#2563eb', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
              title={`Advance to ${nextStage.label}`}
            >
              <span>Next</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>

        <select
          value={lead.pipelineStage}
          onChange={(e) => onMoveStage(lead.id, e.target.value)}
          style={{
            fontSize: '0.72rem',
            padding: '2px 6px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            maxWidth: 110
          }}
        >
          {PIPELINE_STAGES.map(st => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default KanbanCard;
