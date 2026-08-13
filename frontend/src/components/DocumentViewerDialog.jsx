import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton,
  Divider, MenuItem, TextField, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DocumentViewerDialog({ open, onClose, claim, onRefresh }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('RECEIPT');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!claim) return null;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMsg('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('doc_type', docType);

      await api.post(`/documents/upload/${claim.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSelectedFile(null);
      setMsg('Document uploaded successfully!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setMsg('Upload failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (docId, newStatus) => {
    try {
      await api.patch(`/documents/${docId}/verify`, { status: newStatus });
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const canVerify = user?.role === 'CLAIMS_OFFICER' || user?.role === 'AGENT' || user?.role === 'ADMIN';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Claim Attachments & Documents
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Claim Number: {claim.claim_number} | Customer: {claim.customer?.full_name}
          </Typography>
        </Box>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {msg && <Alert severity={msg.includes('failed') ? 'error' : 'success'} sx={{ mb: 2 }}>{msg}</Alert>}

        {/* Existing Documents Table */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Uploaded Documents ({claim.documents?.length || 0})
        </Typography>
        {(!claim.documents || claim.documents.length === 0) ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No documents attached yet. Attach receipts or incident photos below.
          </Alert>
        ) : (
          <Table size="small" sx={{ mb: 3 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Document Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {claim.documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.file_name}</TableCell>
                  <TableCell>
                    <Chip label={doc.doc_type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.status}
                      size="small"
                      color={doc.status === 'VERIFIED' ? 'success' : doc.status === 'REJECTED' ? 'error' : 'warning'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        href={`/api/documents/${doc.id}/download`}
                        target="_blank"
                      >
                        Download
                      </Button>
                      {canVerify && doc.status === 'PENDING' && (
                        <>
                          <IconButton size="small" color="success" onClick={() => handleVerify(doc.id, 'VERIFIED')}>
                            <CheckCircleIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleVerify(doc.id, 'REJECTED')}>
                            <CancelIcon />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Upload Form */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
          Upload New Document
        </Typography>
        <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              size="small"
              sx={{ width: 220 }}
            >
              <MenuItem value="IDENTITY_PROOF">Identity Proof</MenuItem>
              <MenuItem value="INCIDENT_REPORT">Incident Report</MenuItem>
              <MenuItem value="RECEIPT">Medical / Damage Receipt</MenuItem>
              <MenuItem value="PROPERTY_PHOTO">Property Damage Photo</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              size="small"
              sx={{ flexGrow: 1 }}
            >
              {selectedFile ? selectedFile.name : 'Choose File (PDF/JPG/PNG)'}
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </Button>
          </Box>

          <Button
            type="submit"
            variant="contained"
            disabled={!selectedFile || uploading}
            startIcon={<CloudUploadIcon />}
          >
            {uploading ? 'Uploading...' : 'Attach Document to Claim'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
