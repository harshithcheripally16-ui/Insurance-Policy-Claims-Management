import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Table, TableBody, TableCell, TableRow, Paper, TableContainer,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import officerService from '../../services/officerService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officerService.getClaimDetails(id);
      setClaim(data);
    } catch (err) {
      setError('Failed to load claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaim(); }, [id]);

  const handleReview = async () => {
    if (!remarks.trim() || remarks.trim().length < 5) return;
    setSubmitting(true);
    try {
      await officerService.submitReview(id, { decision: reviewAction, remarks });
      setReviewDialog(false);
      setRemarks('');
      setSuccessMsg(`Claim ${reviewAction.toLowerCase()} successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchClaim();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewDialog = (action) => {
    setReviewAction(action);
    setRemarks('');
    setReviewDialog(true);
  };

  if (loading) return <Loading message="Loading claim details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchClaim} />;
  if (!claim) return <ErrorMessage message="Claim not found." />;

  const canReview = claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/officer/claims')} variant="text">Back to Claims</Button>
      </Box>

      {successMsg && (
        <Card sx={{ p: 2, mb: 2, bgcolor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <Typography color="success.dark" fontWeight="600">{successMsg}</Typography>
        </Card>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>{claim.claim_number}</Typography>
          <Typography variant="body2" color="text.secondary">Filed on {new Date(claim.claim_date).toLocaleDateString()}</Typography>
        </Box>
        <Chip label={claim.status} sx={{ bgcolor: STATUS_COLORS[claim.status] + '20', color: STATUS_COLORS[claim.status], fontWeight: 700, fontSize: '1rem', py: 1 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Claim Information</Typography>
            <TableContainer component={Paper} elevation={0}><Table><TableBody>
              <TableRow><TableCell sx={{ fontWeight: 600, width: 150 }}>Claim Number</TableCell><TableCell>{claim.claim_number}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Amount</TableCell><TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹{claim.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Reason</TableCell><TableCell>{claim.reason}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Status</TableCell><TableCell><Chip label={claim.status} size="small" sx={{ bgcolor: STATUS_COLORS[claim.status] + '20', color: STATUS_COLORS[claim.status], fontWeight: 700 }} /></TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Last Updated</TableCell><TableCell>{new Date(claim.updated_at).toLocaleString()}</TableCell></TableRow>
            </TableBody></Table></TableContainer>
          </CardContent></Card>

          <Card sx={{ mb: 3 }}><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Customer Information</Typography>
            <TableContainer component={Paper} elevation={0}><Table><TableBody>
              <TableRow><TableCell sx={{ fontWeight: 600, width: 150 }}>Name</TableCell><TableCell>{claim.customer_name}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Email</TableCell><TableCell>{claim.customer_email}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Phone</TableCell><TableCell>{claim.customer_phone || 'N/A'}</TableCell></TableRow>
            </TableBody></Table></TableContainer>
          </CardContent></Card>

          <Card sx={{ mb: 3 }}><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Policy Information</Typography>
            <TableContainer component={Paper} elevation={0}><Table><TableBody>
              <TableRow><TableCell sx={{ fontWeight: 600, width: 150 }}>Policy Number</TableCell><TableCell>{claim.policy_number}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Policy Name</TableCell><TableCell>{claim.policy_name}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Type</TableCell><TableCell>{claim.policy_type}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Premium</TableCell><TableCell>₹{claim.policy_premium?.toLocaleString()}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Coverage Period</TableCell><TableCell>{new Date(claim.policy_start_date).toLocaleDateString()} - {new Date(claim.policy_end_date).toLocaleDateString()}</TableCell></TableRow>
            </TableBody></Table></TableContainer>
          </CardContent></Card>

          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Documents ({claim.documents?.length || 0})</Typography>
            {claim.documents?.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
            ) : (
              claim.documents.map((doc) => (
                <Box key={doc.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon color="primary" />
                    <Box><Typography variant="body2" fontWeight="600">{doc.file_name}</Typography><Typography variant="caption" color="text.secondary">{doc.file_type} - {new Date(doc.uploaded_date).toLocaleDateString()}</Typography></Box>
                  </Box>
                  <Button size="small" startIcon={<DownloadIcon />} href={`/api/admin/documents/${doc.id}/file`} target="_blank">Download</Button>
                </Box>
              ))
            )}
          </CardContent></Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, position: 'sticky', top: 80 }}><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Review Actions</Typography>
            {canReview ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button fullWidth variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => openReviewDialog('APPROVED')}>Approve Claim</Button>
                <Button fullWidth variant="contained" color="error" startIcon={<CancelIcon />} onClick={() => openReviewDialog('REJECTED')}>Reject Claim</Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.secondary">This claim has already been {claim.status.toLowerCase()}.</Typography>
                <Chip label={claim.status} size="small" sx={{ mt: 1, bgcolor: STATUS_COLORS[claim.status] + '20', color: STATUS_COLORS[claim.status] }} />
              </Box>
            )}
          </CardContent></Card>

          {claim.reviews?.length > 0 && (
            <Card><CardContent>
              <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Review History</Typography>
              {claim.reviews.map((r) => (
                <Box key={r.id} sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Chip label={r.decision} size="small" sx={{ bgcolor: STATUS_COLORS[r.decision] + '20', color: STATUS_COLORS[r.decision], fontWeight: 700 }} />
                    <Typography variant="caption" color="text.secondary">{new Date(r.review_date).toLocaleDateString()}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">{r.remarks}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>By: {r.officer?.full_name || 'Unknown'}</Typography>
                </Box>
              ))}
            </CardContent></Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={reviewDialog} onClose={() => !submitting && setReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{reviewAction === 'APPROVED' ? 'Approve Claim' : 'Reject Claim'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to <strong>{reviewAction.toLowerCase()}</strong> claim <strong>{claim.claim_number}</strong>.
          </Typography>
          <TextField fullWidth label="Remarks" multiline rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)}
            placeholder={reviewAction === 'REJECTED' ? 'Reason for rejection (required)' : 'Optional remarks...'}
            error={reviewAction === 'REJECTED' && remarks.trim().length < 5} helperText={reviewAction === 'REJECTED' && remarks.trim().length < 5 ? 'Minimum 5 characters required' : ''} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setReviewDialog(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleReview} disabled={submitting || (reviewAction === 'REJECTED' && remarks.trim().length < 5)}
            variant="contained" color={reviewAction === 'APPROVED' ? 'success' : 'error'}>
            {submitting ? 'Submitting...' : reviewAction === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimDetails;
