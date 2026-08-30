import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };

const Claims = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClaims = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 10 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const data = await agentService.getClaims(params);
      setClaims(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load claims.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClaims(); }, [page, statusFilter]);

  const handleSearch = (e) => { if (e.key === 'Enter') { setPage(1); fetchClaims(); } };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Claims</Typography>
        <Typography variant="body2" color="text.secondary">Claims related to your assigned customers and policies.</Typography>
      </Box>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="SUBMITTED">Submitted</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={fetchClaims} /> : claims.length === 0 ? (
        <EmptyState icon={AssignmentIcon} title="No claims found" description="No claims are related to your assigned customers." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table><TableHead><TableRow>
              <TableCell>CLAIM #</TableCell><TableCell>CUSTOMER</TableCell><TableCell>POLICY</TableCell><TableCell>AMOUNT</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {claims.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{c.claim_number}</TableCell>
                  <TableCell>{c.customer_name}</TableCell>
                  <TableCell>{c.policy_number}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Chip label={c.status} size="small" sx={{ bgcolor: STATUS_COLORS[c.status] + '20', color: STATUS_COLORS[c.status], fontWeight: 700 }} /></TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/agent/claims/${c.id}`)}>View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Showing {claims.length} of {total}</Typography>
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
