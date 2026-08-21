import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert, TableContainer
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleIcon from '@mui/icons-material/People';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '', email: '', password: 'password123', role: 'CUSTOMER', phone: '', address: ''
  });
  const [msg, setMsg] = useState('');

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
  };

  const loadUsers = async () => {
    try {
      // Query strictly records where role is CUSTOMER
      const res = await api.get('/users?role=CUSTOMER');
      const rawData = Array.isArray(res.data) ? res.data : [];
      const sortedUsers = [...rawData].sort((a, b) => (a.id || 0) - (b.id || 0));
      setUsersList(sortedUsers);
    } catch (err) {
      console.error('Failed to load customers', err);
      setUsersList([]);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/users', newUser);
      setOpenModal(false);
      setNewUser({ full_name: '', email: '', password: 'password123', role: 'CUSTOMER', phone: '', address: '' });
      loadUsers();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to create customer profile');
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <PeopleIcon sx={{ color: '#ff5a00' }} /> Customer Directory ({usersList.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Inspect registered customer profiles, contact numbers, and account details.
          </Typography>
        </Box>

        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenModal(true)}
            sx={{ py: 1.2, px: 3, fontWeight: 800, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}
          >
            Create Customer Profile
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', borderRadius: 4, p: 2, bgcolor: 'background.paper', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Email Address</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Phone Number</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Registered Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">No customer records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              usersList.map((u, index) => (
                <TableRow key={u.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  {/* Sequential Auto-Reindexed ID starting from 1 */}
                  <TableCell sx={{ fontWeight: 800, color: 'secondary.main' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {u.full_name?.replace(/\s*\([^)]*\)/, '')}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{u.email}</TableCell>
                  <TableCell>
                    <Chip
                      label="CUSTOMER"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{u.phone || 'N/A'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.84rem' }}>
                    {formatDate(u.created_at)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* CREATE CUSTOMER DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, pt: 3, color: 'secondary.main' }}>Create Customer Account</DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent>
            {msg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>}
            <TextField
              fullWidth
              label="Full Name"
              value={newUser.full_name}
              onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              margin="dense"
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" sx={{ px: 3, bgcolor: '#ff5a00', '&:hover': { bgcolor: '#e65100' } }}>
              Create Customer
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
