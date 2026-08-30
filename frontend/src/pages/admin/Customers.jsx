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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Snackbar,
  Alert,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PolicyIcon from '@mui/icons-material/Policy';
import AssignmentIcon from '@mui/icons-material/Assignment';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const STATUS_COLORS = {
  ACTIVE: 'success',
  EXPIRED: 'error',
  CANCELLED: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Customer Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setCustomers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setToast({ open: true, message: 'Failed to load customers list.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCustomers();
  };

  const handleOpenDetails = async (c) => {
    setDetailsLoading(true);
    setDetailsModalOpen(true);
    try {
      const fullDetail = await adminService.getCustomer(c.id);
      setSelectedCustomer(fullDetail);
    } catch (err) {
      console.error('Failed to fetch customer details:', err);
      setToast({ open: true, message: 'Failed to fetch customer details.', severity: 'error' });
      setDetailsModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Customer Management (Admin View)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Administrative registry of policyholders, active subscriptions, and filed claims overview.
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
                  placeholder="Search customer by name, email, or phone..."
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
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Account Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
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

      {/* Customer Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CUSTOMER NAME</TableCell>
                <TableCell>EMAIL & CONTACT</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>POLICIES HELD</TableCell>
                <TableCell>CLAIMS FILED</TableCell>
                <TableCell>MEMBER SINCE</TableCell>
                <TableCell align="right">ADMIN ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading customers..." />
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {c.full_name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{c.email}</Typography>
                      {c.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {c.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={c.is_active ? 'success' : 'error'}
                        variant={c.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<PolicyIcon sx={{ fontSize: '16px !important' }} />}
                        label={`${c.policies_count} Policies`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<AssignmentIcon sx={{ fontSize: '16px !important' }} />}
                        label={`${c.claims_count} Claims`}
                        size="small"
                        color={c.claims_count > 0 ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleOpenDetails(c)}
                      >
                        Inspect
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

      {/* Customer In-Depth Inspection Modal */}
      <Dialog
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="800">
          Customer Administrative Record: {selectedCustomer?.full_name}
        </DialogTitle>
        <DialogContent>
          {detailsLoading ? (
            <Loading message="Loading customer policies & claims data..." />
          ) : selectedCustomer ? (
            <Box sx={{ pt: 1 }}>
              {/* Profile Card */}
              <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">CUSTOMER EMAIL</Typography>
                  <Typography variant="body2" fontWeight="700">{selectedCustomer.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">PHONE NUMBER</Typography>
                  <Typography variant="body2" fontWeight="700">{selectedCustomer.phone || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" color="text.secondary" fontWeight="600">REGISTRATION DATE</Typography>
                  <Typography variant="body2">{new Date(selectedCustomer.created_at).toLocaleDateString()}</Typography>
                </Grid>
              </Grid>

              {/* Policy Purchases */}
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PolicyIcon color="primary" fontSize="small" /> Purchased Policies ({selectedCustomer.policies?.length || 0})
              </Typography>
              {selectedCustomer.policies?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  No insurance policies purchased yet.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>POLICY NUMBER</TableCell>
                        <TableCell>PLAN NAME</TableCell>
                        <TableCell>TYPE</TableCell>
                        <TableCell>PREMIUM</TableCell>
                        <TableCell>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCustomer.policies?.map((pol, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{pol.policy_number}</TableCell>
                          <TableCell>{pol.policy_name}</TableCell>
                          <TableCell><Chip label={pol.type} size="small" variant="outlined" /></TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>₹{pol.premium?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={pol.status} size="small" color={STATUS_COLORS[pol.status] || 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Claims History */}
              <Typography variant="subtitle1" fontWeight="700" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="warning" fontSize="small" /> Claims History ({selectedCustomer.claims?.length || 0})
              </Typography>
              {selectedCustomer.claims?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No claims submitted by this customer.
                </Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>CLAIM NUMBER</TableCell>
                        <TableCell>REASON</TableCell>
                        <TableCell>CLAIMED AMOUNT</TableCell>
                        <TableCell>STATUS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedCustomer.claims?.map((clm, idx) => (
                        <TableRow key={idx}>
                          <TableCell sx={{ fontWeight: 700 }}>{clm.claim_number}</TableCell>
                          <TableCell>{clm.reason}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>₹{clm.amount?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip label={clm.status} size="small" color={STATUS_COLORS[clm.status] || 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailsModalOpen(false)} variant="contained" color="primary">
            Close Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
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

export default Customers;
