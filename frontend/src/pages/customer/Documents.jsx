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
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await customerService.getAllMyDocuments();
        setDocuments(res || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
          My Claim Documents Archive
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Central repository of all medical receipts, incident bills, FIRs, and claim evidence files uploaded from your account.
        </Typography>
      </Box>

      {/* Content */}
      {loading ? (
        <Loading message="Loading document archive..." />
      ) : documents.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <EmptyState
            title="No documents uploaded"
            description="You have not uploaded any claim evidence files yet."
          />
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>DOCUMENT NAME</TableCell>
                  <TableCell>MIME TYPE</TableCell>
                  <TableCell>ASSOCIATED CLAIM</TableCell>
                  <TableCell>UPLOADED DATE</TableCell>
                  <TableCell align="right">DOWNLOAD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id} hover>
                    <TableCell sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DescriptionIcon color="primary" fontSize="small" />
                      {doc.file_name}
                    </TableCell>

                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                      {doc.file_type || 'application/pdf'}
                    </TableCell>

                    <TableCell sx={{ fontWeight: 600 }}>
                      Claim {doc.claim_id}
                    </TableCell>

                    <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                      {new Date(doc.uploaded_date).toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        href={customerService.getDocumentDownloadUrl(doc.id)}
                        target="_blank"
                        download={doc.file_name}
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Download
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

export default Documents;
