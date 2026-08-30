import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
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
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';

import adminService from '../../services/adminService';
import Loading from '../../components/Loading';

const Documents = () => {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [claimIdSearch, setClaimIdSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDocuments({
        page: page + 1,
        page_size: pageSize,
        claim_id: claimIdSearch ? parseInt(claimIdSearch, 10) : undefined,
      });
      setDocuments(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setToast({ open: true, message: 'Failed to load documents repository.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, pageSize]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchDocuments();
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const response = await adminService.getDocumentFileBlob(docId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setToast({ open: true, message: `Downloading ${fileName}`, severity: 'success' });
    } catch (err) {
      console.error('Download failed:', err);
      setToast({ open: true, message: 'Failed to retrieve file from secure storage.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          Document Repository Monitoring
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Centralized administrative archive of policyholder medical bills, accident reports, and diagnostic records.
        </Typography>
      </Box>

      {/* Filter by Claim ID */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Filter documents by Claim ID (e.g. 1, 2)..."
                  value={claimIdSearch}
                  onChange={(e) => setClaimIdSearch(e.target.value)}
                  type="number"
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
                  Filter by Claim
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>DOC ID</TableCell>
                <TableCell>FILE NAME</TableCell>
                <TableCell>ASSOCIATED CLAIM</TableCell>
                <TableCell>FILE TYPE</TableCell>
                <TableCell>UPLOAD DATE</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Loading message="Loading document repository..." />
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No claim documents found.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {doc.id}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight="700">
                          {doc.file_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/admin/claims/${doc.claim_id}`)}
                        sx={{ fontWeight: 700 }}
                      >
                        Claim {doc.claim_id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Chip label={doc.file_type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
                      {new Date(doc.uploaded_date).toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                        sx={{ mr: 1 }}
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<VisibilityIcon />}
                        onClick={() => navigate(`/admin/claims/${doc.claim_id}`)}
                      >
                        View Claim
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
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

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: 2 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Documents;
