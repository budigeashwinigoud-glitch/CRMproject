import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import crmApi from '../../services/api';
import {
  Search,
  Plus,
  Bell,
  CheckCircle2,
  Menu,
  ShieldCheck,
  LogOut,
  Sparkles,
  ChevronDown,
  User,
  ShieldAlert,
  Globe2
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const Header = ({ onOpenAddLead, onToggleMobileSidebar, onOpenCommandPalette }) => {
  const navigate = useNavigate();
  const { followUps, backendConnected, setCurrentUser, currentUser } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const searchInputRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (onOpenCommandPalette) {
          onOpenCommandPalette();
        } else {
          searchInputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenCommandPalette]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    crmApi.logout();
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/leads?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const overdueList = followUps.filter(f => f.status === 'Overdue' || (f.status === 'Pending' && f.dueDate < new Date().toISOString().split('T')[0]));

  const userDisplayName = currentUser?.fullName || currentUser?.name || currentUser?.email || 'User';
  const userInitials = userDisplayName
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.85)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        transition: 'all 0.2s ease'
      }}
    >
      {/* Left: Mobile Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 520 }}>
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

        <div
          onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : navigate('/leads')}
          style={{ width: '100%', position: 'relative', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenCommandPalette ? onOpenCommandPalette() : navigate('/leads');
            }
          }}
        >
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
            id="global-search-input"
            type="text"
            readOnly
            placeholder="Quick search leads, pages, or commands (Press Ctrl+K)..."
            style={{
              width: '100%',
              padding: '9px 72px 9px 38px',
              fontSize: '0.875rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: '#64748b',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 5,
              padding: '2px 6px',
              pointerEvents: 'none',
              letterSpacing: '0.04em'
            }}
          >
            ⌘K
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Belvo Agency Official Website Link */}
        <a
          href="https://www.belvo.buzz/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 11px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            color: '#475569',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.15s ease'
          }}
          title="Visit official agency website: https://www.belvo.buzz/"
        >
          <Globe2 size={13} color="#2563eb" />
          <span>belvo.buzz</span>
        </a>

        {/* API Live Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            backgroundColor: backendConnected ? '#f0fdf4' : '#eff6ff',
            border: backendConnected ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: backendConnected ? '#15803d' : '#1d4ed8'
          }}
          title={backendConnected ? "Connected to Belvo FastAPI REST API & Database." : "Centralized Local Storage active."}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: backendConnected ? '#16a34a' : '#2563eb'
            }}
          />
          <span>{backendConnected ? "FastAPI Live" : "Local Sync"}</span>
        </div>

        {/* Add Lead Primary CTA */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddLead}
          id="global-add-lead-btn"
          style={{
            boxShadow: '0 2px 6px -1px rgba(37, 99, 235, 0.35)'
          }}
        >
          <Plus size={15} strokeWidth={2.5} />
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
                  top: -2,
                  right: -2,
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
                width: 320,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                padding: 14,
                zIndex: 110,
                animation: 'scaleUp 0.15s ease-out'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#0f172a' }}>Follow-up Reminders</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{overdueList.length} alert{overdueList.length === 1 ? '' : 's'}</span>
              </div>
              {overdueList.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '16px 0', textAlign: 'center' }}>
                  <CheckCircle2 size={22} color="#10b981" style={{ margin: '0 auto 8px' }} />
                  <div>All scheduled follow-ups are up to date!</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                  {overdueList.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        navigate('/follow-ups');
                        setShowNotifications(false);
                      }}
                      style={{
                        padding: '9px 12px',
                        backgroundColor: '#fef2f2',
                        borderRadius: 6,
                        borderLeft: '3px solid #ef4444',
                        cursor: 'pointer',
                        fontSize: '0.78rem'
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#991b1b' }}>{item.title}</div>
                      <div style={{ color: '#b91c1c', marginTop: 2 }}>{item.company} • Due {item.dueDate}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '4px 8px 4px 6px',
              backgroundColor: showProfileMenu ? '#f1f5f9' : 'transparent',
              border: '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!showProfileMenu) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!showProfileMenu) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {/* Avatar with Presence Indicator */}
            <div style={{ position: 'relative' }}>
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
                  fontSize: '0.8rem',
                  letterSpacing: '0.02em',
                  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)'
                }}
              >
                {userInitials}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: -1,
                  right: -1,
                  width: 9,
                  height: 9,
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  border: '2px solid #ffffff'
                }}
                title="Online"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                {userDisplayName}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.2, fontWeight: 500 }}>
                {currentUser?.role || 'Employee'}
              </span>
            </div>

            <ChevronDown size={14} color="#94a3b8" />
          </button>

          {/* Profile Popover Menu */}
          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 240,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                padding: '8px',
                zIndex: 110,
                animation: 'scaleUp 0.15s ease-out'
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{userDisplayName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{currentUser?.email || 'pavan@belvo.com'}</div>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      padding: '2px 8px',
                      borderRadius: 10,
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    {currentUser?.role || 'Employee'} Access
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 6,
                  color: '#dc2626',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={15} color="#dc2626" />
                <span>Log Out of Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
