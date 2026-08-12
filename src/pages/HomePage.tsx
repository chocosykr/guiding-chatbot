import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import { Link as RouterLink } from 'react-router-dom';
import ExploreIcon from '@mui/icons-material/Explore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SpeedIcon from '@mui/icons-material/Speed';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const features = [
  { icon: <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />, title: 'Smart Intent Resolution', desc: 'Type naturally — our engine maps your request to the right page using keyword matching and graph traversal.' },
  { icon: <SpeedIcon sx={{ fontSize: 32, color: 'secondary.main' }} />, title: 'BFS Pathfinding', desc: 'Shortest-path navigation through the site graph ensures the fewest clicks to your destination.' },
  { icon: <ChatIcon sx={{ fontSize: 32, color: 'info.main' }} />, title: 'Guided Highlights', desc: 'Each step pulses with a clear call-to-action. Just follow the highlights and click through.' },
];

const stats = [
  { value: '8', label: 'Pages' },
  { value: '13', label: 'Graph Nodes' },
  { value: '30+', label: 'Navigation Edges' },
  { value: '5', label: 'Settings Sections' },
];

export default function HomePage() {
  return (
    <Box>
      {/* Hero */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <ExploreIcon sx={{ fontSize: 56, mb: 2 }} />
        <Typography variant="h3" gutterBottom fontWeight={700}>
          Welcome to TourBot
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, opacity: 0.85, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
          A testbed for guided-tour chatbot navigation. Open the chat in the bottom-right corner and tell it where you want to go.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="contained" color="secondary" component={RouterLink} to="/dashboard" size="large" endIcon={<ArrowForwardIcon />}>
            Explore Dashboard
          </Button>
          <Button variant="outlined" component={RouterLink} to="/pricing" size="large" sx={{ color: 'primary.contrastText', borderColor: 'rgba(255,255,255,0.5)' }}>
            View Pricing
          </Button>
        </Box>
        <Chip label="Testbed Demo" sx={{ position: 'absolute', top: 16, right: 16, bgcolor: 'rgba(255,255,255,0.15)', color: 'primary.contrastText', fontWeight: 600 }} />
      </Paper>

      {/* Stats strip */}
      <Grid container spacing={2} sx={{ mt: 4 }}>
        {stats.map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Paper elevation={1} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stat.value}
              </Typography>
              <Typography variant="overline" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Features */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          How It Works
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {features.map((feature) => (
            <Grid key={feature.title} size={{ xs: 12, md: 4 }}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 3, height: '100%' }}>
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA */}
      <Paper elevation={0} sx={{ mt: 6, p: 4, borderRadius: 4, bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Ready to explore?
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            Navigate to any page and try the chat guide.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AvatarGroup max={4}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>JD</Avatar>
            <Avatar sx={{ bgcolor: 'info.main' }}>AK</Avatar>
            <Avatar sx={{ bgcolor: 'error.main' }}>RS</Avatar>
            <Avatar sx={{ bgcolor: 'warning.main' }}>ML</Avatar>
          </AvatarGroup>
          <Button variant="contained" color="primary" component={RouterLink} to="/projects" endIcon={<ArrowForwardIcon />}>
            Browse Projects
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
