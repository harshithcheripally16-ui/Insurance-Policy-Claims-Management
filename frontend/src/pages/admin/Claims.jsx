import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import VisibilityIcon from '@mui/icons-material/Visibility';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const STATUS_COLORS = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const Claims = () => {
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await adminService.getClaims({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setClaims(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch claims:', err);
      setToast({ open: true, message: 'Failed to load claims repository.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchClaims();
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Claims Monitoring Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Real-time oversight of submitted claims, amounts, supporting evidence, and Claims Officer decisions.
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
                  placeholder="Search by claim number, customer name, email, or reason..."
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
                  <InputLabel>Claim Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Claim Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="SUBMITTED">Submitted</MenuItem>
                    <MenuItem value="UNDER_REVIEW">Under Review</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
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

      {/* Claims Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CLAIM NUMBER</TableCell>
                <TableCell>CUSTOMER</TableCell>
                <TableCell>POLICY REF</TableCell>
                <TableCell>CLAIMED AMOUNT</TableCell>
                <TableCell>FILING DATE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>EVIDENCE / DOCS</TableCell>
                <TableCell align="right">ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading claims..." />
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No claims matching criteria found.
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {c.claim_number}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>
                        {c.customer?.full_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.customer?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {c.policy_purchase?.policy?.name || 'Policy Ref'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.policy_purchase?.policy?.policy_number}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{c.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {new Date(c.claim_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        size="small"
                        color={STATUS_COLORS[c.status] || 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem' }}>
                      {c.documents?.length || 0} Attached
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/admin/claims/${c.id}`)}
                      >
                        Inspect Details
                      </Button>
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

export default Claims;
