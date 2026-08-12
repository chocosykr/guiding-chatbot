import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const plans = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    features: ['1 project', 'Basic guided tours', 'Community support', '5 team members', 'Standard analytics'],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: ['10 projects', 'Advanced tours with BFS', 'Priority support', '25 team members', 'Advanced analytics', 'Custom integrations'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: 'per month',
    features: ['Unlimited projects', 'Full tour customization', 'Dedicated support + SLA', 'Unlimited team members', 'Realtime analytics', 'SSO & audit logs', 'On-premise option'],
    highlighted: false,
  },
];

const faqs = [
  { q: 'Can I switch plans anytime?', a: 'Yes, you can upgrade or downgrade at any time. Changes are prorated automatically.' },
  { q: 'Is there a free trial for Pro?', a: 'Every new account gets 14 days of Pro features for free, no credit card required.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.' },
];

export default function PricingPage() {
  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Simple, Transparent Pricing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose the plan that fits your team. No hidden fees, cancel anytime.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
        {plans.map((plan) => (
          <Grid key={plan.name} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={plan.highlighted ? 4 : 2}
              sx={{
                p: 4,
                borderRadius: 4,
                border: plan.highlighted ? 2 : 1,
                borderColor: plan.highlighted ? 'primary.main' : 'divider',
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.highlighted && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: 16 }} />}
                  label="Most Popular"
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', fontWeight: 700 }}
                />
              )}
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {plan.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {plan.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  /{plan.period}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ flexGrow: 1, mb: 3 }}>
                {plan.features.map((feature) => (
                  <Box key={feature} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main', mr: 1, mt: 0.25, flexShrink: 0 }} />
                    <Typography variant="body2">{feature}</Typography>
                  </Box>
                ))}
              </Box>
              <Button
                fullWidth
                variant={plan.highlighted ? 'contained' : 'outlined'}
                color="primary"
                size="large"
              >
                Choose {plan.name}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* FAQ */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {faqs.map((faq) => (
            <Grid key={faq.q} size={{ xs: 12, md: 4 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {faq.q}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.a}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
