import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const navItems = [
  { to: '/', tourId: 'nav-home', label: 'Home' },
  { to: '/dashboard', tourId: 'nav-dashboard', label: 'Dashboard' },
  { to: '/projects', tourId: 'nav-projects', label: 'Projects' },
  { to: '/team', tourId: 'nav-team', label: 'Team' },
  { to: '/analytics', tourId: 'nav-analytics', label: 'Analytics' },
  { to: '/pricing', tourId: 'nav-pricing', label: 'Pricing' },
  { to: '/settings', tourId: 'nav-settings', label: 'Settings' },
  { to: '/help', tourId: 'nav-help', label: 'Help' },
];

export default function TopNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <AppBar position="sticky" elevation={0} color="default" sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1 }}>
        <SmartToyIcon sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ fontWeight: 700, color: 'primary.main', mr: 4 }}>
          TourBot
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {navItems.map((item) => (
            <Button
              key={item.to}
              component={RouterLink}
              to={item.to}
              data-tour-id={item.tourId}
              color={isActive(item.to) ? 'primary' : 'inherit'}
              variant={isActive(item.to) ? 'contained' : 'text'}
              size="small"
              sx={{ fontWeight: isActive(item.to) ? 600 : 400 }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
