import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import agentService from '../../services/agentService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, page_size: 10 };
      if (search.trim()) params.search = search.trim();
      const data = await agentService.getCustomers(params);
      setCustomers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [page]);

  const handleSearch = (e) => { if (e.key === 'Enter') { setPage(1); fetchCustomers(); } };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>My Customers</Typography>
        <Typography variant="body2" color="text.secondary">Customers assigned to you through policy purchases.</Typography>
      </Box>

      <Card sx={{ p: 2.5, mb: 3 }}>
        <TextField fullWidth size="small" placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleSearch}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }} />
      </Card>

      {loading ? <Loading message="Loading customers..." /> : error ? <ErrorMessage message={error} onRetry={fetchCustomers} /> : customers.length === 0 ? (
        <EmptyState icon={PeopleIcon} title="No customers assigned" description="You have no assigned customers yet. Customers will appear here when they purchase policies through you." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table><TableHead><TableRow>
              <TableCell>NAME</TableCell><TableCell>EMAIL</TableCell><TableCell>POLICIES</TableCell><TableCell>ACTIVE</TableCell><TableCell>CLAIMS</TableCell><TableCell>STATUS</TableCell><TableCell align="right">ACTION</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{c.full_name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.policies_count}</TableCell>
                  <TableCell><Chip label={c.active_policies} size="small" color="success" /></TableCell>
                  <TableCell>{c.claims_count}</TableCell>
                  <TableCell><Chip label={c.is_active ? 'Active' : 'Inactive'} size="small" color={c.is_active ? 'success' : 'default'} /></TableCell>
                  <TableCell align="right"><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/agent/customers/${c.id}`)}>View</Button></TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Showing {customers.length} of {total} customers</Typography>
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

export default Customers;
