import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useAppState } from '../context/AppStateContext';

type TabKey = 'auto' | 'manual' | 'template';

export const keywords = ['create', 'new', 'generate', 'set', 'question set', 'template'];

const defaultForm = {
  department: 'Deck',
  rank: '',
  topic: '',
  difficulty: '',
  reviewStatus: '',
  reviewedBy: '',
  adaptive: false,
};

export default function CreateSetPage() {
  const navigate = useNavigate();
  const { addQuestionSet, offices } = useAppState();
  const [tab, setTab] = useState<TabKey>('auto');
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState('');

  const handleReset = () => { setForm(defaultForm); setErrors({}); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.rank) e.rank = 'Required';
    if (!form.difficulty) e.difficulty = 'Required';
    return e;
  };

  const handleGenerate = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    addQuestionSet({
      name: `${form.department} Set – ${form.rank}${form.topic ? ' · ' + form.topic : ''}`,
      office: offices[0]?.name || 'HQ',
      rank: form.rank,
      type: form.department,
      status: 'In Progress',
      shared: 'Not Shared',
    });

    setSnackbar('Question set created successfully!');
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'auto', label: 'Auto Create' },
    { key: 'manual', label: 'Create Manually' },
    { key: 'template', label: 'Create with Template' },
  ];

  return (
    <Box sx={{ pb: 10 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color="primary.main">Create Question Set</Typography>
          <Typography variant="body2" color="text.secondary">Configure and generate assessment question sets</Typography>
        </Box>
        <Button variant="contained" sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
          startIcon={<ArrowBackIcon />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {/* Tab Bar */}
      <Box sx={{ display: 'flex', bgcolor: '#1e293b', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
        {tabs.map(t => (
          <Box key={t.key} onClick={() => setTab(t.key)}
            sx={{
              flex: 1,
              py: 1.5,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              bgcolor: tab === t.key ? '#3b82f6' : 'transparent',
              color: tab === t.key ? '#fff' : '#94a3b8',
              transition: 'background 0.2s',
              '&:hover': { color: '#fff' },
              borderRight: t.key !== 'template' ? '1px solid #334155' : 'none',
            }}
            data-tour-id={`create-tab-${t.key}`}
          >
            {t.label}
          </Box>
        ))}
      </Box>

      {tab === 'auto' && (
        <>
          {/* Configuration Card */}
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3 }}>
            <RadioGroup row value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} sx={{ mb: 3 }}>
              <FormControlLabel value="Deck" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600}>Deck</Typography>} />
              <FormControlLabel value="Engine" control={<Radio size="small" />} label={<Typography variant="body2" fontWeight={600}>Engine</Typography>} />
            </RadioGroup>

            <Grid container spacing={2} alignItems="flex-start">
              {/* Rank */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth error={!!errors.rank}>
                  <InputLabel shrink>Rank *</InputLabel>
                  <Select displayEmpty value={form.rank} label="Rank *"
                    onChange={e => { setForm({ ...form, rank: e.target.value }); setErrors({ ...errors, rank: '' }); }}
                    data-tour-id="create-select-rank"
                  >
                    <MenuItem value=""><em>Please Select</em></MenuItem>
                    {['Master', 'Chief Officer', '2nd Officer', '3rd Officer', 'Chief Engineer', '2nd Engineer', '3rd Engineer', '4th Engineer'].map(r => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </Select>
                  {errors.rank && <FormHelperText>{errors.rank}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Topic */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel shrink>Topic</InputLabel>
                  <Select displayEmpty value={form.topic} label="Topic"
                    onChange={e => setForm({ ...form, topic: e.target.value })}
                    data-tour-id="create-select-topic"
                  >
                    <MenuItem value=""><em>Select Topics…</em></MenuItem>
                    {['Navigation', 'Cargo Handling', 'Ship Operations', 'Marine Engineering', 'Electrical', 'Safety'].map(t => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Difficulty */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth error={!!errors.difficulty}>
                  <InputLabel shrink>Difficulty Level *</InputLabel>
                  <Select displayEmpty value={form.difficulty} label="Difficulty Level *"
                    onChange={e => { setForm({ ...form, difficulty: e.target.value }); setErrors({ ...errors, difficulty: '' }); }}
                    data-tour-id="create-select-difficulty"
                  >
                    <MenuItem value=""><em>Please Select</em></MenuItem>
                    {['Easy', 'Intermediate', 'Difficult'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                  {errors.difficulty && <FormHelperText>{errors.difficulty}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Review Status */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel shrink>Question Review Status</InputLabel>
                  <Select displayEmpty value={form.reviewStatus} label="Question Review Status"
                    onChange={e => setForm({ ...form, reviewStatus: e.target.value })}>
                    <MenuItem value=""><em>Please Select</em></MenuItem>
                    {['Pending', 'Reviewed'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Reviewed By */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel shrink>Reviewed By</InputLabel>
                  <Select displayEmpty value={form.reviewedBy} label="Reviewed By"
                    onChange={e => setForm({ ...form, reviewedBy: e.target.value })}>
                    <MenuItem value=""><em>Please Select</em></MenuItem>
                    {['eDOT Solutions', 'Internal Team'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>

              {/* Select Button */}
              <Grid size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button fullWidth variant="contained"
                  sx={{ bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' }, height: 40 }}
                  onClick={() => setSnackbar('Filters applied')}
                  data-tour-id="create-filter-btn"
                >
                  Select
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Bar */}
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={handleGenerate}
              sx={{ bgcolor: '#fcd34d', color: '#92400e', '&:hover': { bgcolor: '#fbbf24' }, fontWeight: 700, px: 4 }}
              data-tour-id="create-generate-btn"
            >
              Generate
            </Button>

            <FormControlLabel
              control={<Checkbox checked={form.adaptive} size="small" onChange={e => setForm({ ...form, adaptive: e.target.checked })} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">Adaptive Question</Typography>
                  <InfoOutlinedIcon fontSize="small" color="primary" />
                </Box>
              }
            />

            <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="error" startIcon={<RefreshIcon />} onClick={handleReset} data-tour-id="create-reset-btn">Reset</Button>
              <Button variant="contained" sx={{ bgcolor: '#64748b', '&:hover': { bgcolor: '#475569' } }}
                onClick={() => setSnackbar('Template saved!')}
                data-tour-id="create-save-template-btn"
              >
                Save Template
              </Button>
            </Box>
          </Paper>
        </>
      )}

      {tab === 'manual' && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>Create Manually</Typography>
          <Typography color="text.secondary">Manual question creation wizard coming soon.</Typography>
          <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate('/question-review')}>Go to Question Review</Button>
        </Paper>
      )}

      {tab === 'template' && (
        <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>Create with Template</Typography>
          <Typography color="text.secondary">Template selection coming soon.</Typography>
        </Paper>
      )}

      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
