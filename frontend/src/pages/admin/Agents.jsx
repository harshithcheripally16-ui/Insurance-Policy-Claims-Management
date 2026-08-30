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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState(null);
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
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [agentToToggle, setAgentToToggle] = useState(null);

  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAgents({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setAgents(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
      setToast({ open: true, message: 'Failed to load agents list.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, pageSize, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAgents();
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingAgentId(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      is_active: true,
    });
    setFormErrors({});
    setAgentModalOpen(true);
  };

  const handleOpenEditModal = (a) => {
    setIsEditing(true);
    setEditingAgentId(a.id);
    setFormData({
      full_name: a.full_name,
      email: a.email,
      phone: a.phone || '',
      password: '',
      is_active: a.is_active,
    });
    setFormErrors({});
    setAgentModalOpen(true);
  };

  const handleSaveAgent = async (e) => {
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
        await adminService.updateAgent(editingAgentId, updatePayload);
        setToast({ open: true, message: 'Agent updated successfully.', severity: 'success' });
      } else {
        await adminService.createAgent({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          is_active: formData.is_active,
        });
        setToast({ open: true, message: 'Agent account created successfully.', severity: 'success' });
      }
      setAgentModalOpen(false);
      fetchAgents();
    } catch (err) {
      console.error('Save agent failed:', err);
      setToast({
        open: true,
        message: err.response?.data?.detail || 'Failed to save agent.',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = (a) => {
    setAgentToToggle(a);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!agentToToggle) return;
    try {
      await adminService.updateAgentStatus(agentToToggle.id, !agentToToggle.is_active);
      setToast({
        open: true,
        message: `Agent ${agentToToggle.email} ${!agentToToggle.is_active ? 'activated' : 'deactivated'} successfully.`,
        severity: 'success',
      });
      setStatusConfirmOpen(false);
      fetchAgents();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Action failed.', severity: 'error' });
    }
  };

  const handleDeleteClick = (a) => {
    setAgentToDelete(a);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!agentToDelete) return;
    try {
      await adminService.deleteAgent(agentToDelete.id);
      setToast({ open: true, message: 'Agent account deleted successfully.', severity: 'success' });
      setDeleteConfirmOpen(false);
      fetchAgents();
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
            Insurance Agents Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create agent credentials, activate/deactivate accounts, and monitor sales performance.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, px: 2.5 }}
        >
          Create Agent Account
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
                  placeholder="Search agent by name, email, or phone..."
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

      {/* Agents Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>AGENT NAME</TableCell>
                <TableCell>EMAIL & CONTACT</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>POLICIES SOLD</TableCell>
                <TableCell>TOTAL REVENUE</TableCell>
                <TableCell>REGISTERED DATE</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading agents..." />
                  </TableCell>
                </TableRow>
              ) : agents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No insurance agents found.
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {a.full_name}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{a.email}</Typography>
                      {a.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {a.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={a.is_active ? 'success' : 'error'}
                        variant={a.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${a.purchases_handled_count} Policies`}
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'success.dark' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TrendingUpIcon fontSize="small" color="success" />₹{a.total_premium_generated?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Agent">
                        <IconButton size="small" onClick={() => handleOpenEditModal(a)} color="primary">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={a.is_active ? 'Deactivate Agent' : 'Activate Agent'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(a)}
                          color={a.is_active ? 'warning' : 'success'}
                        >
                          {a.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Agent">
                        <IconButton size="small" onClick={() => handleDeleteClick(a)} color="error">
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

      {/* Add / Edit Agent Modal */}
      <Dialog
        open={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="700">
          {isEditing ? 'Edit Agent Profile' : 'Create Insurance Agent Account'}
        </DialogTitle>
        <form onSubmit={handleSaveAgent}>
          <DialogContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Agent Full Name"
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
                  label="Agent Status Active & Authorized to Sell"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAgentModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Save Changes' : 'Create Agent Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Agent Account"
        message={`Are you sure you want to permanently delete agent "${agentToDelete?.full_name}" (${agentToDelete?.email})?`}
        confirmText="Delete Account"
        confirmColor="error"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={statusConfirmOpen}
        title={agentToToggle?.is_active ? 'Deactivate Agent Account' : 'Activate Agent Account'}
        message={`Are you sure you want to ${agentToToggle?.is_active ? 'deactivate' : 'activate'} agent "${agentToToggle?.email}"?`}
        confirmText={agentToToggle?.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={agentToToggle?.is_active ? 'warning' : 'success'}
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

export default Agents;
