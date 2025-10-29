## React + Electron Tech Stack Guide
### Modern Desktop App Development with React & Electron

*Created: September 2024*  
*Purpose: Comprehensive React & Electron development guide with cliff notes*

---

## 🎯 Tech Stack Overview

### **Core Technologies**
- **React 18+** - Component-based UI library
- **Electron 31+** - Cross-platform desktop app framework
- **TypeScript 5.x** - Type-safe development
- **Vite/Webpack** - Fast build tooling
- **Electron Builder** - App packaging and distribution

### **Supporting Libraries**
- **React Router** - Client-side routing
- **Zustand/Redux Toolkit** - State management
- **React Query/TanStack Query** - Server state management
- **Styled Components/Tailwind** - Styling solutions
- **React Hook Form** - Form handling

---

## 📚 React Essentials Cliff Notes

### **Modern React Patterns (2024)**

#### **Functional Components & Hooks**
```jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Basic Component
const UserProfile = ({ userId }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await api.getUser(userId);
                setUser(userData);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    // Memoized computation
    const userDisplayName = useMemo(() => {
        return user ? `${user.firstName} ${user.lastName}` : '';
    }, [user]);

    // Memoized callback
    const handleUpdateUser = useCallback((updates) => {
        setUser(prev => ({ ...prev, ...updates }));
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found</div>;

    return (
        <div className="user-profile">
            <h1>{userDisplayName}</h1>
            <UserDetails user={user} onUpdate={handleUpdateUser} />
        </div>
    );
};
```

#### **Custom Hooks**
```jsx
// Data Fetching Hook
const useApi = (url) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
};

// Local Storage Hook
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    };

    return [storedValue, setValue];
};
```

#### **Context & State Management**
```jsx
// Theme Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// Global State with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
    persist(
        (set, get) => ({
            user: null,
            settings: { theme: 'light', notifications: true },
            
            setUser: (user) => set({ user }),
            updateSettings: (newSettings) => 
                set(state => ({ 
                    settings: { ...state.settings, ...newSettings } 
                })),
            
            // Async actions
            login: async (credentials) => {
                const user = await api.login(credentials);
                set({ user });
                return user;
            },
        }),
        {
            name: 'app-storage',
            partialize: (state) => ({ 
                settings: state.settings 
            }),
        }
    )
);
```

---

## ⚡ Electron Essentials Cliff Notes

### **Main Process (main.js)**
```javascript
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready
        webPreferences: {
            nodeIntegration: false, // Security best practice
            contextIsolation: true, // Security best practice
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// IPC Communication
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-save-dialog', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
        filters: [
            { name: 'JSON files', extensions: ['json'] },
            { name: 'All files', extensions: ['*'] }
        ]
    });
    return result;
});

// Auto-updater (production)
if (!isDev) {
    const { autoUpdater } = require('electron-updater');
    
    app.whenReady().then(() => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall();
    });
}
```

### **Preload Script (preload.js)**
```javascript
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // File operations
    showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
    saveFile: (path, content) => ipcRenderer.invoke('save-file', path, content),
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    
    // System operations
    showNotification: (title, body) => 
        ipcRenderer.invoke('show-notification', { title, body }),
    
    // Menu operations
    showContextMenu: () => ipcRenderer.send('show-context-menu'),
    
    // Window operations
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    
    // Event listeners
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },
    
    // Remove listeners
    removeAllListeners: (channel) => {
        ipcRenderer.removeAllListeners(channel);
    }
});

// Security: Remove Node.js globals
delete window.require;
delete window.exports;
delete window.module;
```

### **React Integration with Electron APIs**
```jsx
// Custom hook for Electron API
const useElectron = () => {
    const [isElectron, setIsElectron] = useState(false);
    const [version, setVersion] = useState('');

    useEffect(() => {
        const checkElectron = async () => {
            if (window.electronAPI) {
                setIsElectron(true);
                try {
                    const appVersion = await window.electronAPI.getVersion();
                    setVersion(appVersion);
                } catch (error) {
                    console.error('Failed to get app version:', error);
                }
            }
        };

        checkElectron();
    }, []);

    return { isElectron, version };
};

// File operations component
const FileManager = () => {
    const { isElectron } = useElectron();
    const [fileContent, setFileContent] = useState('');

    const handleSaveFile = async () => {
        if (!isElectron) return;

        try {
            const result = await window.electronAPI.showSaveDialog();
            if (!result.canceled) {
                await window.electronAPI.saveFile(result.filePath, fileContent);
                console.log('File saved successfully');
            }
        } catch (error) {
            console.error('Failed to save file:', error);
        }
    };

    const handleShowNotification = () => {
        if (isElectron) {
            window.electronAPI.showNotification(
                'Success', 
                'File operation completed!'
            );
        }
    };

    return (
        <div>
            <textarea 
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Enter file content..."
            />
            <button onClick={handleSaveFile}>Save File</button>
            <button onClick={handleShowNotification}>Show Notification</button>
        </div>
    );
};
```

---

## 🛠️ Development Setup & Build Process

### **Project Structure**
```
my-electron-app/
├── public/
│   ├── electron.js          # Main process
│   ├── preload.js          # Preload script
│   └── icon.png            # App icon
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Main App component
│   └── index.jsx          # React entry point
├── dist/                  # Built files
├── electron-dist/         # Packaged app
├── package.json
├── electron-builder.json  # Build configuration
└── vite.config.js         # Vite configuration
```

### **Package.json Scripts**
```json
{
  "main": "public/electron.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:react\" \"npm run dev:electron\"",
    "dev:react": "vite",
    "dev:electron": "wait-on http://localhost:3000 && electron .",
    "build": "vite build",
    "build:electron": "npm run build && electron-builder",
    "dist": "npm run build && electron-builder --publish=never",
    "dist:all": "npm run build && electron-builder -mwl",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### **Electron Builder Configuration**
```json
// electron-builder.json
{
  "appId": "com.yourcompany.yourapp",
  "productName": "Your App Name",
  "directories": {
    "output": "electron-dist"
  },
  "files": [
    "dist/**/*",
    "public/electron.js",
    "public/preload.js",
    "node_modules/**/*"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      }
    ]
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      }
    ]
  },
  "linux": {
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      }
    ]
  }
}
```

---

## ⚡ AI Swarm Integration

### **React Component Analysis Swarm**
```bash
# COMPONENT ARCHITECTURE AGENT
echo "REACT COMPONENT ANALYSIS: Review this React component for architecture, performance, and best practices. Focus on: component structure, hook usage, prop drilling, re-rendering optimization, accessibility.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
COMPONENT CODE: [PASTE_REACT_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > react_component_review.txt &

# REACT PERFORMANCE AGENT
echo "REACT PERFORMANCE OPTIMIZATION: Analyze this React code for performance issues and optimization opportunities. Focus on: unnecessary re-renders, heavy computations, memory leaks, bundle size, lazy loading.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
COMPONENT CODE: [PASTE_REACT_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > react_performance_review.txt &

# REACT TESTING AGENT
echo "REACT TESTING STRATEGY: Create comprehensive testing approach for this React component. Include: unit tests with Testing Library, integration tests, accessibility tests, mock strategies.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
COMPONENT CODE: [PASTE_REACT_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > react_testing_strategy.txt &

wait
```

### **Electron Security & Architecture Swarm**
```bash
# ELECTRON SECURITY AGENT
echo "ELECTRON SECURITY AUDIT: Review this Electron app for security vulnerabilities and best practices. Focus on: context isolation, preload scripts, IPC communication, node integration, CSP policies.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
ELECTRON CODE: [PASTE_ELECTRON_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > electron_security_review.txt &

# ELECTRON ARCHITECTURE AGENT
echo "ELECTRON ARCHITECTURE ANALYSIS: Evaluate the main process, renderer process, and IPC communication design. Focus on: process separation, IPC patterns, performance implications, cross-platform compatibility.
# 🚨 DO NOT TOUCH THIS COMMAND - VERIFIED WORKING SYNTAX
# Command structure: opencode run -m "anthropic/claude-sonnet|opus-4-20250514" --verbose --dangerously-skip-permissions -p
# Any modifications will break the SWARM framework
ELECTRON CODE: [PASTE_ELECTRON_CODE_HERE]" | opencode run -m "anthropic/claude-sonnet-4-20250514" > electron_architecture_review.txt &

wait
```

---

## 🎨 Styling & UI Libraries

### **Tailwind CSS Integration**
```jsx
// Component with Tailwind
const Button = ({ variant = 'primary', size = 'md', children, ...props }) => {
    const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500',
        danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    
    const className = `${baseClasses} ${variants[variant]} ${sizes[size]}`;
    
    return (
        <button className={className} {...props}>
            {children}
        </button>
    );
};
```

### **Styled Components**
```jsx
import styled, { ThemeProvider } from 'styled-components';

const theme = {
    colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        success: '#28a745',
        danger: '#dc3545'
    },
    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1200px'
    }
};

const StyledButton = styled.button`
    background: ${props => props.theme.colors[props.variant] || props.theme.colors.primary};
    color: white;
    border: none;
    border-radius: 4px;
    padding: ${props => props.size === 'large' ? '12px 24px' : '8px 16px'};
    font-size: ${props => props.size === 'large' ? '16px' : '14px'};
    cursor: pointer;
    transition: opacity 0.2s ease;
    
    &:hover {
        opacity: 0.8;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    @media (max-width: ${props => props.theme.breakpoints.mobile}) {
        padding: 6px 12px;
        font-size: 12px;
    }
`;

// Usage
const App = () => (
    <ThemeProvider theme={theme}>
        <StyledButton variant="primary" size="large">
            Click me
        </StyledButton>
    </ThemeProvider>
);
```

---

## 🧪 Testing Strategies

### **React Testing Library Examples**
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
    const mockUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
    };

    test('renders user information correctly', () => {
        render(<UserProfile user={mockUser} />);
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('handles edit mode toggle', async () => {
        const user = userEvent.setup();
        render(<UserProfile user={mockUser} />);
        
        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);
        
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });

    test('calls onSave when form is submitted', async () => {
        const user = userEvent.setup();
        const mockOnSave = jest.fn();
        
        render(<UserProfile user={mockUser} onSave={mockOnSave} />);
        
        await user.click(screen.getByRole('button', { name: /edit/i }));
        await user.clear(screen.getByDisplayValue('John Doe'));
        await user.type(screen.getByDisplayValue(''), 'Jane Doe');
        await user.click(screen.getByRole('button', { name: /save/i }));
        
        expect(mockOnSave).toHaveBeenCalledWith({
            ...mockUser,
            name: 'Jane Doe'
        });
    });
});
```

---

## 📦 Essential Dependencies

### **Core Dependencies**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "zustand": "^4.3.0",
    "@tanstack/react-query": "^4.24.0",
    "react-hook-form": "^7.43.0",
    "styled-components": "^5.3.0"
  },
  "devDependencies": {
    "electron": "^31.0.0",
    "electron-builder": "^24.0.0",
    "concurrently": "^7.6.0",
    "wait-on": "^7.0.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/user-event": "^14.4.0"
  }
}
```

---

## 🚀 Quick Commands

### **Development Workflow**
```bash
# Setup
npx create-react-app my-electron-app --template typescript
cd my-electron-app
npm install electron electron-builder concurrently wait-on --save-dev

# Development
npm run dev              # Start React + Electron in development
npm run build            # Build React app
npm run build:electron   # Build and package Electron app
npm run dist:all         # Build for all platforms

# Testing
npm test                 # Run React tests
npm run test:e2e         # Run Electron e2e tests
```

### **Debugging**
```javascript
// React DevTools in Electron
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');

app.whenReady().then(() => {
    if (isDev) {
        installExtension(REACT_DEVELOPER_TOOLS)
            .then((name) => console.log(`Added Extension: ${name}`))
            .catch((err) => console.log('An error occurred: ', err));
    }
});

// Logging in production
if (!isDev) {
    const log = require('electron-log');
    log.transports.file.level = 'info';
    console.log = log.info;
    console.error = log.error;
}
```

---

*This guide provides comprehensive React + Electron development knowledge for building modern desktop applications with AI swarm orchestration.*