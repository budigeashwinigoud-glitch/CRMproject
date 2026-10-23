/**
 * Belvo CRM System Constants & Structural Definitions
 * Zero-Data Architecture: Default records are empty arrays to ensure a clean slate.
 */

export const INITIAL_LEADS = [];
export const INITIAL_FOLLOW_UPS = [];
export const INITIAL_ACTIVITIES = [];

export const PIPELINE_STAGES = [
  { id: 'New', label: 'New', color: '#64748b' },
  { id: 'Contacted', label: 'Contacted', color: '#0284c7' },
  { id: 'Qualified', label: 'Qualified', color: '#3b82f6' },
  { id: 'Meeting', label: 'Meeting', color: '#8b5cf6' },
  { id: 'Proposal', label: 'Proposal', color: '#f59e0b' },
  { id: 'Negotiation', label: 'Negotiation', color: '#ec4899' },
  { id: 'Won', label: 'Won', color: '#10b981' },
  { id: 'Lost', label: 'Lost', color: '#ef4444' }
];

export const LEAD_SOURCES = [
  'Website',
  'Inbound',
  'Referral',
  'LinkedIn',
  'Outbound',
  'Partner',
  'Event'
];

export const PRIORITIES = ['High', 'Medium', 'Low'];

export const EMPLOYEES = [
  'Pavan Kumar',
  'Carlos Mendes',
  'Mariana Silva',
  'Alex Rivera'
];
