import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import agentService from '../../services/agentService';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };
const PIE_COLORS = ['#10b981', '#ef4444', '#94a3b8'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await agentService.getDashboard();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loading message="Loading agent dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const purchaseChartData = Object.entries(stats.purchases_by_status || {}).map(([name, value]) => ({ name, value }));

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Agent Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Welcome back, {stats.agent_name ? stats.agent_name.replace(/\s+(Customer|Admin|Officer|Agent)$/i, '').trim() : 'Agent'}. Manage your customers and policies.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Assigned Customers" value={stats.total_customers} icon={<PeopleIcon />} color="primary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Purchases" value={stats.total_purchases} icon={<SecurityIcon />} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Active Policies" value={stats.active_purchases} icon={<SecurityIcon />} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Expiring Soon" value={stats.expiring_soon} icon={<EventBusyIcon />} color="warning" /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Expired Policies" value={stats.expired_purchases} icon={<EventBusyIcon />} color="error" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Claims" value={stats.total_claims} icon={<AssignmentIcon />} color="warning" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Pending Claims" value={stats.pending_claims} icon={<AssignmentIcon />} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Approved Claims" value={stats.approved_claims} icon={<AssignmentIcon />} color="success" /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Purchases by Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={purchaseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {purchaseChartData.map((entry, index) => <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Claims by Status</Typography>
            {Object.entries(stats.claims_by_status || {}).map(([status, count]) => (
              <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: STATUS_COLORS[status] || '#94a3b8' }} />
                  <Typography variant="body2" fontWeight="600">{status}</Typography>
                </Box>
                <Typography variant="body2" fontWeight="600">{count} claims</Typography>
              </Box>
            ))}
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="700">Recent Policy Purchases</Typography>
          <Button onClick={() => navigate('/agent/purchases')} variant="text" sx={{ fontWeight: 600 }}>View All</Button>
        </Box>
        <Divider />
        <TableContainer component={Paper} elevation={0}>
          <Table><TableHead><TableRow>
            <TableCell>POLICY</TableCell><TableCell>CUSTOMER</TableCell><TableCell>PREMIUM</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {stats.recent_purchases?.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No purchases assigned yet.</TableCell></TableRow>
            ) : (stats.recent_purchases?.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.policy_name}<br /><Typography variant="caption" color="text.secondary">{p.policy_number}</Typography></TableCell>
                <TableCell>{p.customer_name}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{p.premium?.toLocaleString()}</TableCell>
                <TableCell><Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/agent/purchases/${p.id}`)}>View</Button></TableCell>
              </TableRow>
            )))}
          </TableBody></Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;
