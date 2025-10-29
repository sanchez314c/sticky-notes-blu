# UX/UI Requirements: macOS Sticky Notes App

## Executive Summary

A native-feeling, dark-mode Electron sticky notes application for macOS that provides floating desktop notes with seamless integration into the macOS ecosystem. The design emphasizes simplicity, accessibility, and platform consistency while maintaining modern visual standards.

---

## 1. Platform-Native Design Patterns

### macOS Design Language Integration
- **Visual Hierarchy**: Follow macOS Big Sur/Monterey/Ventura design principles
- **Typography**: Use SF Pro Display/Text font family (system fonts)
- **Iconography**: SF Symbols where applicable, custom icons following Apple's design guidelines
- **Spacing**: 8pt grid system aligned with macOS standards
- **Corner Radius**: 8px for cards, 6px for buttons, 4px for small elements

### Window Management
- **Floating Behavior**: Always-on-top positioning with smart occlusion detection
- **Window Controls**: Custom-styled traffic light buttons (close/minimize/zoom)
- **Transparency**: Utilize macOS vibrancy effects with backdrop filters
- **Shadow**: Elevation shadows following macOS depth guidelines

### Menu Bar Integration
- **Menu Bar Icon**: Monochrome icon that adapts to light/dark menu bar
- **Dropdown Menu**: Native context menu styling
- **Status Indicators**: Badge notifications for note count
- **Quick Actions**: Right-click context menu with common actions

---

## 2. Accessibility (WCAG 2.1 AA Compliance)

### Visual Accessibility
- **Contrast Ratios**:
  - Text on background: minimum 4.5:1
  - Large text (18pt+): minimum 3:1
  - Interactive elements: minimum 3:1
- **Color Independence**: Never rely solely on color for information
- **Focus Indicators**: High-contrast, 2px outline on all interactive elements

### Motor Accessibility
- **Touch Targets**: Minimum 44x44pt for all interactive elements
- **Click Areas**: Extended click areas for small elements
- **Drag Handles**: Clear visual indicators for draggable areas
- **Keyboard Navigation**: Complete keyboard accessibility

### Cognitive Accessibility
- **Simple Language**: Clear, concise interface text
- **Consistent Patterns**: Uniform interaction patterns throughout
- **Error Prevention**: Clear validation and confirmation dialogs
- **Help Context**: Tooltips and contextual help

### Screen Reader Support
- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Live Regions**: Dynamic content announcements
- **Role Definitions**: Clear element roles and states

---

## 3. Dark Mode Theme System

### Color Palette
```css
/* Primary Colors */
--bg-primary: #1c1c1e;           /* Main background */
--bg-secondary: #2c2c2e;         /* Secondary surfaces */
--bg-tertiary: #3a3a3c;          /* Elevated surfaces */

/* Text Colors */
--text-primary: #ffffff;         /* Primary text */
--text-secondary: #ebebf5;       /* Secondary text (60% opacity) */
--text-tertiary: #ebebf5;        /* Tertiary text (30% opacity) */

/* Accent Colors */
--accent-primary: #007aff;       /* System blue */
--accent-secondary: #5ac8fa;     /* Light blue */
--accent-success: #30d158;       /* System green */
--accent-warning: #ff9f0a;       /* System orange */
--accent-danger: #ff453a;        /* System red */

/* System Colors */
--border-primary: #38383a;       /* Primary borders */
--border-secondary: #48484a;     /* Secondary borders */
--overlay: rgba(0, 0, 0, 0.4);   /* Modal overlays */
```

### Theme Adaptation
- **System Preference Detection**: Auto-detect macOS appearance setting
- **Manual Override**: User preference for theme selection
- **Dynamic Switching**: Smooth transitions between themes
- **Accent Color Sync**: Respect system accent color preferences

### Vibrancy Effects
- **Background Materials**: 
  - Ultra-thin material for note backgrounds
  - Thick material for modal dialogs
  - Menu material for dropdowns
- **Blur Radius**: 20px for background blur effects
- **Opacity Levels**: 85% for primary surfaces, 95% for text areas

---

## 4. Interaction Patterns

### Note Creation
1. **Quick Create**: Cmd+N or menu bar → "New Note"
2. **Click-to-Create**: Double-click desktop (if enabled)
3. **Template Selection**: Choose from predefined note templates
4. **Size Initialization**: Default 280x200px, remembers last used size

### Note Editing
- **Inline Editing**: Click anywhere on note to start editing
- **Auto-Save**: Continuous saving every 2 seconds
- **Rich Text**: Basic formatting (bold, italic, lists)
- **Focus Management**: Auto-focus on creation, preserve cursor position

### Note Management
- **Drag to Move**: Drag from title bar or note body
- **Resize Handles**: Corner and edge resize handles
- **Context Menu**: Right-click for note options
- **Bulk Operations**: Multi-select with Cmd+click

### Desktop Integration
- **Smart Positioning**: Avoid overlapping with dock/menu bar
- **Workspace Awareness**: Respect Spaces and Mission Control
- **Screen Edge Behavior**: Magnetic snapping to screen edges
- **Multi-Display**: Per-display note positioning memory

---

## 5. Keyboard Shortcuts

### Global Shortcuts
- `Cmd + N` - Create new note
- `Cmd + Shift + N` - Create note at cursor location
- `Cmd + H` - Hide all notes
- `Cmd + Shift + H` - Show all notes
- `Cmd + Q` - Quit application

### Note-Specific Shortcuts
- `Cmd + W` - Close current note
- `Cmd + D` - Duplicate note
- `Cmd + Backspace` - Delete note (with confirmation)
- `Cmd + +/-` - Increase/decrease font size
- `Cmd + 0` - Reset to default font size

### Text Formatting
- `Cmd + B` - Bold text
- `Cmd + I` - Italic text
- `Cmd + U` - Underline text
- `Cmd + Shift + X` - Strikethrough text
- `Cmd + L` - Create bulleted list

### Navigation
- `Tab` - Navigate between UI elements
- `Shift + Tab` - Navigate backwards
- `Escape` - Close dialogs/menus
- `Enter` - Confirm actions
- `Space` - Activate buttons

---

## 6. Component Hierarchy

### Application Structure
```
StickyNotesApp/
├── MenuBarManager
│   ├── MenuBarIcon
│   ├── DropdownMenu
│   └── NotificationBadge
├── WindowManager
│   ├── NoteWindow[]
│   ├── PreferencesWindow
│   └── AboutWindow
└── DataManager
    ├── NoteStorage
    ├── PreferencesStorage
    └── BackupManager
```

### Note Window Components
```
NoteWindow/
├── WindowFrame
│   ├── TrafficLights
│   ├── TitleBar
│   └── WindowControls
├── NoteContent
│   ├── TextEditor
│   ├── FormattingToolbar (hidden by default)
│   └── StatusIndicator
└── ResizeHandles
    ├── CornerHandles (4)
    └── EdgeHandles (4)
```

### UI Component Library
```
Components/
├── Base/
│   ├── Button
│   ├── Input
│   ├── Dropdown
│   ├── Modal
│   └── Tooltip
├── Note/
│   ├── NoteCard
│   ├── NoteEditor
│   ├── FormattingBar
│   └── NoteMetadata
└── System/
    ├── MenuBar
    ├── ContextMenu
    ├── Notification
    └── Preferences
```

---

## 7. Responsive Design Considerations

### Note Sizing
- **Minimum Size**: 200x150px
- **Maximum Size**: Screen dimensions minus 100px margin
- **Default Size**: 280x200px
- **Aspect Ratio**: Free-form resizing
- **Size Memory**: Remember individual note dimensions

### Content Adaptation
- **Font Scaling**: Dynamic font size based on note dimensions
- **Toolbar Responsive**: Hide/show formatting tools based on width
- **Text Wrapping**: Automatic text wrapping with proper line height
- **Scrolling**: Vertical scroll for overflow content

### Multi-Display Support
- **Display Detection**: Track display configuration changes
- **Position Persistence**: Maintain note positions across displays
- **DPI Scaling**: Proper scaling on high-DPI displays
- **Color Profile**: Respect display color profiles

---

## 8. Animation & Transitions

### Note Animations
- **Creation**: Scale-in animation (0.2s ease-out)
- **Deletion**: Fade + scale-out (0.15s ease-in)
- **Focus**: Subtle scale (1.02x) + shadow enhancement
- **Drag**: Real-time position updates with momentum

### UI Transitions
- **Theme Switching**: 0.3s ease-in-out color transitions
- **Menu Animations**: 0.15s slide-in for dropdowns
- **Button States**: 0.1s ease-out for hover/press states
- **Window Resize**: Smooth resize with 0.1s debounce

### Performance Considerations
- **GPU Acceleration**: Use transform3d for animations
- **Frame Rate**: Target 60fps for all animations
- **Reduced Motion**: Respect prefers-reduced-motion setting
- **Battery Optimization**: Reduce animations on battery power

---

## 9. Error States & Edge Cases

### Error Handling
- **Save Failures**: Visual indicator + retry mechanism
- **Network Issues**: Offline mode indication
- **Storage Full**: Warning dialog with cleanup options
- **Corrupted Data**: Recovery mode with backup restoration

### Edge Case Handling
- **Display Disconnection**: Move orphaned notes to primary display
- **App Crash Recovery**: Restore unsaved notes from temp storage
- **System Sleep/Wake**: Pause/resume auto-save timers
- **Permission Denied**: Graceful degradation with user notification

### Loading States
- **App Launch**: Splash screen with loading indicator
- **Large Notes**: Progressive loading for content-heavy notes
- **Sync Operations**: Non-blocking sync with status indicators
- **Import/Export**: Progress bars for bulk operations

---

## 10. Performance Requirements

### Rendering Performance
- **Note Rendering**: <16ms per note (60fps target)
- **Text Input**: <5ms latency for keystroke response
- **Scroll Performance**: Maintain 60fps during scroll
- **Animation Smoothness**: No dropped frames during transitions

### Memory Management
- **Note Limit**: Support 100+ simultaneous notes
- **Memory Usage**: <100MB baseline, <1MB per note
- **Garbage Collection**: Efficient cleanup of deleted notes
- **Resource Optimization**: Lazy loading for off-screen elements

### Battery Efficiency
- **Idle State**: Minimal CPU usage when not interacting
- **Background Processing**: Throttled auto-save operations
- **Display Updates**: Only redraw changed content areas
- **Event Optimization**: Debounced event handlers

---

## Implementation Priority

### Phase 1: Core Functionality
1. Basic note creation and editing
2. Dark mode theme system
3. Window management and positioning
4. Essential keyboard shortcuts

### Phase 2: Enhanced UX
1. Rich text formatting
2. Animation system
3. Accessibility features
4. Menu bar integration

### Phase 3: Advanced Features
1. Multi-display support
2. Advanced keyboard shortcuts
3. Performance optimizations
4. Error handling and recovery

This comprehensive UX/UI specification provides the foundation for building a polished, accessible, and truly native-feeling sticky notes application for macOS users.