import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TourIcon from '@mui/icons-material/Tour';

const projects = [
  { name: 'Onboarding Flow', desc: 'New user onboarding tour with 8 steps', status: 'Active', tours: 12, members: 4, color: 'primary.main' },
  { name: 'Feature Walkthrough', desc: 'Showcase new analytics dashboard features', status: 'Active', tours: 6, members: 3, color: 'info.main' },
  { name: 'Billing Setup Guide', desc: 'Guide users through subscription and payment', status: 'Draft', tours: 3, members: 2, color: 'warning.main' },
  { name: 'API Documentation', desc: 'Developer integration tour with code samples', status: 'Active', tours: 8, members: 5, color: 'success.main' },
  { name: 'Mobile App Preview', desc: 'Preview tour for the upcoming mobile release', status: 'Paused', tours: 2, members: 3, color: 'secondary.main' },
  { name: 'Enterprise SSO', desc: 'Walkthrough for enterprise SSO configuration', status: 'Draft', tours: 1, members: 2, color: 'error.main' },
];

const statusColor = (status: string) => {
  if (status === 'Active') return 'success';
  if (status === 'Draft') return 'default';
  if (status === 'Paused') return 'warning';
  return 'default';
};

export default function ProjectsPage() {
  const [search, setSearch] = useState('');

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your guided tour projects and workspaces.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />}>
          New Project
        </Button>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filtered.map((project) => (
          <Grid key={project.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ bgcolor: project.color, color: 'common.white', borderRadius: 2, p: 1, display: 'flex' }}>
                  <TourIcon />
                </Box>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {project.desc}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip label={project.status} color={statusColor(project.status) as 'success' | 'default' | 'warning'} size="small" sx={{ fontWeight: 600 }} />
                <Chip label={`${project.tours} tours`} variant="outlined" size="small" />
                <Chip label={`${project.members} members`} variant="outlined" size="small" />
              </Box>
              <Button variant="outlined" size="small" fullWidth>
                Open Project
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
