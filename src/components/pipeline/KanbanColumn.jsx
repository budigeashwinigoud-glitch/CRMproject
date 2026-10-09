import React from 'react';
import KanbanCard from './KanbanCard';

export const KanbanColumn = ({
  stage,
  leads = [],
  onSelectLead,
  onMoveStage
}) => {
  const totalValue = leads.reduce((acc, l) => acc + (Number(l.expectedValue) || 0), 0);

  return (
    <div
      style={{
        flex: '0 0 300px',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 200px)',
        minHeight: 500
      }}
    >
      {/* Stage Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: stage.color
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              {stage.label}
            </span>
          </div>

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
            {leads.length}
          </span>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          ${totalValue.toLocaleString()} <span style={{ fontWeight: 400 }}>total</span>
        </div>
      </div>

      {/* Cards List */}
      <div
        style={{
          padding: '12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          flex: 1
        }}
      >
        {leads.length === 0 ? (
          <div
            style={{
              padding: '32px 12px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.8rem',
              border: '1px dashed #cbd5e1',
              borderRadius: 8,
              margin: 'auto 0'
            }}
          >
            No leads in this stage
          </div>
        ) : (
          leads.map(lead => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onClick={() => onSelectLead(lead)}
              onMoveStage={onMoveStage}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
