/**
 * PRODUCTION-READY SESSION MANAGEMENT SYSTEM
 * Implements secure session handling with advanced security features
 * Addresses: Session management issues, Session fixation, Session hijacking
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

class SessionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = {
      sessionTimeout: options.sessionTimeout || 24 * 60 * 60 * 1000, // 24 hours
      sessionRefreshThreshold: options.sessionRefreshThreshold || 60 * 60 * 1000, // 1 hour
      maxConcurrentSessions: options.maxConcurrentSessions || 5,
      sessionRotationInterval: options.sessionRotationInterval || 30 * 60 * 1000, // 30 minutes
      sessionSecurityCheck: options.sessionSecurityCheck || 5 * 60 * 1000, // 5 minutes
      fingerprintValidation: options.fingerprintValidation !== false,
      strictSessionValidation: options.strictSessionValidation !== false,
      ...options
    };

    // Active sessions storage
    this.activeSessions = new Map();
    this.sessionMetadata = new Map();
    this.suspiciousSessions = new Set();
    
    // Security monitoring
    this.securityMetrics = {
      sessionCreated: 0,
      sessionExpired: 0,
      sessionRevoked: 0,
      securityViolations: 0,
      suspiciousActivity: 0
    };

    // Start background security processes
    this.initializeSecurityMonitoring();
  }

  /**
   * SECURITY FIX: Create secure session with fingerprinting
   */
  createSession(userId, clientInfo = {}) {
    try {
      // Validate user ID
      if (!userId || typeof userId !== 'string') {
        throw new Error('Valid user ID required');
      }

      // Generate secure session ID
      const sessionId = this.generateSecureSessionId();
      const now = Date.now();
      const expiresAt = now + this.config.sessionTimeout;

      // Create client fingerprint for session validation
      const fingerprint = this.createClientFingerprint(clientInfo);

      // Enforce concurrent session limits
      this.enforceSessionLimits(userId);

      // Create session object
      const session = {
        sessionId,
        userId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        fingerprint,
        ipAddress: clientInfo.ipAddress || 'unknown',
        userAgent: clientInfo.userAgent || 'unknown',
        securityFlags: {
          verified: true,
          compromised: false,
          rotationNeeded: false,
          lastSecurityCheck: now
        },
        statistics: {
          requestCount: 0,
          lastRequestTime: now,
          ipAddressChanges: 0,
          userAgentChanges: 0
        }
      };

      // Store session
      this.activeSessions.set(sessionId, session);
      
      // Create metadata entry
      this.sessionMetadata.set(sessionId, {
        creationLocation: clientInfo.location || 'unknown',
        deviceInfo: clientInfo.device || 'unknown',
        initialFingerprint: fingerprint,
        securityAlerts: []
      });

      this.securityMetrics.sessionCreated++;
      this.emit('sessionCreated', { sessionId, userId, clientInfo });

      console.log(`Secure session created: ${sessionId} for user ${userId}`);
      return session;

    } catch (error) {
      console.error('Session creation failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Validate session with comprehensive security checks
   */
  validateSession(sessionId, clientInfo = {}) {
    try {
      if (!sessionId || typeof sessionId !== 'string') {
        throw new Error('Valid session ID required');
      }

      // Get session
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Invalid session');
      }

      const now = Date.now();

      // Check if session is expired
      if (session.expiresAt <= now) {
        this.destroySession(sessionId, 'expired');
        throw new Error('Session expired');
      }

      // Check if session is flagged as compromised
      if (session.securityFlags.compromised) {
        this.destroySession(sessionId, 'compromised');
        throw new Error('Session compromised');
      }

      // Validate client fingerprint if enabled
      if (this.config.fingerprintValidation) {
        this.validateClientFingerprint(session, clientInfo);
      }

      // Perform security checks
      this.performSecurityChecks(session, clientInfo);

      // Update session activity
      this.updateSessionActivity(session, clientInfo);

      // Check if session needs rotation
      if (this.shouldRotateSession(session)) {
        return this.rotateSession(sessionId, clientInfo);
      }

      // Refresh session if needed
      if (this.shouldRefreshSession(session)) {
        this.refreshSession(session);
      }

      this.emit('sessionValidated', { sessionId, userId: session.userId });
      return session;

    } catch (error) {
      this.recordSecurityViolation(sessionId, error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Client fingerprinting for session security
   */
  createClientFingerprint(clientInfo) {
    const fingerprintData = {
      userAgent: clientInfo.userAgent || 'unknown',
      acceptLanguage: clientInfo.acceptLanguage || 'unknown',
      acceptEncoding: clientInfo.acceptEncoding || 'unknown',
      screenResolution: clientInfo.screenResolution || 'unknown',
      timezone: clientInfo.timezone || 'unknown',
      platform: clientInfo.platform || 'unknown'
    };

    const fingerprintString = JSON.stringify(fingerprintData);
    return crypto.createHash('sha256').update(fingerprintString).digest('hex');
  }

  /**
   * SECURITY FIX: Validate client fingerprint to detect session hijacking
   */
  validateClientFingerprint(session, clientInfo) {
    if (!session.fingerprint) {
      return; // Skip if no fingerprint stored
    }

    const currentFingerprint = this.createClientFingerprint(clientInfo);
    
    if (session.fingerprint !== currentFingerprint) {
      // Log potential session hijacking attempt
      const metadata = this.sessionMetadata.get(session.sessionId);
      if (metadata) {
        metadata.securityAlerts.push({
          type: 'fingerprint_mismatch',
          timestamp: Date.now(),
          details: { expected: session.fingerprint, actual: currentFingerprint }
        });
      }

      this.securityMetrics.suspiciousActivity++;
      this.suspiciousSessions.add(session.sessionId);
      
      throw new Error('Session fingerprint validation failed');
    }
  }

  /**
   * SECURITY FIX: Comprehensive security checks
   */
  performSecurityChecks(session, clientInfo) {
    const now = Date.now();
    
    // Check for IP address changes
    if (clientInfo.ipAddress && session.ipAddress !== clientInfo.ipAddress) {
      session.statistics.ipAddressChanges++;
      
      if (session.statistics.ipAddressChanges > 3) {
        this.flagSessionAsSuspicious(session.sessionId, 'multiple_ip_changes');
      }
      
      session.ipAddress = clientInfo.ipAddress;
    }

    // Check for user agent changes
    if (clientInfo.userAgent && session.userAgent !== clientInfo.userAgent) {
      session.statistics.userAgentChanges++;
      
      if (session.statistics.userAgentChanges > 1) {
        this.flagSessionAsSuspicious(session.sessionId, 'user_agent_change');
      }
      
      session.userAgent = clientInfo.userAgent;
    }

    // Check request frequency (potential automation/bot detection)
    const timeSinceLastRequest = now - session.statistics.lastRequestTime;
    if (timeSinceLastRequest < 100) { // Less than 100ms between requests
      this.flagSessionAsSuspicious(session.sessionId, 'high_frequency_requests');
    }

    // Update security check timestamp
    session.securityFlags.lastSecurityCheck = now;
  }

  /**
   * SECURITY FIX: Update session activity with security monitoring
   */
  updateSessionActivity(session, clientInfo) {
    const now = Date.now();
    
    session.lastActivity = now;
    session.statistics.requestCount++;
    session.statistics.lastRequestTime = now;

    // Extend expiry if session is still active
    if (now - session.createdAt < this.config.sessionTimeout) {
      session.expiresAt = now + this.config.sessionTimeout;
    }
  }

  /**
   * SECURITY FIX: Session rotation to prevent fixation
   */
  rotateSession(oldSessionId, clientInfo = {}) {
    try {
      const oldSession = this.activeSessions.get(oldSessionId);
      if (!oldSession) {
        throw new Error('Session not found for rotation');
      }

      // Create new session with same user but new ID
      const newSession = this.createSession(oldSession.userId, {
        ...clientInfo,
        ipAddress: oldSession.ipAddress,
        userAgent: oldSession.userAgent
      });

      // Transfer relevant data from old session
      newSession.statistics = { ...oldSession.statistics };
      newSession.securityFlags.rotationNeeded = false;

      // Destroy old session
      this.destroySession(oldSessionId, 'rotated');

      this.emit('sessionRotated', { 
        oldSessionId, 
        newSessionId: newSession.sessionId,
        userId: newSession.userId 
      });

      console.log(`Session rotated: ${oldSessionId} -> ${newSession.sessionId}`);
      return newSession;

    } catch (error) {
      console.error('Session rotation failed:', error.message);
      throw error;
    }
  }

  /**
   * SECURITY FIX: Session refresh to extend lifetime
   */
  refreshSession(session) {
    const now = Date.now();
    
    // Extend session expiry
    session.expiresAt = now + this.config.sessionTimeout;
    session.lastActivity = now;

    // Reset rotation flag
    session.securityFlags.rotationNeeded = false;

    this.emit('sessionRefreshed', { 
      sessionId: session.sessionId, 
      userId: session.userId 
    });
  }

  /**
   * SECURITY FIX: Determine if session should be rotated
   */
  shouldRotateSession(session) {
    const now = Date.now();
    const sessionAge = now - session.createdAt;
    
    return (
      sessionAge > this.config.sessionRotationInterval ||
      session.securityFlags.rotationNeeded ||
      this.suspiciousSessions.has(session.sessionId)
    );
  }

  /**
   * SECURITY FIX: Determine if session should be refreshed
   */
  shouldRefreshSession(session) {
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    return timeSinceActivity > this.config.sessionRefreshThreshold;
  }

  /**
   * SECURITY FIX: Enforce session limits per user
   */
  enforceSessionLimits(userId) {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);

    if (userSessions.length >= this.config.maxConcurrentSessions) {
      // Remove oldest sessions
      userSessions
        .sort((a, b) => a.lastActivity - b.lastActivity)
        .slice(0, userSessions.length - this.config.maxConcurrentSessions + 1)
        .forEach(session => {
          this.destroySession(session.sessionId, 'limit_exceeded');
        });
    }
  }

  /**
   * SECURITY FIX: Flag session as suspicious
   */
  flagSessionAsSuspicious(sessionId, reason) {
    this.suspiciousSessions.add(sessionId);
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.securityFlags.rotationNeeded = true;
    }

    const metadata = this.sessionMetadata.get(sessionId);
    if (metadata) {
      metadata.securityAlerts.push({
        type: 'suspicious_activity',
        reason,
        timestamp: Date.now()
      });
    }

    this.emit('suspiciousActivity', { sessionId, reason });
    console.warn(`Session flagged as suspicious: ${sessionId} (${reason})`);
  }

  /**
   * SECURITY FIX: Destroy session with reason tracking
   */
  destroySession(sessionId, reason = 'manual') {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      // Remove from active sessions
      this.activeSessions.delete(sessionId);
      this.sessionMetadata.delete(sessionId);
      this.suspiciousSessions.delete(sessionId);

      // Update metrics
      switch (reason) {
        case 'expired':
          this.securityMetrics.sessionExpired++;
          break;
        case 'compromised':
          this.securityMetrics.sessionRevoked++;
          break;
        default:
          this.securityMetrics.sessionRevoked++;
      }

      this.emit('sessionDestroyed', { 
        sessionId, 
        userId: session.userId, 
        reason 
      });

      console.log(`Session destroyed: ${sessionId} (${reason})`);
      return true;

    } catch (error) {
      console.error('Session destruction failed:', error.message);
      return false;
    }
  }

  /**
   * SECURITY FIX: Destroy all sessions for a user
   */
  destroyUserSessions(userId, reason = 'user_requested') {
    const userSessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId);

    let destroyedCount = 0;
    userSessions.forEach(([sessionId]) => {
      if (this.destroySession(sessionId, reason)) {
        destroyedCount++;
      }
    });

    console.log(`Destroyed ${destroyedCount} sessions for user ${userId}`);
    return destroyedCount;
  }

  /**
   * SECURITY FIX: Generate cryptographically secure session ID
   */
  generateSecureSessionId() {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const entropy = crypto.randomInt(1000000).toString(36);
    
    return `${timestamp}_${randomBytes}_${entropy}`;
  }

  /**
   * SECURITY FIX: Record security violations for monitoring
   */
  recordSecurityViolation(sessionId, violation) {
    this.securityMetrics.securityViolations++;
    
    const metadata = sessionId ? this.sessionMetadata.get(sessionId) : null;
    if (metadata) {
      metadata.securityAlerts.push({
        type: 'security_violation',
        violation,
        timestamp: Date.now()
      });
    }

    this.emit('securityViolation', { sessionId, violation });
    console.warn(`Security violation: ${violation} (session: ${sessionId})`);
  }

  /**
   * Get session information safely
   */
  getSessionInfo(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: session.sessionId,
      userId: session.userId,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
      ipAddress: session.ipAddress,
      requestCount: session.statistics.requestCount,
      suspicious: this.suspiciousSessions.has(sessionId)
    };
  }

  /**
   * Get all active sessions for a user
   */
  getUserSessions(userId) {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)
      .map(session => this.getSessionInfo(session.sessionId))
      .filter(info => info !== null);
  }

  /**
   * Initialize background security monitoring
   */
  initializeSecurityMonitoring() {
    // Clean up expired sessions
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 1000); // Every minute

    // Perform security checks on all sessions
    setInterval(() => {
      this.performBulkSecurityChecks();
    }, this.config.sessionSecurityCheck);

    // Clear old security alerts
    setInterval(() => {
      this.cleanupOldSecurityAlerts();
    }, 60 * 60 * 1000); // Every hour
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions) {
      if (session.expiresAt <= now) {
        this.destroySession(sessionId, 'expired');
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Perform bulk security checks
   */
  performBulkSecurityChecks() {
    let suspiciousCount = 0;

    for (const [sessionId, session] of this.activeSessions) {
      // Check for inactive sessions
      const inactiveTime = Date.now() - session.lastActivity;
      if (inactiveTime > this.config.sessionTimeout / 2) {
        // Session has been inactive for more than half the timeout period
        session.securityFlags.rotationNeeded = true;
      }

      // Check for suspicious patterns
      if (session.statistics.ipAddressChanges > 2 || 
          session.statistics.userAgentChanges > 0) {
        this.flagSessionAsSuspicious(sessionId, 'bulk_security_check');
        suspiciousCount++;
      }
    }

    if (suspiciousCount > 0) {
      console.log(`Bulk security check found ${suspiciousCount} suspicious sessions`);
    }
  }

  /**
   * Clean up old security alerts
   */
  cleanupOldSecurityAlerts() {
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    let cleanedCount = 0;

    for (const [sessionId, metadata] of this.sessionMetadata) {
      const oldAlerts = metadata.securityAlerts.filter(alert => alert.timestamp < cutoff);
      if (oldAlerts.length > 0) {
        metadata.securityAlerts = metadata.securityAlerts.filter(alert => alert.timestamp >= cutoff);
        cleanedCount += oldAlerts.length;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old security alerts`);
    }
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics() {
    return {
      ...this.securityMetrics,
      activeSessions: this.activeSessions.size,
      suspiciousSessions: this.suspiciousSessions.size,
      totalMetadata: this.sessionMetadata.size
    };
  }

  /**
   * Export session data for analysis (admin only)
   */
  exportSessionData() {
    const sessions = Array.from(this.activeSessions.values()).map(session => ({
      sessionId: session.sessionId,
      userId: session.userId,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      statistics: session.statistics,
      suspicious: this.suspiciousSessions.has(session.sessionId)
    }));

    return {
      timestamp: new Date().toISOString(),
      metrics: this.getSecurityMetrics(),
      sessions
    };
  }
}

module.exports = { SessionManager };