import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SecurityIcon from '@mui/icons-material/Security';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Purchases = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 10 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const data = await agentService.getPurchases(params);
      setPurchases(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load purchases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, [page, statusFilter]);

  const handleSearch = (e) => { if (e.key === 'Enter') { setPage(1); fetchPurchases(); } };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Policy Purchases</Typography>
        <Typography variant="body2" color="text.secondary">Policy purchases assigned to you.</Typography>
      </Box>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {loading ? <Loading /> : error ? <ErrorMessage message={error} onRetry={fetchPurchases} /> : purchases.length === 0 ? (
        <EmptyState icon={SecurityIcon} title="No purchases found" description="No policy purchases are assigned to you yet." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table><TableHead><TableRow>
              <TableCell>POLICY</TableCell><TableCell>CUSTOMER</TableCell><TableCell>PREMIUM</TableCell><TableCell>PERIOD</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {purchases.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.policy_name}<br /><Typography variant="caption" color="text.secondary">{p.policy_number}</Typography></TableCell>
                  <TableCell>{p.customer_name}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>₹{p.premium?.toLocaleString()}</TableCell>
                  <TableCell><Typography variant="caption">{new Date(p.start_date).toLocaleDateString()}<br />to {new Date(p.end_date).toLocaleDateString()}</Typography></TableCell>
                  <TableCell><Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/agent/purchases/${p.id}`)}>View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Showing {purchases.length} of {total}</Typography>
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

export default Purchases;
