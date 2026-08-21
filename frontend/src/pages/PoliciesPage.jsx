import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, MenuItem,
  IconButton, Tooltip, InputAdornment, Grid, CircularProgress
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generatePolicyPDF } from '../utils/pdfGenerator';

export default function PoliciesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);

  // FILTER BAR STATE
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // EDIT Policy Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', coverage_amount: '', premium: '', status: 'ACTIVE', end_date: '' });

  // DELETE Policy Modal State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // SEND REMINDER Email & SMS State
  const [sendingReminderId, setSendingReminderId] = useState(null);
  const [sendingSmsId, setSendingSmsId] = useState(null);

  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSendReminder = async (policy) => {
    setSendingReminderId(policy.id);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/policies/${policy.id}/send-reminder`);
      const custEmail = policy.customer?.email || 'customer email';
      setMsg({ type: 'success', text: `Policy renewal reminder email successfully delivered to ${custEmail}!` });
      loadPolicies();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to send policy reminder email' });
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleSendSmsReminder = async (policy) => {
    setSendingSmsId(policy.id);
    setMsg({ type: '', text: '' });
    try {
      await api.post(`/policies/${policy.id}/send-sms-reminder`);
      const custPhone = policy.customer?.phone || '+91 98765 43210';
      setMsg({ type: 'success', text: `Phone SMS renewal reminder successfully delivered to ${custPhone}!` });
      loadPolicies();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to send phone SMS reminder' });
    } finally {
      setSendingSmsId(null);
    }
  };

  const loadPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load policies', err);
      setPolicies([]);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [user]);

  // Safe Date Helpers
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Edit Policy Details
  const handleOpenEdit = (policy) => {
    setEditingPolicy(policy);
    setEditForm({
      title: policy?.title || '',
      coverage_amount: policy?.coverage_amount || '',
      premium: policy?.premium || '',
      status: policy?.status || 'ACTIVE',
      end_date: policy?.end_date ? String(policy.end_date).split('T')[0] : ''
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

  // Filter Reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setStatusFilter('ALL');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Multi-criteria Filtering
  const safePolicies = Array.isArray(policies) ? policies : [];
  const filteredPolicies = safePolicies.filter(p => {
    if (!p) return false;
    // 1. Text Search
    const matchesSearch =
      (p.policy_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.customer?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category Filter
    const matchesCategory =
      categoryFilter === 'ALL' || (p.type || '').toUpperCase() === categoryFilter.toUpperCase();

    // 3. Status Filter
    const matchesStatus =
      statusFilter === 'ALL' || p.status === statusFilter;

    // 4. Start Date Range Filter
    const matchesStartDate =
      !startDateFilter || (p.start_date && new Date(p.start_date) >= new Date(startDateFilter));

    // 5. End Date Range Filter
    const matchesEndDate =
      !endDateFilter || (p.end_date && new Date(p.end_date) <= new Date(endDateFilter));

    return matchesSearch && matchesCategory && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const getStatusChip = (status) => {
    const map = {
      ACTIVE: { label: 'ACTIVE', color: 'success' },
      SUSPENDED: { label: 'SUSPENDED', color: 'warning' },
      EXPIRED: { label: 'EXPIRED', color: 'error' },
      CANCELLED: { label: 'CANCELLED', color: 'default' },
    };
    const s = map[status] || { label: status || 'UNKNOWN', color: 'default' };
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
            Inspect, edit details, filter parameters, and generate official policy certificates.
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

      {/* ADVANCED MULTI-FILTER BAR PANEL */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterAltIcon sx={{ color: '#ff5a00', fontSize: 22 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
            Filter & Search Policy Coverages
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          {/* Text Search */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search Policy #, Title, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Plan Category Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Plan Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              <MenuItem value="HEALTH">Health</MenuItem>
              <MenuItem value="AUTO">Auto</MenuItem>
              <MenuItem value="LIFE">Life</MenuItem>
              <MenuItem value="HOME">Home</MenuItem>
            </TextField>
          </Grid>

          {/* Policy Status Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Policy Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </TextField>
          </Grid>

          {/* Start Date Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Valid From"
              InputLabelProps={{ shrink: true }}
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
          </Grid>

          {/* End Date Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Valid Until"
              InputLabelProps={{ shrink: true }}
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </Grid>

          {/* Reset Filters */}
          <Grid item xs={12} md={1}>
            <Tooltip title="Reset All Active Filters">
              <Button
                fullWidth
                size="small"
                variant="outlined"
                color="secondary"
                onClick={handleResetFilters}
                sx={{ py: 0.9, minWidth: 0, fontWeight: 700 }}
              >
                <RestartAltIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* ACTIVE CUSTOMER POLICIES TABLE */}
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
              <TableCell>Last Reminder Sent</TableCell>
              <TableCell align="right">Manage</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No customer policy records match your filter criteria.</Typography>
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
                    {formatDate(p.start_date)} - {formatDate(p.end_date)}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(p.status)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>
                    {formatDateTime(p.last_reminder_sent) ? (
                      <Chip
                        label={formatDateTime(p.last_reminder_sent)}
                        size="small"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Not Sent Yet
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'flex-end' }}>
                      {/* Send Email Reminder Button */}
                      <Tooltip title="Send Policy Renewal Email Reminder">
                        <IconButton
                          size="small"
                          disabled={sendingReminderId === p.id}
                          sx={{ color: '#ff5a00', '&:hover': { bgcolor: 'rgba(255, 90, 0, 0.1)' } }}
                          onClick={() => handleSendReminder(p)}
                        >
                          {sendingReminderId === p.id ? <CircularProgress size={18} color="inherit" /> : <EmailIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      {/* Send Phone SMS Reminder Button */}
                      <Tooltip title="Send Phone SMS Renewal Reminder">
                        <IconButton
                          size="small"
                          disabled={sendingSmsId === p.id}
                          sx={{ color: '#0284c7', '&:hover': { bgcolor: 'rgba(2, 132, 199, 0.1)' } }}
                          onClick={() => handleSendSmsReminder(p)}
                        >
                          {sendingSmsId === p.id ? <CircularProgress size={18} color="inherit" /> : <SmsIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>

                      {/* One-Click PDF Generation Button */}
                      <Tooltip title="Download Policy Certificate (PDF)">
                        <IconButton
                          size="small"
                          sx={{ color: '#00a896', '&:hover': { bgcolor: 'rgba(0, 168, 150, 0.1)' } }}
                          onClick={() => generatePolicyPDF(p)}
                        >
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

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
