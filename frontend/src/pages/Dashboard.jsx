import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Chip, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DocumentViewerDialog from '../components/DocumentViewerDialog';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document viewer state
  const [selectedDocClaim, setSelectedDocClaim] = useState(null);

  const loadData = async () => {
    try {
      const [resStats, resPolicies, resClaims] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/policies'),
        api.get('/claims')
      ]);
      setStats(resStats.data);
      setPolicies(resPolicies.data);
      setClaims(resClaims.data);
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
    return <Typography sx={{ p: 4 }}>Loading Agent dashboard statistics...</Typography>;
  }

  const getStatusChip = (status) => {
    const map = {
      APPROVED: { label: 'Approved', bg: '#dcfce7', color: '#166534' },
      UNDER_REVIEW: { label: 'Under Review', bg: '#fef3c7', color: '#92400e' },
      SUBMITTED: { label: 'Submitted', bg: '#dbeafe', color: '#1e40af' },
      REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
      DOCUMENTS_REQUIRED: { label: 'Docs Required', bg: '#f3e8ff', color: '#6b21a8' },
    };
    const s = map[status] || { label: status, bg: '#f1f5f9', color: '#475569' };
    return (
      <Chip
        label={s.label}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, fontWeight: 700, borderRadius: 1.5, fontSize: '0.75rem' }}
      />
    );
  };

  const totalCommissions = (stats.total_premium_collected * 0.10).toLocaleString('en-IN');

  return (
    <Box sx={{ pb: 6 }}>
      {/* Agent Hero Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          color: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(13, 148, 136, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <SupportAgentIcon sx={{ fontSize: 34, color: '#ffffff' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Welcome, {user?.full_name?.replace(/\s*\([^)]*\)/, '')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccfbf1', mt: 0.5, fontWeight: 500 }}>
                Insurance Agent Portfolio Dashboard | Manage client policies, sales, and customer claims.
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
              bgcolor: '#1e3a8a',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: '#1e40af' }
            }}
          >
            Sell Policy to Customer
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Client Policies"
            value={stats.total_policies}
            icon={<ShieldIcon />}
            color="#3b82f6"
            subtitle={`${stats.active_policies} Active Customer Coverages`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Customer Claims"
            value={stats.total_claims}
            icon={<AssignmentIcon />}
            color="#f59e0b"
            subtitle={`${stats.pending_claims} Under Review`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Premiums Sold"
            value={`₹${stats.total_premium_collected.toLocaleString('en-IN')}`}
            icon={<AccountBalanceWalletIcon />}
            color="#10b981"
            subtitle="Annual Sales Volume"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Agent Commission (10%)"
            value={`₹${totalCommissions}`}
            icon={<MonetizationOnIcon />}
            color="#8b5cf6"
            subtitle="Estimated Earnings"
          />
        </Grid>
      </Grid>

      {/* AGENT PORTFOLIO PANELS */}
      <Grid container spacing={3}>
        {/* Client Policies Portfolio Panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <ShieldIcon color="primary" /> Client Policies Portfolio ({policies.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/policies')}>
                  Manage All
                </Button>
              </Box>

              {policies.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No customer policies assigned yet.</Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/policies/catalog')}>
                    Issue First Policy
                  </Button>
                </Box>
              ) : (
                policies.slice(0, 4).map((p) => (
                  <Card key={p.id} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {p.title}
                        </Typography>
                        <Chip label={p.status} color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                        Policy #: <strong>{p.policy_number}</strong> | Client: <strong>{p.customer?.full_name || 'Customer'}</strong>
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1.2, borderTop: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                          Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Premium: ₹{p.premium?.toLocaleString('en-IN')}/yr
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Customer Claims Overview Panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <ReceiptLongIcon color="warning" /> Customer Claims Overview ({claims.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/claims')}>
                  Track Claims
                </Button>
              </Box>

              {claims.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No customer claims reported.</Typography>
                </Box>
              ) : (
                claims.slice(0, 4).map((c) => (
                  <Card key={c.id} sx={{ mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                    <CardContent sx={{ p: 2.2, '&:last-child': { pb: 2.2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {c.claim_number} - {c.reason}
                        </Typography>
                        {getStatusChip(c.status)}
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 500 }}>
                        Client: <strong>{c.customer?.full_name || 'Customer'}</strong> | Claim Amount: ₹{c.amount?.toLocaleString('en-IN')}
                      </Typography>
                      {c.reviews?.length > 0 && (
                        <Alert severity="info" sx={{ mt: 1.5, py: 0.5, px: 1.5, borderRadius: 2, fontSize: '0.78rem' }}>
                          <strong>Officer Remark:</strong> {c.reviews[c.reviews.length - 1].remarks}
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* DOCUMENT VIEWER DIALOG */}
      <DocumentViewerDialog
        open={Boolean(selectedDocClaim)}
        onClose={() => setSelectedDocClaim(null)}
        claim={selectedDocClaim}
        onRefresh={loadData}
      />
    </Box>
  );
}
