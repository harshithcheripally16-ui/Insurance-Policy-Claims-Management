import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useParams, useNavigate, Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';

const BENEFITS_MAP = {
  HEALTH: [
    'Cashless hospitalization across 5,000+ network hospitals',
    'Comprehensive in-patient care with zero room rent limits',
    'Pre and post-hospitalization medical coverage up to 60 days',
    'Emergency ambulance service assistance 24/7',
  ],
  LIFE: [
    'Guaranteed lump-sum death benefit payout to nominated beneficiary',
    'Terminal illness early benefit acceleration clause',
    'Tax benefits under prevailing statutory provisions',
    'No-claim loyalty bonus accrual on annual renewals',
  ],
  VEHICLE: [
    'Comprehensive zero-depreciation coverage for accidental damages',
    'Third-party property damage and bodily injury indemnity',
    'Roadside assistance towing and spot breakdown repair',
    'Engine and gearbox hydrostatic lock protection addon',
  ],
  TRAVEL: [
    'Emergency medical repatriation and hospitalization abroad',
    'Trip cancellation and flight delay financial reimbursement',
    'Lost baggage and passport reissuance support',
    'Global multilingual emergency assistance hotline',
  ],
  HOME: [
    'Structure and content indemnity against fire, storm, and natural disasters',
    'Burglary, theft, and housebreaking loss compensation',
    'Temporary alternative accommodation expense allowance',
    'Public liability coverage for accidental third-party injury on premises',
  ],
};

const PolicyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await customerService.getPolicyDetails(id);
        setPolicy(res);
      } catch (err) {
        console.error('Failed to load policy details:', err);
        setError('Insurance plan not found or currently unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id]);

  if (loading) return <Loading message="Loading policy coverage specifications..." />;

  if (error || !policy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error || 'Policy not found.'}</Alert>
        <Button component={Link} to="/customer/policies" startIcon={<ArrowBackIcon />}>
          Back to Catalog
        </Button>
      </Box>
    );
  }

  const benefits = BENEFITS_MAP[policy.type] || [
    'Standard comprehensive coverage per policy specifications',
    'Direct claims adjudication with online document processing',
    'Dedicated customer support hotline',
  ];

  return (
    <Box sx={{ pb: 4, maxWidth: 1000, mx: 'auto' }}>
      {/* Back button */}
      <Button
        component={Link}
        to="/customer/policies"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Policy Catalog
      </Button>

      {/* Main Details Card */}
      <Card sx={{ borderRadius: 3.5, mb: 3.5, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: { xs: 3, sm: 4 }, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box>
              <Chip
                icon={<VerifiedUserIcon fontSize="small" />}
                label={policy.type}
                color="primary"
                sx={{ fontWeight: 700, mb: 1 }}
              />
              <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
                {policy.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Policy Code: <strong>{policy.policy_number}</strong>
              </Typography>
            </Box>

            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography variant="caption" color="text.secondary" fontWeight="700" display="block">
                ANNUAL PREMIUM
              </Typography>
              <Typography variant="h3" fontWeight="800" color="primary.main">₹{policy.premium?.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Term duration: {policy.duration_months} Months
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle1" fontWeight="700" gutterBottom>
            Policy Overview & Protection Summary
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
            {policy.description || 'This insurance policy provides robust and dependable risk coverage for individuals and families against unexpected emergencies and financial liabilities.'}
          </Typography>

          <Grid container spacing={3}>
            {/* Key Benefits */}
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#0f172a', mb: 1.5 }}>
                Included Coverage & Plan Benefits
              </Typography>
              <List disablePadding>
                {benefits.map((benefit, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.8 }}>
                    <ListItemIcon sx={{ minWidth: 32, color: 'success.main' }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={benefit}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.primary', fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Terms & Action */}
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" fontWeight="800" gutterBottom>
                  Policy Specifications
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" color="text.secondary">Coverage Type</Typography>
                  <Typography variant="body2" fontWeight="700">{policy.type}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" color="text.secondary">Term Length</Typography>
                  <Typography variant="body2" fontWeight="700">{policy.duration_months} Months</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={policy.status} color="success" size="small" sx={{ height: 22, fontWeight: 700 }} />
                </Box>

                <Button
                  component={Link}
                  to={`/customer/policies/${policy.id}/purchase`}
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<ShoppingCartCheckoutIcon />}
                  sx={{ mt: 3, py: 1.3, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                >
                  Proceed to Purchase
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

export default PolicyDetails;
