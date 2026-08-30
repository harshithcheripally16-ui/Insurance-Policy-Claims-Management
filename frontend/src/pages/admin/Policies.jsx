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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const TYPE_COLORS = {
  HEALTH: 'primary',
  LIFE: 'secondary',
  VEHICLE: 'warning',
  TRAVEL: 'info',
  HOME: 'success',
};

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Policy modal
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [formData, setFormData] = useState({
    policy_number: '',
    name: '',
    type: 'HEALTH',
    description: '',
    premium: '',
    duration_months: '',
    status: 'ACTIVE',
  });
  const [formErrors, setFormErrors] = useState({});

  // Confirm dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [policyToToggle, setPolicyToToggle] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPolicies({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
      });
      setPolicies(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch policies:', err);
      setToast({ open: true, message: 'Failed to load policy catalog.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [page, pageSize, typeFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchPolicies();
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingPolicyId(null);
    setFormData({
      policy_number: '',
      name: '',
      type: 'HEALTH',
      description: '',
      premium: '',
      duration_months: '12',
      status: 'ACTIVE',
    });
    setFormErrors({});
    setPolicyModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setIsEditing(true);
    setEditingPolicyId(p.id);
    setFormData({
      policy_number: p.policy_number,
      name: p.name,
      type: p.type,
      description: p.description || '',
      premium: p.premium.toString(),
      duration_months: p.duration_months.toString(),
      status: p.status,
    });
    setFormErrors({});
    setPolicyModalOpen(true);
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.policy_number.trim()) errors.policy_number = 'Policy number is required';
    if (!formData.name.trim()) errors.name = 'Plan name is required';
    const prem = parseFloat(formData.premium);
    if (isNaN(prem) || prem <= 0) errors.premium = 'Premium must be greater than 0';
    const dur = parseInt(formData.duration_months, 10);
    if (isNaN(dur) || dur <= 0) errors.duration_months = 'Duration must be greater than 0 months';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const payload = {
        policy_number: formData.policy_number.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        premium: prem,
        duration_months: dur,
        status: formData.status,
      };

      if (isEditing) {
        await adminService.updatePolicy(editingPolicyId, payload);
        setToast({ open: true, message: 'Policy plan updated successfully.', severity: 'success' });
      } else {
        await adminService.createPolicy(payload);
        setToast({ open: true, message: 'New insurance policy cataloged.', severity: 'success' });
      }
      setPolicyModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Save policy failed:', err);
      setToast({
        open: true,
        message: err.response?.data?.detail || 'Failed to save policy.',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = (p) => {
    setPolicyToToggle(p);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!policyToToggle) return;
    const newStatus = policyToToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminService.updatePolicyStatus(policyToToggle.id, newStatus);
      setToast({
        open: true,
        message: `Policy ${policyToToggle.policy_number} is now ${newStatus.toLowerCase()}.`,
        severity: 'success',
      });
      setStatusConfirmOpen(false);
      fetchPolicies();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Action failed.', severity: 'error' });
    }
  };

  const handleDeleteClick = (p) => {
    setPolicyToDelete(p);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!policyToDelete) return;
    try {
      await adminService.deletePolicy(policyToDelete.id);
      setToast({ open: true, message: 'Policy deleted successfully.', severity: 'success' });
      setDeleteConfirmOpen(false);
      fetchPolicies();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.detail || 'Cannot delete policy with active subscriptions.',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            Insurance Policies Catalog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Configure insurance products, premiums, coverage terms, and catalog availability.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenCreateModal}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, px: 2.5 }}
        >
          Create Policy Plan
        </Button>
      </Box>

      {/* Filter & Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by policy number, name, or description..."
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
                  <InputLabel>Policy Type</InputLabel>
                  <Select
                    value={typeFilter}
                    label="Policy Type"
                    onChange={(e) => {
                      setTypeFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="HEALTH">Health</MenuItem>
                    <MenuItem value="LIFE">Life</MenuItem>
                    <MenuItem value="VEHICLE">Vehicle / Auto</MenuItem>
                    <MenuItem value="TRAVEL">Travel</MenuItem>
                    <MenuItem value="HOME">Home & Property</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button fullWidth type="submit" variant="outlined" color="primary">
                  Filter
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Policies Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>POLICY NUMBER</TableCell>
                <TableCell>PLAN NAME & DESCRIPTION</TableCell>
                <TableCell>TYPE</TableCell>
                <TableCell>PREMIUM</TableCell>
                <TableCell>DURATION</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>PURCHASES</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading policies catalog..." />
                  </TableCell>
                </TableRow>
              ) : policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No insurance policies matching criteria found.
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {p.policy_number}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>
                        {p.name}
                      </Typography>
                      {p.description && (
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {p.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.type}
                        size="small"
                        color={TYPE_COLORS[p.type] || 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{p.premium?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      {p.duration_months} Months
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        color={p.status === 'ACTIVE' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {p.purchases_count || 0} Sold
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Policy">
                        <IconButton size="small" onClick={() => handleOpenEditModal(p)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={p.status === 'ACTIVE' ? 'Deactivate Policy' : 'Activate Policy'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(p)}
                          color={p.status === 'ACTIVE' ? 'warning' : 'success'}
                        >
                          {p.status === 'ACTIVE' ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Policy">
                        <IconButton size="small" onClick={() => handleDeleteClick(p)} color="error">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

      {/* Add / Edit Policy Modal */}
      <Dialog
        open={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="700">
          {isEditing ? 'Modify Insurance Policy' : 'Create New Insurance Policy'}
        </DialogTitle>
        <form onSubmit={handleSavePolicy}>
          <DialogContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy Code / Number"
                  placeholder="e.g. POL-HLTH-103"
                  value={formData.policy_number}
                  onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                  error={!!formErrors.policy_number}
                  helperText={formErrors.policy_number}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Category / Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Category / Type"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="HEALTH">Health & Hospitalization</MenuItem>
                    <MenuItem value="LIFE">Term Life & Critical</MenuItem>
                    <MenuItem value="VEHICLE">Motor Vehicle Comprehensive</MenuItem>
                    <MenuItem value="TRAVEL">Overseas Travel Guard</MenuItem>
                    <MenuItem value="HOME">Home & Property Protection</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Policy Plan Name"
                  placeholder="e.g. Apex Health Premier Shield"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Premium Amount (₹)"
                  type="number"
                  placeholder="450.00"
                  value={formData.premium}
                  onChange={(e) => setFormData({ ...formData, premium: e.target.value })}
                  error={!!formErrors.premium}
                  helperText={formErrors.premium}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coverage Term (Months)"
                  type="number"
                  placeholder="12"
                  value={formData.duration_months}
                  onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                  error={!!formErrors.duration_months}
                  helperText={formErrors.duration_months}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Plan Coverage Description & Benefits"
                  placeholder="Detailed summary of policy coverage, exclusions, copay terms, and benefits..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Catalog Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Catalog Status"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="ACTIVE">Active (Available for purchase)</MenuItem>
                    <MenuItem value="INACTIVE">Inactive (Hidden from catalog)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setPolicyModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Save Policy Changes' : 'Catalog Policy'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Insurance Policy"
        message={`Are you sure you want to permanently delete policy "${policyToDelete?.name}" (${policyToDelete?.policy_number})? This action cannot be undone.`}
        confirmText="Delete Policy"
        confirmColor="error"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={statusConfirmOpen}
        title={policyToToggle?.status === 'ACTIVE' ? 'Deactivate Insurance Policy' : 'Activate Insurance Policy'}
        message={`Are you sure you want to ${policyToToggle?.status === 'ACTIVE' ? 'deactivate' : 'activate'} policy "${policyToToggle?.policy_number}"?`}
        confirmText={policyToToggle?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        confirmColor={policyToToggle?.status === 'ACTIVE' ? 'warning' : 'success'}
        onConfirm={confirmToggleStatus}
        onClose={() => setStatusConfirmOpen(false)}
      />

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

export default Policies;
