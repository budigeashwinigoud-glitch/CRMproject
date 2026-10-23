import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  CalendarCheck,
  Activity,
  Archive,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Command
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onOpenCommandPalette }) => {
  const { metrics, refreshData, backendConnected } = useCRM();

  const navSections = [
    {
      title: 'Core Pipeline',
      items: [
        {
          label: 'Dashboard',
          path: '/',
          icon: LayoutDashboard
        },
        {
          label: 'Leads',
          path: '/leads',
          icon: Users,
          badge: metrics?.totalLeads > 0 ? metrics.totalLeads : null
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
        }
      ]
    },
    {
      title: 'Activities & Tasks',
      items: [
        {
          label: 'Follow-ups',
          path: '/follow-ups',
          icon: CalendarCheck,
          badge: metrics?.overdueFollowUps > 0 ? `${metrics.overdueFollowUps} due` : null,
          badgeColor: '#ef4444'
        },
        {
          label: 'Activity Audit',
          path: '/activities',
          icon: Activity
        },
        {
          label: 'Archived Leads',
          path: '/archived-leads',
          icon: Archive
        }
      ]
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'User Management',
          path: '/users',
          icon: UserCog
        }
      ]
    }
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        backgroundColor: '#090e1a',
        backgroundImage: 'linear-gradient(180deg, #090e1a 0%, #060913 100%)',
        borderRight: '1px solid rgba(30, 41, 59, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
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
          padding: isCollapsed ? '0 8px' : '0 18px',
          borderBottom: '1px solid rgba(30, 41, 59, 0.8)'
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
              boxShadow: '0 2px 10px rgba(37,99,235,0.45)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            B
          </div>
          {!isCollapsed && (
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 6 }}>
                Belvo <span style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, backgroundColor: 'rgba(56, 189, 248, 0.12)', padding: '1px 6px', borderRadius: 4 }}>CRM</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.67rem', fontWeight: 500, letterSpacing: '0.01em' }}>
                A Perfect Agency For Your Brand
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
              display: 'flex',
              transition: 'color 0.15s ease'
            }}
            title="Collapse Sidebar"
            onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
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

      {/* Navigation Sections */}
      <nav style={{ flex: 1, padding: isCollapsed ? '12px 6px' : '16px 10px', overflowY: 'auto' }}>
        {/* Quick Command Trigger in Sidebar */}
        {!isCollapsed && onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              backgroundColor: 'rgba(30, 41, 59, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 8,
              color: '#94a3b8',
              fontSize: '0.78rem',
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.8)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.45)';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Command size={14} color="#38bdf8" />
              <span>Command Menu</span>
            </div>
            <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)', color: '#cbd5e1' }}>⌘K</span>
          </button>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {navSections.map((sec) => (
            <div key={sec.title}>
              {!isCollapsed && (
                <div
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#475569',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '0 12px 6px',
                    userSelect: 'none'
                  }}
                >
                  {sec.title}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {sec.items.map((item) => {
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
                        padding: isCollapsed ? '10px 0' : '9px 12px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        borderRadius: 8,
                        color: isActive ? '#ffffff' : '#94a3b8',
                        backgroundColor: isActive ? 'rgba(30, 41, 59, 0.75)' : 'transparent',
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease',
                        textDecoration: 'none',
                        position: 'relative',
                        boxShadow: isActive ? 'inset 3px 0 0 #38bdf8' : 'none'
                      })}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} strokeWidth={2} />
                      {!isCollapsed && (
                        <span style={{ flex: 1 }}>{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 10,
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
            </div>
          ))}
        </div>

        {/* Agency Workflow Badge */}
        {!isCollapsed && (
          <div
            style={{
              marginTop: 22,
              padding: '12px 14px',
              backgroundColor: 'rgba(30, 27, 75, 0.4)',
              borderRadius: 10,
              border: '1px solid rgba(139, 92, 246, 0.25)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c084fc', fontSize: '0.75rem', fontWeight: 700, marginBottom: 4 }}>
              <Sparkles size={14} />
              Agency Growth Engine
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.68rem', lineHeight: 1.4, margin: '0 0 6px 0' }}>
              Discover → Design → Develop → Deliver. Scaling brands from scratch.
            </p>
          </div>
        )}
      </nav>

      {/* Footer System Status & Sync */}
      <div
        style={{
          padding: isCollapsed ? '12px 6px' : '14px 16px',
          borderTop: '1px solid rgba(30, 41, 59, 0.8)',
          backgroundColor: '#050811'
        }}
      >
        {!isCollapsed ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                System Status
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: backendConnected ? '#10b981' : '#38bdf8',
                  backgroundColor: backendConnected ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: backendConnected ? '#10b981' : '#38bdf8' }} />
                {backendConnected ? "FastAPI Live" : "Local Sync"}
              </span>
            </div>
            <button
              onClick={() => refreshData()}
              className="btn btn-secondary btn-sm"
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#94a3b8',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
              title="Sync CRM state from database"
            >
              <RotateCcw size={13} />
              Sync & Refresh
            </button>
          </div>
        ) : (
          <button
            onClick={() => refreshData()}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
            title="Sync & Refresh Data"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
