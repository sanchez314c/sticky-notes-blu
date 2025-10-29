# StickyNotes App - Dark Mode Accessibility Requirements

## WCAG 2.1 AA Compliance Overview
This document outlines comprehensive accessibility requirements for the StickyNotes app dark mode implementation, ensuring full WCAG 2.1 AA compliance and optimal user experience for users with disabilities.

---

## 1. WCAG 2.1 AA Compliance Checklist

### 1.1 Perceivable Requirements
- [ ] **1.1.1 Non-text Content (Level A)**: All images, icons, and visual elements have appropriate alternative text
- [ ] **1.1.4 Images of Text (Level AA)**: Avoid images of text; use actual text with CSS styling
- [ ] **1.4.3 Contrast (Minimum) (Level AA)**: Maintain 4.5:1 contrast for normal text, 3:1 for large text
- [ ] **1.4.4 Resize Text (Level AA)**: Support text scaling up to 200% without loss of functionality
- [ ] **1.4.5 Images of Text (Level AA)**: Use real text instead of text images where possible
- [ ] **1.4.10 Reflow (Level AA)**: Content reflows without horizontal scrolling at 320px width
- [ ] **1.4.11 Non-text Contrast (Level AA)**: UI components and graphical objects meet 3:1 contrast ratio
- [ ] **1.4.12 Text Spacing (Level AA)**: No loss of content when text spacing is adjusted
- [ ] **1.4.13 Content on Hover or Focus (Level AA)**: Hoverable content is dismissible, hoverable, and persistent

### 1.2 Operable Requirements
- [ ] **2.1.1 Keyboard (Level A)**: All functionality available via keyboard
- [ ] **2.1.2 No Keyboard Trap (Level A)**: Focus can move away from any component
- [ ] **2.1.4 Character Key Shortcuts (Level A)**: Provide mechanism to turn off or remap shortcuts
- [ ] **2.4.1 Bypass Blocks (Level A)**: Skip links for main content areas
- [ ] **2.4.2 Page Titled (Level A)**: Descriptive page titles
- [ ] **2.4.3 Focus Order (Level A)**: Logical focus order
- [ ] **2.4.4 Link Purpose (Level A)**: Link purpose clear from context
- [ ] **2.4.5 Multiple Ways (Level AA)**: Multiple ways to locate pages
- [ ] **2.4.6 Headings and Labels (Level AA)**: Descriptive headings and labels
- [ ] **2.4.7 Focus Visible (Level AA)**: Keyboard focus indicator visible
- [ ] **2.5.1 Pointer Gestures (Level A)**: Multipoint/path-based gestures have single-point alternatives
- [ ] **2.5.2 Pointer Cancellation (Level A)**: Down-event cancellation available
- [ ] **2.5.3 Label in Name (Level A)**: Accessible name contains visible label text
- [ ] **2.5.4 Motion Actuation (Level A)**: Device motion alternatives available

### 1.3 Understandable Requirements
- [ ] **3.1.1 Language of Page (Level A)**: Page language programmatically determined
- [ ] **3.2.1 On Focus (Level A)**: Focus doesn't trigger context changes
- [ ] **3.2.2 On Input (Level A)**: Input doesn't trigger unexpected context changes
- [ ] **3.2.3 Consistent Navigation (Level AA)**: Navigation consistent across pages
- [ ] **3.2.4 Consistent Identification (Level AA)**: Components with same functionality consistently identified
- [ ] **3.3.1 Error Identification (Level A)**: Errors identified and described
- [ ] **3.3.2 Labels or Instructions (Level A)**: Labels/instructions for user input
- [ ] **3.3.3 Error Suggestion (Level AA)**: Error correction suggestions provided
- [ ] **3.3.4 Error Prevention (Level AA)**: Error prevention for legal/financial/data actions

### 1.4 Robust Requirements
- [ ] **4.1.1 Parsing (Level A)**: Valid HTML markup
- [ ] **4.1.2 Name, Role, Value (Level A)**: Programmatic name, role, value for UI components
- [ ] **4.1.3 Status Messages (Level AA)**: Status messages programmatically available

---

## 2. Color Contrast Requirements

### 2.1 Text Contrast Ratios
| Text Size | Minimum Contrast Ratio | Dark Mode Implementation |
|-----------|----------------------|-------------------------|
| Normal text (under 18pt/24px) | 4.5:1 | #FFFFFF on #1a1a1a (15.6:1) |
| Large text (18pt+/24px+ or 14pt+/19px+ bold) | 3:1 | #F0F0F0 on #2a2a2a (11.2:1) |
| Interactive elements | 3:1 | #E0E0E0 on #333333 (8.9:1) |

### 2.2 UI Component Contrast
| Component | Minimum Ratio | Dark Mode Colors |
|-----------|---------------|------------------|
| Buttons (unfocused) | 3:1 | #4A9EFF on #2a2a2a |
| Input borders | 3:1 | #555555 on #1a1a1a |
| Focus indicators | 3:1 | #FFD700 on background |
| Status indicators | 3:1 | Success: #4CAF50, Error: #F44336 |

### 2.3 Note Color Accessibility
| Note Color | Background | Text Color | Contrast Ratio |
|------------|------------|------------|----------------|
| Yellow | #3D3D00 | #FFFF99 | 7.2:1 |
| Blue | #001A3D | #99CCFF | 6.8:1 |
| Green | #003D1A | #99FF99 | 7.1:1 |
| Pink | #3D001A | #FF99CC | 6.5:1 |
| Purple | #1A003D | #CC99FF | 6.9:1 |

---

## 3. Keyboard Navigation Patterns

### 3.1 Navigation Order
```
Main Navigation → Search → Filter Controls → Notes Grid → Note Actions → Settings
```

### 3.2 Keyboard Shortcuts
| Action | Shortcut | Context |
|--------|----------|---------|
| Create new note | Ctrl/Cmd + N | Global |
| Search notes | Ctrl/Cmd + F | Global |
| Toggle dark mode | Ctrl/Cmd + Shift + D | Global |
| Delete selected note | Delete/Backspace | Note focused |
| Edit note | Enter/F2 | Note focused |
| Save note | Ctrl/Cmd + S | Note editing |
| Cancel edit | Escape | Note editing |
| Next note | Arrow keys/Tab | Notes grid |
| Select multiple | Ctrl/Cmd + Click | Notes grid |

### 3.3 Focus Management
- **Focus indicators**: 2px solid #FFD700 outline with 2px offset
- **Focus trap**: Modal dialogs trap focus within dialog
- **Focus restoration**: Return focus to trigger element after modal close
- **Skip links**: "Skip to main content" link for screen readers

---

## 4. Screen Reader Support (VoiceOver Optimization)

### 4.1 Semantic HTML Structure
```html
<main role="main" aria-label="Sticky Notes Application">
  <header role="banner">
    <h1>My Sticky Notes</h1>
    <nav role="navigation" aria-label="Main navigation">
      <!-- Navigation items -->
    </nav>
  </header>
  
  <section role="search" aria-label="Search and filter notes">
    <input type="search" aria-label="Search notes" />
  </section>
  
  <section role="main" aria-label="Notes grid">
    <div role="grid" aria-label="Sticky notes collection">
      <!-- Note items -->
    </div>
  </section>
</main>
```

### 4.2 ARIA Labels and Descriptions
| Element | ARIA Implementation |
|---------|-------------------|
| Note cards | `role="gridcell"` `aria-label="Note: [first 50 chars]"` |
| Note actions | `aria-label="Delete note: [title]"` |
| Color picker | `aria-label="Choose note color"` `aria-describedby="color-help"` |
| Search results | `aria-live="polite"` `aria-label="[X] notes found"` |
| Status messages | `role="status"` `aria-live="polite"` |

### 4.3 VoiceOver Specific Optimizations
- **Rotor navigation**: Proper heading hierarchy (h1→h2→h3)
- **Landmark regions**: Clear main, navigation, search landmarks
- **Live regions**: Announce search results and status changes
- **Table semantics**: Use grid/table roles for note layout
- **Form labels**: Explicit label associations for all inputs

---

## 5. Focus Management

### 5.1 Focus Indicators
```css
.focus-visible {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
  border-radius: 4px;
}

.focus-within {
  box-shadow: 0 0 0 2px #FFD700;
}
```

### 5.2 Focus Trap Implementation
- **Modal dialogs**: Focus trapped within dialog boundaries
- **Dropdown menus**: Focus cycles within menu options
- **Note editing**: Focus moves logically through edit controls

### 5.3 Focus Restoration
- After modal close: Focus returns to trigger element
- After note deletion: Focus moves to next note or create button
- After search: Focus moves to first result or "no results" message

---

## 6. High Contrast Mode Support

### 6.1 Windows High Contrast Detection
```css
@media (prefers-contrast: high) {
  .note-card {
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }
  
  .button-primary {
    background: Highlight;
    color: HighlightText;
    border: 1px solid ButtonText;
  }
}

@media (-ms-high-contrast: active) {
  /* Windows specific high contrast styles */
}
```

### 6.2 System Colors Usage
| Element | High Contrast Color |
|---------|-------------------|
| Text | ButtonText |
| Background | ButtonFace |
| Buttons | Highlight/HighlightText |
| Borders | ButtonText |
| Links | LinkText |
| Visited links | VisitedText |

---

## 7. Reduced Motion Preferences

### 7.1 Motion Settings Detection
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .parallax-element {
    transform: none !important;
  }
}
```

### 7.2 Alternative Interactions
- **Hover effects**: Replace with focus states only
- **Parallax scrolling**: Disabled entirely
- **Auto-playing content**: Paused by default
- **Smooth scrolling**: Replaced with instant scrolling

---

## 8. Text Scaling Support (up to 200%)

### 8.1 Responsive Text Scaling
```css
/* Base font sizes using rem units */
body {
  font-size: 1rem; /* 16px base */
}

.note-title {
  font-size: 1.25rem; /* Scales to 20px at 125%, 32px at 200% */
}

.note-content {
  font-size: 0.875rem; /* Scales to 14px at 100%, 28px at 200% */
}

/* Layout adjustments for text scaling */
@media (min-resolution: 1.25x) {
  .notes-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-resolution: 2x) {
  .notes-grid {
    grid-template-columns: 1fr;
  }
}
```

### 8.2 Layout Reflow Strategy
- **Grid adaptation**: Fewer columns at higher zoom levels
- **Text wrapping**: All text wraps without horizontal scroll
- **Button sizing**: Minimum 44px touch targets maintained
- **Spacing**: Adequate spacing preserved at all zoom levels

---

## 9. Alternative Text for Visual Elements

### 9.1 Icon Alternative Text
| Icon | Alt Text |
|------|----------|
| Add note | "Create new note" |
| Delete | "Delete note" |
| Edit | "Edit note" |
| Search | "Search notes" |
| Settings | "Open settings" |
| Color picker | "Choose note color" |
| Dark mode toggle | "Switch to light mode" / "Switch to dark mode" |

### 9.2 Decorative vs. Informative Images
- **Decorative**: Empty alt="" or role="presentation"
- **Informative**: Descriptive alt text explaining purpose
- **Complex images**: Long descriptions via aria-describedby

### 9.3 Note Content Images
```html
<!-- User uploaded image in note -->
<img src="chart.png" 
     alt="Sales chart showing 25% increase over Q3" 
     aria-describedby="chart-details">
<div id="chart-details" class="sr-only">
  Detailed description: Bar chart with months on x-axis...
</div>
```

---

## 10. Implementation Testing Checklist

### 10.1 Automated Testing
- [ ] **aXe DevTools**: No violations at AA level
- [ ] **WAVE**: Clean accessibility report
- [ ] **Lighthouse**: Accessibility score 95+
- [ ] **Pa11y**: Command line testing passes

### 10.2 Manual Testing
- [ ] **Keyboard only**: Full navigation without mouse
- [ ] **Screen reader**: VoiceOver/NVDA complete workflow
- [ ] **Voice control**: Dragon/Voice Control compatibility
- [ ] **High contrast**: Windows High Contrast mode
- [ ] **Zoom testing**: 200% browser zoom functional

### 10.3 User Testing
- [ ] **Blind users**: Screen reader workflow validation
- [ ] **Low vision users**: High contrast and zoom testing
- [ ] **Motor impaired users**: Keyboard navigation testing
- [ ] **Cognitive users**: Interface clarity and consistency

---

## 11. Success Metrics

### 11.1 Technical Metrics
- WCAG 2.1 AA compliance: 100%
- Automated test pass rate: 100%
- Color contrast ratios: All exceed minimum requirements
- Keyboard navigation coverage: 100% of functionality

### 11.2 User Experience Metrics
- Screen reader task completion rate: 95%+
- Keyboard-only user satisfaction: 4.5/5
- High contrast mode usability: 100% feature availability
- Text scaling usability: No functionality loss at 200%

This comprehensive accessibility specification ensures the StickyNotes app dark mode provides an excellent experience for all users, regardless of their abilities or assistive technology preferences.