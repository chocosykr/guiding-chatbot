import React, { createContext, useContext, useState, useEffect } from 'react';
import type { QuestionSet, Office, Client, Settings } from './types';

export type { QuestionSet, Office, Client, Settings };

const defaultQuestionSets: QuestionSet[] = [
  {
    id: 1,
    name: 'Set 1204',
    office: 'Mumbai',
    rank: '2nd Engineer',
    type: 'Deck',
    created: '12 Oct 2023',
    status: 'Completed',
    shared: 'Shared',
    history: [
      { id: '1204-1', name: 'Deck Assessment A', marks: 100, passMark: 80, time: '60 mins', created: '10 Oct 2023', assignedTo: 'John Doe' },
      { id: '1204-2', name: 'Deck Assessment B', marks: 100, passMark: 80, time: '60 mins', created: '11 Oct 2023', assignedTo: 'Jane Smith' },
    ],
  },
  {
    id: 2,
    name: 'Set 1205',
    office: 'Singapore',
    rank: 'Chief Officer',
    type: 'Engine',
    created: '14 Oct 2023',
    status: 'In Progress',
    shared: 'Not Shared',
    history: [
      { id: '1205-1', name: 'Engine Safety Test', marks: 50, passMark: 40, time: '30 mins', created: '14 Oct 2023', assignedTo: 'Alice Green' },
    ],
  },
];

const defaultOffices: Office[] = [
  { id: 1, name: 'Mumbai Office', code: 'MUM-01', location: 'India', status: 'Active' },
  { id: 2, name: 'Singapore Hub', code: 'SIN-01', location: 'Singapore', status: 'Active' },
  { id: 3, name: 'London Branch', code: 'LON-02', location: 'United Kingdom', status: 'Inactive' },
  { id: 4, name: 'Dubai Office', code: 'DXB-01', location: 'UAE', status: 'Active' },
  { id: 5, name: 'Houston HQ', code: 'HOU-01', location: 'USA', status: 'Active' },
];

const defaultClients: Client[] = [
  { id: 1, name: 'Oceanic Shipping Co.', users: 120, status: 'Active', plan: 'Enterprise', joined: 'Jan 2022' },
  { id: 2, name: 'Meridian Maritime', users: 45, status: 'Active', plan: 'Pro', joined: 'Mar 2023' },
  { id: 3, name: 'Global Logistics Marine', users: 12, status: 'Inactive', plan: 'Basic', joined: 'Nov 2021' },
];

const defaultSettings: Settings = {
  marks: {
    multiple_choice: { easy: 1, intermediate: 2, difficult: 3, timeLimit: 60 },
    scenario: { easy: 1, intermediate: 2, difficult: 3, timeLimit: 120 },
    video: { easy: 1, intermediate: 2, difficult: 3, timeLimit: 60 },
    audio: { easy: 1, intermediate: 2, difficult: 3, timeLimit: 60 },
  },
  percentages: {
    master: 80, chief_officer: 80, second_officer: 80, third_officer: 80,
    chief_engineer: 80, second_engineer: 80, third_engineer: 80, fourth_engineer: 80
  }
};

interface AppState {
  questionSets: QuestionSet[];
  offices: Office[];
  clients: Client[];
  settings: Settings;
  addQuestionSet: (set: Partial<QuestionSet>) => void;
  updateQuestionSetStatus: (id: number, status: string) => void;
  deleteQuestionSet: (id: number) => void;
  addOffice: (office: Partial<Office>) => void;
  updateOffice: (id: number, updates: Partial<Office>) => void;
  updateOfficeStatus: (id: number, status: string) => void;
  deleteOffice: (id: number) => void;
  addClient: (client: Partial<Client>) => void;
  updateClient: (id: number, updates: Partial<Client>) => void;
  updateClientStatus: (id: number, status: string) => void;
  deleteClient: (id: number) => void;
  updateSettings: (newSettings: Settings) => void;
}

const AppStateContext = createContext<AppState | undefined>(undefined);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>(() => {
    try { const s = localStorage.getItem('app_questionSets'); return s ? JSON.parse(s) : defaultQuestionSets; } catch { return defaultQuestionSets; }
  });
  const [offices, setOffices] = useState<Office[]>(() => {
    try { const s = localStorage.getItem('app_offices'); return s ? JSON.parse(s) : defaultOffices; } catch { return defaultOffices; }
  });
  const [clients, setClients] = useState<Client[]>(() => {
    try { const s = localStorage.getItem('app_clients'); return s ? JSON.parse(s) : defaultClients; } catch { return defaultClients; }
  });
  const [settings, setSettings] = useState<Settings>(() => {
    try { const s = localStorage.getItem('app_settings'); return s ? JSON.parse(s) : defaultSettings; } catch { return defaultSettings; }
  });

  useEffect(() => { localStorage.setItem('app_questionSets', JSON.stringify(questionSets)); }, [questionSets]);
  useEffect(() => { localStorage.setItem('app_offices', JSON.stringify(offices)); }, [offices]);
  useEffect(() => { localStorage.setItem('app_clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('app_settings', JSON.stringify(settings)); }, [settings]);

  const addQuestionSet = (set: Partial<QuestionSet>) => {
    const newSet: QuestionSet = {
      id: Date.now(), name: set.name || 'New Set', office: set.office || 'N/A',
      rank: set.rank || 'N/A', type: set.type || 'N/A',
      created: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'In Progress', shared: 'Not Shared', history: [], ...set,
    };
    setQuestionSets(prev => [newSet, ...prev]);
  };

  const updateQuestionSetStatus = (id: number, status: string) =>
    setQuestionSets(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  const deleteQuestionSet = (id: number) =>
    setQuestionSets(prev => prev.filter(s => s.id !== id));

  const addOffice = (office: Partial<Office>) => {
    const newOffice: Office = { id: Date.now(), name: office.name || 'New Office', code: office.code || 'N/A', location: office.location || 'N/A', status: 'Active', ...office };
    setOffices(prev => [...prev, newOffice]);
  };

  const updateOffice = (id: number, updates: Partial<Office>) =>
    setOffices(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

  const updateOfficeStatus = (id: number, status: string) =>
    setOffices(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  const deleteOffice = (id: number) =>
    setOffices(prev => prev.filter(o => o.id !== id));

  const addClient = (client: Partial<Client>) => {
    const newClient: Client = {
      id: Date.now(), name: client.name || 'New Client', users: client.users || 0,
      status: 'Active', plan: client.plan || 'Basic',
      joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }), ...client,
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: number, updates: Partial<Client>) =>
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));

  const updateClientStatus = (id: number, status: string) =>
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));

  const deleteClient = (id: number) =>
    setClients(prev => prev.filter(c => c.id !== id));

  const updateSettings = (newSettings: Settings) => setSettings(newSettings);

  return (
    <AppStateContext.Provider value={{
      questionSets, offices, clients, settings,
      addQuestionSet, updateQuestionSetStatus, deleteQuestionSet,
      addOffice, updateOffice, updateOfficeStatus, deleteOffice,
      addClient, updateClient, updateClientStatus, deleteClient,
      updateSettings
    }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within an AppStateProvider');
  return context;
}
