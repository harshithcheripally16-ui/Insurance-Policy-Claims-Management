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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SecurityIcon from '@mui/icons-material/Security';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useParams, Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import ClaimStatusChip from '../../components/ClaimStatusChip';
import Loading from '../../components/Loading';

const MyPolicyDetails = () => {
  const { id } = useParams();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPurchase = async () => {
      setLoading(true);
      try {
        const res = await customerService.getMyPurchaseDetails(id);
        setPurchase(res);
      } catch (err) {
        console.error('Failed to load purchase details:', err);
        setError('Subscription record not found or access denied.');
      } finally {
        setLoading(false);
      }
    };
    fetchPurchase();
  }, [id]);

  if (loading) return <Loading message="Loading subscription record..." />;

  if (error || !purchase) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Subscription not found.'}</Alert>
        <Button component={Link} to="/customer/policies/my" startIcon={<ArrowBackIcon />}>
          Back to My Subscriptions
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, maxWidth: 1000, mx: 'auto' }}>
      <Button
        component={Link}
        to="/customer/policies/my"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to My Subscriptions
      </Button>

      {/* Overview Card */}
      <Card sx={{ borderRadius: 3.5, mb: 3.5, boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip label={purchase.type} color="primary" size="small" sx={{ fontWeight: 700 }} />
                <Chip
                  label={purchase.status}
                  color={purchase.status === 'ACTIVE' ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                {purchase.policy_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Policy Code: <strong>{purchase.policy_number}</strong> • Subscription ID: {purchase.id}
              </Typography>
            </Box>

            {purchase.status === 'ACTIVE' && (
              <Button
                component={Link}
                to={`/customer/claims/new?purchase_id=${purchase.id}`}
                variant="contained"
                color="warning"
                startIcon={<AddCircleOutlineIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2.5 }}
              >
                File Claim on this Policy
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2.5 }} />

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">ANNUAL PREMIUM</Typography>
              <Typography variant="h5" fontWeight="800" color="primary.main">₹{purchase.premium?.toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">EFFECTIVE FROM</Typography>
              <Typography variant="body1" fontWeight="700">
                {new Date(purchase.start_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">EXPIRES ON</Typography>
              <Typography variant="body1" fontWeight="700">
                {new Date(purchase.end_date).toLocaleDateString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">ISSUED THROUGH</Typography>
              <Typography variant="body2" fontWeight="600">
                {purchase.agent_name || 'Direct Online Portal'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Claims Associated with this policy */}
      <Card sx={{ borderRadius: 3.5, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIcon color="primary" />
          <Typography variant="h6" fontWeight="800">
            Claims Filed Under This Policy
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {purchase.claims?.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">No claims filed under this policy subscription yet.</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>CLAIM NUMBER</TableCell>
                    <TableCell>REASON</TableCell>
                    <TableCell>CLAIMED AMOUNT</TableCell>
                    <TableCell>INCIDENT DATE</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell align="right">ACTION</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchase.claims.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{c.claim_number}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.reason}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{new Date(c.claim_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <ClaimStatusChip status={c.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          to={`/customer/claims/${c.id}`}
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Track Claim
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyPolicyDetails;
