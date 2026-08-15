import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Chip, Button, MenuItem, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';
import ClaimRiskChip from '../components/ClaimRiskChip';
import DocumentViewerDialog from '../components/DocumentViewerDialog';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDocClaim, setSelectedDocClaim] = useState(null);
  const [openClaimModal, setOpenClaimModal] = useState(false);
  const [claimForm, setClaimForm] = useState({ policy_id: '', reason: '', description: '', amount: '', incident_date: '' });
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const url = statusFilter ? `/claims?status_filter=${statusFilter}` : '/claims';
      const [resClaims, resPol] = await Promise.all([
        api.get(url),
        api.get('/policies')
      ]);
      setClaims(resClaims.data);
      setPolicies(resPol.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, user]);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
            Submit & Track Claims
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            File new insurance claim requests and upload supporting document attachments.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenClaimModal(true)}
            sx={{ py: 1, px: 2.5, fontWeight: 700 }}
          >
            File New Claim
          </Button>

          <TextField
            select
            size="small"
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 170 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="SUBMITTED">Submitted</MenuItem>
            <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="DOCUMENTS_REQUIRED">Docs Required</MenuItem>
          </TextField>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', p: { xs: 1, sm: 2 }, borderRadius: 4, bgcolor: 'background.paper', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Claim #</TableCell>
              <TableCell>Policy Reference</TableCell>
              <TableCell>Reason & Description</TableCell>
              <TableCell>Claim Amount (₹)</TableCell>
              <TableCell>Risk Score</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Document Attachments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No claim requests submitted yet.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              claims.map((c) => (
                <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>{c.claim_number}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.policy?.policy_number || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>{c.reason}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 240, noWrap: true }}>
                      {c.description}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>
                    ₹{c.amount?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <ClaimRiskChip score={c.risk_score} level={c.risk_level} flags={c.fraud_flags} />
                  </TableCell>
                  <TableCell>
                    {getStatusChip(c.status)}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      onClick={() => setSelectedDocClaim(c)}
                      sx={{ borderRadius: 2 }}
                    >
                      Files ({c.documents?.length || 0})
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
                  {p.title} ({p.policy_number}) - Max Coverage: ₹{p.coverage_amount?.toLocaleString('en-IN')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Claim Reason"
              value={claimForm.reason}
              onChange={(e) => setClaimForm({ ...claimForm, reason: e.target.value })}
              margin="normal"
              placeholder="e.g. Hospitalization Expense, Vehicle Damage"
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
              Submit Claim Request
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
