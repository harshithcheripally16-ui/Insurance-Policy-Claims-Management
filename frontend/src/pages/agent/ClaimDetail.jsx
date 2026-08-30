import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Grid, Button, Chip, Divider, Paper, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await agentService.getClaimDetail(id);
      setClaim(data);
    } catch (err) {
      setError('Failed to load claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <Loading message="Loading claim details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDetail} />;
  if (!claim) return null;

  const { claim_number, amount, reason, status, claim_date, customer, policy, documents } = claim;

  return (
    <Box sx={{ pb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/agent/claims')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Claims
      </Button>

      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
                Claim {claim_number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Filed on {new Date(claim_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Chip label={status} color={status === 'APPROVED' ? 'success' : status === 'REJECTED' ? 'error' : 'warning'} fontWeight="700" />
        </Box>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              CLAIM DETAILS
            </Typography>
            <Typography variant="body2"><strong>Amount Claimed:</strong> ₹{amount?.toLocaleString()}</Typography>
            <Typography variant="body2"><strong>Reason / Description:</strong> {reason}</Typography>
            <Typography variant="body2"><strong>Status:</strong> {status}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              CUSTOMER & POLICY
            </Typography>
            <Typography variant="body2"><strong>Customer Name:</strong> {customer?.full_name}</Typography>
            <Typography variant="body2"><strong>Customer Email:</strong> {customer?.email}</Typography>
            <Typography variant="body2"><strong>Policy Name:</strong> {policy?.name}</Typography>
            <Typography variant="body2"><strong>Policy Number:</strong> {policy?.policy_number}</Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Supporting Documents Table */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
          Uploaded Documents ({documents?.length || 0})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {documents && documents.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>FILE NAME</TableCell>
                  <TableCell>FILE TYPE</TableCell>
                  <TableCell>UPLOAD DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{d.file_name}</TableCell>
                    <TableCell>{d.file_type}</TableCell>
                    <TableCell>{new Date(d.uploaded_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No supporting documents uploaded for this claim.</Typography>
        )}
      </Card>
    </Box>
  );
};

export default ClaimDetail;
