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
import VisibilityIcon from '@mui/icons-material/Visibility';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import ConfirmDialog from '../../components/ConfirmDialog';

const ROLE_COLORS = {
  ADMIN: 'primary',
  CUSTOMER: 'info',
  AGENT: 'secondary',
  CLAIMS_OFFICER: 'warning',
};

const Users = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Dialogs
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER',
    is_active: true,
  });
  const [formErrors, setFormErrors] = useState({});

  // View details modal
  const [viewUser, setViewUser] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  // Delete & Status confirm
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState(null);

  // Notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page: page + 1,
        page_size: pageSize,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setToast({ open: true, message: 'Failed to load users list.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingUserId(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      password: '',
      role: 'CUSTOMER',
      is_active: true,
    });
    setFormErrors({});
    setUserModalOpen(true);
  };

  const handleOpenEditModal = (u) => {
    setIsEditing(true);
    setEditingUserId(u.id);
    setFormData({
      full_name: u.full_name,
      email: u.email,
      phone: u.phone || '',
      password: '',
      role: u.role,
      is_active: u.is_active,
    });
    setFormErrors({});
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
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
          role: formData.role,
          is_active: formData.is_active,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await adminService.updateUser(editingUserId, updatePayload);
        setToast({ open: true, message: 'User updated successfully.', severity: 'success' });
      } else {
        await adminService.createUser({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active,
        });
        setToast({ open: true, message: 'User created successfully.', severity: 'success' });
      }
      setUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Save user failed:', err);
      setToast({
        open: true,
        message: err.response?.data?.detail || 'Failed to save user.',
        severity: 'error',
      });
    }
  };

  const handleToggleStatus = (u) => {
    if (u.id === currentAdmin?.id) {
      setToast({ open: true, message: 'You cannot deactivate your own account.', severity: 'warning' });
      return;
    }
    setUserToToggle(u);
    setStatusConfirmOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;
    try {
      await adminService.updateUserStatus(userToToggle.id, !userToToggle.is_active);
      setToast({
        open: true,
        message: `User ${userToToggle.email} ${!userToToggle.is_active ? 'activated' : 'deactivated'} successfully.`,
        severity: 'success',
      });
      setStatusConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Action failed.', severity: 'error' });
    }
  };

  const handleDeleteClick = (u) => {
    if (u.id === currentAdmin?.id) {
      setToast({ open: true, message: 'You cannot delete your own account.', severity: 'warning' });
      return;
    }
    setUserToDelete(u);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await adminService.deleteUser(userToDelete.id);
      setToast({ open: true, message: 'User account removed successfully.', severity: 'success' });
      setDeleteConfirmOpen(false);
      fetchUsers();
    } catch (err) {
      setToast({ open: true, message: err.response?.data?.detail || 'Delete failed.', severity: 'error' });
    }
  };

  const handleOpenView = (u) => {
    setViewUser(u);
    setViewModalOpen(true);
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            System Users Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create, inspect, modify roles, activate/deactivate, and manage all accounts across modules.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenCreateModal}
          sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, px: 2.5 }}
        >
          Add New User
        </Button>
      </Box>

      {/* Filter & Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, email, or phone..."
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
                  <InputLabel>Role Filter</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role Filter"
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="CUSTOMER">Customer</MenuItem>
                    <MenuItem value="AGENT">Agent</MenuItem>
                    <MenuItem value="CLAIMS_OFFICER">Claims Officer</MenuItem>
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
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
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

      {/* Users Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>NAME & CONTACT</TableCell>
                <TableCell>ROLE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>JOINED DATE</TableCell>
                <TableCell>STATS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading users..." />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No users matching the criteria found.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {u.id}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#0f172a' }}>
                        {u.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {u.email}
                      </Typography>
                      {u.phone && (
                        <Typography variant="caption" color="text.secondary">
                          {u.phone}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={ROLE_COLORS[u.role] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={u.is_active ? 'success' : 'error'}
                        variant={u.is_active ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem' }}>
                      {u.role === 'CUSTOMER' && `${u.policies_count} Policies | ${u.claims_count} Claims`}
                      {u.role === 'AGENT' && `${u.purchases_handled_count} Sales`}
                      {u.role === 'CLAIMS_OFFICER' && `${u.reviews_count} Reviews`}
                      {u.role === 'ADMIN' && 'System Access'}
                    </TableCell>
                    <TableCell align="right">
                      {currentAdmin && (currentAdmin.id === u.id || currentAdmin.email?.toLowerCase() === u.email?.toLowerCase()) ? (
                        <Chip
                          label="Current Admin"
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                        />
                      ) : (
                        <>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleOpenView(u)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" onClick={() => handleOpenEditModal(u)} color="primary">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={u.is_active ? 'Deactivate User' : 'Activate User'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(u)}
                              color={u.is_active ? 'warning' : 'success'}
                            >
                              {u.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton size="small" onClick={() => handleDeleteClick(u)} color="error">
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
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

      {/* Add / Edit User Modal */}
      <Dialog
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="700">
          {isEditing ? 'Edit User Profile' : 'Register New User Account'}
        </DialogTitle>
        <form onSubmit={handleSaveUser}>
          <DialogContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <MenuItem value="ADMIN">System Administrator</MenuItem>
                    <MenuItem value="CUSTOMER">Customer (Policyholder)</MenuItem>
                    <MenuItem value="AGENT">Insurance Agent</MenuItem>
                    <MenuItem value="CLAIMS_OFFICER">Claims Officer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={isEditing ? 'Password (leave blank to keep unchanged)' : 'Password'}
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
                  label="Account Active & Enabled"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setUserModalOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Save Changes' : 'Create Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View User Details Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle fontWeight="700">User Profile Details</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">FULL NAME</Typography>
                <Typography variant="body1" fontWeight="700">{viewUser.full_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">EMAIL ADDRESS</Typography>
                <Typography variant="body2">{viewUser.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">PHONE</Typography>
                <Typography variant="body2">{viewUser.phone || 'Not provided'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">ROLE</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewUser.role} size="small" color={ROLE_COLORS[viewUser.role] || 'default'} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">STATUS</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={viewUser.is_active ? 'Active' : 'Inactive'}
                    size="small"
                    color={viewUser.is_active ? 'success' : 'error'}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="600">CREATED DATE</Typography>
                <Typography variant="body2">{new Date(viewUser.created_at).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewModalOpen(false)} variant="contained" color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${userToDelete?.full_name}" (${userToDelete?.email})? All associated records will be removed.`}
        confirmText="Delete Account"
        confirmColor="error"
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirmOpen(false)}
      />

      {/* Status Toggle Confirmation */}
      <ConfirmDialog
        open={statusConfirmOpen}
        title={userToToggle?.is_active ? 'Deactivate User Account' : 'Activate User Account'}
        message={`Are you sure you want to ${userToToggle?.is_active ? 'deactivate' : 'activate'} user "${userToToggle?.email}"?`}
        confirmText={userToToggle?.is_active ? 'Deactivate' : 'Activate'}
        confirmColor={userToToggle?.is_active ? 'warning' : 'success'}
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

export default Users;
