import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, Divider, Paper, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PolicyIcon from '@mui/icons-material/Policy';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const PurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await agentService.getPurchaseDetail(id);
      setPurchase(data);
    } catch (err) {
      setError('Failed to load policy purchase details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading) return <Loading message="Loading policy purchase details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDetail} />;
  if (!purchase) return null;

  const { policy, customer, start_date, end_date, status, claims } = purchase;

  return (
    <Box sx={{ pb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/agent/purchases')}
        sx={{ mb: 2, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Policy Purchases
      </Button>

      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PolicyIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
                {policy?.name || 'Policy Purchase'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Policy {policy?.policy_number}
              </Typography>
            </Box>
          </Box>
          <Chip label={status} color={status === 'ACTIVE' ? 'success' : 'default'} fontWeight="700" />
        </Box>
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              POLICY INFORMATION
            </Typography>
            <Typography variant="body2"><strong>Type:</strong> {policy?.type}</Typography>
            <Typography variant="body2"><strong>Premium:</strong> ₹{policy?.premium?.toLocaleString()}</Typography>
            <Typography variant="body2"><strong>Start Date:</strong> {new Date(start_date).toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>End Date:</strong> {new Date(end_date).toLocaleDateString()}</Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight="700" color="text.secondary" sx={{ mb: 1 }}>
              POLICYHOLDER CUSTOMER
            </Typography>
            <Typography variant="body2"><strong>Customer Name:</strong> {customer?.full_name}</Typography>
            <Typography variant="body2"><strong>Email:</strong> {customer?.email}</Typography>
            <Typography variant="body2"><strong>Phone:</strong> {customer?.phone || 'N/A'}</Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Associated Claims Table */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
          Associated Claims ({claims?.length || 0})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {claims && claims.length > 0 ? (
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CLAIM NUMBER</TableCell>
                  <TableCell>AMOUNT</TableCell>
                  <TableCell>REASON</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>CLAIM DATE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{c.claim_number}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString()}</TableCell>
                    <TableCell>{c.reason}</TableCell>
                    <TableCell><Chip label={c.status} size="small" color={c.status === 'APPROVED' ? 'success' : 'info'} /></TableCell>
                    <TableCell>{new Date(c.claim_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No claims registered under this policy purchase.</Typography>
        )}
      </Card>
    </Box>
  );
};

export default PurchaseDetail;
