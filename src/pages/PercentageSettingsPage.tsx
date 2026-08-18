import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import InputBase from '@mui/material/InputBase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAppState } from '../context/AppStateContext';

const DECK_RANKS = ['2nd Mate', '3rd Mate', 'Cadet', 'Chief Mate', 'Master'];
const ENGINE_RANKS = ['2nd Engineer', '3rd/4th Engineer', 'Chief Engineer', 'ETO / Electrical officer', 'TME'];

export const keywords = ['percentage', 'threshold', 'pass', 'deck', 'engine', 'rank', 'settings'];

function RankCard({ title, value, onChange, tourId }: { title: string; value: number; onChange: (v: number) => void; tourId?: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid #e2e8f0',
        borderRadius: 3,
        bgcolor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 140
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box sx={{ width: 4, height: 20, bgcolor: '#2563eb', borderRadius: 4 }} />
        <Typography variant="subtitle1" fontWeight={800} color="#1e293b">
          {title}
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ display: 'block', mb: 1, letterSpacing: 0.5 }}>
          PASS PERCENTAGE
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              width: 80,
            }}
          >
            <InputBase
              type="number"
              value={value}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange(Math.max(0, Math.min(100, val)));
                else onChange(0);
              }}
              sx={{ fontWeight: 800, color: '#0f172a', width: '100%', textAlign: 'center' }}
              inputProps={{ min: 0, max: 100, style: { textAlign: 'center' } }}
              data-tour-id={tourId}
            />
          </Box>
          <Typography variant="body1" fontWeight={700} color="#64748b">
            %
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function PercentageSettingsPage() {
  const { settings, updateSettings } = useAppState();
  const [activeTab, setActiveTab] = useState<'deck' | 'engine'>('deck');
  const [localSettings, setLocalSettings] = useState(settings.percentages || {});
  const [snackbar, setSnackbar] = useState('');

  const handlePercentageChange = (rank: string, value: number) => {
    const key = rank.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const getValue = (rank: string) => {
    const key = rank.toLowerCase().replace(/[^a-z0-9]/g, '_');
    // Default fallback values based on the screenshots if not in state
    if (localSettings[key] !== undefined) return localSettings[key];
    if (rank === 'TME') return 75;
    if (rank === '3rd Mate' || rank === 'Cadet' || rank === 'Chief Mate' || rank === 'Master') return 60;
    return 50;
  };

  const handleSave = () => {
    updateSettings({ ...settings, percentages: localSettings });
    setSnackbar('Settings saved successfully!');
  };

  const activeRanks = activeTab === 'deck' ? DECK_RANKS : ENGINE_RANKS;

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: 'calc(100vh - 100px)', borderRadius: 3, p: { xs: 2, md: 4 } }}>
      
      {/* Header Area */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#2563eb" sx={{ mb: 1 }}>
            Percentage Settings
          </Typography>
          <Typography variant="body2" color="#64748b" fontWeight={500}>
            Set minimum passing percentages by department and rank
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            bgcolor: '#eab308',
            color: '#ffffff',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1,
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(234, 179, 8, 0.2)',
            '&:hover': {
              bgcolor: '#ca8a04',
              boxShadow: '0 6px 8px -1px rgba(234, 179, 8, 0.3)',
            }
          }}
          data-tour-id="pct-save-btn"
        >
          Save
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, borderBottom: '1px solid #e2e8f0' }}>
        {(['deck', 'engine'] as const).map(tab => (
          <Box
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              pb: 1.5,
              cursor: 'pointer',
              borderBottom: '3px solid',
              borderColor: activeTab === tab ? '#2563eb' : 'transparent',
              color: activeTab === tab ? '#2563eb' : '#64748b',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#2563eb' }
            }}
            data-tour-id={`pct-tab-${tab}`}
          >
            <Typography variant="body1" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
              {tab}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Grid */}
      <Grid container spacing={3}>
        {activeRanks.map((rank) => (
          <Grid key={rank} size={{ xs: 12, sm: 6, md: 4 }}>
            <RankCard
              title={rank}
              value={getValue(rank)}
              onChange={(val) => handlePercentageChange(rank, val)}
              tourId={`pct-input-${rank.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={3000}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSnackbar('')} sx={{ width: '100%', fontWeight: 600 }}>
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}
