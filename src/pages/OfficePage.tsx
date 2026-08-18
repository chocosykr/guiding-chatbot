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
import type { Office } from '../context/AppStateContext';

export const keywords = ['office', 'location', 'branch'];

const PAGE_SIZE = 5;

const emptyForm = { name: '', code: '', location: '', status: 'Active' };

export default function OfficePage() {
  const { offices, addOffice, updateOffice, updateOfficeStatus, deleteOffice } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Office | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState('');

  const filtered = useMemo(() =>
    offices.filter(o =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase())
    ), [offices, search]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(emptyForm); setEditTarget(null); setDialog('add'); };
  const openEdit = (o: Office) => { setForm({ name: o.name, code: o.code, location: o.location, status: o.status }); setEditTarget(o); setDialog('edit'); };
  const closeDialog = () => setDialog(null);

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (dialog === 'add') {
      addOffice(form);
      setSnackbar('Office added successfully');
    } else if (dialog === 'edit' && editTarget) {
      updateOffice(editTarget.id, form);
      setSnackbar('Office updated successfully');
    }
    closeDialog();
  };

  const handleDelete = (o: Office) => {
    if (window.confirm(`Delete "${o.name}"?`)) {
      deleteOffice(o.id);
      setSnackbar('Office deleted');
    }
  };

  const toggleStatus = (o: Office) => {
    const next = o.status === 'Active' ? 'Inactive' : 'Active';
    updateOfficeStatus(o.id, next);
    setSnackbar(`"${o.name}" set to ${next}`);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.dark">Office Management</Typography>
          <Typography variant="body1" color="text.secondary">Manage your company offices and locations.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} data-tour-id="office-add-btn">Add Office</Button>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TextField
          fullWidth size="small" placeholder="Search offices by name, code or location…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          data-tour-id="office-search"
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              {['#', 'OFFICE NAME', 'CODE', 'LOCATION', 'STATUS', 'ACTIONS'].map((h, i) => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }} align={i === 5 ? 'right' : 'left'}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.map((o, i) => (
              <TableRow key={o.id} hover>
                <TableCell>{(page - 1) * PAGE_SIZE + i + 1}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{o.name}</TableCell>
                <TableCell>{o.code}</TableCell>
                <TableCell>{o.location}</TableCell>
                <TableCell>
                  <Chip
                    label={o.status} size="small" clickable onClick={() => toggleStatus(o)}
                    sx={{
                      bgcolor: o.status === 'Active' ? '#e8f5e9' : '#ffebee',
                      color: o.status === 'Active' ? '#2e7d32' : '#c62828',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(o)} data-tour-id={`office-edit-btn-${o.id}`}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(o)} data-tour-id={`office-delete-btn-${o.id}`}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No offices found.</Typography>
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
        <DialogTitle>{dialog === 'add' ? 'Add New Office' : 'Edit Office'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField label="Office Name *" fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-tour-id="office-form-name" />
            <TextField label="Code *" fullWidth size="small" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. MUM-01" data-tour-id="office-form-code" />
            <TextField label="Location" fullWidth size="small" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} data-tour-id="office-form-location" />
            <FormControl size="small" fullWidth data-tour-id="office-form-status">
              <InputLabel>Status</InputLabel>
              <Select value={form.status} label="Status" onChange={e => setForm({ ...form, status: e.target.value })}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={closeDialog} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!form.name.trim()} data-tour-id="office-form-submit">{dialog === 'add' ? 'Add Office' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snackbar} autoHideDuration={2500} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
