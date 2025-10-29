/**
 * AUTHENTICATION IPC HANDLERS
 * Handles authentication, authorization, and session management IPC calls
 * SECURITY FIX: Centralized authentication handling for all IPC operations
 */

const { BrowserWindow } = require('electron');
const path = require('path');

class AuthIpcHandlers {
  constructor() {
    this.authWindow = null;
    this.pendingAuthCallbacks = new Map();
  }

  /**
   * SECURITY FIX: Handle authentication request
   */
  async handleAuthenticate(event, authData) {
    try {
      const { action, username, password, clientInfo } = authData;
      
      if (!global.authManager) {
        throw new Error('Authentication system not initialized');
      }

      switch (action) {
        case 'login':
          return await this.handleLogin(username, password, clientInfo);
        
        case 'register':
          return await this.handleRegister(username, password, clientInfo);
        
        default:
          throw new Error(`Unknown authentication action: ${action}`);
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * SECURITY FIX: Handle login
   */
  async handleLogin(username, password, clientInfo = {}) {
    try {
      // Enhanced client info with security context
      const enhancedClientInfo = {
        ...clientInfo,
        ipAddress: '127.0.0.1', // Local app, but could be extended for remote access
        timestamp: new Date().toISOString()
      };

      const result = await global.authManager.authenticateUser(
        username, 
        password, 
        enhancedClientInfo
      );

      if (result.success) {
        // Create session using session manager
        if (global.sessionManager) {
          const session = global.sessionManager.createSession(
            result.user.id, 
            enhancedClientInfo
          );
          
          // Set resource ownership for existing notes
          if (global.authzManager) {
            // Assign ownership of all existing notes to this user
            // (In a multi-user environment, this would be more selective)
            global.authzManager.clearPermissionCache();
          }
        }

        return {
          success: true,
          user: result.user,
          message: 'Authentication successful'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * SECURITY FIX: Handle user registration
   */
  async handleRegister(username, password, clientInfo = {}) {
    try {
      const result = await global.authManager.registerUser(
        username, 
        password, 
        ['user'] // Default role
      );

      if (result.success) {
        return {
          success: true,
          message: 'Account created successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * SECURITY FIX: Check authentication status
   */
  async handleCheckAuthStatus() {
    try {
      const isAuthenticated = global.authManager?.isAuthenticated() || false;
      const currentUser = global.authManager?.getCurrentUser() || null;
      const authStats = global.authManager?.getAuthStats() || {};
      
      return {
        isAuthenticated,
        user: currentUser,
        hasDefaultAdmin: authStats.totalUsers === 1 && currentUser?.username === 'admin',
        stats: authStats
      };
    } catch (error) {
      console.error('Check auth status error:', error.message);
      return {
        isAuthenticated: false,
        user: null,
        error: error.message
      };
    }
  }

  /**
   * SECURITY FIX: Handle logout
   */
  async handleLogout() {
    try {
      if (global.authManager && global.authManager.isAuthenticated()) {
        const user = global.authManager.getCurrentUser();
        const session = global.authManager.getCurrentSession();
        
        // Destroy session
        if (global.sessionManager && session) {
          global.sessionManager.destroySession(session.sessionId, 'logout');
        }
        
        // Destroy user sessions in auth manager
        await global.authManager.destroyAllSessions(user?.id);
        
        console.log(`User logged out: ${user?.username}`);
        return { success: true, message: 'Logged out successfully' };
      } else {
        return { success: false, message: 'No active session' };
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * SECURITY FIX: Show authentication dialog
   */
  async showAuthDialog() {
    return new Promise((resolve, reject) => {
      try {
        if (this.authWindow && !this.authWindow.isDestroyed()) {
          this.authWindow.focus();
          return;
        }

        this.authWindow = new BrowserWindow({
          width: 450,
          height: 600,
          resizable: false,
          frame: false,
          alwaysOnTop: true,
          modal: true,
          show: false,
          titleBarStyle: 'hidden',
          vibrancy: 'dark',
          transparent: true,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            webSecurity: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, '../preload.js')
          }
        });

        this.authWindow.loadFile(path.join(__dirname, '../ui/authenticationDialog.html'));

        this.authWindow.once('ready-to-show', () => {
          this.authWindow.show();
          this.authWindow.center();
        });

        this.authWindow.on('closed', () => {
          this.authWindow = null;
          reject(new Error('Authentication dialog closed'));
        });

        // Handle authentication completion
        this.pendingAuthCallbacks.set('auth', { resolve, reject });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * SECURITY FIX: Handle authentication completion
   */
  handleAuthComplete(event, authResult) {
    const callback = this.pendingAuthCallbacks.get('auth');
    if (callback) {
      this.pendingAuthCallbacks.delete('auth');
      
      if (this.authWindow && !this.authWindow.isDestroyed()) {
        this.authWindow.close();
        this.authWindow = null;
      }
      
      if (authResult.success) {
        callback.resolve(authResult);
      } else {
        callback.reject(new Error(authResult.message || 'Authentication failed'));
      }
    }
  }

  /**
   * SECURITY FIX: Handle authentication cancellation
   */
  handleAuthCancelled() {
    const callback = this.pendingAuthCallbacks.get('auth');
    if (callback) {
      this.pendingAuthCallbacks.delete('auth');
      callback.reject(new Error('Authentication cancelled'));
    }
    
    if (this.authWindow && !this.authWindow.isDestroyed()) {
      this.authWindow.close();
      this.authWindow = null;
    }
  }

  /**
   * SECURITY FIX: Require authentication for app access
   */
  async requireAuthentication() {
    try {
      // Check if already authenticated
      if (global.authManager?.isAuthenticated()) {
        return global.authManager.getCurrentUser();
      }

      // Show authentication dialog
      const authResult = await this.showAuthDialog();
      
      if (authResult.success) {
        return authResult.user;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication requirement failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Validate session before operations
   */
  validateActiveSession() {
    if (!global.authManager?.isAuthenticated()) {
      throw new Error('Authentication required');
    }

    const session = global.authManager.getCurrentSession();
    if (!session) {
      throw new Error('Valid session required');
    }

    // Validate session with session manager
    if (global.sessionManager) {
      try {
        global.sessionManager.validateSession(session.sessionId);
      } catch (error) {
        console.error('Session validation failed:', error.message);
        throw new Error('Session expired or invalid');
      }
    }

    return true;
  }

  /**
   * Register all authentication IPC handlers
   */
  registerHandlers(ipcMain) {
    // Authentication handlers
    ipcMain.handle('authenticate', this.handleAuthenticate.bind(this));
    ipcMain.handle('check-auth-status', this.handleCheckAuthStatus.bind(this));
    ipcMain.handle('logout', this.handleLogout.bind(this));
    
    // Authentication flow handlers
    ipcMain.on('auth-complete', this.handleAuthComplete.bind(this));
    ipcMain.on('auth-cancelled', this.handleAuthCancelled.bind(this));

    console.log('🔐 Authentication IPC handlers registered');
  }
}

module.exports = { AuthIpcHandlers };