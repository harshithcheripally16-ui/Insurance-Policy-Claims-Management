import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
  Chip, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, MenuItem,
  IconButton, Tooltip, InputAdornment, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VerifiedIcon from '@mui/icons-material/Verified';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(1); // Default to Active Customer Policies
  const [catalog, setCatalog] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState('');

  // EDIT Policy Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', coverage_amount: '', premium: '', status: 'ACTIVE', end_date: '' });

  // DELETE Policy Modal State
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState(null);

  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      const [resCat, resPol, resCust] = await Promise.all([
        api.get('/policy-catalog'),
        api.get('/policies'),
        api.get('/users?role=CUSTOMER')
      ]);
      setCatalog(resCat.data);
      setPolicies(resPol.data);
      setCustomers(resCust.data);
      if (resCust.data.length > 0) {
        setTargetCustomerId(resCust.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Issue Policy for Customer
  const handlePurchase = async () => {
    if (!selectedCatalog || !targetCustomerId) return;
    setMsg({ type: '', text: '' });
    try {
      await api.post('/policies/purchase', {
        catalog_id: selectedCatalog.id,
        customer_id: parseInt(targetCustomerId)
      });
      setOpenPurchaseModal(false);
      setSelectedCatalog(null);
      setTab(1); // Switch to Active Customer Policies tab
      setMsg({ type: 'success', text: 'Policy successfully issued and assigned to customer!' });
      loadData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to issue policy' });
    }
  };

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
      setMsg({ type: 'success', text: `Policy ${editingPolicy.policy_number} details updated successfully!` });
      loadData();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update policy' });
    }
  };

  // Delete Policy
  const handleDeletePolicy = async () => {
    if (!deletingPolicy) return;
    setMsg({ type: '', text: '' });
    try {
      await api.delete(`/policies/${deletingPolicy.id}`);
      setOpenDeleteModal(false);
      setMsg({ type: 'success', text: `Policy ${deletingPolicy.policy_number} cancelled successfully!` });
      setDeletingPolicy(null);
      loadData();
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

  const featureList = [
    'Cashless Settlement at 10,000+ Network Hospitals',
    '24x7 Express Claims Assistance',
    'Instant Digital Policy Document Delivery',
    'Tax Benefits under Section 80D / 80C'
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.02em' }}>
            Customer Policy Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            View, issue, update, and manage policy coverages for your customers.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setTab(0)}
          sx={{ py: 1.2, px: 3, fontWeight: 800, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}
        >
          Issue New Policy
        </Button>
      </Box>

      {msg.text && (
        <Alert severity={msg.type || 'info'} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, p: 0.5, bgcolor: 'background.paper', borderColor: 'divider' }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': { py: 1.5, fontWeight: 800, borderRadius: 2, textTransform: 'none' }
          }}
        >
          <Tab label={`Active Customer Policies (${policies.length})`} value={1} />
          <Tab label="Available Insurance Plans" value={0} />
        </Tabs>
      </Paper>

      {/* TAB 1: ACTIVE CUSTOMER POLICIES TABLE */}
      {tab === 1 && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <TextField
              size="small"
              placeholder="Search by Policy Number, Title, or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 340 }}
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
      )}

      {/* TAB 0: POLICYBAZAAR STYLE AVAILABLE INSURANCE PLANS */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {catalog.map((item, index) => {
            const isPopular = index === 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    position: 'relative',
                    bgcolor: 'background.paper',
                    border: isPopular ? '2px solid #ff5a00' : '1.5px solid',
                    borderColor: isPopular ? '#ff5a00' : 'divider',
                    boxShadow: isPopular ? '0 12px 32px -6px rgba(255, 90, 0, 0.25)' : undefined
                  }}
                >
                  {isPopular && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
                      label="PB BESTSELLER"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        fontWeight: 900,
                        fontSize: '0.68rem',
                        letterSpacing: '0.05em',
                        bgcolor: '#ff5a00',
                        color: '#ffffff'
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Chip
                        label={item.type}
                        size="small"
                        sx={{ bgcolor: 'action.selected', color: 'secondary.main', fontWeight: 800, borderRadius: 1.5 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        {item.code}
                      </Typography>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'secondary.main', mb: 1 }}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, mb: 2, lineHeight: 1.5, fontWeight: 500 }}>
                      {item.description}
                    </Typography>

                    {/* Policybazaar Pricing Box */}
                    <Box sx={{ p: 2.2, bgcolor: (theme) => theme.palette.mode === 'dark' ? '#14223d' : '#f4f7fa', borderRadius: 3, mb: 2.5, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, uppercase: true }}>
                        Maximum Coverage Limit
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 900, color: '#00a896', my: 0.5, letterSpacing: '-0.02em' }}>
                        ₹{item.max_coverage?.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                        ₹{item.base_premium?.toLocaleString('en-IN')} <Typography component="span" variant="caption" color="text.secondary">/ year ({item.term_months} months term)</Typography>
                      </Typography>
                    </Box>

                    <List size="small" disablePadding>
                      {featureList.map((feat, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.4 }}>
                          <ListItemIcon sx={{ minWidth: 24, color: '#00a896' }}>
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText primary={feat} primaryTypographyProps={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 600 }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => { setSelectedCatalog(item); setOpenPurchaseModal(true); }}
                      sx={{ py: 1.3, fontWeight: 800, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}
                    >
                      Issue Policy to Customer
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ISSUE NEW POLICY MODAL */}
      <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pt: 3, color: 'secondary.main' }}>Issue Policy for Customer</DialogTitle>
        <DialogContent>
          {selectedCatalog && (
            <Box sx={{ p: 2.5, bgcolor: 'action.hover', borderRadius: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShieldIcon sx={{ color: '#ff5a00' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                  {selectedCatalog.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                {selectedCatalog.description}
              </Typography>
              <Box sx={{ pt: 1.5, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>Annual Premium:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#00a896' }}>
                  ₹{selectedCatalog.base_premium?.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          )}

          <TextField
            select
            fullWidth
            label="Select Customer"
            value={targetCustomerId}
            onChange={(e) => setTargetCustomerId(e.target.value)}
            margin="normal"
            required
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.full_name?.replace(/\s*\([^)]*\)/, '')} ({c.email})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPurchaseModal(false)}>Cancel</Button>
          <Button onClick={handlePurchase} variant="contained" color="primary" startIcon={<CheckCircleIcon />} sx={{ px: 3, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}>
            Issue & Assign Policy
          </Button>
        </DialogActions>
      </Dialog>

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
