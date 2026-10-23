import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  trend,
  trendPositive,
  onClick
}) => {
  return (
    <div
      className="stat-card"
      style={{
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none'
      }}
      onClick={onClick}
    >
      <div className="stat-card-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && (
          <span className="stat-subtext">
            {trend && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 2,
                  color: trendPositive ? '#15803d' : '#b91c1c',
                  backgroundColor: trendPositive ? '#f0fdf4' : '#fef2f2',
                  padding: '1px 6px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: '0.72rem'
                }}
              >
                {trendPositive ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
                {trend}
              </span>
            )}
            <span>{subtext}</span>
          </span>
        )}
      </div>

      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{
            backgroundColor: iconBg,
            color: iconColor,
            border: `1px solid ${iconColor}20`
          }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
