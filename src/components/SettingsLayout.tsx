import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import ReceiptIcon from '@mui/icons-material/Receipt';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExtensionIcon from '@mui/icons-material/Extension';

const sidebarItems = [
  { to: '/settings/profile', tourId: 'settings-sidebar-profile', label: 'Profile', icon: <PersonIcon /> },
  { to: '/settings/security', tourId: 'settings-sidebar-security', label: 'Security', icon: <SecurityIcon /> },
  { to: '/settings/billing', tourId: 'settings-sidebar-billing', label: 'Billing', icon: <ReceiptIcon /> },
  { to: '/settings/notifications', tourId: 'settings-sidebar-notifications', label: 'Notifications', icon: <NotificationsIcon /> },
  { to: '/settings/integrations', tourId: 'settings-sidebar-integrations', label: 'Integrations', icon: <ExtensionIcon /> },
];

export default function SettingsLayout() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
      <Paper elevation={2} sx={{ width: { xs: '100%', md: 240 }, flexShrink: 0, p: 1, position: { md: 'sticky' }, top: 80 }}>
        <Typography variant="overline" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary' }}>
          Settings
        </Typography>
        <List>
          {sidebarItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.to}
                data-tour-id={item.tourId}
                selected={isActive(item.to)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
                  '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.contrastText' },
                }}
              >
                <Box sx={{ mr: 1.5, display: 'flex', alignItems: 'center', minWidth: 24 }}>{item.icon}</Box>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9rem' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
