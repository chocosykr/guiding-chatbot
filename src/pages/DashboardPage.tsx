import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';
import type { QuestionSet } from '../context/AppStateContext';

export const keywords = ['dashboard', 'home', 'overview', 'summary', 'question sets', 'import', 'upload'];

function Row({ row }: { row: QuestionSet }) {
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState('');
  const { updateQuestionSetStatus, deleteQuestionSet } = useAppState();

  const toggleStatus = () => {
    const next = row.status === 'Completed' ? 'In Progress' : 'Completed';
    updateQuestionSetStatus(row.id, next);
    setSnackbar(`Status changed to "${next}"`);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete "${row.name}"?`)) {
      deleteQuestionSet(row.id);
    }
  };

  const handleDownload = () => {
    const data = JSON.stringify(row, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${row.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:hover': { bgcolor: '#f8fafc' } }}>
        <TableCell sx={{ width: 48 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{row.name}</TableCell>
        <TableCell>{row.office}</TableCell>
        <TableCell>{row.rank}</TableCell>
        <TableCell>{row.type}</TableCell>
        <TableCell>{row.created}</TableCell>
        <TableCell>
          <Chip
            label={row.status}
            size="small"
            sx={{
              bgcolor: row.status === 'Completed' ? '#e8f5e9' : '#fff3e0',
              color: row.status === 'Completed' ? '#2e7d32' : '#e65100',
              fontWeight: 600,
            }}
          />
        </TableCell>
        <TableCell>
          <Chip
            label={row.shared}
            size="small"
            sx={{
              bgcolor: row.shared === 'Shared' ? '#e3f2fd' : '#eeeeee',
              color: row.shared === 'Shared' ? '#1565c0' : '#757575',
              fontWeight: 600,
            }}
          />
        </TableCell>
        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
          <Tooltip title="Download JSON">
            <IconButton size="small" onClick={handleDownload} data-tour-id={`dashboard-download-btn-${row.id}`}><DownloadIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title={row.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}>
            <IconButton size="small" onClick={toggleStatus} sx={{ mx: 0.5 }} data-tour-id={`dashboard-toggle-status-btn-${row.id}`}>
              {row.status === 'Completed' ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={handleDelete} data-tour-id={`dashboard-delete-btn-${row.id}`}><DeleteOutlineIcon fontSize="small" /></IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* Expanded history sub-row */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>Question Sets History</Typography>
              {row.history && row.history.length > 0 ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {['Set ID', 'Name', 'Marks', 'Pass Mark', 'Time', 'Created', 'Assigned To'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.history.map((h: any) => (
                      <TableRow key={h.id}>
                        <TableCell>{h.id}</TableCell>
                        <TableCell>{h.name}</TableCell>
                        <TableCell>{h.marks}</TableCell>
                        <TableCell>{h.passMark}</TableCell>
                        <TableCell>{h.time}</TableCell>
                        <TableCell>{h.created}</TableCell>
                        <TableCell>{h.assignedTo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="text.secondary">No history yet.</Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </>
  );
}

export default function DashboardPage() {
  const { questionSets } = useAppState();
  const navigate = useNavigate();
  const [officeFilter, setOfficeFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');

  const uniqueOffices = useMemo(() => [...new Set(questionSets.map(s => s.office))], [questionSets]);
  const uniqueRanks = useMemo(() => [...new Set(questionSets.map(s => s.rank))], [questionSets]);

  const filteredSets = useMemo(() =>
    questionSets.filter(set => {
      const officeMatch = officeFilter ? set.office === officeFilter : true;
      const rankMatch = rankFilter ? set.rank === rankFilter : true;
      return officeMatch && rankMatch;
    }), [questionSets, officeFilter, rankFilter]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.dark">Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Welcome back — manage your question sets and assessments here.</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => navigate('/create-set')} data-tour-id="dashboard-create-set-btn">
            Create Question Set
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/question-review')} data-tour-id="dashboard-question-bank-btn">Question Bank</Button>
          <Button variant="outlined" color="primary" data-tour-id="dashboard-import-btn">Import Questions</Button>
          <Button variant="outlined" color="error" data-tour-id="dashboard-deleted-btn">Deleted Questions</Button>
        </Box>
      </Box>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2, flexWrap: 'wrap' }}>
        <Typography variant="body2" fontWeight={700} sx={{ mr: 1 }}>FILTERS:</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select displayEmpty value={officeFilter} onChange={e => setOfficeFilter(e.target.value)} data-tour-id="dashboard-filter-office">
            <MenuItem value=""><em>All Offices</em></MenuItem>
            {uniqueOffices.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select displayEmpty value={rankFilter} onChange={e => setRankFilter(e.target.value)} data-tour-id="dashboard-filter-rank">
            <MenuItem value=""><em>All Ranks</em></MenuItem>
            {uniqueRanks.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </Select>
        </FormControl>
        <Button startIcon={<RefreshIcon />} sx={{ ml: 'auto', color: 'text.secondary' }} onClick={() => { setOfficeFilter(''); setRankFilter(''); }} data-tour-id="dashboard-reset-filters-btn">
          Reset
        </Button>
      </Paper>

      {/* Stats summary */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
        {[
          { label: 'Total Sets', value: questionSets.length, color: 'primary.main' },
          { label: 'Completed', value: questionSets.filter(s => s.status === 'Completed').length, color: 'success.main' },
          { label: 'In Progress', value: questionSets.filter(s => s.status === 'In Progress').length, color: '#e65100' },
          { label: 'Shared', value: questionSets.filter(s => s.shared === 'Shared').length, color: 'info.main' },
        ].map(stat => (
          <Paper key={stat.label} elevation={0} sx={{ p: 2, flex: 1, border: '1px solid #e0e0e0', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={800} color={stat.color}>{stat.value}</Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ width: 48 }} />
              {['SET NAME', 'OFFICE', 'RANK', 'TYPE', 'CREATED ON', 'STATUS', 'SHARED', 'ACTIONS'].map(h => (
                <TableCell key={h} sx={{ color: '#fff', fontWeight: 700, fontSize: '0.75rem' }} align={h === 'ACTIONS' ? 'right' : 'left'}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSets.map(row => <Row key={row.id} row={row} />)}
            {filteredSets.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No question sets found. Try adjusting the filters or create a new set.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}