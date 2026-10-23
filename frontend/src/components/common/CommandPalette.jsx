import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../../context/CRMContext';
import {
  Search,
  LayoutDashboard,
  Users,
  Kanban,
  Building2,
  CalendarCheck,
  Activity,
  Archive,
  UserCog,
  Plus,
  RotateCcw,
  Globe2,
  Download,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';

export const CommandPalette = ({ isOpen, onClose, onOpenAddLead, onSelectLead }) => {
  const navigate = useNavigate();
  const { leads, refreshData, showToast } = useCRM();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global shortcut: Escape closes, arrows navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Navigation Items
  const navItems = [
    { label: 'Go to Dashboard', path: '/', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'View Leads Table', path: '/leads', icon: Users, category: 'Navigation' },
    { label: 'Open Pipeline Kanban', path: '/pipeline', icon: Kanban, category: 'Navigation' },
    { label: 'Client Accounts Directory', path: '/clients', icon: Building2, category: 'Navigation' },
    { label: 'Scheduled Follow-ups & Tasks', path: '/follow-ups', icon: CalendarCheck, category: 'Navigation' },
    { label: 'Activity Audit Log', path: '/activities', icon: Activity, category: 'Navigation' },
    { label: 'User & Team Management', path: '/users', icon: UserCog, category: 'Navigation' },
    { label: 'Archived Leads', path: '/archived-leads', icon: Archive, category: 'Navigation' }
  ];

  // Quick Action Items
  const actionItems = [
    {
      label: 'Add New Lead Account',
      action: () => {
        onClose();
        onOpenAddLead();
      },
      icon: Plus,
      category: 'Actions'
    },
    {
      label: 'Refresh Workspace',
      action: async () => {
        onClose();
        await refreshData();
        showToast('Workspace refreshed successfully.', 'success');
      },
      icon: RotateCcw,
      category: 'Actions'
    },
    {
      label: 'Visit Belvo Agency Website',
      action: () => {
        window.open('https://www.belvo.buzz/', '_blank');
        onClose();
      },
      icon: Globe2,
      category: 'Actions'
    }
  ];

  // Matching Leads
  const matchingLeads = query.trim()
    ? leads.filter(l =>
        (l.company && l.company.toLowerCase().includes(query.toLowerCase())) ||
        (l.fullName && l.fullName.toLowerCase().includes(query.toLowerCase())) ||
        (l.email && l.email.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5).map(l => ({
        label: `${l.company} (${l.fullName})`,
        subtext: `$${(l.expectedValue || 0).toLocaleString()} • ${l.pipelineStage}`,
        action: () => {
          onClose();
          if (onSelectLead) onSelectLead(l);
        },
        icon: Building2,
        category: 'Leads'
      }))
    : [];

  const filteredNav = navItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredActions = actionItems.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = [...matchingLeads, ...filteredActions, ...filteredNav];

  const handleSelect = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (allItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % allItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) handleSelect(current);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(9, 14, 26, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Command Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff'
          }}
        >
          <Search size={20} color="#2563eb" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search pages, or search leads..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#0f172a',
              backgroundColor: 'transparent'
            }}
          />
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#94a3b8',
              backgroundColor: '#f1f5f9',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid #e2e8f0'
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
              No commands or leads found matching "<strong>{query}</strong>"
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {allItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${item.category}-${item.label}-${idx}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 10,
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: isSelected ? '#1e40af' : '#0f172a' }}>
                          {item.label}
                        </div>
                        {item.subtext && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 1 }}>
                            {item.subtext}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          color: isSelected ? '#3b82f6' : '#94a3b8',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {item.category}
                      </span>
                      {isSelected && <ArrowRight size={14} color="#2563eb" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Shortcut Hints */}
        <div
          style={{
            padding: '10px 16px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span><strong style={{ color: '#0f172a' }}>↑↓</strong> Navigate</span>
            <span><strong style={{ color: '#0f172a' }}>↵</strong> Select</span>
            <span><strong style={{ color: '#0f172a' }}>ESC</strong> Close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', fontWeight: 600 }}>
            <Sparkles size={13} />
            <span>Belvo Agency OS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
