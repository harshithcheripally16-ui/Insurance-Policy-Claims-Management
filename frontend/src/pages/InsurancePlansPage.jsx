import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, MenuItem,
  List, ListItem, ListItemIcon, ListItemText, InputAdornment
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function InsurancePlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Purchase Modal State
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [openPurchaseModal, setOpenPurchaseModal] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadData = async () => {
    try {
      const [resCat, resCust] = await Promise.all([
        api.get('/policy-catalog'),
        api.get('/users?role=CUSTOMER')
      ]);
      const catList = Array.isArray(resCat.data) ? resCat.data : [];
      const custList = Array.isArray(resCust.data) ? resCust.data : [];
      setCatalog(catList);
      setCustomers(custList);
      if (custList.length > 0) {
        setTargetCustomerId(custList[0].id);
      }
    } catch (err) {
      console.error(err);
      setCatalog([]);
      setCustomers([]);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
      setMsg({ type: 'success', text: 'Policy successfully issued and assigned to customer!' });
      setTimeout(() => navigate('/policies'), 1200);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to issue policy' });
    }
  };

  const featureList = [
    'Cashless Settlement at 10,000+ Network Hospitals',
    '24x7 Express Claims Assistance',
    'Instant Digital Policy Document Delivery',
    'Tax Benefits under Section 80D / 80C'
  ];

  const safeCatalog = Array.isArray(catalog) ? catalog : [];
  const filteredCatalog = safeCatalog.filter(c =>
    c && (
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <CategoryIcon sx={{ color: '#ff5a00' }} /> Available Insurance Plans
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Browse available insurance plans and issue coverage policies directly to registered customers.
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search Insurance Plans..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {msg.text && (
        <Alert severity={msg.type || 'info'} sx={{ mb: 3.5, borderRadius: 2 }} onClose={() => setMsg({ type: '', text: '' })}>
          {msg.text}
        </Alert>
      )}

      {/* Insurance Plans Grid */}
      <Grid container spacing={3}>
        {filteredCatalog.map((item, index) => {
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
                {c.full_name?.replace(/\s*\([^)]*\)/, '')}
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
    </Box>
  );
}
