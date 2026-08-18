import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AnchorIcon from '@mui/icons-material/Anchor';
import ShieldIcon from '@mui/icons-material/Shield';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../context/ThemeModeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/question-review', label: 'Question Review' },
  { to: '/office', label: 'Office' },
  { to: '/manage-clients', label: 'Manage Clients' },
  { to: '/settings/time-marks', label: 'Settings', hasDropdown: true },
];

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeMode();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const openProfileMenu = Boolean(profileAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };
  const isActive = (path: string) => {
    if (path.startsWith('/settings') && location.pathname.startsWith('/settings')) return true;
    return location.pathname === path;
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0} 
      sx={{ 
        bgcolor: '#ffffff', 
        borderBottom: `4px solid ${theme.palette.primary.main}` 
      }}
    >
      <Toolbar sx={{ gap: 2, display: 'flex', justifyContent: 'space-between' }}>
        
        {/* Logo Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldIcon sx={{ color: 'primary.main', fontSize: 32 }} />
            <AnchorIcon sx={{ color: '#ffffff', fontSize: 16, position: 'absolute' }} />
          </Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 800, color: 'text.primary' }}>
            Sailor Skill
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', gap: 3, flexGrow: 1, justifyContent: 'flex-start', ml: 4 }}>
          {navItems.map((item) => {
            const active = isActive(item.to);
            if (item.hasDropdown) {
              return (
                <Box key={item.to}>
                  <Button
                    onClick={handleMenuClick}
                    endIcon={<KeyboardArrowDownIcon />}
                    sx={{
                      color: active ? 'primary.main' : 'text.secondary',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.95rem',
                      borderRadius: 0,
                      p: 0,
                      minWidth: 'auto',
                      borderBottom: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      '&:hover': {
                        bgcolor: 'transparent',
                        color: 'primary.main',
                      }
                    }}
                    data-tour-id="nav-settings"
                  >
                    {item.label}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/settings/time-marks'); }} data-tour-id="nav-settings-time-marks">
                      Time & Marks Settings
                    </MenuItem>
                    <MenuItem onClick={() => { handleMenuClose(); navigate('/settings/percentage'); }} data-tour-id="nav-settings-percentage">
                      Percentage Settings
                    </MenuItem>
                  </Menu>
                </Box>
              );
            }
            
            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                sx={{
                  color: active ? 'primary.main' : 'text.secondary',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.95rem',
                  borderRadius: 0,
                  p: 0,
                  minWidth: 'auto',
                  borderBottom: active ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: 'primary.main',
                  }
                }}
                data-tour-id={`nav-${item.to.replace('/', '')}`}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* User & Theme Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton sx={{ color: 'text.secondary' }} onClick={toggleColorMode} data-tour-id="nav-theme">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          
          <IconButton onClick={handleProfileClick} sx={{ p: 0 }} data-tour-id="nav-profile">
            <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText', width: 40, height: 40, fontWeight: 'bold' }}>
              ES
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={profileAnchorEl}
            open={openProfileMenu}
            onClose={handleProfileClose}
            MenuListProps={{
              'aria-labelledby': 'profile-button',
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem onClick={handleProfileClose}>Profile</MenuItem>
            <MenuItem onClick={handleProfileClose}>My Account</MenuItem>
            <MenuItem onClick={handleProfileClose} sx={{ color: 'error.main' }}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
