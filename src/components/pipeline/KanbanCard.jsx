import React from 'react';
import Badge from '../common/Badge';
import { PIPELINE_STAGES } from '../../services/mockData';
import { Calendar } from 'lucide-react';

export const KanbanCard = ({ lead, onClick, onMoveStage }) => {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        boxShadow: 'var(--shadow-xs)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all 0.15s ease',
        userSelect: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#94a3b8';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header: Company & Priority */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
            {lead.company}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
            {lead.fullName}
          </div>
        </div>
        <Badge type={lead.priority} />
      </div>

      {/* Value and Source */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
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
              width: 20,
              height: 20,
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
          <span style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {lead.assignedEmployee.split(' ')[0]}
          </span>
        </div>

        {lead.nextFollowUpDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
            <Calendar size={13} />
            <span>{lead.nextFollowUpDate.slice(5)}</span>
          </div>
        )}
      </div>

      {/* Quick Stage Transition Dropdown */}
      <div
        style={{
          borderTop: '1px solid #f8fafc',
          paddingTop: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Move to:</span>
        <select
          value={lead.pipelineStage}
          onChange={(e) => onMoveStage(lead.id, e.target.value)}
          style={{
            fontSize: '0.75rem',
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            backgroundColor: '#f8fafc',
            color: '#334155',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none'
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
