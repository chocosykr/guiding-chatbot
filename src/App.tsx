import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeModeProvider } from './context/ThemeModeContext';
import TopNav from './components/TopNav';
import ChatWidget from './components/ChatWidget';

import DashboardPage from './pages/DashboardPage';
import CreateSetPage from './pages/CreateSetPage';
import QuestionReviewPage from './pages/QuestionReviewPage';
import OfficePage from './pages/OfficePage';
import ManageClientsPage from './pages/ManageClientsPage';
import TimeMarksSettingsPage from './pages/TimeMarksSettingsPage';
import PercentageSettingsPage from './pages/PercentageSettingsPage';

import { AppStateProvider } from './context/AppStateContext';

function App() {
  return (
    <AppStateProvider>
      <ThemeModeProvider>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <TopNav />
            <Container maxWidth="xl" sx={{ py: 4, px: { xs: 2, md: 4 } }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/create-set" element={<CreateSetPage />} />
                <Route path="/question-review" element={<QuestionReviewPage />} />
                <Route path="/office" element={<OfficePage />} />
                <Route path="/manage-clients" element={<ManageClientsPage />} />

                <Route path="/settings" element={<Navigate to="/settings/time-marks" replace />} />
                <Route path="/settings/time-marks" element={<TimeMarksSettingsPage />} />
                <Route path="/settings/percentage" element={<PercentageSettingsPage />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Container>
            <ChatWidget />
          </Box>
        </BrowserRouter>
      </ThemeModeProvider>
    </AppStateProvider>
  );
}

export default App;
