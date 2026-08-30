import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import SecurityIcon from '@mui/icons-material/Security';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import StatCard from '../../components/StatCard';
import ClaimStatusChip from '../../components/ClaimStatusChip';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const CustomerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load customer dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loading message="Loading your insurance portal overview..." />;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchDashboard}>Retry</Button>}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Welcome Banner */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3.5,
          background: 'linear-gradient(135deg, #002970 0%, #001f5c 50%, #001438 100%)',
          color: '#ffffff',
          boxShadow: '0 12px 28px -5px rgba(0, 41, 112, 0.45)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={8}>
              <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: '#ff5a00', fontWeight: 800 }}>
                INSURCARE CUSTOMER PORTAL
              </Typography>
              <Typography variant="h4" fontWeight="900" sx={{ mt: 0.5, mb: 1, lineHeight: 1.2, color: '#ffffff' }}>
                Welcome back, {data?.customer_name ? data.customer_name.replace(/\s+(Customer|Admin|Officer|Agent)$/i, '').trim() : (user?.name ? user.name.replace(/\s+(Customer|Admin|Officer|Agent)$/i, '').trim() : 'User')}!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 580, fontWeight: 500 }}>
                Manage your active insurance policies, submit new claims, upload supporting evidence, and track adjudication updates in real time.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: { md: 'flex-end' } }}>
                <Button
                  component={Link}
                  to="/customer/policies"
                  variant="contained"
                  sx={{
                    bgcolor: '#ff5a00',
                    color: '#ffffff',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1,
                    boxShadow: '0 4px 14px rgba(255, 90, 0, 0.4)',
                    '&:hover': { bgcolor: '#e04f00', boxShadow: '0 6px 18px rgba(255, 90, 0, 0.5)' },
                  }}
                  startIcon={<ExploreIcon />}
                >
                  Browse Policies
                </Button>
                <Button
                  component={Link}
                  to="/customer/claims/new"
                  variant="outlined"
                  sx={{
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.6)',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 2.5,
                    py: 1,
                    '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.12)' },
                  }}
                  startIcon={<AddCircleOutlineIcon />}
                >
                  File a Claim
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="TOTAL POLICIES"
            value={data?.total_policies || 0}
            icon={<PolicyIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="ACTIVE COVERAGE"
            value={data?.active_policies || 0}
            icon={<SecurityIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="EXPIRED POLICIES"
            value={data?.expired_policies || 0}
            icon={<EventBusyIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="TOTAL CLAIMS"
            value={data?.total_claims || 0}
            icon={<AssignmentIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="PENDING CLAIMS"
            value={data?.pending_claims || 0}
            icon={<HourglassEmptyIcon />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <StatCard
            title="APPROVED CLAIMS"
            value={data?.approved_claims || 0}
            icon={<CheckCircleIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Main Content: Recent Subscriptions & Recent Claims */}
      <Grid container spacing={3.5}>
        {/* Recent Policies */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <Box>
                <Typography variant="h6" fontWeight="800" color="#0f172a">
                  My Active Subscriptions
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Recent coverage plans tied to your account
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/customer/policies/my"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                View All
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {data?.recent_purchases?.length === 0 ? (
                <EmptyState
                  title="No active policies"
                  description="You have not subscribed to any insurance coverage yet."
                  actionLabel="Browse Available Policies"
                  onAction={() => window.location.href = '/customer/policies'}
                />
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>POLICY NAME</TableCell>
                        <TableCell>CATEGORY</TableCell>
                        <TableCell>EXPIRES</TableCell>
                        <TableCell>STATUS</TableCell>
                        <TableCell align="right">ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.recent_purchases?.map((p) => (
                        <TableRow key={p.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {p.policy_name}
                            <Typography variant="caption" color="text.secondary" display="block">
                              {p.policy_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={p.type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                            {new Date(p.end_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.status}
                              size="small"
                              color={p.status === 'ACTIVE' ? 'success' : 'default'}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              component={Link}
                              to={`/customer/policies/my/${p.id}`}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.2 }}
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Recent Claims */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3 }}>
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
              <Box>
                <Typography variant="h6" fontWeight="800" color="#0f172a">
                  My Recent Claims
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Real-time status tracking for filed claims
                </Typography>
              </Box>
              <Button
                component={Link}
                to="/customer/claims"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                View All
              </Button>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {data?.recent_claims?.length === 0 ? (
                <EmptyState
                  title="No filed claims"
                  description="You have no claims on record. If an incident occurred, file a claim under your active policies."
                  actionLabel="File a New Claim"
                  onAction={() => window.location.href = '/customer/claims/new'}
                />
              ) : (
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>CLAIM NUMBER</TableCell>
                        <TableCell>POLICY</TableCell>
                        <TableCell>AMOUNT</TableCell>
                        <TableCell>STATUS</TableCell>
                        <TableCell align="right">ACTION</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data?.recent_claims?.map((c) => (
                        <TableRow key={c.id} hover>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {c.claim_number}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                            {c.policy_name}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>₹{c.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <ClaimStatusChip status={c.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              component={Link}
                              to={`/customer/claims/${c.id}`}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.2 }}
                            >
                              Track
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
