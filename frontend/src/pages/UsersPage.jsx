import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
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

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      const sortedUsers = [...res.data].sort((a, b) => a.id - b.id);
      setUsersList(sortedUsers);
    } catch (err) {
      console.error(err);
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
      setMsg(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const roleColors = {
    ADMIN: 'error',
    CLAIMS_OFFICER: 'warning',
    AGENT: 'info',
    CUSTOMER: 'success'
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
            User Management Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspect platform users, roles, and create new customer or agent accounts.
          </Typography>
        </Box>
        {user?.role === 'ADMIN' && (
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenModal(true)}
          >
            Create New User
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Registered Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersList.map((u) => (
              <TableRow key={u.id}>
                <TableCell sx={{ fontWeight: 700 }}>{u.id}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{u.full_name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Chip
                    label={u.role.replace('_', ' ')}
                    color={roleColors[u.role] || 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{u.phone || 'N/A'}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* CREATE USER DIALOG */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New User Account</DialogTitle>
        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent>
            {msg && <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>}
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
              select
              fullWidth
              label="User Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              margin="dense"
            >
              <MenuItem value="CUSTOMER">Customer</MenuItem>
              <MenuItem value="AGENT">Insurance Agent</MenuItem>
              <MenuItem value="CLAIMS_OFFICER">Claims Officer</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create User</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
