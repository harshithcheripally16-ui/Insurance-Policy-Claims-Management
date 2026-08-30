import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';

import customerService from '../../services/customerService';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const TYPE_ICONS = {
  INFO: <InfoIcon color="primary" />,
  SUCCESS: <CheckCircleIcon color="success" />,
  WARNING: <WarningIcon color="warning" />,
  ERROR: <ErrorIcon color="error" />,
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await customerService.getNotifications();
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await customerService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await customerService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  return (
    <Box sx={{ pb: 4, maxWidth: 880, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} Unread`} color="primary" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Real-time updates regarding your policy subscriptions, claims reviews, and account activities.
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      {/* Content */}
      {loading ? (
        <Loading message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <EmptyState
            icon={NotificationsIcon}
            title="No notifications"
            description="You are all caught up! Important policy and claim events will appear here."
          />
        </Card>
      ) : (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <List disablePadding>
            {notifications.map((n, idx) => (
              <React.Fragment key={n.id}>
                <ListItem
                  sx={{
                    py: 2.2,
                    px: 3,
                    bgcolor: n.is_read ? 'transparent' : '#f0fdf4',
                    cursor: n.link ? 'pointer' : 'default',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: n.is_read ? '#f8fafc' : '#e6fced',
                    },
                  }}
                  onClick={() => {
                    if (!n.is_read) handleMarkRead(n.id, { stopPropagation: () => {} });
                    if (n.link) navigate(n.link);
                  }}
                  secondaryAction={
                    !n.is_read && (
                      <IconButton
                        edge="end"
                        size="small"
                        title="Mark as Read"
                        onClick={(e) => handleMarkRead(n.id, e)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <MarkEmailReadIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <ListItemIcon sx={{ minWidth: 44 }}>
                    {TYPE_ICONS[n.type] || <InfoIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" fontWeight={n.is_read ? 600 : 800} color="text.primary">
                          {n.title}
                        </Typography>
                        {!n.is_read && (
                          <Chip label="NEW" size="small" color="success" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {n.message}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                          {new Date(n.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

export default Notifications;
