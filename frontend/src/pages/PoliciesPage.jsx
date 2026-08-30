import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, TextField, MenuItem, Select,
  FormControl, InputLabel, IconButton, Alert, CircularProgress, Tooltip,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import api from '../services/api';
import { generatePolicyCertificatePDF } from '../utils/pdfGenerator';

const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Multi-Filter Bar state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [alertInfo, setAlertInfo] = useState({ type: '', text: '' });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // CRUD state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.query = query;
      if (category) params.category = category;
      if (statusFilter) params.status = statusFilter;
      if (validFrom) params.valid_from = validFrom;
      if (validUntil) params.valid_until = validUntil;

      const res = await api.get('/policies', { params });
      if (Array.isArray(res.data)) {
        setPolicies(res.data);
      }
    } catch (err) {
      console.error("Failed to load policies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [query, category, statusFilter, validFrom, validUntil]);

  const handleResetFilters = () => {
    setQuery('');
    setCategory('');
    setStatusFilter('');
    setValidFrom('');
    setValidUntil('');
  };

  const handleSendEmailReminder = async (policyId) => {
    setActionLoadingId(policyId);
    setAlertInfo({ type: '', text: '' });
    try {
      const res = await api.post(`/policies/${policyId}/send-email-reminder`);
      setAlertInfo({ type: 'success', text: res.data.message });
      await fetchPolicies();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.response?.data?.detail || 'Failed to dispatch email reminder' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendSmsReminder = async (policyId) => {
    setActionLoadingId(policyId);
    setAlertInfo({ type: '', text: '' });
    try {
      const res = await api.post(`/policies/${policyId}/send-sms-reminder`);
      setAlertInfo({ type: 'success', text: res.data.message });
      await fetchPolicies();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.response?.data?.detail || 'Failed to dispatch SMS reminder' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenEdit = (policy) => {
    setEditingPolicy({ 
      ...policy, 
      valid_until: policy.valid_until ? policy.valid_until.split('T')[0] : '' 
    });
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingPolicy(null);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/policies/${editingPolicy.id}`, {
        title: editingPolicy.title,
        premium_amount: editingPolicy.premium_amount,
        coverage_amount: editingPolicy.coverage_amount,
        status: editingPolicy.status,
        valid_until: editingPolicy.valid_until ? new Date(editingPolicy.valid_until).toISOString() : null,
      });
      setAlertInfo({ type: 'success', text: 'Policy updated successfully' });
      handleCloseEdit();
      fetchPolicies();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.response?.data?.detail || 'Failed to update policy' });
    }
  };

  const handleOpenDelete = (policy) => {
    setPolicyToDelete(policy);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setPolicyToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/policies/${policyToDelete.id}`);
      setAlertInfo({ type: 'success', text: 'Policy deleted successfully' });
      handleCloseDelete();
      fetchPolicies();
    } catch (err) {
      setAlertInfo({ type: 'error', text: err.response?.data?.detail || 'Failed to delete policy' });
    }
  };

  const formatReminderTimestamp = (timestamp) => {
    if (!timestamp) return 'Not Sent Yet';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Not Sent Yet';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusChip = (st) => {
    switch (st) {
      case 'ACTIVE':
        return <Chip label="ACTIVE" color="success" size="small" sx={{ fontWeight: 800 }} />;
      case 'SUSPENDED':
        return <Chip label="SUSPENDED" color="warning" size="small" sx={{ fontWeight: 800 }} />;
      case 'EXPIRED':
        return <Chip label="EXPIRED" color="error" size="small" sx={{ fontWeight: 800 }} />;
      case 'CANCELLED':
        return <Chip label="CANCELLED" color="default" size="small" sx={{ fontWeight: 800 }} />;
      default:
        return <Chip label={st} size="small" />;
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#002970' }}>
          Customer Policies Portfolio
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
          Manage issued client coverages, run multi-criteria queries, and send 1-click renewal reminders.
        </Typography>
      </Box>

      {alertInfo.text && (
        <Alert severity={alertInfo.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlertInfo({ type: '', text: '' })}>
          {alertInfo.text}
        </Alert>
      )}

      {/* Advanced Multi-Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3, bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterListIcon sx={{ color: '#002970' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#002970' }}>
            Advanced Multi-Filter Controls
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search Policy #, Title, or Customer..."
            variant="outlined"
            size="small"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 240, flexGrow: 1 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#002970', mr: 1, fontSize: 20 }} />,
            }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Auto">Auto</MenuItem>
              <MenuItem value="Life">Life</MenuItem>
              <MenuItem value="Home">Home</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Coverage Status</InputLabel>
            <Select value={statusFilter} label="Coverage Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem>
              <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
              <MenuItem value="EXPIRED">EXPIRED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Valid From (After)"
            type="date"
            size="small"
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <TextField
            label="Valid Until (Before)"
            type="date"
            size="small"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />

          <Button
            variant="outlined"
            color="primary"
            startIcon={<RestartAltIcon />}
            onClick={handleResetFilters}
            sx={{ fontWeight: 700, height: 40 }}
          >
            Reset
          </Button>
        </Box>
      </Card>

      {/* Customer Policies Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 41, 112, 0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#002970' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Policy #</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Coverage Title</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Customer Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Sum Insured (₹)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Premium (₹)</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Expiry Date</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Last Reminder</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="secondary" />
                </TableCell>
              </TableRow>
            ) : policies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    No active policy records match your search criteria.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              policies.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{ fontWeight: 800, color: '#002970' }}>{p.policy_number}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                    <Chip label={p.category} size="small" variant="outlined" sx={{ fontSize: '0.68rem', mt: 0.3 }} />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{p.customer_name || 'Customer'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#00a896' }}>
                    ₹ {p.coverage_amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#ff5a00' }}>
                    ₹ {p.premium_amount.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>{getStatusChip(p.status)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {p.valid_until ? new Date(p.valid_until).toLocaleDateString('en-IN') : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', color: p.last_reminder_sent ? '#002970' : '#888', fontWeight: 600 }}>
                    {formatReminderTimestamp(p.last_reminder_sent)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="Edit Policy">
                        <IconButton size="small" onClick={() => handleOpenEdit(p)} sx={{ bgcolor: 'rgba(0,41,112,0.06)' }}>
                          <EditIcon fontSize="small" sx={{ color: '#002970' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Policy">
                        <IconButton size="small" onClick={() => handleOpenDelete(p)} sx={{ bgcolor: 'rgba(211,47,47,0.06)' }}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email Reminder">
                        <IconButton color="primary" size="small" onClick={() => handleSendEmailReminder(p.id)} disabled={actionLoadingId === p.id} sx={{ bgcolor: 'rgba(0,41,112,0.06)' }}>
                          <EmailIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send SMS Reminder">
                        <IconButton color="secondary" size="small" onClick={() => handleSendSmsReminder(p.id)} disabled={actionLoadingId === p.id} sx={{ bgcolor: 'rgba(255,90,0,0.08)' }}>
                          <SmsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download Certificate">
                        <IconButton color="success" size="small" onClick={() => generatePolicyCertificatePDF(p)} sx={{ bgcolor: 'rgba(0,168,150,0.1)' }}>
                          <PictureAsPdfIcon fontSize="small" />
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

      {/* Edit Policy Modal */}
      <Dialog open={editModalOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#002970', pb: 1 }}>
          Edit Policy Details
          {editingPolicy?.customer_name && (
            <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              Customer: {editingPolicy.customer_name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {editingPolicy && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Coverage Title"
                fullWidth
                value={editingPolicy.title}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
              />
              <TextField
                label="Premium Amount (₹)"
                type="number"
                fullWidth
                value={editingPolicy.premium_amount}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, premium_amount: parseFloat(e.target.value) })}
              />
              <TextField
                label="Sum Insured / Coverage Amount (₹)"
                type="number"
                fullWidth
                value={editingPolicy.coverage_amount}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, coverage_amount: parseFloat(e.target.value) })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingPolicy.status}
                  label="Status"
                  onChange={(e) => setEditingPolicy({ ...editingPolicy, status: e.target.value })}
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="SUSPENDED">SUSPENDED</MenuItem>
                  <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Valid Until"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editingPolicy.valid_until}
                onChange={(e) => setEditingPolicy({ ...editingPolicy, valid_until: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseEdit} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained" sx={{ bgcolor: '#ff5a00', fontWeight: 700 }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete}>
        <DialogTitle sx={{ fontWeight: 800, color: '#d32f2f' }}>Delete Policy?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete policy 
            <strong style={{ marginLeft: 4 }}>{policyToDelete?.policy_number}</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDelete} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" sx={{ fontWeight: 700 }}>
            Delete Permanently
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PoliciesPage;
