import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer, Chip, Card, CardContent, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
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

  // Modal dialog states
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ policy_id: '', reason: '', description: '', amount: '', incident_date: '' });
  const [selectedDocClaim, setSelectedDocClaim] = useState(null);
  const [msg, setMsg] = useState('');

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

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/claims', {
        ...claimForm,
        policy_id: parseInt(claimForm.policy_id),
        amount: parseFloat(claimForm.amount),
        incident_date: new Date(claimForm.incident_date).toISOString()
      });
      setOpenClaimModal(false);
      setClaimForm({ policy_id: '', reason: '', description: '', amount: '', incident_date: '' });
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to submit claim');
    }
  };

  if (loading || !stats) {
    return <Typography sx={{ p: 4 }}>Loading dashboard statistics...</Typography>;
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

  return (
    <Box sx={{ pb: 6 }}>
      {/* Sleek Hero Card Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.3)',
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
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 32, color: '#60a5fa' }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Welcome, {user?.full_name?.replace(/\s*\([^)]*\)/, '')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#93c5fd', mt: 0.5, fontWeight: 500 }}>
                Manage your active insurance policies, submit claim requests, and track reviews.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => setOpenClaimModal(true)}
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              fontSize: '0.9rem',
              boxShadow: '0 8px 20px -4px rgba(13, 148, 136, 0.5)'
            }}
          >
            File New Claim
          </Button>
        </Box>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Policies"
            value={stats.total_policies}
            icon={<ShieldIcon />}
            color="#3b82f6"
            subtitle={`${stats.active_policies} Active Policy Coverages`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Claims"
            value={stats.total_claims}
            icon={<AssignmentIcon />}
            color="#f59e0b"
            subtitle={`${stats.pending_claims} Under Review`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Loss Ratio"
            value={`${stats.loss_ratio}%`}
            icon={<AccountBalanceWalletIcon />}
            color="#10b981"
            subtitle={`₹${stats.total_claim_amount.toLocaleString('en-IN')} Approved Claims`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Risk Claims"
            value={stats.risk_level_distribution?.HIGH || 0}
            icon={<WarningAmberIcon />}
            color="#ef4444"
            subtitle="Risk Engine Evaluation"
          />
        </Grid>
      </Grid>

      {/* CUSTOMER POLICIES & CLAIMS PANELS */}
      <Grid container spacing={3}>
        {/* Active Policies Panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <ShieldIcon color="primary" /> My Active Policies ({policies.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/policies')}>
                  View All
                </Button>
              </Box>

              {policies.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No active policies found.</Typography>
                  <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/policies/catalog')}>
                    Browse Policy Catalog
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
                        Policy #: <strong>{p.policy_number}</strong> | Type: {p.type}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, pt: 1.2, borderTop: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                          Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          Expires: {new Date(p.end_date).toLocaleDateString('en-IN')}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Submitted Claims Panel */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper', borderColor: 'divider' }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <ReceiptLongIcon color="warning" /> My Claims Tracker ({claims.length})
                </Typography>
                <Button size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/claims')}>
                  View All
                </Button>
              </Box>

              {claims.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'action.hover', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary">No submitted claims found.</Typography>
                  <Button variant="contained" sx={{ mt: 2 }} startIcon={<AddIcon />} onClick={() => setOpenClaimModal(true)}>
                    File First Claim
                  </Button>
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
                        Claim Amount: <strong>₹{c.amount?.toLocaleString('en-IN')}</strong> | Incident Date: {new Date(c.incident_date).toLocaleDateString('en-IN')}
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

      {/* SUBMIT CLAIM DIALOG */}
      <Dialog open={openClaimModal} onClose={() => setOpenClaimModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>Submit New Insurance Claim</DialogTitle>
        <Box component="form" onSubmit={handleClaimSubmit}>
          <DialogContent>
            {msg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>}
            <TextField
              select
              fullWidth
              label="Select Policy"
              value={claimForm.policy_id}
              onChange={(e) => setClaimForm({ ...claimForm, policy_id: e.target.value })}
              margin="normal"
              required
            >
              {policies.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.title} ({p.policy_number}) - Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Claim Reason"
              value={claimForm.reason}
              onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
              margin="normal"
              placeholder="e.g. Hospitalization Expense, Vehicle Repair"
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Incident Description"
              value={claimForm.description}
              onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Claim Amount (₹)"
              value={claimForm.amount}
              onChange={(e) => setClaimForm({ ...claimForm, amount: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              type="date"
              label="Incident Date"
              InputLabelProps={{ shrink: true }}
              value={claimForm.incident_date}
              onChange={(e) => setClaimForm({ ...claimForm, incident_date: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenClaimModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ px: 3 }}>
              Submit Claim
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
