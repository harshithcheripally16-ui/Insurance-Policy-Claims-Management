import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, MenuItem,
  IconButton, Tooltip, InputAdornment
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PoliciesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // EDIT Policy Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', coverage_amount: '', premium: '', status: 'ACTIVE', end_date: '' });

  // DELETE Policy Modal State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (err) {
      console.error('Failed to load policies', err);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [user]);

  // Edit Policy Details
  const handleOpenEdit = (policy) => {
    setEditingPolicy(policy);
    setEditForm({
      title: policy.title || '',
      coverage_amount: policy.coverage_amount || '',
      premium: policy.premium || '',
      status: policy.status || 'ACTIVE',
      end_date: policy.end_date ? policy.end_date.split('T')[0] : ''
    });
    setOpenEditModal(true);
  };

  const handleUpdatePolicy = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    const polNum = editingPolicy?.policy_number || '';
    try {
      await api.put(`/policies/${editingPolicy.id}`, {
        title: editForm.title,
        coverage_amount: parseFloat(editForm.coverage_amount),
        premium: parseFloat(editForm.premium),
        status: editForm.status,
        end_date: new Date(editForm.end_date).toISOString()
      });
      setOpenEditModal(false);
      setEditingPolicy(null);
      setMsg({ type: 'success', text: `Policy ${polNum} details updated successfully!` });
      loadPolicies();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update policy' });
    }
  };

  // Delete Policy
  const handleDeletePolicy = async () => {
    if (!deletingPolicy) return;
    const polNum = deletingPolicy?.policy_number || '';
    setMsg({ type: '', text: '' });
    try {
      await api.delete(`/policies/${deletingPolicy.id}`);
      setOpenDeleteModal(false);
      setDeletingPolicy(null);
      setMsg({ type: 'success', text: `Policy ${polNum} cancelled successfully!` });
      loadPolicies();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to cancel policy' });
    }
  };

  const filteredPolicies = policies.filter(p =>
    p.policy_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusChip = (status) => {
    const map = {
      ACTIVE: { label: 'ACTIVE', color: 'success' },
      SUSPENDED: { label: 'SUSPENDED', color: 'warning' },
      EXPIRED: { label: 'EXPIRED', color: 'error' },
      CANCELLED: { label: 'CANCELLED', color: 'default' },
    };
    const s = map[status] || { label: status, color: 'default' };
    return <Chip label={s.label} color={s.color} size="small" sx={{ fontWeight: 800, borderRadius: 1.5 }} />;
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <ShieldIcon sx={{ color: '#ff5a00' }} /> Customer Policies ({policies.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Inspect, edit details, and manage active policy coverages assigned to your customers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/policies/catalog')}
          sx={{ py: 1.2, px: 3, fontWeight: 800, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}
        >
          Issue New Policy
        </Button>
      </Box>

      {msg.text && (
        <Alert severity={msg.type || 'info'} sx={{ mb: 3.5, borderRadius: 2 }} onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      {/* ACTIVE CUSTOMER POLICIES TABLE */}
      <Box>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            size="small"
            placeholder="Search by Policy Number, Title, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', borderRadius: 4, p: 2, bgcolor: 'background.paper', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy Number</TableCell>
                <TableCell>Plan Title & Type</TableCell>
                <TableCell>Assigned Customer</TableCell>
                <TableCell>Coverage Amount (₹)</TableCell>
                <TableCell>Annual Premium (₹)</TableCell>
                <TableCell>Validity Term</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Manage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPolicies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No customer policy records found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPolicies.map((p) => (
                  <TableRow key={p.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ fontWeight: 800, color: 'secondary.main' }}>{p.policy_number}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.type}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      {p.customer?.full_name?.replace(/\s*\([^)]*\)/, '') || 'Customer'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>
                      ₹{p.coverage_amount?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>₹{p.premium?.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                      {new Date(p.start_date).toLocaleDateString('en-IN')} - {new Date(p.end_date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      {getStatusChip(p.status)}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit Policy Details">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(p)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cancel Policy Coverage">
                          <IconButton size="small" color="error" onClick={() => { setDeletingPolicy(p); setOpenDeleteModal(true); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* EDIT POLICY MODAL */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pt: 3, color: 'secondary.main' }}>Edit Policy Details</DialogTitle>
        <Box component="form" onSubmit={handleUpdatePolicy}>
          <DialogContent>
            {editingPolicy && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, fontWeight: 600 }}>
                Policy Number: <strong>{editingPolicy.policy_number}</strong> | Customer: <strong>{editingPolicy.customer?.full_name}</strong>
              </Typography>
            )}

            <TextField
              fullWidth
              label="Policy Title"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              type="number"
              label="Coverage Amount (₹)"
              value={editForm.coverage_amount}
              onChange={(e) => setEditForm({ ...editForm, coverage_amount: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              type="number"
              label="Annual Premium (₹)"
              value={editForm.premium}
              onChange={(e) => setEditForm({ ...editForm, premium: e.target.value })}
              margin="normal"
              required
            />

            <TextField
              select
              fullWidth
              label="Policy Status"
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              margin="normal"
              required
            >
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Expiration Date"
              InputLabelProps={{ shrink: true }}
              value={editForm.end_date}
              onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ px: 3, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}>
              Save Changes
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* CANCEL POLICY MODAL */}
      <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pt: 3, color: 'error.main' }}>Cancel Policy Coverage</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            Are you sure you want to cancel policy <strong>{deletingPolicy?.policy_number}</strong> ({deletingPolicy?.title})?
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This action will remove the customer policy coverage.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteModal(false)}>Cancel</Button>
          <Button onClick={handleDeletePolicy} variant="contained" color="error" sx={{ px: 3 }}>
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
