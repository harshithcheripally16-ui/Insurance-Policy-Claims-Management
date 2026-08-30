import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import SecurityIcon from '@mui/icons-material/Security';
import { useParams, useNavigate, Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';

const PurchasePolicy = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [purchasedRecord, setPurchasedRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      try {
        const res = await customerService.getPolicyDetails(id);
        setPolicy(res);
      } catch (err) {
        console.error('Failed to load policy for purchase:', err);
        setError('Insurance plan not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, [id]);

  const handleConfirmPurchase = async () => {
    if (!agreed) {
      setError('Please acknowledge the terms and conditions before confirming your purchase.');
      return;
    }

    setPurchasing(true);
    setError('');
    try {
      const res = await customerService.purchasePolicy(policy.id);
      setPurchasedRecord(res);
      setSuccess(true);
    } catch (err) {
      console.error('Purchase failed:', err);
      setError(err.response?.data?.detail || 'Failed to complete policy purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <Loading message="Preparing policy subscription checkout..." />;

  if (success) {
    return (
      <Box sx={{ pb: 4, maxWidth: 680, mx: 'auto', textAlign: 'center', pt: 4 }}>
        <Card sx={{ borderRadius: 4, p: { xs: 3, sm: 5 }, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: '#dcfce7',
              color: 'success.main',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }} gutterBottom>
            Policy Purchase Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You have successfully subscribed to <strong>{purchasedRecord?.policy_name}</strong>. Your policy coverage is active immediately.
          </Typography>

          <Box sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 3, mb: 4, textAlign: 'left', border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" fontWeight="700" gutterBottom>
              Subscription Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Policy Plan: <strong>{purchasedRecord?.policy_name} ({purchasedRecord?.policy_number})</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Premium Paid: <strong>₹{purchasedRecord?.premium?.toLocaleString()}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Effective Until: <strong>{new Date(purchasedRecord?.end_date).toLocaleDateString()}</strong>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              component={Link}
              to="/customer/policies/my"
              variant="contained"
              color="primary"
              sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              View My Subscriptions
            </Button>
            <Button
              component={Link}
              to="/customer/dashboard"
              variant="outlined"
              sx={{ px: 3, py: 1.2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  if (error && !policy) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button component={Link} to="/customer/policies" startIcon={<ArrowBackIcon />}>
          Back to Catalog
        </Button>
      </Box>
    );
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + (policy?.duration_months || 12));

  return (
    <Box sx={{ pb: 4, maxWidth: 800, mx: 'auto' }}>
      <Button
        component={Link}
        to={`/customer/policies/${policy.id}`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3, textTransform: 'none', fontWeight: 600 }}
      >
        Back to Plan Overview
      </Button>

      <Card sx={{ borderRadius: 3.5, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.06)' }}>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0f172a' }}>
              Confirm Insurance Subscription
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please review the policy coverage specifications and payment term before confirming.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Breakdown Table */}
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mb: 3.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">SELECTED POLICY</Typography>
                <Typography variant="subtitle1" fontWeight="800">{policy.name}</Typography>
                <Typography variant="caption" color="text.secondary">Code: {policy.policy_number}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">CATEGORY</Typography>
                <Typography variant="subtitle1" fontWeight="800">{policy.type}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">START DATE</Typography>
                <Typography variant="body2" fontWeight="600">{startDate.toLocaleDateString()}</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">EXPIRATION DATE</Typography>
                <Typography variant="body2" fontWeight="600">{endDate.toLocaleDateString()}</Typography>
              </Grid>

              <Grid item xs={12}><Divider /></Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">COVERAGE TERM</Typography>
                <Typography variant="body2" fontWeight="600">{policy.duration_months} Months</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">TOTAL PREMIUM DUE</Typography>
                <Typography variant="h5" fontWeight="800" color="primary.main">₹{policy.premium?.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Terms checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                I acknowledge that I have reviewed the terms of coverage and agree to activate this policy subscription under SecureCare insurance terms.
              </Typography>
            }
            sx={{ mb: 3, alignItems: 'flex-start' }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            disabled={purchasing || !agreed}
            onClick={handleConfirmPurchase}
            startIcon={<ShoppingCartCheckoutIcon />}
            sx={{ py: 1.4, borderRadius: 2, fontWeight: 800, textTransform: 'none', fontSize: '1rem' }}
          >
            {purchasing ? 'Processing Subscription...' : `Confirm & Activate Coverage (₹${policy.premium?.toLocaleString()})`}
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default PurchasePolicy;
