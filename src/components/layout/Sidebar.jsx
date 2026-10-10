import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  CalendarCheck,
  Activity,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { metrics, resetDemoData, backendConnected } = useCRM();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/',
      icon: LayoutDashboard
    },
    {
      label: 'Leads',
      path: '/leads',
      icon: Users,
      badge: metrics?.totalLeads
    },
    {
      label: 'Sales Pipeline',
      path: '/pipeline',
      icon: Kanban
    },
    {
      label: 'Clients',
      path: '/clients',
      icon: Building2
    },
    {
      label: 'Follow-ups',
      path: '/follow-ups',
      icon: CalendarCheck,
      badge: metrics?.overdueFollowUps > 0 ? `${metrics.overdueFollowUps} due` : null,
      badgeColor: '#ef4444'
    },
    {
      label: 'Activities',
      path: '/activities',
      icon: Activity
    }
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'width 0.2s ease',
        flexShrink: 0
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          padding: isCollapsed ? '0 8px' : '0 20px',
          borderBottom: '1px solid var(--sidebar-border)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(37,99,235,0.4)'
            }}
          >
            B
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                Belvo <span style={{ color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>CRM</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.68rem', fontWeight: 500 }}>
                Lead Intelligence
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
              display: 'flex'
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              background: '#151e2e',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex'
            }}
            title="Expand Sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: isCollapsed ? '10px 0' : '10px 14px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                  backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none'
                })}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={19} />
                {!isCollapsed && (
                  <span style={{ flex: 1 }}>{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 12,
                      backgroundColor: item.badgeColor || '#1e293b',
                      color: '#ffffff'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* AI & Intelligence Section Tag */}
        {!isCollapsed && (
          <div
            style={{
              marginTop: 24,
              padding: '12px 14px',
              backgroundColor: '#131b2e',
              borderRadius: 10,
              border: '1px solid #1e293b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={14} />
              AI Lead Scoring
            </div>
            <p style={{ color: '#64748b', fontSize: '0.7rem', lineHeight: 1.4 }}>
              AI insights & predictive conversions ready for ML pipeline integration.
            </p>
          </div>
        )}
      </nav>

      {/* Footer Info & Reset Demo */}
      <div
        style={{
          padding: isCollapsed ? '12px 6px' : '16px',
          borderTop: '1px solid var(--sidebar-border)',
          backgroundColor: '#070b14'
        }}
      >
        {!isCollapsed ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Environment
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: backendConnected ? '#38bdf8' : '#10b981',
                  backgroundColor: backendConnected ? 'rgba(56,189,248,0.1)' : 'rgba(16,185,129,0.1)',
                  padding: '2px 6px',
                  borderRadius: 4
                }}
              >
                {backendConnected ? "Live Backend" : "Demo Active"}
              </span>
            </div>
            <button
              onClick={resetDemoData}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                backgroundColor: '#151e2e',
                borderColor: '#1e293b',
                color: '#94a3b8',
                fontSize: '0.75rem'
              }}
              title="Reset records to default demo state"
            >
              <RotateCcw size={13} />
              Reset Demo Data
            </button>
          </div>
        ) : (
          <button
            onClick={resetDemoData}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
            title="Reset Demo Data"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
