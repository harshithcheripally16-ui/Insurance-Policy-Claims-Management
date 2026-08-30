import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const STATUS_COLORS = {
  ACTIVE: 'success',
  EXPIRED: 'error',
  CANCELLED: 'default',
};

const PolicyPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPolicyPurchases({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setPurchases(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch policy purchases:', err);
      setToast({ open: true, message: 'Failed to load policy purchases.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPurchases();
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Policy Purchases Monitoring
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Monitor customer subscriptions, active policy coverage timelines, and issuing brokers.
        </Typography>
      </Box>

      {/* Filter & Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by customer name, email, or policy number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Subscription Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Subscription Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="ACTIVE">Active (In Effect)</MenuItem>
                    <MenuItem value="EXPIRED">Expired</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <Button fullWidth type="submit" variant="outlined" color="primary">
                  Filter
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PURCHASE ID</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>POLICY PLAN</TableCell>
                <TableCell>AGENT / BROKER</TableCell>
                <TableCell>EFFECTIVE DATES</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>CLAIMS FILED</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading policy purchases..." />
                  </TableCell>
                </TableRow>
              ) : purchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No policy purchases found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                purchases.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      {p.id}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>
                        {p.customer?.full_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {p.customer?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" color="primary.main">
                        {p.policy?.name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.policy?.policy_number} • ${p.policy?.premium?.toLocaleString()}/term
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {p.agent?.full_name || 'Direct / Online'}
                      </Typography>
                      {p.agent?.email && (
                        <Typography variant="caption" color="text.secondary">
                          {p.agent.email}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem' }}>
                      <Typography variant="body2">
                        {new Date(p.start_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        to {new Date(p.end_date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        color={STATUS_COLORS[p.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {p.claims_count || 0} Claims
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PolicyPurchases;
