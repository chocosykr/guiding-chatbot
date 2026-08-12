import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import UploadIcon from '@mui/icons-material/Upload';

function InfoTab() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Profile Information
      </Typography>
      <Box
        data-tour-id="avatar-upload-section"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
        }}
      >
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
          JD
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            Avatar Upload
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Upload a profile picture (PNG or JPG, max 2MB)
          </Typography>
          <Button variant="outlined" size="small" startIcon={<UploadIcon />} sx={{ textTransform: 'none' }}>
            Choose File
          </Button>
        </Box>
      </Box>
      <TextField fullWidth label="Full Name" defaultValue="Jane Doe" sx={{ mb: 2 }} />
      <TextField fullWidth label="Email" defaultValue="jane@example.com" sx={{ mb: 2 }} />
      <TextField fullWidth label="Bio" multiline rows={3} defaultValue="Product designer and tour enthusiast." />
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" sx={{ textTransform: 'none' }}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

function PasswordTab() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Change Password
      </Typography>
      <TextField fullWidth label="Current Password" type="password" sx={{ mb: 2 }} />
      <TextField fullWidth label="New Password" type="password" sx={{ mb: 2 }} />
      <TextField fullWidth label="Confirm New Password" type="password" sx={{ mb: 2 }} />
      <Button variant="contained" color="primary" sx={{ textTransform: 'none' }}>
        Update Password
      </Button>
    </Box>
  );
}

export default function ProfilePage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Profile Settings
      </Typography>
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab
          label="Info"
          data-tour-id="profile-tab-info"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
        <Tab
          label="Password"
          data-tour-id="profile-tab-password"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && <InfoTab />}
        {tabValue === 1 && <PasswordTab />}
      </Box>
    </Paper>
  );
}
