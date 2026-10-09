import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  CheckCircle2,
  Menu,
  ShieldCheck
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Header = ({ onOpenAddLead, onToggleMobileSidebar }) => {
  const navigate = useNavigate();
  const { followUps } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const overdueList = followUps.filter(f => f.status === 'Overdue' || (f.status === 'Pending' && f.dueDate < new Date().toISOString().split('T')[0]));

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-main)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90
      }}
    >
      {/* Left: Mobile Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 480 }}>
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="btn btn-ghost btn-icon"
            style={{ display: 'none' }}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        )}

        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8'
            }}
          />
          <input
            type="text"
            placeholder="Search leads, companies, emails... (Press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.875rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
          />
        </form>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* API / Demo Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#1d4ed8'
          }}
          title="Centralized Mock & LocalStorage active. Ready for Backend API integration."
        >
          <ShieldCheck size={14} color="#2563eb" />
          <span>Local Demo Storage</span>
        </div>

        {/* Add Lead Primary CTA */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddLead}
          id="global-add-lead-btn"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Lead</span>
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary btn-icon btn-sm"
            style={{ position: 'relative' }}
            aria-label="Notifications"
          >
            <Bell size={16} color="#475569" />
            {overdueList.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: -3,
                  right: -3,
                  width: 8,
                  height: 8,
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }}
              />
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 300,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-xl)',
                padding: 12,
                zIndex: 110
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{overdueList.length} alert{overdueList.length === 1 ? '' : 's'}</span>
              </div>
              {overdueList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '12px 0', textAlign: 'center' }}>
                  <CheckCircle2 size={20} color="#10b981" style={{ margin: '0 auto 6px' }} />
                  All scheduled follow-ups are up to date!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {overdueList.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate('/follow-ups');
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#fef2f2',
                        borderRadius: 6,
                        borderLeft: '3px solid #ef4444',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#991b1b' }}>{item.title}</div>
                      <div style={{ color: '#b91c1c' }}>{item.company} • Due {item.dueDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 10,
            borderLeft: '1px solid var(--border-main)'
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            AS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Ashwini Sharma
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.2 }}>
              Lead CRM Specialist
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
