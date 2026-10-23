import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '../common/Toast';
import LeadFormModal from '../leads/LeadFormModal';
import LeadDetailModal from '../leads/LeadDetailModal';
import CommandPalette from '../common/CommandPalette';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [inspectingLead, setInspectingLead] = useState(null);
  const [editingLead, setEditingLead] = useState(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Header
          onOpenAddLead={() => setIsAddLeadModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>

      {/* Global Add / Edit Lead Modal */}
      <LeadFormModal
        isOpen={isAddLeadModalOpen || Boolean(editingLead)}
        onClose={() => {
          setIsAddLeadModalOpen(false);
          setEditingLead(null);
        }}
        leadToEdit={editingLead}
      />

      {/* Global Lead Detail Modal from Command Palette */}
      <LeadDetailModal
        isOpen={Boolean(inspectingLead)}
        onClose={() => setInspectingLead(null)}
        lead={inspectingLead}
        onEditLead={(lead) => {
          setInspectingLead(null);
          setEditingLead(lead);
        }}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAddLead={() => setIsAddLeadModalOpen(true)}
        onSelectLead={(lead) => setInspectingLead(lead)}
      />

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Layout;
