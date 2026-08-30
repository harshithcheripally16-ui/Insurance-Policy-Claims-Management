import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import RateReviewIcon from '@mui/icons-material/RateReview';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import officerService from '../../services/officerService';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };
const PIE_COLORS = ['#f59e0b', '#0284c7', '#10b981', '#ef4444'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officerService.getDashboard();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <Loading message="Loading officer dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Claims Officer Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">Welcome back, {stats.officer_name ? stats.officer_name.replace(/\s+(Customer|Admin|Officer|Agent)$/i, '').trim() : 'Officer'}. Monitor and review policyholder claims.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Claims" value={stats.total_claims} icon={<AssignmentIcon />} color="primary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Submitted" value={stats.submitted_claims} icon={<PendingActionsIcon />} color="warning" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Under Review" value={stats.under_review_claims} icon={<RateReviewIcon />} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Pending Review" value={stats.pending_review_claims} icon={<PendingActionsIcon />} color="error" /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Approved" value={stats.approved_claims} icon={<CheckCircleOutlineIcon />} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Rejected" value={stats.rejected_claims} icon={<CancelOutlinedIcon />} color="error" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="My Reviews" value={stats.my_reviews_count} icon={<RateReviewIcon />} color="secondary" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Amount" value={`₹${stats.claims_by_status?.reduce((a, b) => a + b.total_amount, 0).toLocaleString()}`} icon={<AssignmentIcon />} color="primary" /></Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Claims by Status</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart><Pie data={stats.claims_by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {stats.claims_by_status?.map((entry, index) => <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Status Breakdown</Typography>
            {stats.claims_by_status?.map((item) => (
              <Box key={item.status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: STATUS_COLORS[item.status] || '#94a3b8' }} />
                  <Typography variant="body2" fontWeight="600">{item.status}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="body2" color="text.secondary">{item.count} claims</Typography>
                  <Typography variant="body2" fontWeight="600">₹{item.total_amount?.toLocaleString()}</Typography>
                </Box>
              </Box>
            ))}
          </CardContent></Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="700">Recent Claims</Typography>
          <Button onClick={() => navigate('/officer/claims')} variant="text" sx={{ fontWeight: 600 }}>View All</Button>
        </Box>
        <Divider />
        <TableContainer component={Paper} elevation={0}>
          <Table><TableHead><TableRow>
            <TableCell>CLAIM #</TableCell><TableCell>CUSTOMER</TableCell><TableCell>AMOUNT</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {stats.recent_claims?.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}>No claims found.</TableCell></TableRow>
            ) : (stats.recent_claims?.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>{c.claim_number}</TableCell>
                <TableCell>{c.customer_name}<br /><Typography variant="caption" color="text.secondary">{c.customer_email}</Typography></TableCell>
                <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell><Chip label={c.status} size="small" sx={{ bgcolor: STATUS_COLORS[c.status] + '20', color: STATUS_COLORS[c.status], fontWeight: 700 }} /></TableCell>
                <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/officer/claims/${c.id}`)}>Review</Button></TableCell>
              </TableRow>
            )))}
          </TableBody></Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default Dashboard;
