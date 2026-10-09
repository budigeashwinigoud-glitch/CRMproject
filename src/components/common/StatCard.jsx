import React from 'react';

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
      style={{ cursor: onClick ? 'pointer' : 'default' }}
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
                  color: trendPositive ? '#10b981' : '#ef4444',
                  fontWeight: 600
                }}
              >
                {trendPositive ? '↑' : '↓'} {trend}
              </span>
            )}
            {subtext}
          </span>
        )}
      </div>

      {Icon && (
        <div
          className="stat-icon-wrapper"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          <Icon size={22} strokeWidth={2.2} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
