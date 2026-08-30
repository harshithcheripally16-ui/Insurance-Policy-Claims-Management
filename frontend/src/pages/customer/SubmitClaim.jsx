import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPurchaseId = searchParams.get('purchase_id');

  const [activePurchases, setActivePurchases] = useState([]);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(preselectedPurchaseId ? Number(preselectedPurchaseId) : '');
  const [amount, setAmount] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await customerService.getMyPurchases();
        const active = (res || []).filter((p) => p.status === 'ACTIVE');
        setActivePurchases(active);
        if (preselectedPurchaseId) {
          const match = active.find((p) => p.id === Number(preselectedPurchaseId));
          if (match) setSelectedPurchaseId(match.id);
        } else if (active.length > 0) {
          setSelectedPurchaseId(active[0].id);
        }
      } catch (err) {
        console.error('Failed to load eligible policies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, [preselectedPurchaseId]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedPurchaseId) {
      setError('Please select an active policy to file a claim under.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Please provide a valid positive claim amount.');
      return;
    }
    if (!reason.trim()) {
      setError('Please describe the incident reason.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create Claim
      const claimPayload = {
        policy_purchase_id: Number(selectedPurchaseId),
        amount: Number(amount),
        reason: reason.trim(),
        incident_date: new Date(incidentDate).toISOString(),
      };
      const createdClaim = await customerService.submitClaim(claimPayload);

      // 2. Upload any attached evidence files
      if (files.length > 0) {
        for (const f of files) {
          try {
            await customerService.uploadClaimDocument(createdClaim.id, f);
          } catch (uploadErr) {
            console.error(`Failed to upload ${f.name}:`, uploadErr);
          }
        }
      }

      navigate(`/customer/claims/${createdClaim.id}`, { replace: true });
    } catch (err) {
      console.error('Claim submission failed:', err);
      setError(err.response?.data?.detail || 'Failed to submit claim. Please verify the form fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading message="Loading eligible policies..." />;

  return (
    <Box sx={{ pb: 4, maxWidth: 840, mx: 'auto' }}>
      <Button
        component={Link}
        to="/customer/claims"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Claims List
      </Button>

      <Card sx={{ borderRadius: 3.5, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
              File an Insurance Claim
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
            Submit an insurance claim with incident details and upload receipts, FIR reports, or repair estimates.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {activePurchases.length === 0 ? (
            <Alert severity="warning" sx={{ borderRadius: 2, mb: 3 }}>
              You do not have any active policies eligible for filing a claim.{' '}
              <Link to="/customer/policies" style={{ color: '#b45309', fontWeight: 700 }}>
                Browse & Subscribe to a Policy Plan
              </Link>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Select Policy */}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Select Active Policy Subscription"
                    value={selectedPurchaseId}
                    onChange={(e) => setSelectedPurchaseId(e.target.value)}
                    required
                    helperText="Only active policies can receive new claim submissions"
                  >
                    {activePurchases.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.policy_name} ({p.policy_number}) — Valid until {new Date(p.end_date).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Claim Amount */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Claim Amount (₹ INR)"
                    type="number"
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    InputProps={{ inputProps: { min: 1, step: 'any' } }}
                  />
                </Grid>

                {/* Incident Date */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Incident / Loss"
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Reason */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Incident Description & Reason for Claim"
                    placeholder="Describe what occurred (e.g. Emergency hospitalization due to acute pneumonia, vehicle damage in rear-end collision, etc.)..."
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </Grid>

                {/* Document Attachments */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight="700" gutterBottom>
                    Attach Supporting Documents (Optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    Accepted formats: PDF, PNG, JPG, JPEG (Max 20MB per file). Additional evidence can also be uploaded after submission.
                  </Typography>

                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                  >
                    Select Files to Attach
                    <input type="file" hidden multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} />
                  </Button>

                  {files.length > 0 && (
                    <List dense sx={{ mt: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      {files.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton edge="end" size="small" onClick={() => handleRemoveFile(index)}>
                              <DeleteOutlineIcon fontSize="small" color="error" />
                            </IconButton>
                          }
                        >
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <AttachFileIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(1)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                {/* Submit button */}
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={submitting}
                    startIcon={<SendIcon />}
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem' }}
                  >
                    {submitting ? 'Submitting Claim...' : 'Submit Claim for Review'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubmitClaim;
