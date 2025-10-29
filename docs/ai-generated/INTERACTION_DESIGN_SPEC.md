# StickyNotes App - Interaction Design Specification

## Overview
This document defines interaction patterns and micro-animations for a macOS-native StickyNotes application, ensuring smooth 60fps performance and intuitive user experience.

## Core Interaction Principles

### macOS Design Language
- Follow Apple Human Interface Guidelines
- Use system-standard animations and timing
- Respect user accessibility preferences
- Maintain consistency with macOS behavior

### Performance Standards
- Target 60fps for all animations
- Use hardware-accelerated transforms
- Implement efficient rendering techniques
- Optimize for both Intel and Apple Silicon Macs

---

## 1. Hover States

### Note Hover
**Behavior**: Subtle elevation and shadow enhancement
```
Animation Properties:
- Duration: 150ms
- Easing: ease-out
- Transform: translateZ(2px) or box-shadow enhancement
- Opacity: Maintain 1.0
```

**Implementation**:
- Increase drop shadow blur from 4px to 8px
- Slightly brighten note color (5% lighter)
- Show resize handles on corners
- Reveal close button (fade in)

### Button Hover (Toolbar)
**Behavior**: Standard macOS button hover
```
Animation Properties:
- Duration: 100ms
- Easing: ease-out
- Background: System highlight color
- Border-radius: 6px
```

### Resize Handle Hover
**Behavior**: Cursor change + visual feedback
```
Animation Properties:
- Duration: 100ms
- Scale: 1.2x
- Opacity: 0.6 → 1.0
- Cursor: Resize indicators
```

---

## 2. Click/Tap Feedback

### Note Selection
**Visual Feedback**:
```
Animation Properties:
- Duration: 80ms down, 120ms up
- Scale: 0.98x on press
- Easing: ease-in-out
- Shadow: Reduce blur temporarily
```

### Button Press
**System-Standard Feedback**:
```
Animation Properties:
- Duration: 50ms down, 100ms up
- Scale: 0.95x on press
- Background: Darken 10%
- Haptic: Light tap (if supported)
```

### Note Creation
**Satisfying Pop-in**:
```
Animation Properties:
- Duration: 300ms
- Easing: spring(1, 100, 10)
- Scale: 0.3 → 1.0
- Opacity: 0 → 1.0
- Rotation: -5° → 0°
```

---

## 3. Drag and Drop Behaviors

### Note Dragging
**Pickup Animation**:
```
Initial State:
- Scale: 1.0 → 1.05
- Shadow: Enhanced (blur 12px, offset 6px)
- Z-index: Elevated
- Rotation: 0° → ±2° (subtle tilt)
- Duration: 200ms
- Easing: ease-out
```

**During Drag**:
```
Continuous State:
- Follow cursor with slight lag (100ms)
- Maintain elevated shadow
- Slight oscillation on rapid movement
- Semi-transparent (0.9 opacity)
```

**Drop Animation**:
```
Settlement:
- Scale: 1.05 → 1.0
- Shadow: Return to normal
- Rotation: Return to 0°
- Snap to grid (if enabled)
- Duration: 250ms
- Easing: ease-out with slight bounce
```

### Drag Affordances
**Visual Cues**:
- Cursor changes to grab/grabbing
- Other notes slightly fade (0.7 opacity)
- Drop zones highlight with gentle glow
- Invalid drop areas show red tint

---

## 4. Window Management Interactions

### Window Minimize
**macOS-Standard Genie Effect**:
```
Animation Properties:
- Duration: 500ms
- Path: Curved bezier to dock
- Easing: ease-in-out
- Opacity: 1.0 → 0.3 → 0.0
```

### Window Restore
**Reverse Genie Effect**:
```
Animation Properties:
- Duration: 400ms
- Path: Curved bezier from dock
- Scale: 0.1 → 1.0
- Opacity: 0.0 → 1.0
- Easing: ease-out
```

### Window Close
**Fade and Scale**:
```
Animation Properties:
- Duration: 200ms
- Scale: 1.0 → 0.95
- Opacity: 1.0 → 0.0
- Easing: ease-in
```

### Window Resize
**Live Resize Feedback**:
```
Behavior:
- Real-time content reflow
- Maintain aspect ratio options
- Smooth corner radius adjustment
- 60fps throughout resize operation
```

---

## 5. Note Creation/Editing Flows

### New Note Creation
**Flow Sequence**:
1. **Trigger**: Menu selection or keyboard shortcut
2. **Spawn Animation** (300ms):
   ```
   - Appear at cursor location
   - Scale: 0.3 → 1.0
   - Rotation: -10° → 0°
   - Opacity: 0 → 1.0
   - Easing: spring animation
   ```
3. **Focus State** (immediate):
   - Text cursor appears
   - Soft glow around note border
   - Keyboard focus established

### Edit Mode Entry
**Double-click/Return Key**:
```
Animation Properties:
- Duration: 150ms
- Border highlight (system accent color)
- Slight inner shadow
- Text cursor fade-in
- Easing: ease-out
```

### Edit Mode Exit
**Click outside/Escape**:
```
Animation Properties:
- Duration: 200ms
- Border fade-out
- Remove inner shadow
- Text cursor fade-out
- Save indicator (if changed)
```

### Auto-Save Indicator
**Subtle Feedback**:
```
Animation Properties:
- Duration: 1000ms
- Small checkmark icon
- Opacity: 0 → 1.0 → 0
- Position: Top-right corner
- Easing: ease-in-out
```

---

## 6. Transition Animations

### Note Color Change
**Smooth Color Transition**:
```
Animation Properties:
- Duration: 300ms
- Easing: ease-in-out
- Interpolation: HSB color space
- Maintain readability during transition
```

### Font Size Adjustment
**Live Preview**:
```
Animation Properties:
- Duration: 200ms
- Smooth font scaling
- Maintain text position anchoring
- Reflow other content smoothly
```

### Note Stack Reordering
**Deck Shuffle Effect**:
```
Animation Properties:
- Duration: 400ms
- Staggered timing (50ms offset per note)
- Z-index transitions
- Smooth position interpolation
- Easing: ease-out
```

---

## 7. Loading States

### App Launch
**Progressive Loading**:
```
Sequence:
1. App icon bounce (dock)
2. Main window fade-in (300ms)
3. Notes cascade in (100ms stagger)
4. Toolbar slide-in from top (200ms)
```

### Note Sync
**Cloud Sync Indicator**:
```
Animation Properties:
- Rotating sync icon
- Duration: 2000ms linear loop
- Opacity pulse: 0.5 → 1.0
- Stop with success/error state
```

### Search Results
**Cascading Results**:
```
Animation Properties:
- Staggered appearance (80ms delay)
- Slide-in from right
- Highlight matching text
- Duration: 250ms per result
```

---

## 8. Error States

### Network Error
**Gentle Error Indication**:
```
Animation Properties:
- Red tint overlay (0.1 opacity)
- Shake animation: ±4px horizontal
- Duration: 500ms
- Error icon with bounce
```

### Save Error
**Immediate Feedback**:
```
Visual Cues:
- Note border flash red
- Duration: 200ms
- Error tooltip appear
- Retry button with pulse
```

### Validation Error
**Field-Level Feedback**:
```
Animation Properties:
- Invalid field highlight
- Subtle shake (±2px)
- Error message slide-down
- Duration: 300ms
```

---

## 9. Accessibility Considerations

### Reduced Motion
**Respect `prefers-reduced-motion`**:
- Disable all non-essential animations
- Replace with instant state changes
- Maintain visual feedback through opacity/color
- Keep functional animations (focus indicators)

### High Contrast
**Enhanced Visibility**:
- Increase border thickness
- Use system high contrast colors
- Maintain animation timing
- Ensure sufficient color contrast ratios

### Keyboard Navigation
**Focus Indicators**:
```
Animation Properties:
- Focus ring: 2px system accent color
- Smooth focus transitions (150ms)
- Clear tab order indication
- Voice Over compatibility
```

---

## 10. Performance Optimizations

### Hardware Acceleration
**CSS Properties**:
- Use `transform` instead of position changes
- Utilize `opacity` for show/hide
- Enable `will-change` for animating elements
- Use `transform3d()` to trigger GPU acceleration

### Animation Batching
**Efficient Rendering**:
- Group related animations
- Use `requestAnimationFrame`
- Avoid layout thrashing
- Implement frame rate monitoring

### Memory Management
**Resource Optimization**:
- Clean up completed animations
- Remove unused event listeners
- Optimize image assets
- Monitor memory usage patterns

---

## 11. Implementation Guidelines

### Animation Library
**Recommended Stack**:
- CSS Animations for simple transitions
- JavaScript for complex sequences
- Core Animation (if using native framework)
- Lottie for complex illustrations

### Timing Functions
**Standard Easings**:
```css
/* macOS-style easings */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Testing Checklist
- [ ] All animations run at 60fps
- [ ] Reduced motion preferences respected
- [ ] Works across different display densities
- [ ] Maintains performance with multiple notes
- [ ] Graceful degradation on older hardware

---

This interaction design specification ensures the StickyNotes app feels native to macOS while providing delightful, performant micro-interactions that enhance productivity without being distracting.