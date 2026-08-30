import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider,
} from '@mui/material';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import officerService from '../../services/officerService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const STATUS_COLORS = { SUBMITTED: '#f59e0b', UNDER_REVIEW: '#0284c7', APPROVED: '#10b981', REJECTED: '#ef4444' };

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officerService.getMyReviews();
      setReviews(data || []);
    } catch (err) {
      setError('Failed to load review history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Review History</Typography>
        <Typography variant="body2" color="text.secondary">Your claim review activity and decisions.</Typography>
      </Box>

      {loading ? <Loading message="Loading reviews..." /> : error ? <ErrorMessage message={error} onRetry={fetchReviews} /> : reviews.length === 0 ? (
        <EmptyState icon={HistoryToggleOffIcon} title="No reviews yet" description="You have not reviewed any claims yet." />
      ) : (
        <Card>
          <TableContainer component={Paper} elevation={0}>
            <Table><TableHead><TableRow>
              <TableCell>CLAIM #</TableCell><TableCell>DECISION</TableCell><TableCell>REMARKS</TableCell><TableCell>REVIEW DATE</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {reviews.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/officer/claims/${r.claim_id}`)}>
                  <TableCell sx={{ fontWeight: 700, color: 'secondary.main' }}>Claim {r.claim_id}</TableCell>
                  <TableCell><Chip label={r.decision} size="small" sx={{ bgcolor: STATUS_COLORS[r.decision] + '20', color: STATUS_COLORS[r.decision], fontWeight: 700 }} /></TableCell>
                  <TableCell sx={{ maxWidth: 400 }}><Typography variant="body2" noWrap>{r.remarks}</Typography></TableCell>
                  <TableCell>{new Date(r.review_date).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default Reviews;
