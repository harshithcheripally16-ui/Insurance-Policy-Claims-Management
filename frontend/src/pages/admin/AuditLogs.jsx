import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  Grid,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const ACTION_COLORS = {
  SYSTEM_INIT: 'default',
  CREATE_USER: 'primary',
  UPDATE_USER: 'info',
  ACTIVATE_USER: 'success',
  DEACTIVATE_USER: 'warning',
  DELETE_USER: 'error',
  CREATE_POLICY: 'primary',
  UPDATE_POLICY: 'info',
  ACTIVATE_POLICY: 'success',
  DEACTIVATE_POLICY: 'warning',
  DELETE_POLICY: 'error',
  CREATE_AGENT: 'secondary',
  UPDATE_AGENT: 'info',
  ACTIVATE_AGENT: 'success',
  DEACTIVATE_AGENT: 'warning',
  DELETE_AGENT: 'error',
  CREATE_CLAIMS_OFFICER: 'warning',
  UPDATE_CLAIMS_OFFICER: 'info',
  ACTIVATE_CLAIMS_OFFICER: 'success',
  DEACTIVATE_CLAIMS_OFFICER: 'warning',
  DELETE_CLAIMS_OFFICER: 'error',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [actionSearch, setActionSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs({
        page: page + 1,
        page_size: pageSize,
        action: actionSearch.trim() || undefined,
      });
      setLogs(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchAuditLogs();
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          System Audit Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Immutable compliance record of administrative operations, policy changes, and account activations.
        </Typography>
      </Box>

      {/* Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter by action (e.g. CREATE_USER, DEACTIVATE_POLICY)..."
                  value={actionSearch}
                  onChange={(e) => setActionSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button fullWidth type="submit" variant="outlined" color="primary">
                  Filter Logs
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>LOG ID</TableCell>
                <TableCell>TIMESTAMP</TableCell>
                <TableCell>ADMINISTRATOR</TableCell>
                <TableCell>ACTION TYPE</TableCell>
                <TableCell>TARGET TYPE</TableCell>
                <TableCell>DETAILS / AUDIT TRAIL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading audit trails..." />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {log.id}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {log.admin_name || 'System Auto'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.action}
                        size="small"
                        color={ACTION_COLORS[log.action] || 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={log.target_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: '#334155' }}>
                      {log.details || 'Action completed successfully'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 15, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
};

export default AuditLogs;
