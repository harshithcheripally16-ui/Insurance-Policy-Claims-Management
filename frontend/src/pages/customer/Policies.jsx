import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  Pagination,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import customerService from '../../services/customerService';
import PolicyCard from '../../components/PolicyCard';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const CATEGORIES = ['ALL', 'HEALTH', 'LIFE', 'VEHICLE', 'TRAVEL', 'HOME'];

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPolicies = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        page_size: 9,
        search: search.trim() || undefined,
        type: category === 'ALL' ? undefined : category,
      };
      const res = await customerService.getPolicies(params);
      setPolicies(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      console.error('Failed to load policies:', err);
      setError('Unable to load insurance catalog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [page, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPolicies();
  };

  const totalPages = Math.ceil(total / 9);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Explore Insurance Plans
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Browse comprehensive coverage options tailored for health, life, auto, travel, and home protection.
        </Typography>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3.5, borderRadius: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={5}>
              <form onSubmit={handleSearchSubmit}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search policies by name, keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </form>
            </Grid>

            {/* Category Tabs */}
            <Grid item xs={12} md={7}>
              <Tabs
                value={category}
                onChange={(_, val) => {
                  setCategory(val);
                  setPage(1);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    minWidth: 'auto',
                    px: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                  },
                }}
              >
                {CATEGORIES.map((cat) => (
                  <Tab key={cat} label={cat === 'ALL' ? 'All Categories' : cat} value={cat} />
                ))}
              </Tabs>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Policy Cards Grid */}
      {loading ? (
        <Loading message="Fetching insurance plans..." />
      ) : policies.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <EmptyState
            title="No insurance plans match your criteria"
            description="Try adjusting your search terms or selecting a different category."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setCategory('ALL');
              setPage(1);
            }}
          />
        </Card>
      ) : (
        <>
          <Grid container spacing={3}>
            {policies.map((policy) => (
              <Grid item xs={12} sm={6} lg={4} key={policy.id}>
                <PolicyCard policy={policy} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Policies;
