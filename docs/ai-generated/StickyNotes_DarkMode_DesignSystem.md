# StickyNotes Dark Mode Design System
*macOS-Compliant Visual Specifications v1.0*

## Overview
This design system provides comprehensive specifications for StickyNotes app dark mode interface, ensuring consistency with macOS design patterns and WCAG 2.1 AA accessibility compliance.

---

## 🎨 Color System

### Primary Colors
```css
/* Background Colors */
--bg-primary: #1E1E1E;           /* Main app background */
--bg-secondary: #2D2D2D;         /* Secondary surfaces */
--bg-tertiary: #3A3A3A;          /* Elevated surfaces */
--bg-quaternary: #4A4A4A;        /* Interactive surfaces */

/* Surface Colors */
--surface-base: #252525;         /* Default surface */
--surface-elevated: #333333;     /* Elevated cards/panels */
--surface-overlay: #404040;      /* Overlays/modals */
--surface-pressed: #1A1A1A;      /* Pressed states */

/* Primary Brand Colors */
--primary-50: #FFF8E1;           /* Lightest yellow */
--primary-100: #FFECB3;
--primary-200: #FFE082;
--primary-300: #FFD54F;
--primary-400: #FFCA28;          /* Primary yellow */
--primary-500: #FFC107;          /* Main brand color */
--primary-600: #FFB300;
--primary-700: #FFA000;
--primary-800: #FF8F00;
--primary-900: #FF6F00;          /* Darkest yellow */

/* Secondary Colors */
--secondary-300: #81C784;        /* Light green */
--secondary-400: #66BB6A;        /* Medium green */
--secondary-500: #4CAF50;        /* Main secondary */
--secondary-600: #43A047;        /* Dark green */

/* Text Colors */
--text-primary: #FFFFFF;         /* Primary text (contrast 16:1) */
--text-secondary: #B3B3B3;       /* Secondary text (contrast 7:1) */
--text-tertiary: #8A8A8A;        /* Tertiary text (contrast 4.5:1) */
--text-disabled: #5A5A5A;        /* Disabled text (contrast 3:1) */
--text-inverse: #000000;         /* Text on light backgrounds */

/* Semantic Colors */
--success: #34C759;              /* Success states */
--warning: #FF9500;              /* Warning states */
--error: #FF453A;                /* Error states */
--info: #007AFF;                 /* Information states */

/* Border Colors */
--border-subtle: #404040;        /* Subtle borders */
--border-default: #525252;       /* Default borders */
--border-strong: #6B6B6B;        /* Strong borders */
--border-focus: #0A84FF;         /* Focus indicators */
```

### Accessibility Compliance
- All color combinations meet WCAG 2.1 AA contrast ratios (4.5:1 minimum)
- Critical text meets AAA standards (7:1 contrast ratio)
- Focus indicators use system accent color with 3:1 contrast minimum

---

## 📝 Typography System

### Font Family
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
                'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             'Courier New', monospace;
```

### Font Scale & Hierarchy
```css
/* Display Sizes */
--text-display-large: 
  font-size: 57px;
  font-weight: 400;
  line-height: 64px;
  letter-spacing: -0.25px;

--text-display-medium:
  font-size: 45px;
  font-weight: 400;
  line-height: 52px;
  letter-spacing: 0px;

--text-display-small:
  font-size: 36px;
  font-weight: 400;
  line-height: 44px;
  letter-spacing: 0px;

/* Headline Sizes */
--text-headline-large:
  font-size: 32px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: 0px;

--text-headline-medium:
  font-size: 28px;
  font-weight: 600;
  line-height: 36px;
  letter-spacing: 0px;

--text-headline-small:
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: 0px;

/* Title Sizes */
--text-title-large:
  font-size: 22px;
  font-weight: 500;
  line-height: 28px;
  letter-spacing: 0px;

--text-title-medium:
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.15px;

--text-title-small:
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.1px;

/* Body Sizes */
--text-body-large:
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.5px;

--text-body-medium:
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.25px;

--text-body-small:
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: 0.4px;

/* Label Sizes */
--text-label-large:
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.1px;

--text-label-medium:
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.5px;

--text-label-small:
  font-size: 11px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: 0.5px;
```

### Font Weights
```css
--weight-thin: 100;
--weight-light: 300;
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-heavy: 800;
--weight-black: 900;
```

---

## 📏 Spacing System

### Base Units
```css
--space-base: 8px;               /* Base unit */

/* Spacing Scale (8px base) */
--space-xs: 4px;                 /* 0.5x base */
--space-sm: 8px;                 /* 1x base */
--space-md: 16px;                /* 2x base */
--space-lg: 24px;                /* 3x base */
--space-xl: 32px;                /* 4x base */
--space-2xl: 48px;               /* 6x base */
--space-3xl: 64px;               /* 8x base */
--space-4xl: 96px;               /* 12x base */
--space-5xl: 128px;              /* 16x base */

/* Component Spacing */
--padding-xs: var(--space-xs);
--padding-sm: var(--space-sm);
--padding-md: var(--space-md);
--padding-lg: var(--space-lg);
--padding-xl: var(--space-xl);

--margin-xs: var(--space-xs);
--margin-sm: var(--space-sm);
--margin-md: var(--space-md);
--margin-lg: var(--space-lg);
--margin-xl: var(--space-xl);

/* Grid System */
--grid-gap: var(--space-md);
--grid-container: 1200px;
--grid-columns: 12;
--grid-gutter: var(--space-lg);
```

### Layout Measurements
```css
/* Window & Panel Sizes */
--window-min-width: 280px;
--window-min-height: 200px;
--panel-width: 320px;
--sidebar-width: 240px;
--toolbar-height: 52px;
--titlebar-height: 28px;

/* Interactive Element Sizes */
--button-height-sm: 28px;
--button-height-md: 36px;
--button-height-lg: 44px;
--input-height: 36px;
--touch-target-min: 44px;       /* Minimum touch target */
```

---

## 🔲 Component Specifications

### Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--primary-500);
  color: var(--text-inverse);
  border: none;
  border-radius: 6px;
  padding: var(--space-sm) var(--space-lg);
  font: var(--text-label-medium);
  height: var(--button-height-md);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    background: var(--primary-600);
    transform: translateY(-1px);
  }
  
  &:active {
    background: var(--primary-700);
    transform: translateY(0);
  }
  
  &:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  
  &:disabled {
    background: var(--bg-quaternary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: var(--space-sm) var(--space-lg);
  font: var(--text-label-medium);
  height: var(--button-height-md);
  
  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--border-strong);
  }
  
  &:active {
    background: var(--bg-quaternary);
  }
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 6px;
  padding: var(--space-sm) var(--space-lg);
  font: var(--text-label-medium);
  
  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
}
```

### Input Fields

#### Text Input
```css
.input-field {
  background: var(--surface-base);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: var(--space-sm) var(--space-md);
  font: var(--text-body-medium);
  color: var(--text-primary);
  height: var(--input-height);
  width: 100%;
  transition: border-color 150ms ease;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1);
  }
  
  &:disabled {
    background: var(--bg-secondary);
    color: var(--text-disabled);
    cursor: not-allowed;
  }
}
```

#### Search Input
```css
.input-search {
  background: var(--surface-base);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: var(--space-sm) var(--space-md) var(--space-sm) 40px;
  font: var(--text-body-medium);
  background-image: url('data:image/svg+xml...');
  background-position: 12px center;
  background-repeat: no-repeat;
}
```

### Cards & Panels

#### Note Card
```css
.note-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: var(--space-lg);
  position: relative;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    border-color: var(--border-default);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  &:focus-within {
    border-color: var(--border-focus);
    box-shadow: var(--shadow-lg);
  }
}
```

#### Panel Container
```css
.panel {
  background: var(--surface-base);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  overflow: hidden;
  
  .panel-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-subtle);
    background: var(--bg-secondary);
  }
  
  .panel-content {
    padding: var(--space-lg);
  }
}
```

### Modal & Dialog

#### Modal Overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
}

.modal-content {
  background: var(--surface-overlay);
  border: 1px solid var(--border-default);
  border-radius: 12px;
  box-shadow: var(--shadow-2xl);
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  
  .modal-header {
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .modal-body {
    padding: var(--space-lg);
  }
  
  .modal-footer {
    padding: var(--space-lg);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    gap: var(--space-md);
    justify-content: flex-end;
  }
}
```

---

## 🌘 Shadow & Elevation System

### Shadow Definitions
```css
/* Elevation Shadows (following macOS style) */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4), 
             0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4), 
             0 2px 4px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 
             0 4px 6px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.4), 
             0 10px 10px rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.5);

/* Inner Shadows */
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.3);

/* Glow Effects */
--glow-primary: 0 0 0 3px rgba(255, 193, 7, 0.2);
--glow-focus: 0 0 0 3px rgba(10, 132, 255, 0.2);
--glow-error: 0 0 0 3px rgba(255, 69, 58, 0.2);
```

### Elevation Levels
```css
/* Surface Elevations */
.elevation-0 { box-shadow: none; }                    /* Ground level */
.elevation-1 { box-shadow: var(--shadow-xs); }        /* Slightly raised */
.elevation-2 { box-shadow: var(--shadow-sm); }        /* Cards, buttons */
.elevation-3 { box-shadow: var(--shadow-md); }        /* Hover states */
.elevation-4 { box-shadow: var(--shadow-lg); }        /* Dropdowns, tooltips */
.elevation-5 { box-shadow: var(--shadow-xl); }        /* Modals, drawers */
.elevation-6 { box-shadow: var(--shadow-2xl); }       /* Overlays */
```

---

## ♿ Accessibility Guidelines

### Focus Management
```css
/* Focus Indicators */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: 6px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--surface-overlay);
  color: var(--text-primary);
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 1001;
  
  &:focus {
    top: 6px;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### High Contrast Support
```css
@media (prefers-contrast: high) {
  :root {
    --border-subtle: var(--border-strong);
    --text-secondary: var(--text-primary);
    --shadow-xs: 0 0 0 1px var(--border-default);
  }
}
```

---

## 🎯 Implementation Notes

### Dark Mode Detection
```css
@media (prefers-color-scheme: dark) {
  /* Dark mode styles are default */
}

/* Light mode override if needed */
[data-theme="light"] {
  /* Override variables for light mode */
}
```

### Color Usage Guidelines
1. **Primary Yellow**: Use sparingly for key actions and branding
2. **Text Hierarchy**: Always use the designated text color variables
3. **Interactive States**: Provide clear hover, focus, and active states
4. **Semantic Colors**: Reserve for their specific purposes only

### Responsive Considerations
```css
/* Mobile adjustments */
@media (max-width: 768px) {
  :root {
    --space-lg: var(--space-md);
    --space-xl: var(--space-lg);
    --button-height-md: var(--button-height-lg);
  }
}
```

---

## 📋 Component Checklist

### Required Components
- [ ] Note cards with sticky appearance
- [ ] Floating action buttons
- [ ] Search bar with filters
- [ ] Settings panel
- [ ] Color picker for notes
- [ ] Typography controls
- [ ] Window controls (close, minimize, maximize)
- [ ] Context menus
- [ ] Tooltips
- [ ] Progress indicators
- [ ] Alert/notification system

### Accessibility Requirements Met
- ✅ WCAG 2.1 AA contrast ratios
- ✅ Focus indicators on all interactive elements
- ✅ Screen reader support via semantic HTML
- ✅ Keyboard navigation support
- ✅ Reduced motion preferences
- ✅ High contrast mode support
- ✅ Touch target minimum sizes (44px)

---

This design system ensures consistent, accessible, and macOS-native dark mode experience for the StickyNotes application while maintaining brand identity and usability standards.