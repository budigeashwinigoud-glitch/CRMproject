import React from 'react';

export const Badge = ({ children, type = 'default', icon: Icon, className = '' }) => {
  const getStyles = () => {
    switch (type) {
      // Stages
      case 'New':
        return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
      case 'Contacted':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' };
      case 'Qualified':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Meeting':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' };
      case 'Proposal':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'Negotiation':
        return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8' };
      case 'Won':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'Lost':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };

      // Priority
      case 'High':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };
      case 'Medium':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a' };
      case 'Low':
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };

      // Follow-up status
      case 'Completed':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' };
      case 'Pending':
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' };
      case 'Overdue':
        return { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' };

      // Sources
      case 'Referral':
        return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'LinkedIn':
        return { bg: '#eff6ff', color: '#0284c7', border: '#bae6fd' };
      case 'Inbound':
      case 'Website':
        return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'Partner':
        return { bg: '#fdf4ff', color: '#c026d3', border: '#f5d0fe' };
      case 'Event':
      case 'Outbound':
        return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };

      case 'ai':
        return { bg: '#f5f3ff', color: '#6d28d9', border: '#c4b5fd' };

      default:
        return { bg: '#f1f5f9', color: '#334155', border: '#e2e8f0' };
    }
  };

  const style = getStyles();

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`
      }}
    >
      {Icon && <Icon size={12} />}
      {children || type}
    </span>
  );
};

export default Badge;
