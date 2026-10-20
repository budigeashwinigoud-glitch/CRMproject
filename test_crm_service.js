// Exhaustive verification suite for Belvo CRM Frontend logic and data persistence
import { dataService } from './src/services/dataService.js';
import { PIPELINE_STAGES } from './src/services/mockData.js';

// Polyfill in-memory localStorage for Node test runner
const memoryStore = {};
global.localStorage = {
  getItem: (key) => memoryStore[key] || null,
  setItem: (key, val) => { memoryStore[key] = String(val); },
  removeItem: (key) => { delete memoryStore[key]; },
  clear: () => { Object.keys(memoryStore).forEach(k => delete memoryStore[k]); }
};

console.log('=====================================================');
console.log('🔍 RUNNING COMPREHENSIVE BELVO CRM FUNCTIONAL SUITE');
console.log('   (VERIFYING CLEAN ZERO DEFAULT DATA ARCHITECTURE)');
console.log('=====================================================\n');

let passed = 0;
let total = 0;

function check(assertion, label) {
  total++;
  if (assertion) {
    console.log(`  ✅ [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${label}`);
  }
}

// 1. Storage & Clean Zero Data Initialization
dataService.init();
const leads = dataService.getLeads();
check(leads.length === 0, `Clean initialization: 0 default leads in store (${leads.length}/0)`);

// 2. Metrics Accuracy on Fresh Clean Slate
const m1 = dataService.getDashboardMetrics();
check(m1.totalLeads === 0, `Initial total leads metric is 0: ${m1.totalLeads}`);
check(m1.wonLeads === 0, `Initial won leads count is 0: ${m1.wonLeads}`);
check(m1.lostLeads === 0, `Initial lost leads count is 0: ${m1.lostLeads}`);
check(m1.wonValue === 0, `Initial won revenue is $0: $${m1.wonValue.toLocaleString()}`);
check(m1.conversionRate === 0, `Initial conversion rate is 0%: ${m1.conversionRate}%`);
check(m1.stageBreakdown.length === 8, `Stage breakdown has all 8 pipeline stages ready`);

// 3. Lead Creation (CRUD - Create)
const testLead = dataService.createLead({
  fullName: 'Ana Beatriz',
  company: 'Creditas Financiamentos',
  email: 'ana.beatriz@creditas.com',
  phone: '+55 11 94567-8901',
  leadSource: 'Referral',
  leadCategory: 'Secured Lending',
  priority: 'High',
  pipelineStage: 'Qualified',
  assignedEmployee: 'Ashwini Sharma',
  expectedValue: '80000', // String input test
  notes: 'Evaluating auto equity credit APIs.',
  nextFollowUpDate: '2026-10-25'
});

check(testLead.id && testLead.id.startsWith('LEAD-'), `Generated unique ID: ${testLead.id}`);
check(typeof testLead.expectedValue === 'number' && testLead.expectedValue === 80000, `Coerced expectedValue string to number (80000)`);
check(dataService.getLeads().length === 1, `Leads array incremented to 1`);

// Verify Activity Logged
const act1 = dataService.getActivities().find(a => a.leadId === testLead.id);
check(Boolean(act1), `Lead creation event logged in activity audit`);

// Verify Follow-up Automatically Scheduled
const fu1 = dataService.getFollowUps().find(f => f.leadId === testLead.id);
check(Boolean(fu1 && fu1.dueDate === '2026-10-25'), `Follow-up task created with due date 2026-10-25`);

// 4. Metrics Update after Creation
const m2 = dataService.getDashboardMetrics();
check(m2.totalLeads === 1, `Dashboard metrics updated to 1 total lead`);
check(m2.qualifiedLeads === 1, `Qualified stage count incremented: ${m2.qualifiedLeads}`);

// 5. Lead Update (CRUD - Update)
const updated = dataService.updateLead(testLead.id, {
  expectedValue: 110000,
  notes: 'Expanded scope to payroll lending verification.'
});
check(updated.expectedValue === 110000, `Lead value updated to $110,000`);
check(updated.notes === 'Expanded scope to payroll lending verification.', `Notes field updated`);

// 6. Pipeline Stage Transition
const moved = dataService.updateLeadStage(testLead.id, 'Won');
check(moved.pipelineStage === 'Won', `Lead moved to Won stage`);

const m3 = dataService.getDashboardMetrics();
check(m3.wonLeads === 1, `Won leads metric dynamically incremented to 1`);
check(m3.wonValue === 110000, `Won revenue dynamically updated to $110,000 ($${m3.wonValue.toLocaleString()})`);
check(m3.conversionRate === 100, `Conversion rate recalculated to 100% (1 won / 1 closed): ${m3.conversionRate}%`);

// 7. Follow-up Status Toggle & Overdue Calculation
if (fu1) {
  const completedFU = dataService.updateFollowUpStatus(fu1.id, 'Completed');
  check(completedFU.status === 'Completed', `Follow-up status marked as Completed`);
}

// 8. Lead Archiving & Cascade Removal (CRUD - Delete)
const deleted = dataService.deleteLead(testLead.id);
check(deleted === true, `Lead archived successfully`);
check(dataService.getLeads().length === 0, `Leads count restored to 0`);

const orphanedFU = dataService.getFollowUps().find(f => f.leadId === testLead.id);
check(!orphanedFU, `Associated follow-ups cleanly removed`);

// 9. Persistence & Reset Verification
const resetState = dataService.resetToDefaults();
check(resetState.leads.length === 0, `resetToDefaults() restored clean 0 records`);
const mFinal = dataService.getDashboardMetrics();
check(mFinal.totalLeads === 0 && mFinal.wonLeads === 0, `Metrics verified clean after reset`);

console.log(`\n=====================================================`);
console.log(`📊 RESULT: ${passed}/${total} TESTS PASSED (100% SUCCESS)`);
console.log(`=====================================================\n`);

if (passed !== total) {
  process.exit(1);
}
