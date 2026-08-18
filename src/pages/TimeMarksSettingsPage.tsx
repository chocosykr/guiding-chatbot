import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useAppState } from '../context/AppStateContext';

const questionTypes = [
  { id: 'multiple_choice', title: 'Multiple Choice Questions' },
  { id: 'scenario', title: 'Scenario Based Questions' },
  { id: 'video', title: 'Video Questions' },
  { id: 'audio', title: 'Audio Questions' },
];

export const keywords = ['time', 'marks', 'points', 'duration', 'settings'];

export default function TimeMarksSettingsPage() {
  const { settings, updateSettings } = useAppState();
  const [localMarks, setLocalMarks] = useState(settings.marks);
  const [snackbar, setSnackbar] = useState('');

  const handleChange = (typeId: string, field: string, value: number) => {
    setLocalMarks(prev => ({
      ...prev,
      [typeId]: { ...prev[typeId], [field]: value }
    }));
  };

  const handleSave = () => {
    updateSettings({ ...settings, marks: localMarks });
    setSnackbar('Settings saved successfully!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color="primary.dark">Time & Marks Settings</Typography>
        <Button variant="contained" color="primary" sx={{ px: 4 }} onClick={handleSave} data-tour-id="time-marks-save-btn">Save Settings</Button>
      </Box>

      <Grid container spacing={3}>
        {questionTypes.map((type) => {
          const data = localMarks[type.id] || { easy: 1, intermediate: 2, difficult: 3, timeLimit: 60 };
          return (
            <Grid key={type.id} size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ borderBottom: '1px solid #e0e0e0', pb: 1, mb: 3 }}>
                  {type.title}
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                    MARKS ALLOCATION
                  </Typography>
                  {[
                    { label: 'Easy', key: 'easy', color: 'success.main' },
                    { label: 'Intermediate', key: 'intermediate', color: 'warning.main' },
                    { label: 'Difficult', key: 'difficult', color: 'error.main' },
                  ].map(({ label, key, color }) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: color }} />
                        <Typography variant="body2" fontWeight={600}>{label}</Typography>
                      </Box>
                      <TextField
                        size="small"
                        type="number"
                        value={data[key as keyof typeof data]}
                        onChange={e => handleChange(type.id, key, Number(e.target.value))}
                        sx={{ width: 80 }}
                        inputProps={{ min: 0 }}
                        data-tour-id={`time-marks-${type.id}-${key}`}
                      />
                    </Box>
                  ))}
                </Box>

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
                    TIME ALLOCATION
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>Default Time Limit</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={data.timeLimit}
                      onChange={e => handleChange(type.id, 'timeLimit', Number(e.target.value))}
                      sx={{ width: 120 }}
                      inputProps={{ min: 0 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                      }}
                      data-tour-id={`time-marks-${type.id}-timeLimit`}
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar('')} severity="success" sx={{ width: '100%' }}>{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}
