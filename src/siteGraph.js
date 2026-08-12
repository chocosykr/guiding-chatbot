export const siteGraph = {
  home: { path: '/', label: 'Home', keywords: ['start','main'],
    edges: [
      { to: 'dashboard', selector: '[data-tour-id="nav-dashboard"]' },
      { to: 'pricing', selector: '[data-tour-id="nav-pricing"]' },
      { to: 'settings', selector: '[data-tour-id="nav-settings"]' },
    ]},
  dashboard: { path: '/dashboard', label: 'Dashboard', keywords: ['overview','stats'],
    edges: [{ to: 'home', selector: '[data-tour-id="nav-home"]' }] },
  pricing: { path: '/pricing', label: 'Pricing', keywords: ['plans','cost'],
    edges: [{ to: 'home', selector: '[data-tour-id="nav-home"]' }] },
  settings: { path: '/settings', label: 'Settings', keywords: ['account','preferences'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
    ]},
  'settings.profile': { path: '/settings/profile', label: 'Profile Settings', keywords: ['name','account'],
    edges: [
      { to: 'settings.profile.password', selector: '[data-tour-id="profile-tab-password"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
    ]},
  'settings.profile.password': { path: '/settings/profile', label: 'Change Password', keywords: ['password','security'],
    edges: [{ to: 'settings.profile', selector: '[data-tour-id="profile-tab-info"]' }] },
  'settings.billing': { path: '/settings/billing', label: 'Billing', keywords: ['invoices','payment'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.notifications', selector: '[data-tour-id="settings-sidebar-notifications"]' },
    ]},
  'settings.notifications': { path: '/settings/notifications', label: 'Notifications', keywords: ['alerts','email'],
    edges: [
      { to: 'settings.profile', selector: '[data-tour-id="settings-sidebar-profile"]' },
      { to: 'settings.billing', selector: '[data-tour-id="settings-sidebar-billing"]' },
    ]},
};
