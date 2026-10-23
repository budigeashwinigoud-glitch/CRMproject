import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'Try adjusting your filters or search criteria, or add a new record to get started.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  return (
    <div
      style={{
        padding: '56px 28px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px dashed #cbd5e1',
        margin: '20px 0',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.02)'
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '16px',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          border: '1px solid #bfdbfe'
        }}
      >
        <Icon size={28} strokeWidth={2} />
      </div>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
        {title}
      </h3>
      
      <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 460, lineHeight: 1.5, marginBottom: (actionLabel || secondaryActionLabel) ? 20 : 0 }}>
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {actionLabel && onAction && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={onAction}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>{actionLabel}</span>
            </button>
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
