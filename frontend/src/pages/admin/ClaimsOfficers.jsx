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
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const ClaimsOfficers = () => {
  const [officers, setOfficers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [officerModalOpen, setOfficerModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOfficerId, setEditingOfficerId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // Confirm dialogs
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [officerToDelete, setOfficerToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [officerToToggle, setOfficerToToggle] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchOfficers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getClaimsOfficers({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setOfficers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch claims officers:', err);
      setToast({ open: true, message: 'Failed to load claims officers.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchOfficers();
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingOfficerId(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true,
    });
    setFormErrors({});
    setOfficerModalOpen(true);
  };

  const handleOpenEditModal = (o) => {
    setIsEditing(true);
    setEditingOfficerId(o.id);
    setFormData({
      full_name: o.full_name,
      email: o.email,
      phone: o.phone || '',
      password: '',
      is_active: o.is_active,
    });
    setFormErrors({});
    setOfficerModalOpen(true);
  };

  const handleSaveOfficer = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Valid email is required';
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (isEditing) {
        const updatePayload = {
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          is_active: formData.is_active,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await adminService.updateClaimsOfficer(editingOfficerId, updatePayload);
        setToast({ open: true, message: 'Claims Officer updated successfully.', severity: 'success' });
      } else {
        await adminService.createClaimsOfficer({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          is_active: formData.is_active,
        });
        setToast({ open: true, message: 'Claims Officer created successfully.', severity: 'success' });
      }
      setOfficerModalOpen(false);
      fetchOfficers();
    } catch (err) {
      console.error('Save officer failed:', err);
      setToast({
        open: true,
        message: err.response?.data?.detail || 'Failed to save claims officer.',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = (o) => {
    setOfficerToToggle(o);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!officerToToggle) return;
    try {
      await adminService.updateClaimsOfficerStatus(officerToToggle.id, !officerToToggle.is_active);
      setToast({
        open: true,
        message: `Claims Officer ${officerToToggle.email} ${!officerToToggle.is_active ? 'activated' : 'deactivated'} successfully.`,
        severity: 'success',
      });
      setStatusConfirmOpen(false);
      fetchOfficers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Action failed.', severity: 'error' });
    }
  };

  const handleDeleteClick = (o) => {
    setOfficerToDelete(o);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!officerToDelete) return;
    try {
      await adminService.deleteClaimsOfficer(officerToDelete.id);
      setToast({ open: true, message: 'Claims Officer removed successfully.', severity: 'success' });
      setDeleteConfirmOpen(false);
      fetchOfficers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Delete failed.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            Claims Officers Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage Claims Officer personnel responsible for evaluating claim submissions and evidence.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, px: 2.5 }}
        >
          Add Claims Officer
        </Button>
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
                  placeholder="Search officer by name, email, or phone..."
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

      {/* Claims Officers Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>OFFICER NAME</TableCell>
                <TableCell>EMAIL & CONTACT</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>TOTAL REVIEWS</TableCell>
                <TableCell>APPROVED CLAIMS</TableCell>
                <TableCell>REJECTED CLAIMS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading claims officers..." />
                  </TableCell>
                </TableRow>
              ) : officers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No claims officers found.
                  </TableCell>
                </TableRow>
              ) : (
                officers.map((o) => (
                  <TableRow key={o.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {o.full_name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{o.email}</Typography>
                      {o.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {o.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={o.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={o.is_active ? 'success' : 'error'}
                        variant={o.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${o.reviews_count} Reviews`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'success.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircleIcon fontSize="small" color="success" />
                        {o.approved_count}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'error.main' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CancelIcon fontSize="small" color="error" />
                        {o.rejected_count}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Officer">
                        <IconButton size="small" onClick={() => handleOpenEditModal(o)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={o.is_active ? 'Deactivate Officer' : 'Activate Officer'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(o)}
                          color={o.is_active ? 'warning' : 'success'}
                        >
                          {o.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Officer">
                        <IconButton size="small" onClick={() => handleDeleteClick(o)} color="error">
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

      {/* Add / Edit Claims Officer Modal */}
      <Dialog
        open={officerModalOpen}
        onClose={() => setOfficerModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="700">
          {isEditing ? 'Edit Claims Officer Profile' : 'Register Claims Officer'}
        </DialogTitle>
        <form onSubmit={handleSaveOfficer}>
          <DialogContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Officer Full Name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  error={!!formErrors.full_name}
                  helperText={formErrors.full_name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={isEditing ? 'Password (leave blank to keep unchanged)' : 'Initial Password'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  required={!isEditing}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Officer Account Active & Authorized to Adjudicate Claims"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOfficerModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Save Changes' : 'Create Officer Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Claims Officer Account"
        message={`Are you sure you want to permanently delete officer "${officerToDelete?.full_name}" (${officerToDelete?.email})?`}
        confirmText="Delete Account"
        confirmColor="error"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={statusConfirmOpen}
        title={officerToToggle?.is_active ? 'Deactivate Officer Account' : 'Activate Officer Account'}
        message={`Are you sure you want to ${officerToToggle?.is_active ? 'deactivate' : 'activate'} officer "${officerToToggle?.email}"?`}
        confirmText={officerToToggle?.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={officerToToggle?.is_active ? 'warning' : 'success'}
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

export default ClaimsOfficers;
