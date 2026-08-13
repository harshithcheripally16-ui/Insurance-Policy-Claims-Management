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
import GavelIcon from '@mui/icons-material/Gavel';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import StatCard from '../components/StatCard';
import ClaimRiskChip from '../components/ClaimRiskChip';
import DocumentViewerDialog from '../components/DocumentViewerDialog';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal dialog states
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ policy_id: '', reason: '', description: '', amount: '', incident_date: '' });
  const [selectedDocClaim, setSelectedDocClaim] = useState(null);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState(null);
  const [reviewForm, setReviewForm] = useState({ decision: 'APPROVED', remarks: '' });
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReviewClaim) return;
    try {
      await api.post(`/claims/${selectedReviewClaim.id}/review`, reviewForm);
      setOpenReviewModal(false);
      setSelectedReviewClaim(null);
      setReviewForm({ decision: 'APPROVED', remarks: '' });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !stats) {
    return <Typography sx={{ p: 4 }}>Loading dashboard statistics...</Typography>;
  }

  // Chart data formatting
  const pieData = Object.entries(stats.claims_by_status || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  const barData = [
    { name: 'Financials (₹)', Premiums: stats.total_premium_collected, ClaimsPaid: stats.total_claim_amount }
  ];

  return (
    <Box sx={{ pb: 6 }}>
      {/* Welcome Banner */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: '#1e3a8a', color: '#ffffff', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <VerifiedUserIcon sx={{ fontSize: 36, color: '#60a5fa' }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Welcome, {user?.full_name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.2 }}>
                Role: <strong>{user?.role?.replace('_', ' ')}</strong> | InsurCare Policy & Claims Portal
              </Typography>
            </Box>
          </Box>
          {user?.role === 'CUSTOMER' && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenClaimModal(true)}
              sx={{ color: '#ffffff', fontWeight: 700 }}
            >
              Submit New Claim
            </Button>
          )}
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
            subtitle={`${stats.active_policies} Active Policies`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Claims"
            value={stats.total_claims}
            icon={<AssignmentIcon />}
            color="#f59e0b"
            subtitle={`${stats.pending_claims} Pending Review`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Loss Ratio"
            value={`${stats.loss_ratio}%`}
            icon={<AccountBalanceWalletIcon />}
            color="#10b981"
            subtitle={`₹${stats.total_claim_amount.toLocaleString('en-IN')} Claims Paid`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="High Risk Claims"
            value={stats.risk_level_distribution?.HIGH || 0}
            icon={<WarningAmberIcon />}
            color="#ef4444"
            subtitle="Flagged by Risk Engine"
          />
        </Grid>
      </Grid>

      {/* Charts Section (Admin & Officers) */}
      {(user?.role === 'ADMIN' || user?.role === 'CLAIMS_OFFICER') && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 350 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Claims Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 350 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Premiums Collected vs Claims Paid (₹)
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Premiums" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ClaimsPaid" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* CLAIMS OFFICER WORKBENCH */}
      {(user?.role === 'CLAIMS_OFFICER' || user?.role === 'ADMIN') && (
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Claims Review Workbench ({claims.length})
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Claim #</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Risk Score & Level</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.slice(0, 8).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ fontWeight: 700 }}>{c.claim_number}</TableCell>
                    <TableCell>{c.customer?.full_name}</TableCell>
                    <TableCell>{c.reason}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>
                      <ClaimRiskChip score={c.risk_score} level={c.risk_level} flags={c.fraud_flags} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status.replace('_', ' ')}
                        color={c.status === 'APPROVED' ? 'success' : c.status === 'REJECTED' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button size="small" variant="outlined" startIcon={<FolderSharedIcon />} onClick={() => setSelectedDocClaim(c)}>
                          Docs ({c.documents?.length || 0})
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<GavelIcon />}
                          onClick={() => { setSelectedReviewClaim(c); setOpenReviewModal(true); }}
                        >
                          Review
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* CUSTOMER MY POLICIES & CLAIMS */}
      {user?.role === 'CUSTOMER' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon color="primary" /> My Active Policies ({policies.length})
              </Typography>
              {policies.map((p) => (
                <Card key={p.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                        {p.title}
                      </Typography>
                      <Chip label={p.status} color="success" size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Policy #: {p.policy_number} | Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Premium: ₹{p.premium?.toLocaleString('en-IN')}/yr | Valid until: {new Date(p.end_date).toLocaleDateString('en-IN')}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon color="warning" /> My Submitted Claims ({claims.length})
              </Typography>
              {claims.map((c) => (
                <Card key={c.id} sx={{ mb: 2, bgcolor: '#f8fafc' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {c.claim_number} - {c.reason}
                      </Typography>
                      <Chip label={c.status.replace('_', ' ')} color={c.status === 'APPROVED' ? 'success' : 'warning'} size="small" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Amount: ₹{c.amount?.toLocaleString('en-IN')} | Date: {new Date(c.incident_date).toLocaleDateString('en-IN')}
                    </Typography>
                    {c.reviews?.length > 0 && (
                      <Alert severity="info" sx={{ mt: 1, py: 0, px: 1 }}>
                        <Typography variant="caption">
                          Officer Remarks: {c.reviews[c.reviews.length - 1].remarks}
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* SUBMIT CLAIM DIALOG */}
      <Dialog open={openClaimModal} onClose={() => setOpenClaimModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Submit New Claim</DialogTitle>
        <Box component="form" onSubmit={handleClaimSubmit}>
          <DialogContent>
            {msg && <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>}
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenClaimModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Submit Claim</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* OFFICER REVIEW DIALOG */}
      <Dialog open={openReviewModal} onClose={() => setOpenReviewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Review Claim {selectedReviewClaim?.claim_number}
        </DialogTitle>
        <Box component="form" onSubmit={handleReviewSubmit}>
          <DialogContent>
            {selectedReviewClaim && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Reason: {selectedReviewClaim.reason}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Claimed Amount: ₹{selectedReviewClaim.amount?.toLocaleString('en-IN')}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <ClaimRiskChip
                    score={selectedReviewClaim.risk_score}
                    level={selectedReviewClaim.risk_level}
                    flags={selectedReviewClaim.fraud_flags}
                  />
                </Box>
              </Box>
            )}

            <TextField
              select
              fullWidth
              label="Review Decision"
              value={reviewForm.decision}
              onChange={(e) => setReviewForm({ ...reviewForm, decision: e.target.value })}
              margin="normal"
            >
              <MenuItem value="APPROVED">Approve Claim</MenuItem>
              <MenuItem value="REJECTED">Reject Claim</MenuItem>
              <MenuItem value="DOCUMENTS_REQUIRED">Request Additional Documents</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Officer Remarks / Justification"
              value={reviewForm.remarks}
              onChange={(e) => setReviewForm({ ...reviewForm, remarks: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenReviewModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Submit Review</Button>
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
