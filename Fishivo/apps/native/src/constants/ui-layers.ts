export const UI_LAYERS = {
  // Base layer - content, screens
  CONTENT: 1,
  
  // Navigation layers - Professional range
  TAB_BAR: 1000,
  BACKDROP: 1080, // TabBar üstü, NavBar altı - research-based positioning
  NAV_BAR: 1100,
  
  // Floating elements
  FLOATING_MENU: 1200,
  MODAL: 1300,
  TOAST: 1400,
  
  // System layers
  LOADING: 1500,
  DEBUG: 9999,
} as const;

export type UILayer = typeof UI_LAYERS[keyof typeof UI_LAYERS];