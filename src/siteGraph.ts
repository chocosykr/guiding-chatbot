export interface TourEdge {
  to: string;
  selector: string;
}

export interface TourNode {
  path: string;
  label: string;
  keywords: string[];
  edges: TourEdge[];
}

export type SiteGraph = Record<string, TourNode>;

export const siteGraph: SiteGraph = {
  home: {
    path: '/',
    label: 'Home',
    keywords: ['start', 'main', 'landing', 'welcome'],
    edges: [
      { to: 'dashboard', selector: '[data-tour-id="nav-dashboard"]' },
      { to: 'pricing', selector: '[data-tour-id="nav-pricing"]' },
      { to: 'projects', selector: '[data-tour-id="nav-projects"]' },
      { to: 'team', selector: '[data-tour-id="nav-team"]' },
      { to: 'analytics', selector: '[data-tour-id="nav-analytics"]' },
      { to: 'settings', selector: '[data-tour-id="nav-settings"]' },
      { to: 'help', selector: '[data-tour-id="nav-help"]' },
    ],
  },
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    keywords: ['overview', 'stats', 'metrics'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'projects', selector: '[data-tour-id="nav-projects"]' },
      { to: 'analytics', selector: '[data-tour-id="nav-analytics"]' },
      { to: 'pricing', selector: '[data-tour-id="nav-pricing"]' },
    ],
  },
  projects: {
    path: '/projects',
    label: 'Projects',
    keywords: ['project', 'workspace', 'tours', 'manage'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'dashboard', selector: '[data-tour-id="nav-dashboard"]' },
      { to: 'team', selector: '[data-tour-id="nav-team"]' },
      { to: 'analytics', selector: '[data-tour-id="nav-analytics"]' },
    ],
  },
  team: {
    path: '/team',
    label: 'Team',
    keywords: ['team', 'members', 'users', 'invite', 'people'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'projects', selector: '[data-tour-id="nav-projects"]' },
      { to: 'settings', selector: '[data-tour-id="nav-settings"]' },
    ],
  },
  analytics: {
    path: '/analytics',
    label: 'Analytics',
    keywords: ['analytics', 'charts', 'reports', 'data', 'insights'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'dashboard', selector: '[data-tour-id="nav-dashboard"]' },
      { to: 'pricing', selector: '[data-tour-id="nav-pricing"]' },
    ],
  },
  pricing: {
    path: '/pricing',
    label: 'Pricing',
    keywords: ['plans', 'cost', 'subscribe', 'upgrade', 'billing'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'settings.billing', selector: '[data-tour-id="nav-settings"]' },
    ],
  },
  help: {
    path: '/help',
    label: 'Help Center',
    keywords: ['help', 'support', 'docs', 'faq', 'guide', 'contact'],
    edges: [
      { to: 'home', selector: '[data-tour-id="nav-home"]' },
      { to: 'settings', selector: '[data-tour-id="nav-settings"]' },
    ],
  },
  settings: {
    path: '/settings',
    label: 'Settings',
    keywords: ['account', 'preferences', 'config'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.security', selector: '[data-tour-id="settings-sidebar-security"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
      { to: 'settings.integrations', selector: '[data-tour-id="settings-sidebar-integrations"]' },
    ],
  },
  'settings.profile': {
    path: '/settings/profile',
    label: 'Profile Settings',
    keywords: ['name', 'account', 'avatar', 'bio'],
    edges: [
      { to: 'settings.profile.password', selector: '[data-tour-id="profile-tab-password"]' },
      { to: 'settings.profile.preferences', selector: '[data-tour-id="profile-tab-preferences"]' },
      { to: 'settings.security', selector: '[data-tour-id="settings-sidebar-security"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
      { to: 'settings.integrations', selector: '[data-tour-id="settings-sidebar-integrations"]' },
    ],
  },
  'settings.profile.password': {
    path: '/settings/profile',
    label: 'Change Password',
    keywords: ['password', 'security', 'change'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="profile-tab-info"]' },
      { to: 'settings.profile.preferences', selector: '[data-tour-id="profile-tab-preferences"]' },
    ],
  },
  'settings.profile.preferences': {
    path: '/settings/profile',
    label: 'Preferences',
    keywords: ['preferences', 'theme', 'language', 'timezone'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="profile-tab-info"]' },
      { to: 'settings.profile.password', selector: '[data-tour-id="profile-tab-password"]' },
    ],
  },
  'settings.security': {
    path: '/settings/security',
    label: 'Security',
    keywords: ['security', '2fa', 'sessions', 'login', 'devices'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
      { to: 'settings.integrations', selector: '[data-tour-id="settings-sidebar-integrations"]' },
    ],
  },
  'settings.billing': {
    path: '/settings/billing',
    label: 'Billing',
    keywords: ['invoices', 'payment', 'card', 'subscription'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.security', selector: '[data-tour-id="settings-sidebar-security"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
      { to: 'settings.integrations', selector: '[data-tour-id="settings-sidebar-integrations"]' },
    ],
  },
  'settings.notifications': {
    path: '/settings/notifications',
    label: 'Notifications',
    keywords: ['alerts', 'email', 'push', 'notifications'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.security', selector: '[data-tour-id="settings-sidebar-security"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.integrations', selector: '[data-tour-id="settings-sidebar-integrations"]' },
    ],
  },
  'settings.integrations': {
    path: '/settings/integrations',
    label: 'Integrations',
    keywords: ['integrations', 'api', 'webhooks', 'slack', 'github', 'connect'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.security', selector: '[data-tour-id="settings-sidebar-security"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
    ],
  },
};
