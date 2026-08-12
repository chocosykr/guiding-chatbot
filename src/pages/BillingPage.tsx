import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const invoices = [
  { id: 'INV-2024-001', date: 'Jan 1, 2024', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2024-002', date: 'Feb 1, 2024', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2024-003', date: 'Mar 1, 2024', amount: '$29.00', status: 'Paid' },
  { id: 'INV-2024-004', date: 'Apr 1, 2024', amount: '$29.00', status: 'Pending' },
];

export default function BillingPage() {
  return (
    <Box>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Billing
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
          <CreditCardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Visa ending in 4242
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Expires 12/2026
            </Typography>
          </Box>
          <Button variant="outlined" size="small" sx={{ ml: 'auto', textTransform: 'none' }}>
            Update
          </Button>
        </Box>
      </Paper>

      <Box data-tour-id="invoices-section" sx={{ p: 4, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Invoices
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell sx={{ fontWeight: 500 }}>{inv.id}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell>
                    <Box
                      component="span"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 5,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: inv.status === 'Paid' ? 'success.main' : 'warning.main',
                        color: 'common.white',
                      }}
                    >
                      {inv.status}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
