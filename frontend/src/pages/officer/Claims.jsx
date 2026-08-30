import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, InputAdornment, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, MenuItem, Select, FormControl, InputLabel, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import officerService from '../../services/officerService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';
import AssignmentIcon from '@mui/icons-material/Assignment';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };

const Claims = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 10 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const data = await officerService.getClaims(params);
      setClaims(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, [page, statusFilter]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') { setPage(1); fetchClaims(); }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Claims Management</Typography>
        <Typography variant="body2" color="text.secondary">Review and process all policyholder claims.</Typography>
      </Box>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={6}>
            <TextField fullWidth size="small" placeholder="Search by claim number, customer, reason..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="SUBMITTED">Submitted</MenuItem>
                <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2} md={3} sx={{ textAlign: 'right' }}>
            <Button variant="outlined" onClick={() => { setPage(1); fetchClaims(); }}>Search</Button>
          </Grid>
        </Grid>
      </Card>

      {loading ? <Loading message="Loading claims..." /> : error ? <ErrorMessage message={error} onRetry={fetchClaims} /> : claims.length === 0 ? (
        <EmptyState icon={AssignmentIcon} title="No claims found" description="No claims match your search criteria." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table><TableHead><TableRow>
              <TableCell>CLAIM #</TableCell><TableCell>CUSTOMER</TableCell><TableCell>POLICY</TableCell><TableCell>AMOUNT</TableCell><TableCell>DATE</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {claims.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>{c.claim_number}</TableCell>
                  <TableCell>{c.customer_name}<br /><Typography variant="caption" color="text.secondary">{c.customer_email}</Typography></TableCell>
                  <TableCell>{c.policy_number}<br /><Typography variant="caption" color="text.secondary">{c.policy_name}</Typography></TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell>{new Date(c.claim_date).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={c.status} size="small" sx={{ bgcolor: STATUS_COLORS[c.status] + '20', color: STATUS_COLORS[c.status], fontWeight: 700 }} /></TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/officer/claims/${c.id}`)}>Review</Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Showing {claims.length} of {total} claims</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button size="small" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default Claims;
