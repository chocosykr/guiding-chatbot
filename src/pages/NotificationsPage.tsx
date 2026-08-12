import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const notificationSettings = [
  { key: 'email', label: 'Email Notifications', description: 'Receive notifications about your tours and account activity via email.' },
  { key: 'push', label: 'Push Notifications', description: 'Get real-time alerts on your device when tours complete or need attention.' },
  { key: 'product', label: 'Product Updates', description: 'Be the first to know about new features and improvements.' },
  { key: 'marketing', label: 'Marketing Emails', description: 'Tips, special offers, and best practices for using TourBot.' },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    email: true,
    push: true,
    product: false,
    marketing: false,
  });

  const toggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Notifications
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Choose how and when you want to be notified.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {notificationSettings.map((item) => (
          <Box
            key={item.key}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={settings[item.key]} onChange={() => toggle(item.key)} color="primary" />}
              label=""
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
