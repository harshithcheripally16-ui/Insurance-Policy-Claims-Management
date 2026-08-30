import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link } from 'react-router-dom';

import customerService from '../../services/customerService';
import ClaimStatusChip from '../../components/ClaimStatusChip';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await customerService.getMyClaims();
        setClaims(res || []);
      } catch (err) {
        console.error('Failed to fetch claims:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            My Insurance Claims
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Submit, monitor, and track adjudication progress for all your insurance claims.
          </Typography>
        </Box>
        <Button
          component={Link}
          to="/customer/claims/new"
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          File a New Claim
        </Button>
      </Box>

      {/* Content */}
      {loading ? (
        <Loading message="Loading your insurance claims history..." />
      ) : claims.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <EmptyState
            title="No claims filed yet"
            description="You have not filed any insurance claims. If an emergency or loss event has occurred on an active policy, submit a claim online."
            actionLabel="File a New Claim"
            onAction={() => window.location.href = '/customer/claims/new'}
          />
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>CLAIM NUMBER</TableCell>
                  <TableCell>POLICY NAME & CODE</TableCell>
                  <TableCell>CLAIM AMOUNT</TableCell>
                  <TableCell>INCIDENT DATE</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="right">ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {c.claim_number}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight="600">
                        {c.policy_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {c.policy_number}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹{c.amount?.toLocaleString()}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {new Date(c.claim_date).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <ClaimStatusChip status={c.status} />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        component={Link}
                        to={`/customer/claims/${c.id}`}
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Track Progress
                      </Button>
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

export default Claims;
