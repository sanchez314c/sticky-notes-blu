# StickyNotes Typography Design System
## Dark Mode Optimized Typography Specification

---

## 1. Font Selection Strategy

### Primary Typeface: Inter
**Rationale:** Specifically designed for screens with excellent dark mode performance
- **Weights:** 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-bold), 700 (Bold)
- **Features:** OpenType features, extensive language support, optimized character spacing
- **Dark Mode Benefits:** High contrast ratios, reduced eye strain, clear letterforms

### Secondary Typeface: JetBrains Mono
**Purpose:** Code snippets, technical notes, monospace content
- **Weights:** 400 (Regular), 500 (Medium), 700 (Bold)
- **Features:** Ligatures, clear distinction between similar characters (0/O, 1/l/I)

### Fallback Stack
```css
font-family: 
  'Inter', 
  -apple-system, 
  BlinkMacSystemFont, 
  'Segoe UI', 
  'Roboto', 
  'Helvetica Neue', 
  Arial, 
  sans-serif;
```

---

## 2. Type Scale System

### Base Configuration
- **Base Font Size:** 16px (1rem)
- **Scale Ratio:** 1.25 (Major Third)
- **Line Height Base:** 1.5 (24px)

### Scale Hierarchy
```
Display:    48px (3rem)     - Hero text, large headings
H1:         38px (2.375rem) - Main note titles
H2:         30px (1.875rem) - Section headers
H3:         24px (1.5rem)   - Subsection headers
H4:         19px (1.1875rem)- Minor headers
Body Large: 18px (1.125rem) - Important body text
Body:       16px (1rem)     - Default body text
Body Small: 14px (0.875rem) - Secondary text
Caption:    12px (0.75rem)  - Metadata, timestamps
Micro:      10px (0.625rem) - Tags, system text
```

---

## 3. Line Spacing & Paragraph Formatting

### Line Height System
```css
/* Responsive line heights for better readability */
.text-display { line-height: 1.1; }    /* 52.8px */
.text-h1 { line-height: 1.2; }        /* 45.6px */
.text-h2 { line-height: 1.25; }       /* 37.5px */
.text-h3 { line-height: 1.3; }        /* 31.2px */
.text-h4 { line-height: 1.35; }       /* 25.65px */
.text-body-large { line-height: 1.5; } /* 27px */
.text-body { line-height: 1.6; }       /* 25.6px */
.text-body-small { line-height: 1.5; } /* 21px */
.text-caption { line-height: 1.4; }    /* 16.8px */
```

### Paragraph Spacing
- **Paragraph Bottom Margin:** 1rem (16px)
- **List Item Spacing:** 0.5rem (8px)
- **Block Quote Padding:** 1rem left, 0.5rem top/bottom

### Reading Optimization
- **Maximum Line Length:** 65 characters (optimal readability)
- **Minimum Line Length:** 35 characters
- **Text Justification:** Left-aligned (better for scanning)

---

## 4. Color System for Dark Mode

### Primary Text Colors
```css
--text-primary: #FFFFFF;        /* Pure white for high contrast */
--text-secondary: #E5E5E5;      /* Light gray for secondary content */
--text-muted: #A3A3A3;         /* Medium gray for supporting text */
--text-disabled: #525252;       /* Dark gray for disabled states */
```

### Accent Text Colors
```css
--text-accent-blue: #60A5FA;    /* Links, interactive elements */
--text-accent-green: #34D399;   /* Success, positive actions */
--text-accent-yellow: #FBBF24;  /* Warnings, highlights */
--text-accent-red: #F87171;     /* Errors, destructive actions */
--text-accent-purple: #A78BFA;  /* Special content, tags */
```

### Contextual Colors
```css
--text-code: #E879F9;          /* Code snippets */
--text-link: #60A5FA;          /* Hyperlinks */
--text-link-hover: #93C5FD;    /* Link hover state */
--text-selection: #1E40AF;     /* Text selection background */
```

---

## 5. Note Type Typography Specifications

### Standard Notes
- **Title:** H2 (30px), Semi-bold (600), --text-primary
- **Body:** Body (16px), Regular (400), --text-secondary
- **Metadata:** Caption (12px), Regular (400), --text-muted

### Quick Notes
- **Title:** H3 (24px), Medium (500), --text-primary
- **Body:** Body (16px), Regular (400), --text-secondary
- **Timestamp:** Micro (10px), Regular (400), --text-muted

### Code Notes
- **Title:** H3 (24px), Medium (500), --text-primary
- **Code Blocks:** JetBrains Mono, Body (16px), --text-code
- **Inline Code:** JetBrains Mono, Body Small (14px), --text-accent-purple

### Meeting Notes
- **Title:** H2 (30px), Semi-bold (600), --text-primary
- **Speaker Names:** Body Large (18px), Medium (500), --text-accent-blue
- **Timestamps:** Caption (12px), Regular (400), --text-muted
- **Action Items:** Body (16px), Medium (500), --text-accent-green

### Research Notes
- **Title:** H1 (38px), Semi-bold (600), --text-primary
- **Citations:** Body Small (14px), Regular (400), --text-muted
- **Quotes:** Body (16px), Italic (400), --text-secondary
- **References:** Caption (12px), Regular (400), --text-accent-blue

### Task Lists
- **List Title:** H3 (24px), Medium (500), --text-primary
- **Completed Tasks:** Body (16px), Regular (400), --text-muted, strikethrough
- **Active Tasks:** Body (16px), Regular (400), --text-secondary
- **High Priority:** Body (16px), Medium (500), --text-accent-red

---

## 6. Accessibility & Dyslexia-Friendly Design

### WCAG 2.1 Compliance
- **Contrast Ratios:**
  - Primary text: 21:1 (exceeds AAA standard)
  - Secondary text: 12.63:1 (exceeds AAA standard)
  - Muted text: 4.51:1 (meets AA standard)

### Dyslexia-Friendly Features
```css
.dyslexia-friendly {
  font-family: 'OpenDyslexic', 'Comic Sans MS', cursive;
  letter-spacing: 0.05em;        /* Increased character spacing */
  word-spacing: 0.16em;          /* Increased word spacing */
  line-height: 1.8;             /* Increased line spacing */
  font-weight: 400;             /* Avoid thin fonts */
}
```

### Alternative Typography Options
- **Dyslexia Mode:** OpenDyslexic font with enhanced spacing
- **High Contrast Mode:** Increased contrast ratios (25:1 minimum)
- **Large Text Mode:** 1.25x scale multiplier for all text sizes

### Focus and Selection States
```css
.text-focus {
  outline: 2px solid --text-accent-blue;
  outline-offset: 2px;
  border-radius: 4px;
}

::selection {
  background-color: var(--text-selection);
  color: #FFFFFF;
}
```

---

## 7. Responsive Typography

### Breakpoint System
```css
/* Mobile: Base sizes */
@media (max-width: 768px) {
  html { font-size: 14px; } /* Scale down 12.5% */
}

/* Tablet: Slightly larger */
@media (min-width: 769px) and (max-width: 1024px) {
  html { font-size: 15px; } /* Scale down 6.25% */
}

/* Desktop: Full size */
@media (min-width: 1025px) {
  html { font-size: 16px; } /* Base size */
}
```

### Fluid Typography
```css
.text-fluid {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: clamp(1.4, 1.5, 1.6);
}
```

---

## 8. Implementation Guidelines

### CSS Custom Properties Setup
```css
:root {
  /* Typography Scale */
  --font-size-display: 3rem;
  --font-size-h1: 2.375rem;
  --font-size-h2: 1.875rem;
  --font-size-h3: 1.5rem;
  --font-size-h4: 1.1875rem;
  --font-size-body-large: 1.125rem;
  --font-size-body: 1rem;
  --font-size-body-small: 0.875rem;
  --font-size-caption: 0.75rem;
  --font-size-micro: 0.625rem;
  
  /* Line Heights */
  --line-height-tight: 1.1;
  --line-height-normal: 1.5;
  --line-height-loose: 1.8;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.05em;
}
```

### Utility Classes
```css
.font-display { font-size: var(--font-size-display); }
.font-h1 { font-size: var(--font-size-h1); }
.font-h2 { font-size: var(--font-size-h2); }
.leading-tight { line-height: var(--line-height-tight); }
.leading-normal { line-height: var(--line-height-normal); }
.leading-loose { line-height: var(--line-height-loose); }
```

---

## 9. Performance Considerations

### Font Loading Strategy
```css
/* Critical font preload */
<link rel="preload" href="./fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="./fonts/Inter-Medium.woff2" as="font" type="font/woff2" crossorigin>

/* Font display optimization */
@font-face {
  font-family: 'Inter';
  font-display: swap;
  src: url('./fonts/Inter-Regular.woff2') format('woff2');
}
```

### Bundle Optimization
- **Subset Fonts:** Include only required characters and weights
- **Variable Fonts:** Consider Inter Variable for weight flexibility
- **Fallback Timing:** Ensure fallback fonts load immediately

---

## 10. Design Tokens Export

### JSON Format
```json
{
  "typography": {
    "fontFamily": {
      "primary": ["Inter", "system-ui", "sans-serif"],
      "mono": ["JetBrains Mono", "Menlo", "Monaco", "monospace"]
    },
    "fontSize": {
      "display": "3rem",
      "h1": "2.375rem",
      "h2": "1.875rem",
      "body": "1rem"
    },
    "colors": {
      "text": {
        "primary": "#FFFFFF",
        "secondary": "#E5E5E5",
        "muted": "#A3A3A3"
      }
    }
  }
}
```

---

## Summary

This typography system prioritizes:
- **Readability** in dark environments
- **Accessibility** for all users
- **Scalability** across devices
- **Performance** optimization
- **Consistency** across note types

The system uses proven typefaces, maintains proper contrast ratios, and provides flexibility for user preferences while ensuring excellent readability in dark mode environments.