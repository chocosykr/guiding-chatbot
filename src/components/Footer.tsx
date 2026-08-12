import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const footerSections = [
  { title: 'Product', links: ['Dashboard', 'Projects', 'Analytics', 'Pricing'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
  { title: 'Resources', links: ['Help Center', 'Documentation', 'API Reference', 'Status'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
];

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', mt: 6, py: 6 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SmartToyIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={700} color="primary.main">
                TourBot
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
              Guided-tour chatbot navigation for modern web apps. Try the chat in the bottom-right corner.
            </Typography>
          </Grid>
          {footerSections.map((section) => (
            <Grid key={section.title} size={{ xs: 6, md: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                {section.title}
              </Typography>
              {section.links.map((link) => (
                <Link key={link} href="#" underline="hover" sx={{ display: 'block', mb: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                  {link}
                </Link>
              ))}
            </Grid>
          ))}
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, textAlign: 'center' }}>
          {new Date().getFullYear()} TourBot. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
