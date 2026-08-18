import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import { useAppState } from '../context/AppStateContext';

// ── Types ───────────────────────────────────────────────────────────────────
type Section = 'time-marks' | 'percentage';

const QUESTION_TYPES = [
  { id: 'multiple_choice', title: 'Multiple Choice Questions', defaultTime: 60 },
  { id: 'scenario',        title: 'Scenario Based Questions', defaultTime: 120 },
  { id: 'video',           title: 'Video Questions',          defaultTime: 60 },
  { id: 'audio',           title: 'Audio Questions',          defaultTime: 60 },
];

const DECK_RANKS   = ['Master', 'Chief Officer', '2nd Officer', '3rd Officer'];
const ENGINE_RANKS = ['Chief Engineer', '2nd Engineer', '3rd Engineer', '4th Engineer'];

// ── Marks Card ───────────────────────────────────────────────────────────────
function MarksCard({
  type, data, onChange,
}: {
  type: { id: string; title: string };
  data: { easy: number; intermediate: number; difficult: number; timeLimit: number };
  onChange: (field: string, value: number) => void;
}) {
  const levels = [
    { label: 'Easy',         key: 'easy',         color: '#22c55e' },
    { label: 'Intermediate', key: 'intermediate',  color: '#f59e0b' },
    { label: 'Difficult',    key: 'difficult',     color: '#ef4444' },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, height: '100%', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }, transition: 'all 0.2s' }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ pb: 1.5, mb: 2.5, borderBottom: '2px solid #f0f0f0' }}>
        {type.title}
      </Typography>

      {/* Marks Allocation */}
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Marks Allocation
      </Typography>
      {levels.map(({ label, key, color }) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography variant="body2" fontWeight={600}>{label}</Typography>
          </Box>
          <TextField
            size="small" type="number"
            value={data[key as keyof typeof data]}
            onChange={e => onChange(key, Number(e.target.value))}
            sx={{ width: 80, '& input': { textAlign: 'center', fontWeight: 700 } }}
            inputProps={{ min: 0 }}
            InputProps={{ endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>pts</InputAdornment> }}
          />
        </Box>
      ))}

      <Divider sx={{ my: 2 }} />

      {/* Time Allocation */}
      <Typography variant="overline" fontWeight={800} color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Time Allocation
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" fontWeight={600}>Default Time Limit</Typography>
        <TextField
          size="small" type="number"
          value={data.timeLimit}
          onChange={e => onChange('timeLimit', Number(e.target.value))}
          sx={{ width: 110, '& input': { textAlign: 'center', fontWeight: 700 } }}
          inputProps={{ min: 0 }}
          InputProps={{ endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>sec</InputAdornment> }}
        />
      </Box>
    </Paper>
  );
}

// ── Percentage Card ─────────────────────────────────────────────────────────
function PercentageCard({
  rank, value, onChange,
}: {
  rank: string; value: number; onChange: (v: number) => void;
}) {
  const rankKey = rank.toLowerCase().replace(/\s+/g, '_');
  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 14px rgba(0,0,0,0.07)' }, transition: 'all 0.2s' }}>
      <Typography variant="body1" fontWeight={700} gutterBottom>{rank}</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Slider
          value={value}
          min={0} max={100} step={5}
          onChange={(_, v) => onChange(v as number)}
          sx={{ flex: 1, color: value >= 80 ? 'success.main' : value >= 60 ? 'warning.main' : 'error.main' }}
        />
        <TextField
          size="small" type="number"
          value={value}
          onChange={e => onChange(Math.min(100, Math.max(0, Number(e.target.value))))}
          sx={{ width: 80, '& input': { textAlign: 'center', fontWeight: 800 } }}
          inputProps={{ min: 0, max: 100 }}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
        />
      </Box>
    </Paper>
  );
}

// ── Main Settings Page ──────────────────────────────────────────────────────
export default function SettingsPage() {
  const { settings, updateSettings } = useAppState();
  const [activeSection, setActiveSection] = useState<Section>('time-marks');
  const [localMarks, setLocalMarks] = useState(settings.marks);
  const [localPercentages, setLocalPercentages] = useState(settings.percentages);
  const [snackbar, setSnackbar] = useState('');

  const handleMarksChange = (typeId: string, field: string, value: number) => {
    setLocalMarks(prev => ({ ...prev, [typeId]: { ...prev[typeId], [field]: value } }));
  };

  const handlePercentageChange = (rankKey: string, value: number) => {
    setLocalPercentages(prev => ({ ...prev, [rankKey]: value }));
  };

  const handleSave = () => {
    updateSettings({ ...settings, marks: localMarks, percentages: localPercentages });
    setSnackbar('Settings saved successfully!');
  };

  const navItems: { key: Section; label: string; description: string }[] = [
    { key: 'time-marks',   label: 'Time & Marks',      description: 'Configure marks and time allocations per question type' },
    { key: 'percentage',   label: 'Pass Percentages',  description: 'Set pass thresholds for each rank' },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="primary.dark">Settings</Typography>
          <Typography variant="body1" color="text.secondary">Configure assessment parameters and thresholds for the Sailor Skill platform.</Typography>
        </Box>
        <Button variant="contained" color="primary" size="large" sx={{ px: 5 }} onClick={handleSave}>
          Save Settings
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* ── Sidebar ── */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>
            {navItems.map((item, i) => (
              <Box
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                sx={{
                  p: 2, cursor: 'pointer',
                  borderLeft: '4px solid',
                  borderLeftColor: activeSection === item.key ? 'primary.main' : 'transparent',
                  bgcolor: activeSection === item.key ? 'primary.50' : 'white',
                  borderBottom: i < navItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                  '&:hover': { bgcolor: '#f8fafc', borderLeftColor: activeSection === item.key ? 'primary.main' : '#ddd' },
                  transition: 'all 0.15s',
                }}
              >
                <Typography variant="body1" fontWeight={700} color={activeSection === item.key ? 'primary.main' : 'text.primary'}>
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">{item.description}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* ── Content ── */}
        <Grid size={{ xs: 12, md: 9 }}>

          {/* Time & Marks */}
          {activeSection === 'time-marks' && (
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>Time &amp; Marks Configuration</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define how many points each difficulty level is worth and how long each question type is allowed.
              </Typography>
              <Grid container spacing={3}>
                {QUESTION_TYPES.map(type => {
                  const data = localMarks[type.id] || { easy: 1, intermediate: 2, difficult: 3, timeLimit: type.defaultTime };
                  return (
                    <Grid key={type.id} size={{ xs: 12, sm: 6 }}>
                      <MarksCard type={type} data={data} onChange={(field, val) => handleMarksChange(type.id, field, val)} />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {/* Pass Percentages */}
          {activeSection === 'percentage' && (
            <Box>
              <Typography variant="h5" fontWeight={800} gutterBottom>Pass Percentage Thresholds</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Set the minimum pass percentage required for each rank across Deck and Engine departments. Default is 80%.
              </Typography>

              {/* Deck */}
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 6, height: 28, bgcolor: '#3b82f6', borderRadius: 3 }} />
                  <Typography variant="h6" fontWeight={800}>Deck Department</Typography>
                </Box>
                <Grid container spacing={2}>
                  {DECK_RANKS.map(rank => {
                    const key = rank.toLowerCase().replace(/\s+/g, '_').replace(/nd|rd|th/g, match => match);
                    const rankKey = rank.toLowerCase().replace(/\s+/g, '_');
                    const value = localPercentages[rankKey] ?? localPercentages[key] ?? 80;
                    return (
                      <Grid key={rank} size={{ xs: 12, sm: 6 }}>
                        <PercentageCard rank={rank} value={value}
                          onChange={v => handlePercentageChange(rankKey, v)} />
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>

              {/* Engine */}
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 6, height: 28, bgcolor: '#f59e0b', borderRadius: 3 }} />
                  <Typography variant="h6" fontWeight={800}>Engine Department</Typography>
                </Box>
                <Grid container spacing={2}>
                  {ENGINE_RANKS.map(rank => {
                    const rankKey = rank.toLowerCase().replace(/\s+/g, '_');
                    const value = localPercentages[rankKey] ?? 80;
                    return (
                      <Grid key={rank} size={{ xs: 12, sm: 6 }}>
                        <PercentageCard rank={rank} value={value}
                          onChange={v => handlePercentageChange(rankKey, v)} />
                      </Grid>
                    );
                  })}
                </Grid>
              </Paper>
            </Box>
          )}

        </Grid>
      </Grid>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSnackbar('')}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
