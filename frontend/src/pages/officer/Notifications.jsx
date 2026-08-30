import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, List, ListItem, ListItemText,
  ListItemIcon, Divider, Button, Chip,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import officerService from '../../services/officerService';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import EmptyState from '../../components/EmptyState';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await officerService.getNotifications();
      setNotifications(data.items || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markAsRead = async (id) => {
    try {
      await officerService.markNotificationRead(id);
      fetchNotifs();
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await officerService.markAllNotificationsRead();
      fetchNotifs();
    } catch (err) {}
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5 }}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#0f172a' }}>Notifications</Typography>
          <Typography variant="body2" color="text.secondary">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</Typography>
        </Box>
        {unreadCount > 0 && (
          <Button variant="outlined" startIcon={<CheckCircleIcon />} onClick={markAllRead}>Mark All Read</Button>
        )}
      </Box>

      {loading ? <Loading message="Loading notifications..." /> : error ? <ErrorMessage message={error} onRetry={fetchNotifs} /> : notifications.length === 0 ? (
        <EmptyState icon={NotificationsActiveIcon} title="No notifications" description="You are all caught up!" />
      ) : (
        <Card><List>
          {notifications.map((n, idx) => (
            <React.Fragment key={n.id}>
              <ListItem sx={{ bgcolor: n.is_read ? 'transparent' : '#f0fdfa', py: 2, cursor: 'pointer' }} onClick={() => { if (!n.is_read) markAsRead(n.id); if (n.link) navigate(n.link); }}>
                <ListItemIcon><NotificationsActiveIcon color={n.is_read ? 'disabled' : 'secondary'} /></ListItemIcon>
                <ListItemText
                  primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Typography variant="body2" fontWeight={n.is_read ? 500 : 700}>{n.title}</Typography>{!n.is_read && <Chip label="New" size="small" color="secondary" />}</Box>}
                  secondary={<Box><Typography variant="body2" color="text.secondary">{n.message}</Typography><Typography variant="caption" color="text.secondary">{new Date(n.created_at).toLocaleString()}</Typography></Box>}
                />
              </ListItem>
              {idx < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List></Card>
      )}
    </Box>
  );
};

export default Notifications;
