import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PolicyIcon from '@mui/icons-material/Policy';
import DescriptionIcon from '@mui/icons-material/Description';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const STATUS_COLORS = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const ClaimDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClaimDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminService.getClaim(id);
      setClaim(data);
    } catch (err) {
      console.error('Failed to load claim details:', err);
      setError('Unable to load claim details. Please verify the claim ID.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimDetails();
  }, [id]);

  const handleDownloadDoc = async (docId, fileName) => {
    try {
      const response = await adminService.getDocumentFileBlob(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Unable to retrieve document file.');
    }
  };

  if (loading) {
    return <Loading message="Loading claim audit details, evidence, and officer reviews..." />;
  }

  if (error || !claim) {
    return (
      <Box sx={{ p: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/claims')} sx={{ mb: 2 }}>
          Back to Claims List
        </Button>
        <ErrorMessage message={error || 'Claim not found.'} onRetry={fetchClaimDetails} />
      </Box>
    );
  }

  const purchase = claim.policy_purchase;
  const policy = purchase?.policy;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Back Button & Title Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/claims')}
          variant="outlined"
          size="small"
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
            Claim Audit Record: {claim.claim_number}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Filed on {new Date(claim.claim_date).toLocaleString()} • Administrative Oversight View
          </Typography>
        </Box>
        <Chip
          label={`STATUS: ${claim.status}`}
          color={STATUS_COLORS[claim.status] || 'default'}
          sx={{ fontWeight: 800, fontSize: '0.85rem', px: 1, py: 2 }}
        />
      </Box>

      {/* Role Rule Banner */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }} icon={<InfoOutlinedIcon />}>
        <strong>Administrative Monitoring Mode:</strong> Official claim adjudication, approvals, and rejections are handled by the Claims Officer Module. This interface provides end-to-end auditability over customer evidence and officer determinations.
      </Alert>

      {/* Row 1: Claim Information & Financials */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Claim Details & Justification</Typography>}
            />
            <Divider />
            <CardContent>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">
                  REASON / CIRCUMSTANCE OF CLAIM
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  {claim.reason}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">CLAIM NUMBER</Typography>
                  <Typography variant="body2" fontWeight="600">{claim.claim_number}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="700">SYSTEM REGISTERED DATE</Typography>
                  <Typography variant="body2">{new Date(claim.created_at).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CardHeader
              title={<Typography variant="subtitle1" fontWeight="800" color="success.dark">Claim Financial Settlement</Typography>}
            />
            <Divider sx={{ borderColor: '#bbf7d0' }} />
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight="600">CLAIMED AMOUNT REQUESTED</Typography>
              <Typography variant="h3" fontWeight="800" color="success.dark" sx={{ my: 1 }}>₹{claim.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Covered under terms of {policy?.name || 'Active Policy'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Customer & Policy Information Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Customer Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<PersonOutlineIcon color="primary" />}
              title={<Typography variant="subtitle1" fontWeight="700">Policyholder (Customer) Information</Typography>}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">FULL NAME</Typography>
                  <Typography variant="body2" fontWeight="700">{claim.customer?.full_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">EMAIL ADDRESS</Typography>
                  <Typography variant="body2">{claim.customer?.email || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">PHONE</Typography>
                  <Typography variant="body2">{claim.customer?.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">CUSTOMER ID</Typography>
                  <Typography variant="body2">{claim.customer_id}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Policy Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              avatar={<PolicyIcon color="secondary" />}
              title={<Typography variant="subtitle1" fontWeight="700">Associated Insurance Policy</Typography>}
            />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">PLAN NAME</Typography>
                  <Typography variant="body2" fontWeight="700">{policy?.name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">POLICY NUMBER</Typography>
                  <Typography variant="body2" fontWeight="600" color="primary.main">{policy?.policy_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">PLAN CATEGORY</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip label={policy?.type || 'N/A'} size="small" variant="outlined" />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">PREMIUM / TERM</Typography>
                  <Typography variant="body2" fontWeight="700">₹{policy?.premium?.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">COVERAGE PERIOD</Typography>
                  <Typography variant="body2">
                    {purchase?.start_date ? new Date(purchase.start_date).toLocaleDateString() : 'N/A'} to {purchase?.end_date ? new Date(purchase.end_date).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Attached Supporting Documents */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={<DescriptionIcon color="info" />}
          title={<Typography variant="subtitle1" fontWeight="700">Attached Supporting Documents & Evidence ({claim.documents?.length || 0})</Typography>}
          subheader="Medical discharge summaries, police accident FIR reports, diagnostic test receipts, and bills"
        />
        <Divider />
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>DOCUMENT NAME</TableCell>
                <TableCell>FILE TYPE</TableCell>
                <TableCell>UPLOADED DATE</TableCell>
                <TableCell align="right">DOWNLOAD / VIEW</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claim.documents?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No supporting documents attached to this claim.
                  </TableCell>
                </TableRow>
              ) : (
                claim.documents?.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{doc.file_name}</TableCell>
                    <TableCell><Chip label={doc.file_type} size="small" variant="outlined" /></TableCell>
                    <TableCell>{new Date(doc.uploaded_date).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownloadDoc(doc.id, doc.file_name)}
                      >
                        Download Secure File
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Row 4: Claims Officer Review History Timeline */}
      <Card>
        <CardHeader
          avatar={<RateReviewIcon color="warning" />}
          title={<Typography variant="subtitle1" fontWeight="700">Claims Officer Adjudication History ({claim.reviews?.length || 0})</Typography>}
          subheader="Recorded remarks, surveyor evaluations, and determination decisions by Claims Officers"
        />
        <Divider />
        <CardContent>
          {claim.reviews?.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              This claim is pending evaluation. No Claims Officer review remarks have been logged yet.
            </Typography>
          ) : (
            claim.reviews?.map((rev, idx) => (
              <Box
                key={rev.id}
                sx={{
                  p: 2.5,
                  mb: idx < claim.reviews.length - 1 ? 2 : 0,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="700">
                      Officer: {rev.officer?.full_name || `Officer ${rev.officer_id}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({rev.officer?.email})
                    </Typography>
                  </Box>
                  <Chip
                    label={rev.decision}
                    size="small"
                    color={STATUS_COLORS[rev.decision] || 'default'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="body2" sx={{ my: 1.5, color: '#334155', fontStyle: 'italic' }}>
                  "{rev.remarks}"
                </Typography>

                <Typography variant="caption" color="text.secondary" display="block">
                  Reviewed on {new Date(rev.review_date).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClaimDetails;
