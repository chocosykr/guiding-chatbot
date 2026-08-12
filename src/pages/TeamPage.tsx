import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';

const members = [
  { name: 'Jane Doe', email: 'jane@example.com', role: 'Owner', initials: 'JD', color: 'primary.main' },
  { name: 'Alex Kim', email: 'alex@example.com', role: 'Admin', initials: 'AK', color: 'info.main' },
  { name: 'Raj Singh', email: 'raj@example.com', role: 'Editor', initials: 'RS', color: 'success.main' },
  { name: 'Maria Lopez', email: 'maria@example.com', role: 'Editor', initials: 'ML', color: 'warning.main' },
  { name: 'Tom Wright', email: 'tom@example.com', role: 'Viewer', initials: 'TW', color: 'secondary.main' },
  { name: 'Nina Patel', email: 'nina@example.com', role: 'Viewer', initials: 'NP', color: 'error.main' },
];

const roleColors: Record<string, 'primary' | 'info' | 'success' | 'warning' | 'default'> = {
  Owner: 'primary',
  Admin: 'info',
  Editor: 'success',
  Viewer: 'default',
};

export default function TeamPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Team
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage team members and their roles.
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<PersonAddIcon />}>
          Invite Member
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Member list */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ borderRadius: 3 }}>
            <List>
              {members.map((member, idx) => (
                <Box key={member.email}>
                  <ListItem
                    sx={{ py: 2 }}
                    secondaryAction={
                      <IconButton edge="end"><MoreVertIcon /></IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: member.color, fontWeight: 700 }}>{member.initials}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>{member.name}</Typography>
                          <Chip label={member.role} color={roleColors[member.role]} size="small" sx={{ fontWeight: 600 }} />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">{member.email}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {idx < members.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Summary sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Team Summary
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {[
                { label: 'Total Members', value: members.length },
                { label: 'Owners', value: members.filter((m) => m.role === 'Owner').length },
                { label: 'Admins', value: members.filter((m) => m.role === 'Admin').length },
                { label: 'Editors', value: members.filter((m) => m.role === 'Editor').length },
                { label: 'Viewers', value: members.filter((m) => m.role === 'Viewer').length },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
          <Paper elevation={1} sx={{ p: 4, borderRadius: 3, mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Pending Invitations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No pending invitations. Use the Invite Member button to add new teammates.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
