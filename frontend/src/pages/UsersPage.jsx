import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Paper, Chip,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedIcon from '@mui/icons-material/Verified';

import api from '../services/api';

const UsersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCust, setNewCust] = useState({ name: '', email: '', phone: '', password: 'Password@123' });
  const [addMsg, setAddMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users/customers', {
        params: searchQuery ? { query: searchQuery } : {}
      });
      if (Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error("Failed to load customer directory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery]);

  const handleCreateCustomerSubmit = async () => {
    if (!newCust.name || !newCust.email) {
      setAddMsg({ type: 'error', text: 'Name and email are required' });
      return;
    }
    setSubmitting(true);
    setAddMsg({ type: '', text: '' });

    try {
      await api.post('/users/customers', newCust);
      setAddMsg({ type: 'success', text: 'Customer client account created successfully!' });
      setTimeout(() => {
        setAddModalOpen(false);
        setNewCust({ name: '', email: '', phone: '', password: 'Password@123' });
        fetchCustomers();
      }, 1200);
    } catch (err) {
      setAddMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to create customer' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#002970' }}>
            Customer Directory
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
            Verified Client Accounts (Reindexed dynamically starting from 1 with zero gaps).
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddModalOpen(true)}
          sx={{ fontWeight: 700, px: 3, py: 1.2 }}
        >
          Add Client Account
        </Button>
      </Box>

      {/* Search Bar */}
      <Card sx={{ p: 2, mb: 3, bgcolor: '#ffffff' }}>
        <TextField
          placeholder="Search client directory by customer name, email, or phone..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#002970' }} />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      {/* Customers Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 41, 112, 0.08)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#002970' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff', fontWeight: 700, width: 80 }}>Client #</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Customer Full Name</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Email Address</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Contact Phone</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Active Coverages</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Account Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress color="secondary" />
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="textSecondary">
                    No customer accounts found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              customers.map((cust) => (
                <TableRow key={cust.id} hover>
                  {/* Sequential Auto-Reindexed ID Column starting from 1 with zero gaps */}
                  <TableCell sx={{ fontWeight: 800, color: '#ff5a00' }}>
                    #{cust.display_id}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#002970' }}>
                    {cust.name}
                  </TableCell>
                  <TableCell sx={{ color: '#334155', fontWeight: 500 }}>{cust.email}</TableCell>
                  <TableCell sx={{ color: '#334155', fontWeight: 500 }}>{cust.phone || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#00a896' }}>
                    {cust.total_policies} Policies
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '13px !important' }} />}
                      label="VERIFIED CLIENT"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 800 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Client Account Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970', borderBottom: '1px solid #eee' }}>
          Create New Client Account
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {addMsg.text && (
            <Alert severity={addMsg.type || 'info'} sx={{ mb: 2 }}>
              {addMsg.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Customer Full Name"
              value={newCust.name}
              onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email Address"
              type="email"
              value={newCust.email}
              onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={newCust.phone}
              onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
              placeholder="+91 98765 43210"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddModalOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleCreateCustomerSubmit}
            variant="contained"
            color="secondary"
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersPage;
