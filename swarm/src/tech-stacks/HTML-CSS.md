## HTML/CSS Tech Stack Guide
### Modern Web Development with AI Swarm Orchestration

*Created: September 2024*  
*Purpose: Comprehensive HTML/CSS development guide with cliff notes*

---

## 🎯 Tech Stack Overview

### **Core Technologies**
- **HTML5** - Semantic markup language with modern APIs
- **CSS3** - Styling and layout with advanced features  
- **Sass/SCSS** - CSS preprocessor for maintainable styles
- **PostCSS** - CSS transformation tool with plugins

### **Development Tools**
- **Vite/Webpack** - Build tools and dev servers
- **Autoprefixer** - Automatic vendor prefixing
- **CSSlint/Stylelint** - CSS code quality and linting
- **PurgeCSS** - Unused CSS removal

---

## 📚 Essential Cliff Notes

### **HTML5 Fundamentals**

#### **Semantic Structure**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern Web App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- Semantic Layout -->
    <header>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="hero">
            <h1>Welcome to Our Site</h1>
            <p>Modern semantic HTML structure</p>
        </section>
        
        <article>
            <h2>Article Title</h2>
            <p>Content goes here...</p>
        </article>
    </main>
    
    <aside>
        <h3>Sidebar Content</h3>
        <!-- Related content -->
    </aside>
    
    <footer>
        <p>&copy; 2025 Company Name</p>
    </footer>
</body>
</html>
```

#### **Modern HTML Features**
```html
<!-- Form Elements with Validation -->
<form>
    <fieldset>
        <legend>User Information</legend>
        
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        
        <label for="phone">Phone:</label>
        <input type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}">
        
        <label for="date">Date:</label>
        <input type="date" id="date" name="date">
        
        <label for="range">Range:</label>
        <input type="range" id="range" min="0" max="100" value="50">
    </fieldset>
</form>

<!-- Media Elements -->
<figure>
    <img src="image.jpg" alt="Description" loading="lazy" width="400" height="300">
    <figcaption>Image caption</figcaption>
</figure>

<video controls poster="thumbnail.jpg">
    <source src="video.mp4" type="video/mp4">
    <source src="video.webm" type="video/webm">
    Your browser doesn't support video.
</video>

<!-- Custom Elements & Web Components -->
<custom-button type="primary" size="large">
    Click Me
</custom-button>
```

### **CSS3 Essentials**

#### **Modern Layout Systems**
```css
/* CSS Grid - 2D Layout */
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 2rem;
    grid-template-areas: 
        "header header header"
        "sidebar content content"
        "footer footer footer";
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.footer { grid-area: footer; }

/* Flexbox - 1D Layout */
.flex-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.flex-item {
    flex: 1 1 auto; /* grow | shrink | basis */
}

/* Container Queries (Modern) */
@container (min-width: 500px) {
    .card {
        display: grid;
        grid-template-columns: 2fr 1fr;
    }
}
```

#### **Advanced Styling Techniques**
```css
/* CSS Custom Properties (Variables) */
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --font-size-base: 1rem;
    --spacing-unit: 0.5rem;
    --border-radius: 0.25rem;
}

/* Modern Color Functions */
.element {
    background: hsl(210 100% 50%);
    color: oklch(0.7 0.15 180); /* Modern color space */
    border: 1px solid color-mix(in srgb, var(--primary-color) 80%, white);
}

/* Advanced Selectors */
.card:has(img) { /* Has selector */
    padding: 0;
}

.item:nth-child(odd) {
    background: #f8f9fa;
}

.input:invalid {
    border-color: #dc3545;
}

.input:user-invalid { /* Only after user interaction */
    outline: 2px solid red;
}

/* CSS Nesting (Modern) */
.button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--border-radius);
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    &.primary {
        background: var(--primary-color);
        color: white;
    }
}
```

#### **Responsive Design Patterns**
```css
/* Mobile-First Approach */
.container {
    width: 100%;
    padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        padding: 2rem;
    }
}

/* Modern Media Queries */
@media (prefers-color-scheme: dark) {
    :root {
        --bg-color: #1a1a1a;
        --text-color: #ffffff;
    }
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* Fluid Typography */
.heading {
    font-size: clamp(1.5rem, 4vw, 3rem);
    line-height: 1.2;
}
```

### **CSS Animations & Transitions**

#### **Modern Animation Techniques**
```css
/* CSS Transitions */
.button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.button:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* CSS Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(2rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.fade-in {
    animation: fadeInUp 0.6s ease-out;
}

/* Scroll-Triggered Animations */
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.scroll-animate {
    animation: slideIn 0.8s ease-out;
    animation-timeline: view();
    animation-range: entry 0% entry 100%;
}
```

### **CSS Architecture Patterns**

#### **BEM (Block Element Modifier)**
```css
/* Block */
.card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Element */
.card__header {
    padding: 1rem;
    border-bottom: 1px solid #eee;
}

.card__body {
    padding: 1rem;
}

.card__footer {
    padding: 1rem;
    background: #f8f9fa;
}

/* Modifier */
.card--featured {
    border: 2px solid var(--primary-color);
}

.card--large {
    padding: 2rem;
}

/* Usage in HTML */
/*
<div class="card card--featured card--large">
    <div class="card__header">Title</div>
    <div class="card__body">Content</div>
    <div class="card__footer">Footer</div>
</div>
*/
```

#### **CSS Custom Properties Organization**
```css
/* Design System Variables */
:root {
    /* Colors */
    --color-primary-50: #eff6ff;
    --color-primary-500: #3b82f6;
    --color-primary-900: #1e3a8a;
    
    /* Typography */
    --font-family-sans: 'Inter', system-ui, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    
    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-8: 2rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## 🛠️ Development Best Practices

### **File Organization**
```
project/
├── src/
│   ├── styles/
│   │   ├── base/           # Reset, typography, base styles
│   │   ├── components/     # Component-specific styles
│   │   ├── layout/         # Layout-related styles
│   │   ├── utilities/      # Utility classes
│   │   ├── variables/      # CSS custom properties
│   │   └── main.scss       # Main entry point
│   ├── components/         # HTML components/templates
│   └── assets/            # Images, fonts, etc.
├── dist/                  # Built files
├── package.json
├── vite.config.js
└── postcss.config.js
```

### **Performance Optimization**
```css
/* Critical CSS Loading */
<style>
    /* Inline critical above-the-fold CSS */
    .hero { /* Critical styles */ }
</style>
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

/* CSS Containment */
.card {
    contain: layout style paint;
}

/* will-change for Performance */
.animated-element {
    will-change: transform, opacity;
}

.animated-element.done {
    will-change: auto; /* Remove when animation complete */
}

/* Efficient Selectors */
/* Good */
.nav-item { }
.btn-primary { }

/* Avoid */
div > ul > li > a { }
#content .sidebar .widget .title { }
```

### **Accessibility Best Practices**
```css
/* Focus Management */
.button:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}

/* Screen Reader Only Content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* High Contrast Support */
@media (prefers-contrast: high) {
    .button {
        border: 2px solid;
    }
}

/* Color Contrast Utilities */
.text-contrast-high {
    color: var(--color-gray-900);
}

.text-contrast-low {
    color: var(--color-gray-600);
}
```

---

## ⚡ AI Swarm Integration

### **HTML/CSS Swarm Commands**

#### **Code Analysis Swarm**
```bash
# HTML STRUCTURE AGENT
echo "HTML SEMANTIC ANALYSIS: Review this HTML code for semantic structure, accessibility, and modern HTML5 best practices. Focus on: proper semantic elements, ARIA attributes, form validation, meta tags, performance optimization.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > html_structure_review.txt &

# CSS ARCHITECTURE AGENT
echo "CSS ARCHITECTURE ANALYSIS: Analyze CSS code structure, organization, and maintainability. Focus on: BEM methodology, CSS custom properties usage, responsive design patterns, performance implications, browser compatibility.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > css_architecture_review.txt &

# ACCESSIBILITY AUDIT AGENT
echo "WEB ACCESSIBILITY AUDIT: Comprehensive accessibility review of HTML/CSS code. Focus on: WCAG 2.1 compliance, keyboard navigation, screen reader compatibility, color contrast, focus management, ARIA implementation.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > accessibility_audit.txt &

wait
```

#### **Design System Swarm**
```bash
# DESIGN TOKENS AGENT
echo "CSS DESIGN SYSTEM ANALYSIS: Create comprehensive design token system from existing CSS. Focus on: color palettes, typography scales, spacing systems, component variants, design consistency.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > design_tokens_system.txt &

# COMPONENT LIBRARY AGENT
echo "CSS COMPONENT SYSTEM: Design modular CSS component architecture. Focus on: reusable components, variant patterns, composition strategies, naming conventions, documentation structure.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
CODE: [PASTE_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > component_library_design.txt &

wait
```

---

## 📦 Essential Tools & Packages

### **Build Tools Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('@tailwindcss/postcss7-compat'),
        require('cssnano')({
          preset: 'default',
        })
      ]
    }
  }
});

// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-custom-properties'),
    require('postcss-nesting'),
    require('cssnano')
  ]
};
```

### **CSS Frameworks & Libraries**
```scss
// Modern CSS Framework Options

// Tailwind CSS
@tailwind base;
@tailwind components;
@tailwind utilities;

// Bootstrap 5
@import "bootstrap/scss/bootstrap";

// Bulma
@import "bulma/bulma.sass";

// CSS-in-JS Alternative (Vanilla Extract)
// styles.css.ts
import { style } from '@vanilla-extract/css';

export const button = style({
  padding: '12px 24px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
});
```

---

## 🔧 Configuration Files

### **Package.json for CSS Development**
```json
{
  "devDependencies": {
    "sass": "^1.62.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "cssnano": "^6.0.0",
    "stylelint": "^15.6.0",
    "stylelint-config-standard-scss": "^9.0.0",
    "postcss-preset-env": "^8.4.0",
    "lightningcss": "^1.20.0",
    "vite": "^4.3.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint:css": "stylelint 'src/**/*.{css,scss}'",
    "lint:css:fix": "stylelint 'src/**/*.{css,scss}' --fix"
  }
}
```

### **Stylelint Configuration (.stylelintrc.json)**
```json
{
  "extends": ["stylelint-config-standard-scss"],
  "rules": {
    "declaration-block-trailing-semicolon": null,
    "no-descending-specificity": null,
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]*(__[a-z][a-zA-Z0-9]*)?((--[a-z][a-zA-Z0-9]*)?)*$",
    "custom-property-pattern": "^[a-z][a-zA-Z0-9]*(-[a-z][a-zA-Z0-9]*)*$",
    "at-rule-no-unknown": [
      true,
      {
        "ignoreAtRules": ["tailwind", "apply", "variants", "responsive", "screen"]
      }
    ]
  }
}
```

---

## 🚀 Quick Commands

### **Development Workflow**
```bash
# Project Setup
npm init -y
npm install --save-dev vite sass postcss autoprefixer
npm install --save-dev stylelint stylelint-config-standard-scss

# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint:css     # Lint CSS/SCSS files
npm run lint:css:fix # Auto-fix CSS linting issues

# CSS Processing
npx sass src/styles/main.scss dist/css/styles.css
npx postcss dist/css/styles.css -o dist/css/styles.min.css
npx lightningcss --minify dist/css/styles.css -o dist/css/styles.min.css
```

### **CSS Debugging Commands**
```bash
# Analyze CSS Bundle Size
npx bundlesize
npx webpack-bundle-analyzer dist/

# Check CSS Browser Support
npx browserslist
npx caniuse-cmd "grid"

# Performance Analysis
npx lighthouse-ci autorun
npx web-vitals-cli https://yoursite.com
```

---

## 🎨 Modern CSS Patterns

### **Utility-First CSS**
```css
/* Utility Classes */
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.flex { display: flex; }
.grid { display: grid; }
.block { display: block; }
.hidden { display: none; }

/* Responsive Utilities */
@media (min-width: 768px) {
    .md\:flex { display: flex; }
    .md\:hidden { display: none; }
    .md\:text-lg { font-size: var(--font-size-lg); }
}
```

### **Component-Scoped CSS**
```css
/* Component Isolation */
.component {
    /* Use CSS custom properties for customization */
    --component-bg: var(--color-white);
    --component-border: var(--color-gray-200);
    --component-radius: var(--border-radius-md);
    
    background: var(--component-bg);
    border: 1px solid var(--component-border);
    border-radius: var(--component-radius);
}

/* Theme Variations */
.component.theme-dark {
    --component-bg: var(--color-gray-800);
    --component-border: var(--color-gray-600);
}

.component.theme-primary {
    --component-bg: var(--color-primary-50);
    --component-border: var(--color-primary-200);
}
```

---

*This guide provides essential HTML/CSS knowledge and commands for AI-assisted web development. Use these cliff notes as quick reference during swarm orchestration.*