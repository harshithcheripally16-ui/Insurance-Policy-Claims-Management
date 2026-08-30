import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Divider,
  Table, TableBody, TableCell, TableRow, Paper, TableContainer,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await agentService.getCustomerDetail(id);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load customer details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return <Loading message="Loading customer details..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  if (!data) return <ErrorMessage message="Customer not found." />;

  const { customer, purchases } = data;

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/agent/customers')} variant="text">Back to Customers</Button>
      </Box>

      <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a', mb: 3 }}>{customer.full_name}</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Customer Information</Typography>
            <TableContainer component={Paper} elevation={0}><Table><TableBody>
              <TableRow><TableCell sx={{ fontWeight: 600, width: 100 }}>Name</TableCell><TableCell>{customer.full_name}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Email</TableCell><TableCell>{customer.email}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Phone</TableCell><TableCell>{customer.phone || 'N/A'}</TableCell></TableRow>
              <TableRow><TableCell sx={{ fontWeight: 600 }}>Status</TableCell><TableCell><Chip label={customer.is_active ? 'Active' : 'Inactive'} size="small" color={customer.is_active ? 'success' : 'default'} /></TableCell></TableRow>
            </TableBody></Table></TableContainer>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card><CardContent>
            <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>Policy Purchases ({purchases.length})</Typography>
            {purchases.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No policy purchases found.</Typography>
            ) : (
              purchases.map((p) => (
                <Box key={p.id} sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="700">{p.policy_name}</Typography>
                    <Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">{p.policy_number} - {p.policy_type} - Premium: ${p.premium?.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Period: {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}</Typography>
                  {p.claims.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" fontWeight="600">Claims:</Typography>
                      {p.claims.map((c) => (
                        <Chip key={c.id} label={`${c.claim_number} (${c.status})`} size="small" sx={{ mr: 0.5, mt: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              ))
            )}
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDetail;
