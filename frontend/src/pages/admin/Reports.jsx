import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PolicyIcon from '@mui/icons-material/Policy';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AssignmentIcon from '@mui/icons-material/Assignment';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

import adminService from '../../services/adminService';
import StatCard from '../../components/StatCard';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Reports = () => {
  const [tab, setTab] = useState(0);

  const [claimReport, setClaimReport] = useState(null);
  const [policyReport, setPolicyReport] = useState(null);
  const [premiumReport, setPremiumReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const [cData, pData, prData] = await Promise.all([
        adminService.getClaimReports(),
        adminService.getPolicyReports(),
        adminService.getPremiumReports(),
      ]);
      setClaimReport(cData);
      setPolicyReport(pData);
      setPremiumReport(prData);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError('Unable to compile analytics reports from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const exportCSV = (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) => {
          return keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) {
    return <Loading message="Synthesizing multi-module analytics reports..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchReports} />;
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
            System Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Enterprise performance intelligence, claims distribution metrics, policy popularity, and revenue generation.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => {
            if (tab === 0) exportCSV('claims_report', claimReport?.claims_by_status || []);
            if (tab === 1) exportCSV('policies_report', policyReport?.popular_policies || []);
            if (tab === 2) exportCSV('premium_revenue_report', premiumReport?.revenue_by_policy_type || []);
          }}
        >
          Export CSV Report
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, newTab) => setTab(newTab)}
        sx={{
          mb: 3.5,
          borderBottom: '1px solid #e2e8f0',
          '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '0.95rem' },
        }}
      >
        <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Claims Analytics" />
        <Tab icon={<PolicyIcon fontSize="small" />} iconPosition="start" label="Policy Breakdown" />
        <Tab icon={<MonetizationOnIcon fontSize="small" />} iconPosition="start" label="Premium & Revenue" />
      </Tabs>

      {/* TAB 0: Claims Analytics */}
      {tab === 0 && (
        <Box>
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Total Claims Volume"
                value={claimReport?.total_claims || 0}
                icon={<AssignmentIcon />}
                color="info"
                subtitle="All filed cases"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Total Claimed Amount"
                value={`₹${claimReport?.total_claimed_amount?.toLocaleString() || '0'}`}
                icon={<AssessmentIcon />}
                color="warning"
                subtitle="Gross liabilities claimed"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Approved Settlement"
                value={`₹${claimReport?.total_approved_amount?.toLocaleString() || '0'}`}
                icon={<MonetizationOnIcon />}
                color="success"
                subtitle="Settled & paid payouts"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title={<Typography variant="h6" fontWeight="700">Claims Settlement by Stage</Typography>} />
                <Divider />
                <CardContent sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={claimReport?.claims_by_status || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name="Claims Count" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title={<Typography variant="h6" fontWeight="700">Monthly Claims Volume</Typography>} />
                <Divider />
                <CardContent sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={claimReport?.monthly_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="submitted_count" stroke="#3b82f6" name="Submitted" strokeWidth={2} />
                      <Line type="monotone" dataKey="approved_count" stroke="#10b981" name="Approved" strokeWidth={2} />
                      <Line type="monotone" dataKey="rejected_count" stroke="#ef4444" name="Rejected" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* TAB 1: Policy Breakdown */}
      {tab === 1 && (
        <Box>
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Catalog Policies"
                value={policyReport?.total_policies || 0}
                icon={<PolicyIcon />}
                color="primary"
                subtitle="Available plan designs"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Active Catalog Plans"
                value={policyReport?.active_policies || 0}
                icon={<PolicyIcon />}
                color="success"
                subtitle="Eligible for subscription"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                title="Inactive / Archived"
                value={policyReport?.inactive_policies || 0}
                icon={<PolicyIcon />}
                color="error"
                subtitle="Retired from market"
              />
            </Grid>
          </Grid>

          <Card sx={{ mb: 4 }}>
            <CardHeader
              title={<Typography variant="h6" fontWeight="700">Most Popular Policies by Purchase Volume</Typography>}
              subheader="Ranked ranking of insurance policies sold to customers"
            />
            <Divider />
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>POLICY NUMBER</TableCell>
                    <TableCell>PLAN NAME</TableCell>
                    <TableCell>CATEGORY</TableCell>
                    <TableCell>PREMIUM</TableCell>
                    <TableCell>PURCHASES COUNT</TableCell>
                    <TableCell>TOTAL REVENUE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policyReport?.popular_policies?.map((p, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{p.policy_number}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                      <TableCell><Chip label={p.type} size="small" variant="outlined" /></TableCell>
                      <TableCell>₹{p.premium?.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{p.purchases_count} Sold</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>₹{p.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      )}

      {/* TAB 2: Premium & Revenue */}
      {tab === 2 && (
        <Box>
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Total Premium Generated"
                value={`₹${premiumReport?.total_collected_premium?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`}
                icon={<MonetizationOnIcon />}
                color="success"
                subtitle="Gross premium collected across all sales"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="Top Agent Sales Force"
                value={`${premiumReport?.top_agents_by_revenue?.length || 0} Brokers`}
                icon={<AssessmentIcon />}
                color="primary"
                subtitle="Active broker distribution"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title={<Typography variant="h6" fontWeight="700">Revenue Breakdown by Policy Type</Typography>} />
                <Divider />
                <CardContent sx={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={premiumReport?.revenue_by_policy_type || []}
                        dataKey="total_revenue"
                        nameKey="policy_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => `${entry.policy_type}: ₹${entry.total_revenue.toLocaleString()}`}
                      >
                        {(premiumReport?.revenue_by_policy_type || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={6}>
              <Card sx={{ height: '100%' }}>
                <CardHeader title={<Typography variant="h6" fontWeight="700">Top Performing Agents</Typography>} />
                <Divider />
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>AGENT NAME</TableCell>
                        <TableCell>POLICIES SOLD</TableCell>
                        <TableCell>REVENUE GENERATED</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {premiumReport?.top_agents_by_revenue?.map((ag, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{ag.agent_name || `Agent ${ag.agent_id}`}</TableCell>
                          <TableCell>{ag.policies_sold}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>₹{ag.total_revenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Reports;
