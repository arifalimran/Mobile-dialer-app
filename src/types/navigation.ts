export type BottomNavScreen =
  | 'DASHBOARD'
  | 'DIALER'
  | 'CALLBACKS'
  | 'INVENTORY'
  | 'WALLET'
  | 'SHIFTS';

/** Screens reachable from the Agent Drawer Menu (Module 2). Simple in-app screen
 * switching is used instead of @react-navigation to avoid adding new native
 * modules to an already Expo-Go-sensitive project (see PROJECT_STATUS.md).
 */
export type AppScreen =
  | BottomNavScreen
  | 'BULLETINS'
  | 'KPI'
  | 'SHIFTS'
  | 'SCHEDULED_CALLBACKS'
  | 'SITE_VISITS'
  | 'WALLET'
  | 'REGISTRATION';
