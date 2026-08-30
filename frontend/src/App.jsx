import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import { Box } from '@mui/material';
import { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';


// Layout & Protected Route
import ProtectedRoute from './components/ProtectedRoute';





// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminCustomers from './pages/admin/Customers';
import AdminAgents from './pages/admin/Agents';
import AdminClaimsOfficers from './pages/admin/ClaimsOfficers';
import AdminPolicies from './pages/admin/Policies';
import AdminPolicyPurchases from './pages/admin/PolicyPurchases';
import AdminClaims from './pages/admin/Claims';
import AdminClaimDetails from './pages/admin/ClaimDetails';
import AdminDocuments from './pages/admin/Documents';
import AdminReports from './pages/admin/Reports';
import AdminAuditLogs from './pages/admin/AuditLogs';
import AdminProfile from './pages/admin/Profile';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerPolicies from './pages/customer/Policies';
import CustomerPolicyDetails from './pages/customer/PolicyDetails';
import CustomerPurchasePolicy from './pages/customer/PurchasePolicy';
import CustomerMyPolicies from './pages/customer/MyPolicies';
import CustomerMyPolicyDetails from './pages/customer/MyPolicyDetails';
import CustomerClaims from './pages/customer/Claims';
import CustomerSubmitClaim from './pages/customer/SubmitClaim';
import CustomerClaimDetails from './pages/customer/ClaimDetails';
import CustomerDocuments from './pages/customer/Documents';
import CustomerNotifications from './pages/customer/Notifications';
import CustomerProfile from './pages/customer/Profile';

// Claims Officer Pages
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerClaims from './pages/officer/Claims';
import OfficerClaimDetails from './pages/officer/ClaimDetails';
import OfficerReviews from './pages/officer/Reviews';
import OfficerNotifications from './pages/officer/Notifications';
import OfficerProfile from './pages/officer/Profile';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentCustomers from './pages/agent/Customers';
import AgentCustomerDetail from './pages/agent/CustomerDetail';
import AgentPurchases from './pages/agent/Purchases';
import AgentPurchaseDetail from './pages/agent/PurchaseDetail';
import AgentClaims from './pages/agent/Claims';
import AgentClaimDetail from './pages/agent/ClaimDetail';
import AgentNotifications from './pages/agent/Notifications';
import AgentProfile from './pages/agent/Profile';

const ProtectedLayout = () => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#edf5ff' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Root redirect to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Module 1: Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="agents" element={<AdminAgents />} />
        <Route path="claims-officers" element={<AdminClaimsOfficers />} />
        <Route path="policies" element={<AdminPolicies />} />
        <Route path="policy-purchases" element={<AdminPolicyPurchases />} />
        <Route path="claims" element={<AdminClaims />} />
        <Route path="claims/:id" element={<AdminClaimDetails />} />
        <Route path="documents" element={<AdminDocuments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Module 2: Protected Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/dashboard" replace />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="policies" element={<CustomerPolicies />} />
        <Route path="policies/:id" element={<CustomerPolicyDetails />} />
        <Route path="policies/:id/purchase" element={<CustomerPurchasePolicy />} />
        <Route path="policies/my" element={<CustomerMyPolicies />} />
        <Route path="policies/my/:id" element={<CustomerMyPolicyDetails />} />
        <Route path="claims" element={<CustomerClaims />} />
        <Route path="claims/new" element={<CustomerSubmitClaim />} />
        <Route path="claims/:id" element={<CustomerClaimDetails />} />
        <Route path="documents" element={<CustomerDocuments />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Module 3: Protected Claims Officer Routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={['CLAIMS_OFFICER']}>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/officer/dashboard" replace />} />
        <Route path="dashboard" element={<OfficerDashboard />} />
        <Route path="claims" element={<OfficerClaims />} />
        <Route path="claims/:id" element={<OfficerClaimDetails />} />
        <Route path="reviews" element={<OfficerReviews />} />
        <Route path="notifications" element={<OfficerNotifications />} />
        <Route path="profile" element={<OfficerProfile />} />
      </Route>

      {/* Module 4: Protected Agent Routes */}
      <Route
        path="/agent"
        element={
          <ProtectedRoute allowedRoles={['AGENT']}>
            <ProtectedLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/agent/dashboard" replace />} />
        <Route path="dashboard" element={<AgentDashboard />} />
        <Route path="customers" element={<AgentCustomers />} />
        <Route path="customers/:id" element={<AgentCustomerDetail />} />
        <Route path="purchases" element={<AgentPurchases />} />
        <Route path="purchases/:id" element={<AgentPurchaseDetail />} />
        <Route path="claims" element={<AgentClaims />} />
        <Route path="claims/:id" element={<AgentClaimDetail />} />
        <Route path="notifications" element={<AgentNotifications />} />
        <Route path="profile" element={<AgentProfile />} />
      </Route>

      {/* Fallback Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
