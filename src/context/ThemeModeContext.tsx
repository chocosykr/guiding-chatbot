import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blue, red, orange, green, grey } from '@mui/material/colors';

type PaletteMode = 'light' | 'dark';

interface ThemeModeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  // Load mode from localStorage or default to 'light'
  const [mode, setMode] = useState<PaletteMode>(() => {
    const saved = localStorage.getItem('theme_mode');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme_mode', mode);
  }, [mode]);
  
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: blue[800],
            light: blue[600],
            dark: blue[900],
          },
          secondary: {
            main: orange[700],
            light: orange[500],
            dark: orange[800],
          },
          error: { main: red[700] },
          success: { main: green[600] },
          background: {
            default: mode === 'light' ? '#f8fafc' : '#0f172a',
            paper: mode === 'light' ? '#ffffff' : '#1e293b',
          },
          text: {
            primary: mode === 'light' ? grey[900] : '#f1f5f9',
            secondary: mode === 'light' ? grey[600] : '#94a3b8',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: { textTransform: 'none', fontWeight: 600, borderRadius: 6 },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: { backgroundImage: 'none' },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: mode === 'light' 
                  ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                  : 'none',
                border: mode === 'dark' ? '1px solid #334155' : 'none',
              },
            },
          },
          MuiDataGrid: {
            styleOverrides: {
              root: {
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: mode === 'light' ? '1px solid #f0f0f0' : '1px solid #334155',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: blue[800],
                  color: '#fff',
                  borderRadius: 0,
                },
                '& .MuiDataGrid-iconSeparator': {
                  display: 'none',
                },
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
