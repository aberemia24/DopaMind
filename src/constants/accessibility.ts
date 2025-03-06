export type FontWeight = "normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export const ACCESSIBILITY = {
  // Dimensiuni minime pentru touch targets (WCAG 2.5.5)
  TOUCH_TARGET: {
    MIN_HEIGHT: 44,
    MIN_WIDTH: 44,
    COMPACT_HEIGHT: 36,
    COMPACT_WIDTH: 36,
    SPACING: 8,
    SPACING_COMPACT: 6,
    SPACING_TIGHT: 4,
  },
  
  // Culori cu contrast îmbunătățit pentru ADHD
  COLORS: {
    // Text colors with WCAG AA compliance
    TEXT: {
      PRIMARY: '#111827',    // Contrast ratio 16:1
      PRIMARY_LIGHT: '#1F2937', // Contrast ratio 14:1
      SECONDARY: '#4B5563',  // Contrast ratio 9:1
      SECONDARY_LIGHT: '#6B7280', // Contrast ratio 7:1
      TERTIARY: '#9CA3AF',   // Contrast ratio 4.5:1
      DISABLED: '#D1D5DB',   // Contrast ratio 3:1
      ON_INTERACTIVE: '#FFFFFF',
      ON_INTERACTIVE_LIGHT: '#F9FAFB',
    },
    
    // Background colors
    BACKGROUND: {
      PRIMARY: '#FFFFFF',
      SECONDARY: '#F9FAFB',
      TERTIARY: '#F3F4F6',
      QUATERNARY: '#E5E7EB',
      DISABLED: '#F3F4F6',
      HIGHLIGHT: '#F0FDF4', // Light green highlight
      HIGHLIGHT_SECONDARY: '#ECFDF5', // Light teal highlight
      HIGHLIGHT_WARNING: '#FFFBEB', // Light yellow highlight
      HIGHLIGHT_ERROR: '#FEF2F2', // Light red highlight
    },
    
    // Interactive elements
    INTERACTIVE: {
      PRIMARY: '#4CAF50',
      PRIMARY_LIGHT: '#66BB6A',
      PRIMARY_DARK: '#388E3C',
      PRIMARY_PRESSED: '#2E7D32',
      
      SECONDARY: '#F3F4F6',
      SECONDARY_LIGHT: '#F9FAFB',
      SECONDARY_DARK: '#E5E7EB',
      SECONDARY_PRESSED: '#D1D5DB',
      
      DANGER: '#DC2626',
      DANGER_LIGHT: '#EF4444',
      DANGER_DARK: '#B91C1C',
      DANGER_PRESSED: '#991B1B',
      
      INFO: '#3B82F6',
      INFO_LIGHT: '#60A5FA',
      INFO_DARK: '#2563EB',
      INFO_PRESSED: '#1D4ED8',
    },
    
    // States
    STATES: {
      SUCCESS: '#059669',
      SUCCESS_LIGHT: '#10B981',
      SUCCESS_DARK: '#047857',
      
      WARNING: '#D97706',
      WARNING_LIGHT: '#F59E0B',
      WARNING_DARK: '#B45309',
      
      ERROR: '#DC2626',
      ERROR_LIGHT: '#EF4444',
      ERROR_DARK: '#B91C1C',
      
      INFO: '#3B82F6',
      INFO_LIGHT: '#60A5FA',
      INFO_DARK: '#2563EB',
    },
    
    // Border colors
    BORDER: {
      LIGHT: 'rgba(0,0,0,0.05)',
      MEDIUM: 'rgba(0,0,0,0.1)',
      DARK: 'rgba(0,0,0,0.15)',
      FOCUS: '#3B82F6',
      ERROR: '#DC2626',
      SUCCESS: '#059669',
    },
    
    // Culori specifice perioadelor zilei
    DAYTIME: {
      MORNING: {
        PRIMARY: '#FEF3C7', // galben foarte deschis
        SECONDARY: '#FEF9C3', // galben pal
        BORDER: '#FDE68A',   // galben mediu pentru border
        ICON: '#D97706',     // galben-portocaliu pentru iconițe
      },
      AFTERNOON: {
        PRIMARY: '#BAE6FD', // albastru-turcoaz deschis
        SECONDARY: '#E0F2FE', // bleu foarte deschis
        BORDER: '#7DD3FC',   // albastru-turcoaz mediu pentru border
        ICON: '#0284C7',     // albastru-turcoaz pentru iconițe
      },
      EVENING: {
        PRIMARY: '#C4B5FD', // mov-indigo deschis
        SECONDARY: '#F3E8FF', // mov foarte deschis
        BORDER: '#A78BFA',   // mov-indigo mediu pentru border
        ICON: '#7C3AED',     // mov-indigo pentru iconițe
      },
    },
  },
  
  // Font sizes optimizate pentru lizibilitate
  TYPOGRAPHY: {
    SIZES: {
      XXS: 10,
      XS: 12,
      SM_MINUS: 13,
      SM: 14,
      SM_PLUS: 15,
      BASE: 16,
      MD_MINUS: 17,
      MD: 18,
      MD_PLUS: 19,
      LG: 20,
      LG_PLUS: 22,
      XL: 24,
      XL_PLUS: 28,
      XXL: 32,
      XXL_PLUS: 36,
      XXXL: 40,
    },
    LINE_HEIGHT: {
      TIGHT: 1.25,
      SEMI_TIGHT: 1.35,
      BASE: 1.5,
      SEMI_RELAXED: 1.65,
      RELAXED: 1.75,
      LOOSE: 2,
    },
    WEIGHTS: {
      THIN: "300" as FontWeight,
      REGULAR: "400" as FontWeight,
      MEDIUM: "500" as FontWeight,
      SEMIBOLD: "600" as FontWeight,
      BOLD: "700" as FontWeight,
      HEAVY: "800" as FontWeight,
    },
  },
  
  // Spațiere consistentă (sistem granular cu valori din 2 în 2 și 4 în 4)
  SPACING: {
    XXS: 2,
    XS: 4,
    S: 6,
    SM: 8,
    SM_PLUS: 10,
    SM_MD: 12,
    MD_MINUS: 14,
    BASE: 16,
    MD_SMALL: 20,
    MD: 24, 
    MD_PLUS: 28,
    LG: 32,
    LG_PLUS: 40,
    XL: 48,
    XL_PLUS: 56,
    XXL: 64,
    XXL_PLUS: 80,
  },
} as const;
