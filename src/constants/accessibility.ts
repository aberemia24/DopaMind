export type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export const ACCESSIBILITY = {
  // Dimensiuni minime pentru touch targets (WCAG 2.5.5)
  TOUCH_TARGET: {
    MIN_HEIGHT: 44,
    MIN_WIDTH: 44,
    SPACING: 8,
  },
  
  // Culori cu contrast îmbunătățit pentru ADHD
  COLORS: {
    // Text colors with WCAG AA compliance
    TEXT: {
      PRIMARY: '#111827',    // Contrast ratio 16:1
      SECONDARY: '#4B5563',  // Contrast ratio 9:1
      DISABLED: '#6B7280',   // Contrast ratio 7:1
      ON_INTERACTIVE: '#FFFFFF',
    },
    
    // Background colors
    BACKGROUND: {
      PRIMARY: '#FFFFFF',
      SECONDARY: '#F9FAFB',
      DISABLED: '#E5E7EB',
    },
    
    // Interactive elements
    INTERACTIVE: {
      PRIMARY: '#4CAF50',
      PRIMARY_PRESSED: '#388E3C',
      SECONDARY: '#F3F4F6',
      SECONDARY_PRESSED: '#E5E7EB',
      DANGER: '#DC2626',
      DANGER_PRESSED: '#B91C1C',
    },
    
    // States
    STATES: {
      SUCCESS: '#059669',
      WARNING: '#D97706',
      ERROR: '#DC2626',
      INFO: '#3B82F6',
    },
  },
  
  // Font sizes optimizate pentru lizibilitate
  TYPOGRAPHY: {
    SIZES: {
      XS: 12,
      SM: 14,
      BASE: 16,
      LG: 18,
      XL: 20,
      XXL: 24,
    },
    LINE_HEIGHT: {
      TIGHT: 1.25,
      BASE: 1.5,
      RELAXED: 1.75,
    },
    WEIGHTS: {
      REGULAR: "400" as FontWeight,
      MEDIUM: "500" as FontWeight,
      SEMIBOLD: "600" as FontWeight,
      BOLD: "700" as FontWeight,
    },
  },
  
  // Spațiere consistentă (multiplii de 8)
  SPACING: {
    XS: 4,
    SM: 8,
    BASE: 16,
    MD: 24, 
    LG: 32,
    XL: 48,
    XXL: 64,
  },
} as const;
