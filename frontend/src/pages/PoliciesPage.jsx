import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button,
  Chip, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PoliciesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [catalog, setCatalog] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
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
        catalog_id: selectedCatalog.id
      });
      setOpenPurchaseModal(false);
      setSelectedCatalog(null);
      setTab(1); // Switch to Purchased Policies tab
      loadData();
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Failed to purchase policy');
    }
  };

  const featureList = [
    'Cashless Claim Settlement Network',
    '24x7 Emergency Customer Support',
    'Instant Digital Policy Issuance',
    'Tax Savings Benefits under Section 80D/80C'
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Insurance Policy Center
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Browse available insurance coverage plans or view your active policies.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ mb: 4, borderRadius: 3, p: 0.5, bgcolor: '#ffffff' }}>
        <Tabs
          value={tab}
          onChange={(e, val) => setTab(val)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': { py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none' }
          }}
        >
          <Tab label="Explore Policy Catalog" />
          <Tab label={`My Active Policies (${policies.length})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: POLICY CATALOG */}
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
                    border: isPopular ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    boxShadow: isPopular ? '0 12px 30px -8px rgba(37, 99, 235, 0.2)' : undefined
                  }}
                >
                  {isPopular && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '14px !important', color: '#ffffff !important' }} />}
                      label="MOST POPULAR"
                      size="small"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        letterSpacing: '0.05em'
                      }}
                    />
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Chip
                        label={item.type}
                        size="small"
                        sx={{ bgcolor: '#eff6ff', color: '#1e3a8a', fontWeight: 700, borderRadius: 1.5 }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8' }}>
                        {item.code}
                      </Typography>
                    </Box>

                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
                      {item.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48, mb: 2, lineHeight: 1.5 }}>
                      {item.description}
                    </Typography>

                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, mb: 2, border: '1px solid #f1f5f9' }}>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                        Maximum Coverage Limit
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#059669', my: 0.5, letterSpacing: '-0.02em' }}>
                        ₹{item.max_coverage?.toLocaleString('en-IN')}
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
                        ₹{item.base_premium?.toLocaleString('en-IN')} <Typography component="span" variant="caption" color="text.secondary">/ year ({item.term_months} months term)</Typography>
                      </Typography>
                    </Box>

                    <List size="small" disablePadding>
                      {featureList.map((feat, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0.4 }}>
                          <ListItemIcon sx={{ minWidth: 24, color: '#10b981' }}>
                            <CheckCircleIcon sx={{ fontSize: 16 }} />
                          </ListItemIcon>
                          <ListItemText primary={feat} primaryTypographyProps={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant={isPopular ? 'contained' : 'outlined'}
                      color="primary"
                      size="large"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => { setSelectedCatalog(item); setOpenPurchaseModal(true); }}
                      sx={{ py: 1.2, fontWeight: 700 }}
                    >
                      Buy Insurance Plan
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* TAB 1: PURCHASED POLICIES */}
      {tab === 1 && (
        <TableContainer component={Paper} elevation={0} sx={{ overflowX: 'auto', borderRadius: 4, p: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policy Number</TableCell>
                <TableCell>Title & Type</TableCell>
                <TableCell>Coverage (₹)</TableCell>
                <TableCell>Premium (₹)</TableCell>
                <TableCell>Validity Term</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">No purchased policies found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                policies.map((p) => (
                  <TableRow key={p.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell sx={{ fontWeight: 800, color: '#1e3a8a' }}>{p.policy_number}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.type}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#059669' }}>
                      ₹{p.coverage_amount?.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>₹{p.premium?.toLocaleString('en-IN')}</TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                      {new Date(p.start_date).toLocaleDateString('en-IN')} - {new Date(p.end_date).toLocaleDateString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip label={p.status} color="success" size="small" sx={{ fontWeight: 700, borderRadius: 1.5 }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* PURCHASE CONFIRMATION MODAL */}
      <Dialog open={openPurchaseModal} onClose={() => setOpenPurchaseModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pt: 3 }}>Confirm Policy Purchase</DialogTitle>
        <DialogContent>
          {msg && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{msg}</Alert>}
          {selectedCatalog && (
            <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, mb: 2, border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ShieldIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e3a8a' }}>
                  {selectedCatalog.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {selectedCatalog.description}
              </Typography>
              <Box sx={{ pt: 1.5, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>Annual Premium:</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#059669' }}>
                  ₹{selectedCatalog.base_premium?.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            Policy coverage will be activated immediately upon confirmation.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenPurchaseModal(false)}>Cancel</Button>
          <Button onClick={handlePurchase} variant="contained" color="primary" startIcon={<CheckCircleIcon />} sx={{ px: 3 }}>
            Confirm & Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
