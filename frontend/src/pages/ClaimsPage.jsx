import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Chip, Button, MenuItem, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClaimRiskChip from '../components/ClaimRiskChip';
import DocumentViewerDialog from '../components/DocumentViewerDialog';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ClaimsPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDocClaim, setSelectedDocClaim] = useState(null);
  const [selectedReviewClaim, setSelectedReviewClaim] = useState(null);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ decision: 'APPROVED', remarks: '' });

  const loadClaims = async () => {
    try {
      const url = statusFilter ? `/claims?status_filter=${statusFilter}` : '/claims';
      const res = await api.get(url);
      setClaims(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [statusFilter, user]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReviewClaim) return;
    try {
      await api.post(`/claims/${selectedReviewClaim.id}/review`, reviewForm);
      setOpenReviewModal(false);
      setSelectedReviewClaim(null);
      setReviewForm({ decision: 'APPROVED', remarks: '' });
      loadClaims();
    } catch (err) {
      console.error(err);
    }
  };

  const isOfficerOrAdmin = user?.role === 'CLAIMS_OFFICER' || user?.role === 'ADMIN';

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
            Claims Workbench & History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage submitted claims, examine risk scores, and process approval decisions.
          </Typography>
        </Box>
        <TextField
          select
          size="small"
          label="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: 200 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="SUBMITTED">Submitted</MenuItem>
          <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
          <MenuItem value="APPROVED">Approved</MenuItem>
          <MenuItem value="REJECTED">Rejected</MenuItem>
          <MenuItem value="DOCUMENTS_REQUIRED">Docs Required</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', p: { xs: 1, sm: 3 }, borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Claim #</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Customer Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Policy Ref</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason & Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Risk Score & Level</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {claims.map((c) => (
              <TableRow key={c.id}>
                <TableCell sx={{ fontWeight: 700 }}>{c.claim_number}</TableCell>
                <TableCell>{c.customer?.full_name || 'Customer'}</TableCell>
                <TableCell>{c.policy?.policy_number || 'N/A'}</TableCell>
                <TableCell>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.reason}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220, noWrap: true }}>
                    {c.description}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                  ₹{c.amount?.toLocaleString('en-IN')}
                </TableCell>
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
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AttachFileIcon />}
                      onClick={() => setSelectedDocClaim(c)}
                    >
                      Docs ({c.documents?.length || 0})
                    </Button>
                    {isOfficerOrAdmin && (
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<GavelIcon />}
                        onClick={() => { setSelectedReviewClaim(c); setOpenReviewModal(true); }}
                      >
                        Review
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
            <Button type="submit" variant="contained">Submit Review</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DOCUMENT VIEWER DIALOG */}
      <DocumentViewerDialog
        open={Boolean(selectedDocClaim)}
        onClose={() => setSelectedDocClaim(null)}
        claim={selectedDocClaim}
        onRefresh={loadClaims}
      />
    </Box>
  );
}
