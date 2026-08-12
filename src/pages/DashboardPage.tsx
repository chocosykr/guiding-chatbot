import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TourIcon from '@mui/icons-material/Tour';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CircleIcon from '@mui/icons-material/Circle';

const stats = [
  { label: 'Total Users', value: '1,248', change: '+12%', icon: <PeopleIcon />, color: 'primary.main' },
  { label: 'Revenue', value: '$24.5k', change: '+8%', icon: <MonetizationOnIcon />, color: 'success.main' },
  { label: 'Active Tours', value: '42', change: '+5%', icon: <TourIcon />, color: 'info.main' },
  { label: 'Conversion', value: '3.2%', change: '-0.4%', icon: <AnalyticsIcon />, color: 'warning.main' },
];

const activityFeed = [
  { user: 'Jane Doe', action: 'completed a tour to Billing', time: '2 min ago' },
  { user: 'Alex Kim', action: 'started a new project "Onboarding Flow"', time: '15 min ago' },
  { user: 'Raj Singh', action: 'updated notification preferences', time: '1 hour ago' },
  { user: 'Maria Lopez', action: 'invited 3 team members', time: '2 hours ago' },
  { user: 'Tom Wright', action: 'upgraded to Pro plan', time: '3 hours ago' },
];

const topPages = [
  { name: 'Dashboard', visits: 3420, pct: 85 },
  { name: 'Projects', visits: 2180, pct: 62 },
  { name: 'Pricing', visits: 1540, pct: 44 },
  { name: 'Settings', visits: 980, pct: 28 },
  { name: 'Help', visits: 420, pct: 12 },
];

export default function DashboardPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Overview of your key metrics and recent activity.
          </Typography>
        </Box>
        <Chip icon={<CircleIcon sx={{ fontSize: 12 }} />} label="Live" color="success" sx={{ fontWeight: 600 }} />
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ bgcolor: stat.color, color: 'common.white', borderRadius: 2, p: 1, display: 'flex' }}>
                  {stat.icon}
                </Box>
                {stat.change.startsWith('+') ? (
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                ) : (
                  <TrendingDownIcon sx={{ color: 'error.main' }} />
                )}
              </Box>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ color: stat.change.startsWith('+') ? 'success.main' : 'error.main', fontWeight: 600 }}>
                {stat.change} vs last month
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Two-column lower section */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Recent Activity
            </Typography>
            <List>
              {activityFeed.map((item, idx) => (
                <Box key={idx}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CircleIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2">
                          <Box component="span" fontWeight={600}>{item.user}</Box> {item.action}
                        </Typography>
                      }
                      secondary={item.time}
                      secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    />
                  </ListItem>
                  {idx < activityFeed.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Top Pages */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Top Pages by Visits
            </Typography>
            {topPages.map((page) => (
              <Box key={page.name} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={500}>{page.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{page.visits.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ height: 8, borderRadius: 5, bgcolor: 'grey.100', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${page.pct}%`, borderRadius: 5, bgcolor: 'primary.main' }} />
                </Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
