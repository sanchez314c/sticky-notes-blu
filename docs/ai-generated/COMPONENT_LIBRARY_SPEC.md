# StickyNotes App - Dark Mode Component Library Specification

## Design System Foundation

### Color Palette
```css
/* Dark Mode Colors */
--bg-primary: #1a1a1a;
--bg-secondary: #2d2d2d;
--bg-tertiary: #3a3a3a;
--bg-overlay: rgba(0, 0, 0, 0.8);

--text-primary: #ffffff;
--text-secondary: #b3b3b3;
--text-muted: #808080;
--text-disabled: #4d4d4d;

--accent-primary: #007AFF;
--accent-secondary: #5856D6;
--accent-success: #34C759;
--accent-warning: #FF9500;
--accent-error: #FF3B30;

--border-primary: #404040;
--border-secondary: #2d2d2d;
--border-focus: #007AFF;

/* Sticky Note Colors */
--note-yellow: #FFF740;
--note-blue: #40B4FF;
--note-pink: #FF40B4;
--note-green: #40FF74;
--note-purple: #B440FF;
--note-orange: #FF8040;
--note-red: #FF4040;
--note-gray: #808080;
```

### Typography Scale
```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui;
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
```

### Spacing System
```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 0.75rem;   /* 12px */
--spacing-lg: 1rem;      /* 16px */
--spacing-xl: 1.5rem;    /* 24px */
--spacing-2xl: 2rem;     /* 32px */
```

---

## 1. Note Components

### StickyNote
The core component for individual sticky notes.

**Props:**
```typescript
interface StickyNoteProps {
  id: string;
  content: string;
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number; z: number };
  isSelected?: boolean;
  isEditing?: boolean;
  isDragging?: boolean;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
  onContentChange: (content: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onDelete: () => void;
  onPin: () => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: string) => void;
}
```

**Sizes:**
```css
/* Small Note */
.sticky-note--small {
  width: 150px;
  height: 150px;
  font-size: var(--font-size-sm);
}

/* Medium Note (default) */
.sticky-note--medium {
  width: 200px;
  height: 200px;
  font-size: var(--font-size-base);
}

/* Large Note */
.sticky-note--large {
  width: 250px;
  height: 250px;
  font-size: var(--font-size-lg);
}
```

**States:**
- **Default**: Standard appearance with subtle shadow
- **Hover**: Slightly elevated with increased shadow
- **Selected**: Blue border with selection handles
- **Editing**: Focused text area with cursor
- **Dragging**: Elevated with stronger shadow, slightly rotated
- **Pinned**: Pin icon in top-right corner

**Responsive Behavior:**
- Mobile: All notes become full-width with minimum height of 120px
- Tablet: Notes maintain aspect ratio but scale down proportionally
- Desktop: Full size and positioning capabilities

### NotePreview
Compact version for lists and search results.

**Props:**
```typescript
interface NotePreviewProps {
  id: string;
  content: string;
  color: string;
  createdAt: Date;
  onClick: () => void;
  isSelected?: boolean;
}
```

---

## 2. Button System

### PrimaryButton
Main action buttons throughout the app.

**Props:**
```typescript
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  size: 'small' | 'medium' | 'large';
  variant: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

**Variants:**
```css
/* Solid (default) */
.btn-primary--solid {
  background: var(--accent-primary);
  color: white;
  border: none;
}

/* Outline */
.btn-primary--outline {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

/* Ghost */
.btn-primary--ghost {
  background: transparent;
  color: var(--accent-primary);
  border: none;
}
```

### SecondaryButton
Secondary actions and utility buttons.

**Props:** Same as PrimaryButton with secondary styling.

### IconButton
Icon-only buttons for toolbars and compact interfaces.

**Props:**
```typescript
interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  size: 'small' | 'medium' | 'large';
  variant: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  tooltip?: string;
  active?: boolean;
}
```

**Sizes:**
```css
.icon-btn--small { width: 28px; height: 28px; }
.icon-btn--medium { width: 36px; height: 36px; }
.icon-btn--large { width: 44px; height: 44px; }
```

---

## 3. Input Components

### TextArea
Multi-line text input for note content.

**Props:**
```typescript
interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  rows?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  onBlur?: () => void;
  onFocus?: () => void;
}
```

**States:**
- **Default**: Transparent background, minimal border
- **Focus**: Blue border, slight background tint
- **Disabled**: Grayed out, no interaction
- **Error**: Red border for validation errors

### SearchField
Specialized input for searching notes.

**Props:**
```typescript
interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  showClearButton?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}
```

### FilterSelect
Dropdown for filtering notes by color, date, etc.

**Props:**
```typescript
interface FilterSelectProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  options: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
}
```

---

## 4. Navigation Elements

### Sidebar
Main navigation sidebar with collapsible sections.

**Props:**
```typescript
interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  sections: Array<{
    title: string;
    items: Array<{
      label: string;
      icon: React.ReactNode;
      onClick: () => void;
      active?: boolean;
      badge?: string | number;
    }>;
  }>;
}
```

### TabNavigation
Horizontal tabs for different views.

**Props:**
```typescript
interface TabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  orientation?: 'horizontal' | 'vertical';
}
```

### Breadcrumbs
Navigation breadcrumbs for hierarchical content.

**Props:**
```typescript
interface BreadcrumbsProps {
  items: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
  separator?: React.ReactNode;
  maxItems?: number;
}
```

---

## 5. Modal Dialogs

### Modal
Base modal component for overlays.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
}
```

### ConfirmDialog
Confirmation dialog for destructive actions.

**Props:**
```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error';
}
```

### SettingsModal
Specialized modal for app settings.

**Props:**
```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    theme: 'light' | 'dark' | 'auto';
    defaultNoteColor: string;
    autoSave: boolean;
    showGrid: boolean;
    snapToGrid: boolean;
  };
  onSettingsChange: (settings: any) => void;
}
```

---

## 6. Context Menus

### ContextMenu
Right-click context menu for notes and canvas.

**Props:**
```typescript
interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
    separator?: boolean;
  }>;
}
```

### NoteContextMenu
Specialized context menu for sticky notes.

**Predefined Actions:**
- Edit Note
- Change Color
- Change Size
- Pin/Unpin
- Duplicate
- Delete
- Bring to Front
- Send to Back

---

## 7. Toolbar Components

### MainToolbar
Primary toolbar with main actions.

**Props:**
```typescript
interface MainToolbarProps {
  actions: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    tooltip?: string;
  }>;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}
```

### FloatingToolbar
Contextual toolbar that appears near selected elements.

**Props:**
```typescript
interface FloatingToolbarProps {
  position: { x: number; y: number };
  isVisible: boolean;
  actions: Array<{
    icon: React.ReactNode;
    onClick: () => void;
    tooltip?: string;
    active?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
}
```

### ColorPicker
Color selection tool for notes.

**Props:**
```typescript
interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colors: string[];
  size?: 'small' | 'medium' | 'large';
  showCustomColors?: boolean;
}
```

---

## 8. Status Indicators

### LoadingSpinner
Animated loading indicator.

**Props:**
```typescript
interface LoadingSpinnerProps {
  size: 'small' | 'medium' | 'large';
  color?: string;
  overlay?: boolean;
  message?: string;
}
```

### StatusBadge
Status indicator badges.

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'info' | 'success' | 'warning' | 'error';
  children: React.ReactNode;
  size?: 'small' | 'medium';
  variant?: 'solid' | 'outline' | 'dot';
}
```

### ProgressIndicator
Progress bar for operations.

**Props:**
```typescript
interface ProgressIndicatorProps {
  value: number; // 0-100
  max?: number;
  indeterminate?: boolean;
  size?: 'small' | 'medium';
  showValue?: boolean;
  color?: string;
}
```

### ConnectionStatus
Network/sync status indicator.

**Props:**
```typescript
interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastSync?: Date;
  showDetails?: boolean;
  onClick?: () => void;
}
```

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) {
  /* Stack components vertically */
  /* Increase touch targets to minimum 44px */
  /* Hide non-essential UI elements */
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  /* Adaptive grid layouts */
  /* Collapsible sidebars */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full feature set */
  /* Hover states enabled */
}
```

---

## Animation Guidelines

### Transitions
```css
/* Standard easing */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerated: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerated: cubic-bezier(0.4, 0.0, 1, 1);

/* Duration scale */
--duration-fast: 150ms;
--duration-medium: 250ms;
--duration-slow: 350ms;
```

### Motion Principles
- **Entrance**: Fade in with slight scale (0.95 → 1.0)
- **Exit**: Fade out with slight scale (1.0 → 0.95)
- **State Changes**: Color and opacity transitions
- **Drag Operations**: Transform with momentum
- **Loading States**: Subtle pulse or rotate animations

---

## Accessibility Standards

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order follows logical visual flow
- Escape key closes modals and menus
- Arrow keys navigate lists and grids

### Screen Readers
- All components include proper ARIA labels
- Status changes are announced
- Loading states are communicated
- Error messages are associated with inputs

### Color Contrast
- All text meets WCAG 2.1 AA standards (4.5:1 ratio)
- Interactive elements have sufficient contrast
- Focus indicators are clearly visible
- Color is not the only means of conveying information

This component library specification provides the foundation for consistent, accessible, and maintainable UI components in the StickyNotes dark mode application.