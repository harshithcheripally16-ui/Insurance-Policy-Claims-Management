import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Chip, Card, CardContent
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [resStats, resPolicies, resCustomers] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/policies'),
        api.get('/users?role=CUSTOMER')
      ]);
      setStats(resStats.data);
      setPolicies(resPolicies.data);
      setCustomers(resCustomers.data);
    } catch (err) {
      console.error('Error fetching dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading || !stats) {
    return <Typography sx={{ p: 4 }}>Loading dashboard...</Typography>;
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Policybazaar Signature Deep Navy Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #001e54 0%, #002970 100%)',
          color: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(0, 41, 112, 0.35)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3.5,
                bgcolor: 'rgba(255, 90, 0, 0.18)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid rgba(255, 90, 0, 0.4)'
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 36, color: '#ff5a00' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Welcome, {user?.full_name?.replace(/\s*\([^)]*\)/, '')}
                </Typography>
                <Chip
                  icon={<VerifiedIcon sx={{ color: '#ffffff !important', fontSize: 14 }} />}
                  label="Verified Agent"
                  size="small"
                  sx={{ bgcolor: '#ff5a00', color: '#ffffff', fontWeight: 800, fontSize: '0.7rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: '#93c5fd', mt: 0.5, fontWeight: 600 }}>
                Insurance Agent Portal | Overview of customer policy coverages and client accounts.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<ShoppingCartIcon />}
            onClick={() => navigate('/policies/catalog')}
            sx={{
              color: '#ffffff',
              bgcolor: '#ff5a00',
              fontWeight: 800,
              px: 3,
              py: 1.3,
              borderRadius: 2.5,
              fontSize: '0.92rem',
              boxShadow: '0 8px 24px -4px rgba(255, 90, 0, 0.45)',
              '&:hover': { bgcolor: '#e65100' }
            }}
          >
            Issue Policy to Customer
          </Button>
        </Box>
      </Paper>

      {/* Policybazaar KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Client Policies"
            value={stats.total_policies}
            icon={<ShieldIcon />}
            color="#ff5a00"
            subtitle="Customer Policy Coverages"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Policies"
            value={stats.active_policies}
            icon={<VerifiedUserIcon />}
            color="#00a896"
            subtitle="Active Policy Coverages"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Premiums"
            value={`₹${stats.total_premium_collected.toLocaleString('en-IN')}`}
            icon={<AccountBalanceWalletIcon />}
            color="#0284c7"
            subtitle="Annual Premium Value"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Client Accounts"
            value={customers.length}
            icon={<PeopleIcon />}
            color="#002970"
            subtitle="Registered Customer Profiles"
          />
        </Grid>
      </Grid>

      {/* AGENT POLICY & CUSTOMER PANELS */}
      <Grid container spacing={3}>
        {/* Client Policies Portfolio Panel */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <ShieldIcon sx={{ color: '#ff5a00' }} /> Customer Policies ({policies.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/policies')} sx={{ fontWeight: 700, color: '#ff5a00' }}>
                  View All
                </Button>
              </Box>

              {policies.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No customer policies registered yet.</Typography>
                  <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/policies/catalog')}>
                    Issue First Policy
                  </Button>
                </Box>
              ) : (
                policies.slice(0, 4).map((p) => (
                  <Card key={p.id} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                          {p.title}
                        </Typography>
                        <Chip label={p.status} color="success" size="small" sx={{ fontWeight: 800, borderRadius: 1.5 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                        Policy Number: <strong>{p.policy_number}</strong> | Client: <strong>{p.customer?.full_name || 'Customer'}</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1.2, borderTop: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 800 }}>
                          Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Premium: ₹{p.premium?.toLocaleString('en-IN')}/year
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Customer Directory Quick Panel */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <PeopleIcon color="info" /> Customer Directory ({customers.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/users')} sx={{ fontWeight: 700, color: '#ff5a00' }}>
                  View Directory
                </Button>
              </Box>

              {customers.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No customer profiles registered.</Typography>
                </Box>
              ) : (
                customers.slice(0, 4).map((c) => (
                  <Card key={c.id} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {c.full_name?.replace(/\s*\([^)]*\)/, '')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {c.email} | {c.phone || 'No Phone Number'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
