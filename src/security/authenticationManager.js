/**
 * PRODUCTION-READY AUTHENTICATION MANAGER
 * Implements secure user authentication with session management
 * Addresses: Authentication bypass vulnerabilities, Session management issues
 */

const crypto = require('crypto');
const { app } = require('electron');
const Store = require('electron-store');

class AuthenticationManager {
  constructor() {
    // Secure store for auth data with encryption
    this.authStore = new Store({
      name: 'auth-data',
      encryptionKey: this.generateEncryptionKey(),
      schema: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              passwordHash: { type: 'string' },
              salt: { type: 'string' },
              createdAt: { type: 'string' },
              lastLogin: { type: 'string' },
              failedAttempts: { type: 'number' },
              lockedUntil: { type: 'string' },
              roles: { type: 'array', items: { type: 'string' } }
            },
            required: ['id', 'username', 'passwordHash', 'salt', 'roles']
          }
        },
        sessions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              sessionId: { type: 'string' },
              userId: { type: 'string' },
              createdAt: { type: 'string' },
              lastActivity: { type: 'string' },
              expiresAt: { type: 'string' },
              ipAddress: { type: 'string' },
              userAgent: { type: 'string' }
            },
            required: ['sessionId', 'userId', 'createdAt', 'expiresAt']
          }
        }
      },
      defaults: {
        users: [],
        sessions: []
      }
    });

    // Current session data
    this.currentSession = null;
    this.currentUser = null;
    
    // Security configuration
    this.config = {
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      maxFailedAttempts: 5,
      accountLockDuration: 30 * 60 * 1000, // 30 minutes
      passwordMinLength: 8,
      requireStrongPassword: true,
      sessionRefreshInterval: 60 * 60 * 1000, // 1 hour
      maxActiveSessions: 3
    };

    // Rate limiting for authentication attempts
    this.authAttempts = new Map();
    this.rateLimitWindow = 15 * 60 * 1000; // 15 minutes
    this.maxAttemptsPerWindow = 10;

    // Initialize cleanup intervals
    this.startCleanupIntervals();
  }

  /**
   * Generate encryption key for auth store
   */
  generateEncryptionKey() {
    const machineId = require('node-machine-id').machineIdSync();
    const appName = app.getName();
    return crypto.createHash('sha256')
      .update(machineId + appName + 'stickynotes-auth')
      .digest('hex');
  }

  /**
   * SECURITY FIX: Secure password hashing with salt
   */
  hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(32).toString('hex');
    }
    
    // Use PBKDF2 with high iteration count for strong password security
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  /**
   * SECURITY FIX: Password strength validation
   */
  validatePasswordStrength(password) {
    if (password.length < this.config.passwordMinLength) {
      throw new Error(`Password must be at least ${this.config.passwordMinLength} characters long`);
    }

    if (this.config.requireStrongPassword) {
      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChar) {
        throw new Error('Password must contain uppercase, lowercase, number, and special character');
      }
    }

    // Check against common passwords
    const commonPasswords = ['password', '123456', 'admin', 'user', 'login'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      throw new Error('Password contains common patterns');
    }

    return true;
  }

  /**
   * SECURITY FIX: Rate limiting for authentication attempts
   */
  checkRateLimit(identifier) {
    const now = Date.now();
    const attempts = this.authAttempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(timestamp => 
      now - timestamp < this.rateLimitWindow
    );

    if (validAttempts.length >= this.maxAttemptsPerWindow) {
      const oldestAttempt = Math.min(...validAttempts);
      const timeUntilReset = this.rateLimitWindow - (now - oldestAttempt);
      throw new Error(`Too many authentication attempts. Try again in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes.`);
    }

    // Record this attempt
    validAttempts.push(now);
    this.authAttempts.set(identifier, validAttempts);
    
    return true;
  }

  /**
   * SECURITY FIX: Secure user registration
   */
  async registerUser(username, password, roles = ['user']) {
    try {
      // Validate inputs
      if (!username || typeof username !== 'string' || username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error('Username can only contain letters, numbers, underscores, and hyphens');
      }

      this.validatePasswordStrength(password);

      // Check if user already exists
      const users = this.authStore.get('users', []);
      if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username already exists');
      }

      // Create secure user record
      const userId = crypto.randomUUID();
      const { hash: passwordHash, salt } = this.hashPassword(password);
      const now = new Date().toISOString();

      const newUser = {
        id: userId,
        username: username,
        passwordHash,
        salt,
        createdAt: now,
        lastLogin: null,
        failedAttempts: 0,
        lockedUntil: null,
        roles: Array.isArray(roles) ? roles : ['user']
      };

      // Save user
      users.push(newUser);
      this.authStore.set('users', users);

      console.log(`User registered successfully: ${username}`);
      return { success: true, userId };

    } catch (error) {
      console.error('User registration failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Secure authentication with account lockout
   */
  async authenticateUser(username, password, clientInfo = {}) {
    try {
      const identifier = clientInfo.ipAddress || 'unknown';
      
      // Rate limiting check
      this.checkRateLimit(identifier);

      // Get user
      const users = this.authStore.get('users', []);
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      if (!user) {
        // Prevent username enumeration by using same timing
        this.hashPassword('dummy-password');
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const lockTime = new Date(user.lockedUntil);
        const timeLeft = Math.ceil((lockTime - new Date()) / 1000 / 60);
        throw new Error(`Account locked. Try again in ${timeLeft} minutes.`);
      }

      // Verify password
      const { hash } = this.hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        // Increment failed attempts
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        
        if (user.failedAttempts >= this.config.maxFailedAttempts) {
          user.lockedUntil = new Date(Date.now() + this.config.accountLockDuration).toISOString();
          console.warn(`Account locked due to failed attempts: ${username}`);
        }

        // Update user record
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        this.authStore.set('users', users);

        throw new Error('Invalid credentials');
      }

      // Reset failed attempts on successful login
      user.failedAttempts = 0;
      user.lockedUntil = null;
      user.lastLogin = new Date().toISOString();

      // Update user record
      const userIndex = users.findIndex(u => u.id === user.id);
      users[userIndex] = user;
      this.authStore.set('users', users);

      // Create new session
      const session = await this.createSession(user, clientInfo);

      console.log(`User authenticated successfully: ${username}`);
      return { 
        success: true, 
        user: this.sanitizeUserData(user),
        session: session
      };

    } catch (error) {
      console.error('Authentication failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Secure session management
   */
  async createSession(user, clientInfo = {}) {
    try {
      // Clean up old sessions first
      await this.cleanupExpiredSessions();
      await this.enforceMaxSessions(user.id);

      const sessionId = crypto.randomUUID();
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + this.config.sessionTimeout).toISOString();

      const session = {
        sessionId,
        userId: user.id,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        ipAddress: clientInfo.ipAddress || 'unknown',
        userAgent: clientInfo.userAgent || 'unknown'
      };

      // Save session
      const sessions = this.authStore.get('sessions', []);
      sessions.push(session);
      this.authStore.set('sessions', sessions);

      // Set current session
      this.currentSession = session;
      this.currentUser = user;

      return session;

    } catch (error) {
      console.error('Session creation failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Session validation and refresh
   */
  async validateSession(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('No session ID provided');
      }

      const sessions = this.authStore.get('sessions', []);
      const session = sessions.find(s => s.sessionId === sessionId);

      if (!session) {
        throw new Error('Invalid session');
      }

      // Check if session is expired
      if (new Date(session.expiresAt) <= new Date()) {
        await this.destroySession(sessionId);
        throw new Error('Session expired');
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();
      
      // Refresh session expiry if needed
      const timeSinceCreated = Date.now() - new Date(session.createdAt).getTime();
      if (timeSinceCreated > this.config.sessionRefreshInterval) {
        session.expiresAt = new Date(Date.now() + this.config.sessionTimeout).toISOString();
      }

      // Update session record
      const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
      sessions[sessionIndex] = session;
      this.authStore.set('sessions', sessions);

      // Get user data
      const users = this.authStore.get('users', []);
      const user = users.find(u => u.id === session.userId);

      if (!user) {
        await this.destroySession(sessionId);
        throw new Error('User not found');
      }

      this.currentSession = session;
      this.currentUser = user;

      return {
        valid: true,
        session,
        user: this.sanitizeUserData(user)
      };

    } catch (error) {
      this.currentSession = null;
      this.currentUser = null;
      throw error;
    }
  }

  /**
   * SECURITY FIX: Authorization checks
   */
  checkPermission(requiredRole) {
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }

    if (!this.currentSession) {
      throw new Error('Valid session required');
    }

    if (requiredRole && !this.currentUser.roles.includes(requiredRole) && !this.currentUser.roles.includes('admin')) {
      throw new Error('Insufficient permissions');
    }

    return true;
  }

  /**
   * Session cleanup and management
   */
  async cleanupExpiredSessions() {
    const sessions = this.authStore.get('sessions', []);
    const now = new Date();
    const validSessions = sessions.filter(s => new Date(s.expiresAt) > now);
    
    if (validSessions.length !== sessions.length) {
      this.authStore.set('sessions', validSessions);
      console.log(`Cleaned up ${sessions.length - validSessions.length} expired sessions`);
    }
  }

  async enforceMaxSessions(userId) {
    const sessions = this.authStore.get('sessions', []);
    const userSessions = sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

    if (userSessions.length >= this.config.maxActiveSessions) {
      // Remove oldest sessions
      const sessionsToRemove = userSessions.slice(this.config.maxActiveSessions - 1);
      const remainingSessions = sessions.filter(s => 
        !sessionsToRemove.some(remove => remove.sessionId === s.sessionId)
      );
      
      this.authStore.set('sessions', remainingSessions);
      console.log(`Removed ${sessionsToRemove.length} old sessions for user ${userId}`);
    }
  }

  async destroySession(sessionId) {
    const sessions = this.authStore.get('sessions', []);
    const filteredSessions = sessions.filter(s => s.sessionId !== sessionId);
    this.authStore.set('sessions', filteredSessions);

    if (this.currentSession && this.currentSession.sessionId === sessionId) {
      this.currentSession = null;
      this.currentUser = null;
    }
  }

  async destroyAllSessions(userId = null) {
    if (userId) {
      const sessions = this.authStore.get('sessions', []);
      const filteredSessions = sessions.filter(s => s.userId !== userId);
      this.authStore.set('sessions', filteredSessions);
    } else {
      this.authStore.set('sessions', []);
    }

    this.currentSession = null;
    this.currentUser = null;
  }

  /**
   * Utility methods
   */
  sanitizeUserData(user) {
    const { passwordHash, salt, ...sanitized } = user;
    return sanitized;
  }

  getCurrentUser() {
    return this.currentUser ? this.sanitizeUserData(this.currentUser) : null;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  isAuthenticated() {
    return !!(this.currentUser && this.currentSession);
  }

  /**
   * Initialize background cleanup processes
   */
  startCleanupIntervals() {
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);

    // Clean up old auth attempts every hour
    setInterval(() => {
      const now = Date.now();
      for (const [key, attempts] of this.authAttempts.entries()) {
        const validAttempts = attempts.filter(timestamp => 
          now - timestamp < this.rateLimitWindow
        );
        if (validAttempts.length === 0) {
          this.authAttempts.delete(key);
        } else {
          this.authAttempts.set(key, validAttempts);
        }
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Get authentication statistics for monitoring
   */
  getAuthStats() {
    const users = this.authStore.get('users', []);
    const sessions = this.authStore.get('sessions', []);
    
    return {
      totalUsers: users.length,
      activeSessions: sessions.length,
      lockedAccounts: users.filter(u => u.lockedUntil && new Date(u.lockedUntil) > new Date()).length,
      rateLimitedIPs: this.authAttempts.size
    };
  }
}

module.exports = { AuthenticationManager };