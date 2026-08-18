import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAppState } from '../context/AppStateContext';
import type { Client } from '../context/AppStateContext';

export const keywords = ['client', 'company', 'manage'];

const PAGE_SIZE = 5;
const emptyForm = { name: '', plan: 'Basic', users: 0 };

export default function ManageClientsPage() {
  const { clients, addClient, updateClient, updateClientStatus, deleteClient } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Client | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [snackbar, setSnackbar] = useState('');

  const filtered = useMemo(() =>
    clients.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.plan.toLowerCase().includes(search.toLowerCase())
    ), [clients, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setDialog('add'); };
  const openEdit = (c: Client) => { setForm({ name: c.name, plan: c.plan, users: c.users }); setEditTarget(c); setDialog('edit'); };
  const closeDialog = () => setDialog(null);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (dialog === 'add') {
      addClient({ name: form.name, plan: form.plan, users: Number(form.users) });
      setSnackbar('Client added successfully');
    } else if (dialog === 'edit' && editTarget) {
      updateClient(editTarget.id, { name: form.name, plan: form.plan, users: Number(form.users) });
      setSnackbar('Client updated successfully');
    }
    closeDialog();
  };

  const handleDelete = (c: Client) => {
    if (window.confirm(`Remove "${c.name}" from clients?`)) {
      deleteClient(c.id);
      setSnackbar('Client removed');
    }
  };

  const toggleStatus = (c: Client) => {
    const next = c.status === 'Active' ? 'Inactive' : 'Active';
    updateClientStatus(c.id, next);
    setSnackbar(`"${c.name}" set to ${next}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.dark">Manage Clients</Typography>
          <Typography variant="body1" color="text.secondary">View and manage all client companies.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} data-tour-id="client-add-btn">Add Client</Button>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Search clients by name or plan…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          data-tour-id="client-search"
        />
      </Paper>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {[
          { label: 'Total Clients', value: clients.length, color: 'primary.main' },
          { label: 'Active', value: clients.filter(c => c.status === 'Active').length, color: 'success.main' },
          { label: 'Inactive', value: clients.filter(c => c.status === 'Inactive').length, color: 'error.main' },
          { label: 'Total Users', value: clients.reduce((acc, c) => acc + c.users, 0), color: 'info.main' },
        ].map(s => (
          <Paper key={s.label} elevation={0} sx={{ p: 2, flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color={s.color}>{s.value}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>{s.label}</Typography>
          </Paper>
        ))}
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {['#', 'COMPANY NAME', 'USERS', 'PLAN', 'JOINED', 'STATUS', 'ACTIONS'].map((h, i) => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }} align={i === 6 ? 'right' : 'left'}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((c, i) => (
              <TableRow key={c.id} hover>
                <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                <TableCell>{c.users.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip label={c.plan} size="small"
                    sx={{ bgcolor: c.plan === 'Enterprise' ? '#ede7f6' : c.plan === 'Pro' ? '#e3f2fd' : '#f5f5f5', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{c.joined}</TableCell>
                <TableCell>
                  <Chip label={c.status} size="small" clickable onClick={() => toggleStatus(c)}
                    sx={{ bgcolor: c.status === 'Active' ? '#e8f5e9' : '#ffebee', color: c.status === 'Active' ? '#2e7d32' : '#c62828', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(c)} data-tour-id={`client-edit-btn-${c.id}`}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(c)} data-tour-id={`client-delete-btn-${c.id}`}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No clients found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={!!dialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog === 'add' ? 'Add New Client' : 'Edit Client'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Company Name *" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-tour-id="client-form-name" />
            <TextField label="Number of Users" type="number" fullWidth size="small" value={form.users} onChange={e => setForm({ ...form, users: parseInt(e.target.value) || 0 })} data-tour-id="client-form-users" />
            <FormControl size="small" fullWidth data-tour-id="client-form-plan">
              <InputLabel>Plan</InputLabel>
              <Select value={form.plan} label="Plan" onChange={e => setForm({ ...form, plan: e.target.value })}>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name.trim()} data-tour-id="client-form-submit">{dialog === 'add' ? 'Add Client' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
