import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
  Chip, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,

  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [targetCustomer, setTargetCustomer] = useState('');
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    try {
      const [resCat, resPol] = await Promise.all([
        api.get('/policy-catalog'),
        api.get('/policies')
      ]);
      setCatalog(resCat.data);
      setPolicies(resPol.data);

      if (user?.role === 'AGENT' || user?.role === 'ADMIN') {
        const resCust = await api.get('/users?role=CUSTOMER');
        setCustomers(resCust.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handlePurchase = async () => {
    if (!selectedCatalog) return;
    setMsg('');
    try {
      await api.post('/policies/purchase', {
        catalog_id: selectedCatalog.id,
        customer_id: targetCustomer ? parseInt(targetCustomer) : undefined
      });
      setOpenPurchaseModal(false);
      setSelectedCatalog(null);
      setTargetCustomer('');
      setTab(1); // Switch to Purchased Policies tab
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to purchase policy');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e3a8a', mb: 1 }}>
        Policy Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Browse available insurance products or view active customer policies.
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(e, val) => setTab(val)} indicatorColor="primary" textColor="primary">
          <Tab label="Available Policy Catalog" sx={{ fontWeight: 700 }} />
          <Tab label={`Purchased Policies (${policies.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: POLICY CATALOG */}
      {tab === 0 && (
        <Grid container spacing={3}>
          {catalog.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={item.type} color="primary" size="small" />
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                      {item.code}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 700, mt: 1, color: '#0f172a' }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 48 }}>
                    {item.description}
                  </Typography>

                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Max Coverage
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
                      ₹{item.max_coverage?.toLocaleString('en-IN')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e3a8a', mt: 0.5 }}>
                      ₹{item.base_premium?.toLocaleString('en-IN')} / year ({item.term_months} mos)
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<ShoppingCartIcon />}
                    onClick={() => { setSelectedCatalog(item); setOpenPurchaseModal(true); }}
                  >
                    Purchase Policy
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* TAB 1: PURCHASED POLICIES */}
      {tab === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>

              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Policy Number</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title & Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Coverage (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Premium (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{p.policy_number}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.type}</Typography>
                  </TableCell>
                  <TableCell>{p.customer?.full_name || 'N/A'}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#059669' }}>
                    ₹{p.coverage_amount?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>₹{p.premium?.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{new Date(p.end_date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color="success" size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PURCHASE MODAL */}
      <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Policy Purchase</DialogTitle>
        <DialogContent>
          {msg && <Alert severity="error" sx={{ mb: 2 }}>{msg}</Alert>}
          {selectedCatalog && (
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                {selectedCatalog.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Base Premium: ₹{selectedCatalog.base_premium?.toLocaleString('en-IN')}/yr | Coverage: ₹{selectedCatalog.max_coverage?.toLocaleString('en-IN')}
              </Typography>
            </Box>
          )}

          {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
            <TextField
              select
              fullWidth
              label="Select Customer to Assign Policy"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              margin="normal"
              required
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPurchaseModal(false)}>Cancel</Button>
          <Button onClick={handlePurchase} variant="contained" startIcon={<CheckCircleIcon />}>
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
