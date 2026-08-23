import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, Paper, TextField, MenuItem, Select,
  FormControl, InputLabel, Tooltip
} from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GavelIcon from '@mui/icons-material/Gavel';

import api from '../services/api';

const ClaimsPage = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // File Claim Modal state
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [claimForm, setClaimForm] = useState({
    policy_id: '',
    incident_date: new Date().toISOString().split('T')[0],
    amount_claimed: '',
    description: '',
    document_name: 'Hospital_Discharge_Report.pdf'
  });
  const [fileMsg, setFileMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchClaimsAndPolicies = async () => {
    setLoading(true);
    try {
      const [claimsRes, polRes] = await Promise.all([
        api.get('/claims'),
        api.get('/policies')
      ]);

      if (Array.isArray(claimsRes.data)) setClaims(claimsRes.data);
      if (Array.isArray(polRes.data)) setPolicies(polRes.data);
    } catch (err) {
      console.error("Failed to load claims or policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsAndPolicies();
  }, []);

  const handleFileClaimSubmit = async () => {
    if (!claimForm.policy_id || !claimForm.amount_claimed || !claimForm.description) {
      setFileMsg({ type: 'error', text: 'Please fill all required claim details' });
      return;
    }
    setSubmitting(true);
    setFileMsg({ type: '', text: '' });

    try {
      const res = await api.post('/claims', {
        policy_id: Number(claimForm.policy_id),
        incident_date: new Date(claimForm.incident_date).toISOString ? new Date(claimForm.incident_date).toISOString() : claimForm.incident_date,
        amount_claimed: parseFloat(claimForm.amount_claimed),
        description: claimForm.description,
        document_name: claimForm.document_name
      });

      setFileMsg({
        type: 'success',
        text: `Claim notice #${res.data.claim_number} submitted! Automated Risk Score: ${res.data.risk_score}/100`
      });

      setTimeout(() => {
        setFileModalOpen(false);
        fetchClaimsAndPolicies();
      }, 1500);
    } catch (err) {
      setFileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to file claim notice' });
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskChip = (score) => {
    if (score > 50) {
      return <Chip label={`HIGH RISK (${score})`} color="error" size="small" sx={{ fontWeight: 800 }} />;
    } else if (score > 25) {
      return <Chip label={`MODERATE (${score})`} color="warning" size="small" sx={{ fontWeight: 800 }} />;
    } else {
      return <Chip label={`LOW RISK (${score})`} color="success" size="small" sx={{ fontWeight: 800 }} />;
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#002970' }}>
            Client Claims Assistance
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
            Assist clients in submitting claim notices and checking claim status. (Formal adjudication & payout approvals are handled by Claims Officers).
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddAlertIcon />}
          onClick={() => setFileModalOpen(true)}
          sx={{ fontWeight: 700, px: 3, py: 1.2 }}
        >
          Submit Claim Notice
        </Button>
      </Box>

      {/* Claims Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 41, 112, 0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#002970' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Claim #</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Coverage Title</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Claimant (Customer)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Amount Claimed (₹)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Automated Risk Score</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Document Record</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>Adjudication Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="secondary" />
                </TableCell>
              </TableRow>
            ) : claims.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    No claim notices currently submitted.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              claims.map((claim) => (
                <TableRow key={claim.id} hover>
                  <TableCell sx={{ fontWeight: 800, color: '#ff5a00' }}>{claim.claim_number}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#002970' }}>{claim.policy_title}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{claim.customer_name || 'Client'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#d32f2f' }}>
                    ₹ {claim.amount_claimed.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>{getRiskChip(claim.risk_score)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#00a896', fontSize: '0.85rem', fontWeight: 600 }}>
                      <InsertDriveFileIcon fontSize="small" />
                      {claim.document_name || 'Report.pdf'}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Adjudicated by Claims Officer Module">
                      <Chip
                        icon={<GavelIcon sx={{ fontSize: '13px !important' }} />}
                        label={claim.status.replace('_', ' ')}
                        size="small"
                        color={
                          claim.status === 'APPROVED' ? 'success' :
                          claim.status === 'REJECTED' ? 'error' : 'warning'
                        }
                        sx={{ fontWeight: 800 }}
                      />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* File Claim Notice Modal */}
      <Dialog open={fileModalOpen} onClose={() => setFileModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970', borderBottom: '1px solid #eee' }}>
          Submit Client Claim Notice
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {fileMsg.text && (
            <Alert severity={fileMsg.type || 'info'} sx={{ mb: 2 }}>
              {fileMsg.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Select Client Policy</InputLabel>
              <Select
                value={claimForm.policy_id}
                label="Select Client Policy"
                onChange={(e) => setClaimForm({ ...claimForm, policy_id: e.target.value })}
              >
                {policies.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.policy_number} - {p.title} ({p.customer_name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Incident Date"
              type="date"
              value={claimForm.incident_date}
              onChange={(e) => setClaimForm({ ...claimForm, incident_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />

            <TextField
              label="Claim Amount (₹)"
              type="number"
              value={claimForm.amount_claimed}
              onChange={(e) => setClaimForm({ ...claimForm, amount_claimed: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Incident Description / Cause of Loss"
              multiline
              rows={3}
              value={claimForm.description}
              onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Attached Document Name"
              value={claimForm.document_name}
              onChange={(e) => setClaimForm({ ...claimForm, document_name: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setFileModalOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleFileClaimSubmit}
            variant="contained"
            color="secondary"
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit Notice'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimsPage;
