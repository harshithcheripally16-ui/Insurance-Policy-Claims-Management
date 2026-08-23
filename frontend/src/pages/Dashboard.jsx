import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardContent, Button, Chip,
  CircularProgress, Paper
} from '@mui/material';
import PolicyIcon from '@mui/icons-material/Policy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssessmentIcon from '@mui/icons-material/Assessment';

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Legend, CartesianGrid
} from 'recharts';

import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  const salesData = Array.isArray(stats?.sales_by_category) ? stats.sales_by_category : [];

  return (
    <Box sx={{ pb: 5 }}>
      {/* Hero Banner Welcoming Priya Nair */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #002970 0%, #001848 60%, #00a896 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 700 }}>
          <Chip
            icon={<VerifiedUserIcon sx={{ color: '#00a896 !important' }} />}
            label="OFFICIAL AGENT DESK"
            sx={{
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontWeight: 700,
              mb: 1.5,
              backdropFilter: 'blur(4px)',
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#ffffff' }}>
            Welcome back, {user?.name || 'Priya Nair'}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.85)', mb: 3, fontSize: '1.05rem' }}>
            Your Policybazaar Insurance Operations Overview. Track active customer policies, premium revenues, and issue new coverage plans seamlessly.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/policies/catalog')}
              sx={{ fontWeight: 700, px: 3, py: 1.2 }}
            >
              Issue Insurance Plan
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/policies')}
              sx={{
                color: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 600,
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Manage Client Coverages
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* KPI Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Client Policies"
            value={stats?.total_client_policies || 0}
            icon={<PolicyIcon />}
            color="#002970"
            accentColor="#ff5a00"
            subtitle="Issued Portfolio"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Policies"
            value={stats?.active_policies || 0}
            icon={<CheckCircleIcon />}
            color="#00a896"
            accentColor="#00a896"
            subtitle="Under Protection"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Premiums Collected"
            value={`₹ ${(stats?.total_premiums_collected || 0).toLocaleString('en-IN')}`}
            icon={<AccountBalanceWalletIcon />}
            color="#ff5a00"
            accentColor="#ff5a00"
            subtitle="Gross Revenue"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Client Accounts"
            value={stats?.client_accounts || 0}
            icon={<PeopleIcon />}
            color="#7b2cbf"
            accentColor="#7b2cbf"
            subtitle="Verified Customers"
          />
        </Grid>
      </Grid>

      {/* Recharts Category Sales Performance Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: '#ff5a00' }} /> Category Sales Performance
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Premiums collected (₹) & policies issued per category (Health, Auto, Life, Home)
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: '100%', height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,41,112,0.08)" />
                  <XAxis dataKey="category" stroke="#002970" fontWeight={600} />
                  <YAxis yAxisId="left" orientation="left" stroke="#002970" />
                  <YAxis yAxisId="right" orientation="right" stroke="#ff5a00" />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                    formatter={(value, name) => [
                      name === 'revenue_collected' ? `₹ ${value.toLocaleString('en-IN')}` : value,
                      name === 'revenue_collected' ? 'Premiums Collected (₹)' : 'Policies Issued'
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="policies_issued" name="Policies Issued" fill="#002970" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue_collected" name="Premiums Collected (₹)" fill="#ff5a00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* Quick Access Action Cards */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #edf5ff 100%)',
                borderLeft: '4px solid #002970',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(4px)' }
              }}
              onClick={() => navigate('/policies')}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970', mb: 1 }}>
                Client Policies Portfolio
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                View active customer policies, filter by valid date ranges, and dispatch 1-Click Email/SMS renewal reminders.
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ color: '#002970', fontWeight: 700, p: 0 }}>
                View Policies Table
              </Button>
            </Card>

            <Card
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #fff5f0 100%)',
                borderLeft: '4px solid #ff5a00',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateX(4px)' }
              }}
              onClick={() => navigate('/users')}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#002970', mb: 1 }}>
                Customer Directory
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Browse verified client accounts with gapless sequential auto-reindexed customer IDs (1, 2, 3...).
              </Typography>
              <Button size="small" endIcon={<ArrowForwardIcon />} sx={{ color: '#ff5a00', fontWeight: 700, p: 0 }}>
                Open Directory
              </Button>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
