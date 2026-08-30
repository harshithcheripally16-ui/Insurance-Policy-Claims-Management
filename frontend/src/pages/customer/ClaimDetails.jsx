import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { useParams, Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import ClaimStatusChip from '../../components/ClaimStatusChip';
import Loading from '../../components/Loading';

const ClaimDetails = () => {
  const { id } = useParams();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Upload Additional Dialog
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchClaim = async () => {
    setLoading(true);
    try {
      const res = await customerService.getMyClaimDetails(id);
      setClaim(res);
    } catch (err) {
      console.error('Failed to load claim:', err);
      setError('Claim record not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleUploadAdditional = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      await customerService.uploadClaimDocument(claim.id, selectedFile);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      fetchClaim();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loading message="Loading claim details & adjudication history..." />;

  if (error || !claim) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Claim record not found.'}</Alert>
        <Button component={Link} to="/customer/claims" startIcon={<ArrowBackIcon />}>
          Back to Claims
        </Button>
      </Box>
    );
  }

  // Determine Stepper Step
  let activeStep = 0;
  if (claim.status === 'SUBMITTED') activeStep = 0;
  else if (claim.status === 'UNDER_REVIEW') activeStep = 1;
  else if (claim.status === 'APPROVED' || claim.status === 'REJECTED') activeStep = 2;

  const steps = [
    { label: 'Claim Submitted', desc: `Filed on ${new Date(claim.created_at).toLocaleDateString()}` },
    { label: 'Under Review', desc: 'Claims Officer evaluating incident evidence' },
    {
      label: claim.status === 'REJECTED' ? 'Claim Rejected' : 'Claim Approved',
      desc: claim.status === 'APPROVED' ? 'Settlement processed' : claim.status === 'REJECTED' ? 'Claim decision finalized' : 'Awaiting determination',
    },
  ];

  return (
    <Box sx={{ pb: 4, maxWidth: 1050, mx: 'auto' }}>
      <Button
        component={Link}
        to="/customer/claims"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Claims List
      </Button>

      {/* Header Overview Card */}
      <Card sx={{ borderRadius: 3.5, mb: 3.5, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                  {claim.claim_number}
                </Typography>
                <ClaimStatusChip status={claim.status} size="medium" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Policy: <strong>{claim.policy_name}</strong> ({claim.policy_number})
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                CLAIMED AMOUNT
              </Typography>
              <Typography variant="h3" fontWeight="800" color="primary.main">₹{claim.amount?.toLocaleString()}
              </Typography>
            </Box>
          </Box>

          {/* Stepper Timeline */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block', mb: 2 }}>
              ADJUDICATION STATUS TIMELINE
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((s, index) => (
                <Step key={index}>
                  <StepLabel
                    error={index === 2 && claim.status === 'REJECTED'}
                    optional={<Typography variant="caption" color="text.secondary">{s.desc}</Typography>}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {s.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Incident Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">DATE OF INCIDENT</Typography>
              <Typography variant="body1" fontWeight="700">
                {new Date(claim.claim_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">SUBMISSION DATE</Typography>
              <Typography variant="body1" fontWeight="700">
                {new Date(claim.created_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">COVERAGE CATEGORY</Typography>
              <Typography variant="body1" fontWeight="700">
                {claim.policy_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">SUBSCRIPTION ID</Typography>
              <Typography variant="body1" fontWeight="700">
                {claim.policy_purchase_id}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 0.5 }}>
                Incident Description & Claim Reason
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {claim.reason}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Adjudication Officer Review Remarks */}
      {claim.reviews && claim.reviews.length > 0 && (
        <Card sx={{ borderRadius: 3.5, mb: 3.5, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <RateReviewIcon color="primary" />
            <Typography variant="h6" fontWeight="800">
              Claims Officer Adjudication Determination
            </Typography>
          </Box>
          <CardContent sx={{ p: 3 }}>
            {claim.reviews.map((r) => (
              <Box key={r.id} sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0', mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="800">
                      Determination:
                    </Typography>
                    <Chip
                      label={r.decision}
                      size="small"
                      color={r.decision === 'APPROVED' ? 'success' : r.decision === 'REJECTED' ? 'error' : 'info'}
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Reviewed on {new Date(r.review_date).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Officer Remarks:</strong> {r.remarks}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Attached Supporting Documents */}
      <Card sx={{ borderRadius: 3.5, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AttachFileIcon color="primary" />
            <Typography variant="h6" fontWeight="800">
              Supporting Evidence Documents ({claim.documents?.length || 0})
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<CloudUploadIcon />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Upload Additional Evidence
          </Button>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {claim.documents?.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2" gutterBottom>No documents attached to this claim yet.</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{ mt: 1, textTransform: 'none', borderRadius: 2 }}
              >
                Upload Medical Bill or Receipt
              </Button>
            </Box>
          ) : (
            <List disablePadding>
              {claim.documents.map((doc) => (
                <ListItem
                  key={doc.id}
                  divider
                  sx={{ py: 2, px: 3 }}
                  secondaryAction={
                    <Button
                      href={customerService.getDocumentDownloadUrl(doc.id)}
                      target="_blank"
                      download={doc.file_name}
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ textTransform: 'none', borderRadius: 1.5 }}
                    >
                      Download File
                    </Button>
                  }
                >
                  <ListItemIcon>
                    <AttachFileIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight="700">{doc.file_name}</Typography>}
                    secondary={`Uploaded: ${new Date(doc.uploaded_date).toLocaleString()} • Type: ${doc.file_type}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Upload Additional Evidence Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Upload Additional Claim Evidence</DialogTitle>
        <DialogContent dividers>
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Attach additional medical invoices, diagnostic test results, repair invoices, or police FIR reports.
          </Typography>

          <Button
            variant="outlined"
            component="label"
            fullWidth
            startIcon={<CloudUploadIcon />}
            sx={{ py: 2, borderRadius: 2, borderStyle: 'dashed' }}
          >
            {selectedFile ? selectedFile.name : 'Click to select PDF or image file'}
            <input
              type="file"
              hidden
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setUploadError('');
                }
              }}
            />
          </Button>
          {selectedFile && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Selected: <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(1)} KB)
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUploadAdditional}
            disabled={uploading || !selectedFile}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            {uploading ? 'Uploading...' : 'Confirm Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClaimDetails;
