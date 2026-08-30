import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Grid,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExploreIcon from '@mui/icons-material/Explore';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const MyPolicies = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      try {
        const res = await customerService.getMyPurchases();
        setPurchases(res || []);
      } catch (err) {
        console.error('Failed to load my policies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPurchases();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            My Insurance Subscriptions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Active and past policy coverage plans associated with your policyholder account.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/customer/policies"
          variant="contained"
          color="primary"
          startIcon={<ExploreIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          Explore More Plans
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Loading message="Loading your insurance subscriptions..." />
      ) : purchases.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <EmptyState
            title="No active insurance subscriptions"
            description="You have not purchased any insurance policies yet. Browse available plans and secure your coverage today."
            actionLabel="Browse Available Policies"
            onAction={() => window.location.href = '/customer/policies'}
          />
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>POLICY NAME & CODE</TableCell>
                  <TableCell>CATEGORY</TableCell>
                  <TableCell>ANNUAL PREMIUM</TableCell>
                  <TableCell>COVERAGE TIMELINE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" color="text.primary">
                        {p.policy_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.policy_number} • Subscription {p.id}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip label={p.type} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹{p.premium?.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                        {new Date(p.start_date).toLocaleDateString()} – {new Date(p.end_date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.duration_months} Months Term
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        color={p.status === 'ACTIVE' ? 'success' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          component={Link}
                          to={`/customer/policies/my/${p.id}`}
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityIcon />}
                          sx={{ textTransform: 'none', borderRadius: 1.5 }}
                        >
                          Details
                        </Button>
                        {p.status === 'ACTIVE' && (
                          <Button
                            component={Link}
                            to={`/customer/claims/new?purchase_id=${p.id}`}
                            variant="contained"
                            size="small"
                            color="warning"
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 700 }}
                          >
                            File Claim
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default MyPolicies;
