import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import PipelinePage from './pages/PipelinePage';
import ClientsPage from './pages/ClientsPage';
import FollowUpsPage from './pages/FollowUpsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import LeadDetailPage from './pages/LeadDetailPage';
import ArchivedLeadsPage from './pages/ArchivedLeadsPage';
import UserManagementPage from './pages/UserManagementPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <CRMProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          

<Route element={<ProtectedRoute />}>
  
          

          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="pipeline" element={<PipelinePage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="follow-ups" element={<FollowUpsPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="archived-leads" element={<ArchivedLeadsPage />} />
            <Route path="users" element={<UserManagementPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CRMProvider>
  );
}

export default App;
