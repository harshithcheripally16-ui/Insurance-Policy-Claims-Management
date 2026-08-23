import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, Chip, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import AddTaskIcon from '@mui/icons-material/AddTask';

import api from '../services/api';

const InsurancePlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Issue Policy Modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [tenureYears, setTenureYears] = useState(1);
  const [issueMsg, setIssueMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalogAndCustomers = async () => {
    setLoading(true);
    try {
      const [plansRes, custRes] = await Promise.all([
        api.get('/policies/catalog'),
        api.get('/users/customers')
      ]);

      if (Array.isArray(plansRes.data)) setPlans(plansRes.data);
      if (Array.isArray(custRes.data)) setCustomers(custRes.data);
    } catch (err) {
      console.error("Failed to load catalog or customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogAndCustomers();
  }, []);

  const handleOpenIssueModal = (plan) => {
    setSelectedPlan(plan);
    setSelectedCustomerId('');
    setTenureYears(1);
    setIssueMsg({ type: '', text: '' });
    setIssueModalOpen(true);
  };

  const handleIssuePolicySubmit = async () => {
    if (!selectedCustomerId) {
      setIssueMsg({ type: 'error', text: 'Please select a customer' });
      return;
    }

    setSubmitting(true);
    setIssueMsg({ type: '', text: '' });

    try {
      const res = await api.post('/policies/issue', {
        catalog_id: selectedPlan.id,
        customer_id: Number(selectedCustomerId),
        tenure_years: tenureYears
      });

      setIssueMsg({
        type: 'success',
        text: `Policy #${res.data.policy_number} issued successfully to ${res.data.customer_name}!`
      });

      setTimeout(() => {
        setIssueModalOpen(false);
      }, 1800);
    } catch (err) {
      setIssueMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to issue policy'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const matchesCat = selectedCategory === 'ALL' || plan.category === selectedCategory;
    const matchesSearch = plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <Box sx={{ pb: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#002970' }}>
          Insurance Plans Catalog
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 0.5 }}>
          Explore featured insurance coverages, bestseller plans, and issue coverage to client accounts.
        </Typography>
      </Box>

      {/* Filter & Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4, alignItems: 'center' }}>
        <TextField
          placeholder="Search insurance plans by title or features..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flexGrow: 1, minWidth: 280, bgcolor: '#fff', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#002970' }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['ALL', 'Health', 'Auto', 'Life', 'Home'].map((cat) => (
            <Chip
              key={cat}
              label={cat === 'ALL' ? 'All Plan Categories' : `${cat} Insurance`}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                px: 1.5,
                py: 2.2,
                borderRadius: 2,
                bgcolor: selectedCategory === cat ? '#002970' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#002970',
                border: '1px solid rgba(0, 41, 112, 0.15)',
                '&:hover': {
                  bgcolor: selectedCategory === cat ? '#001848' : 'rgba(0, 41, 112, 0.05)',
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="secondary" />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPlans.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#fff', borderRadius: 3 }}>
                <Typography variant="h6" color="textSecondary">
                  No insurance plans found matching criteria.
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredPlans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0, 41, 112, 0.15)',
                    },
                  }}
                >
                  {plan.bestseller_tag && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        bgcolor: '#ff5a00',
                        color: '#fff',
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 1,
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        boxShadow: '0 2px 8px rgba(255,90,0,0.3)',
                      }}
                    >
                      <StarIcon sx={{ fontSize: 13 }} /> BESTSELLER
                    </Box>
                  )}

                  <CardContent sx={{ p: 3 }}>
                    <Chip
                      label={plan.category}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 168, 150, 0.1)',
                        color: '#00a896',
                        fontWeight: 700,
                        mb: 1.5,
                      }}
                    />

                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#002970', mb: 1 }}>
                      {plan.title}
                    </Typography>

                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5, minHeight: 40, lineHeight: 1.5 }}>
                      {plan.description}
                    </Typography>

                    {/* Features checklist */}
                    {plan.features && (
                      <Box sx={{ mb: 3 }}>
                        {plan.features.split(',').slice(0, 3).map((feat, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                            <CheckCircleOutlineIcon sx={{ color: '#00a896', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>
                              {feat.trim()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Coverage & Price Box */}
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'rgba(0, 41, 112, 0.03)',
                        borderRadius: 2,
                        border: '1px dashed rgba(0, 41, 112, 0.12)',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                          Coverage Guarantee
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#00a896' }}>
                          ₹ {plan.coverage_amount.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                          Annual Premium
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#ff5a00' }}>
                          ₹ {plan.base_premium.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<AddTaskIcon />}
                      onClick={() => handleOpenIssueModal(plan)}
                      sx={{ py: 1.2, fontWeight: 700 }}
                    >
                      Issue Policy to Customer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* "Issue Policy to Customer" Modal */}
      <Dialog open={issueModalOpen} onClose={() => setIssueModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#002970', borderBottom: '1px solid #eee' }}>
          Issue Policy - {selectedPlan?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {issueMsg.text && (
            <Alert severity={issueMsg.type || 'info'} sx={{ mb: 3 }}>
              {issueMsg.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            {/* Customer Dropdown - Strictly displaying ONLY customer full names */}
            <FormControl fullWidth required>
              <InputLabel id="customer-select-label">Select Customer (Client Account)</InputLabel>
              <Select
                labelId="customer-select-label"
                value={selectedCustomerId}
                label="Select Customer (Client Account)"
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                {customers.map((cust) => (
                  <MenuItem key={cust.id} value={cust.id}>
                    {/* Strictly show ONLY customer full name */}
                    <Typography sx={{ fontWeight: 600, color: '#002970' }}>
                      {cust.name}
                    </Typography>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Policy Coverage Tenure</InputLabel>
              <Select
                value={tenureYears}
                label="Policy Coverage Tenure"
                onChange={(e) => setTenureYears(e.target.value)}
              >
                <MenuItem value={1}>1 Year Standard Term</MenuItem>
                <MenuItem value={2}>2 Years Extended Protection (5% Savings)</MenuItem>
                <MenuItem value={3}>3 Years Comprehensive Shield (10% Savings)</MenuItem>
              </Select>
            </FormControl>

            {selectedPlan && (
              <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#002970', mb: 1 }}>
                  Policy Issuance Summary
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Sum Insured Limit: <strong>₹ {selectedPlan.coverage_amount.toLocaleString('en-IN')}</strong>
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Calculated Premium: <strong style={{ color: '#ff5a00' }}>₹ {(selectedPlan.base_premium * tenureYears).toLocaleString('en-IN')}</strong>
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setIssueModalOpen(false)} color="inherit">Cancel</Button>
          <Button
            onClick={handleIssuePolicySubmit}
            variant="contained"
            color="secondary"
            disabled={submitting}
            sx={{ fontWeight: 700, px: 3 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : 'Confirm & Issue Coverage'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsurancePlansPage;
