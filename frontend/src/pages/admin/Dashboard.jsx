import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupIcon from '@mui/icons-material/Group';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PolicyIcon from '@mui/icons-material/Policy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

import adminService from '../../services/adminService';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const STATUS_COLORS = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashData, claimsData] = await Promise.all([
        adminService.getDashboard(),
        adminService.getClaims({ page: 1, page_size: 5 }),
      ]);
      setStats(dashData);
      setRecentClaims(claimsData.items || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to fetch administrative metrics from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading message="Loading system metrics and analytics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            System Overview & Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time administrative monitoring across policies, users, claims, and financials.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Row 1: Primary User & Stakeholder Stats (4 cards) */}
      <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, letterSpacing: '0.04em' }}>
        USER & STAKEHOLDER POPULATION
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={<PeopleAltIcon />}
            color="primary"
            subtitle="Registered in system"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Customers"
            value={stats?.total_customers || 0}
            icon={<GroupIcon />}
            color="info"
            subtitle="Policyholder accounts"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Agents"
            value={stats?.total_agents || 0}
            icon={<SupportAgentIcon />}
            color="secondary"
            subtitle="Insurance sales brokers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Claims Officers"
            value={stats?.total_claims_officers || 0}
            icon={<FactCheckIcon />}
            color="warning"
            subtitle="Review & audit personnel"
          />
        </Grid>
      </Grid>

      {/* Row 2: Policy & Claim Performance Stats (8 cards in 2x4 grid) */}
      <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, letterSpacing: '0.04em' }}>
        POLICIES & CLAIMS MONITORING
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Policies"
            value={stats?.total_policies || 0}
            icon={<PolicyIcon />}
            color="primary"
            subtitle={`${stats?.active_policies || 0} Active Catalog Plans`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Policy Purchases"
            value={stats?.total_policy_purchases || 0}
            icon={<ShoppingCartIcon />}
            color="success"
            subtitle="Total customer subscriptions"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Claims Filed"
            value={stats?.total_claims || 0}
            icon={<AssignmentIcon />}
            color="info"
            subtitle="All-time claim volume"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Claims"
            value={stats?.pending_claims || 0}
            icon={<PendingActionsIcon />}
            color="warning"
            subtitle="Under officer review"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Claims"
            value={stats?.approved_claims || 0}
            icon={<CheckCircleOutlineIcon />}
            color="success"
            subtitle="Settled by officers"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected Claims"
            value={stats?.rejected_claims || 0}
            icon={<CancelOutlinedIcon />}
            color="error"
            subtitle="Ineligible / Non-covered"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Policies"
            value={stats?.active_policies || 0}
            icon={<PolicyIcon />}
            color="success"
            subtitle="Enabled for sale"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Expired Subscriptions"
            value={stats?.expired_policies || 0}
            icon={<EventBusyIcon />}
            color="error"
            subtitle="Past coverage duration"
          />
        </Grid>
      </Grid>

      {/* Row 3: Recharts Visualizations Grid (4 charts) */}
      <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1.5, letterSpacing: '0.04em' }}>
        REPORTS & ANALYTICS VISUALIZATIONS
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Chart 1: Claims by Status */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Claims by Status</Typography>}
              subheader="Distribution of claim settlement stages"
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.claims_by_status || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(val, name) => [name === 'total_amount' ? `₹${val.toLocaleString()}` : val, name === 'total_amount' ? 'Total Amount' : 'Count']} />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Claim Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2: Policies by Type */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Policies by Insurance Category</Typography>}
              subheader="Catalog offerings & customer purchases by policy type"
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.policies_by_type || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0f766e" name="Plan Variations" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total_purchases" fill="#10b981" name="Customer Purchases" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3: Monthly Claims Trend */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Monthly Claims Activity Trend</Typography>}
              subheader="Chronological tracking of submitted vs approved claims"
            />
            <Divider />
            <CardContent sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.monthly_claims || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="submitted_count" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Submitted" />
                  <Area type="monotone" dataKey="approved_count" stackId="2" stroke="#10b981" fill="#a7f3d0" name="Approved" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4: Premium Revenue by Policy Type */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Premium Revenue by Policy Type</Typography>}
              subheader="Total subscription volume generated per category"
            />
            <Divider />
            <CardContent sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.premium_revenue || []}
                    dataKey="total_revenue"
                    nameKey="policy_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.policy_type}: ₹${entry.total_revenue.toLocaleString()}`}
                  >
                    {(stats?.premium_revenue || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 4: Recent Claims Monitoring Table */}
      <Card>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" fontWeight="700">
              Recent Claims Activity (Monitoring)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Latest claims registered by customers for review by Claims Officers.
            </Typography>
          </Box>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/admin/claims')}
            color="primary"
            variant="text"
            sx={{ fontWeight: 600 }}
          >
            View All Claims
          </Button>
        </Box>

        <Divider />

        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CLAIM NUMBER</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>AMOUNT</TableCell>
                <TableCell>REASON</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentClaims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No recent claims found.
                  </TableCell>
                </TableRow>
              ) : (
                recentClaims.map((claim) => (
                  <TableRow key={claim.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {claim.claim_number}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {claim.customer?.full_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {claim.customer?.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{claim.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }} noWrap>
                      {claim.reason}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={claim.status}
                        size="small"
                        color={STATUS_COLORS[claim.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/admin/claims/${claim.id}`)}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;
