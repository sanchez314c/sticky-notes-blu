/**
 * Comprehensive Security Validation Tests
 * Tests all input validation and sanitization functions
 */

const { SecurityValidator } = require('../src/security/inputValidation');
const validator = new SecurityValidator();

// Test Results Tracker
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    console.error(`❌ FAIL: ${message}`);
  }
}

function assertThrows(fn, message) {
  testResults.total++;
  try {
    fn();
    testResults.failed++;
    console.error(`❌ FAIL: ${message} (expected to throw)`);
  } catch (error) {
    testResults.passed++;
    console.log(`✅ PASS: ${message}`);
  }
}

console.log('🔐 Starting Security Validation Tests...\n');

// ======================
// XSS Prevention Tests
// ======================
console.log('📋 XSS Prevention Tests:');

// Test basic text sanitization
const safeText = validator.sanitizeText('Hello world!');
assert(safeText === 'Hello world!', 'Safe text should pass through unchanged');

// Test script tag removal
const scriptText = validator.sanitizeText('<script>alert("xss")</script>Hello');
assert(!scriptText.includes('<script>'), 'Script tags should be removed');
assert(scriptText.includes('Hello'), 'Safe content should remain');

// Test HTML encoding
const htmlText = validator.sanitizeText('<div>Test & "quotes"</div>');
assert(htmlText.includes('&lt;div&gt;'), 'HTML tags should be encoded');
assert(htmlText.includes('&amp;'), 'Ampersands should be encoded');
assert(htmlText.includes('&quot;'), 'Quotes should be encoded');

// Test JavaScript URL removal
const jsUrl = validator.sanitizeText('javascript:alert("xss")');
assert(!jsUrl.includes('javascript:'), 'JavaScript URLs should be removed');

// Test event handler removal
const eventHandler = validator.sanitizeText('<div onclick="alert(1)">Test</div>');
assert(!eventHandler.includes('onclick'), 'Event handlers should be removed');

// Test null byte removal
const nullByte = validator.sanitizeText('Hello\x00World');
assert(!nullByte.includes('\x00'), 'Null bytes should be removed');

// Test length limits
const longText = 'A'.repeat(15000);
const truncated = validator.sanitizeText(longText);
assert(truncated.length <= 10000, 'Long text should be truncated');

console.log('');

// ======================
// Note ID Validation Tests
// ======================
console.log('📋 Note ID Validation Tests:');

// Test valid note IDs
assert(validator.validateNoteId('note_123') === 'note_123', 'Valid note ID should pass');
assert(validator.validateNoteId('test-note_1') === 'test-note_1', 'Note ID with hyphens and underscores should pass');

// Test invalid note IDs
assertThrows(() => validator.validateNoteId(''), 'Empty note ID should throw');
assertThrows(() => validator.validateNoteId('note with spaces'), 'Note ID with spaces should throw');
assertThrows(() => validator.validateNoteId('note@123'), 'Note ID with special characters should throw');
assertThrows(() => validator.validateNoteId(123), 'Non-string note ID should throw');
assertThrows(() => validator.validateNoteId('A'.repeat(60)), 'Too long note ID should throw');

console.log('');

// ======================
// Color Validation Tests
// ======================
console.log('📋 Color Validation Tests:');

// Test valid colors
assert(validator.validateColor('#ff0000') === '#ff0000', 'Valid hex color should pass');
assert(validator.validateColor('#fff') === '#fff', 'Valid 3-digit hex should pass');
assert(validator.validateColor('gradient-1') === 'gradient-1', 'Valid gradient class should pass');
assert(validator.validateColor('gradient-dark') === 'gradient-dark', 'Valid named gradient should pass');
assert(validator.validateColor('rgb(255, 0, 0)') === 'rgb(255, 0, 0)', 'Valid RGB color should pass');

// Test invalid colors
assertThrows(() => validator.validateColor('invalid-color'), 'Invalid color should throw');
assertThrows(() => validator.validateColor('#gggggg'), 'Invalid hex color should throw');
assertThrows(() => validator.validateColor('rgb(256, 0, 0)'), 'Invalid RGB values should throw');
assertThrows(() => validator.validateColor(123), 'Non-string color should throw');

console.log('');

// ======================
// Path Traversal Prevention Tests
// ======================
console.log('📋 Path Traversal Prevention Tests:');

// Test safe paths
assert(validator.validateFilePath('notes/note1.txt') === 'notes/note1.txt', 'Safe relative path should pass');
assert(validator.validateFilePath('/absolute/path/file.txt') === '/absolute/path/file.txt', 'Safe absolute path should pass');

// Test path traversal attempts
assertThrows(() => validator.validateFilePath('../../../etc/passwd'), 'Path traversal attempt should throw');
assertThrows(() => validator.validateFilePath('..\\..\\windows\\system32'), 'Windows path traversal should throw');
assertThrows(() => validator.validateFilePath('/notes/../../etc/passwd'), 'Mixed path traversal should throw');
assertThrows(() => validator.validateFilePath('%2e%2e%2f%2e%2e%2fpasswd'), 'URL-encoded traversal should throw');

// Test base directory validation
assertThrows(() => validator.validateFilePath('../outside.txt', '/safe/base/'), 'Path escaping base directory should throw');

console.log('');

// ======================
// Command Injection Prevention Tests
// ======================
console.log('📋 Command Injection Prevention Tests:');

// Test safe content
assert(!validator.containsCommandInjection('Hello world'), 'Safe text should not contain command injection');
assert(!validator.containsCommandInjection('user@domain.com'), 'Email should not be flagged');

// Test command injection attempts
assert(validator.containsCommandInjection('rm -rf /'), 'Command deletion should be detected');
assert(validator.containsCommandInjection('$(whoami)'), 'Command substitution should be detected');
assert(validator.containsCommandInjection('`cat /etc/passwd`'), 'Backtick execution should be detected');
assert(validator.containsCommandInjection('test; rm file'), 'Command chaining should be detected');
assert(validator.containsCommandInjection('test && rm file'), 'Logical AND command should be detected');
assert(validator.containsCommandInjection('test | rm'), 'Pipe command should be detected');

console.log('');

// ======================
// SQL Injection Prevention Tests
// ======================
console.log('📋 SQL Injection Prevention Tests:');

// Test safe content
assert(!validator.containsSqlInjection('user input'), 'Safe text should not contain SQL injection');
assert(!validator.containsSqlInjection("O'Reilly"), 'Legitimate apostrophe should not be flagged as injection');

// Test SQL injection attempts
assert(validator.containsSqlInjection("'; DROP TABLE users; --"), 'Classic SQL injection should be detected');
assert(validator.containsSqlInjection("1 OR 1=1"), 'Boolean-based injection should be detected');
assert(validator.containsSqlInjection("UNION SELECT * FROM passwords"), 'UNION-based injection should be detected');
assert(validator.containsSqlInjection("admin'--"), 'Comment-based injection should be detected');
assert(validator.containsSqlInjection("x' AND '1'='1"), 'String-based injection should be detected');

console.log('');

// ======================
// IPC Data Validation Tests
// ======================
console.log('📋 IPC Data Validation Tests:');

// Test valid IPC data
const validSaveData = { id: 'note_123', content: 'Hello world' };
const validatedSave = validator.validateIpcData(validSaveData, 'save-note-content');
assert(validatedSave.id === 'note_123', 'Valid save data ID should pass');
assert(validatedSave.content === 'Hello world', 'Valid save data content should pass');

const validColorData = { id: 'note_123', color: 'gradient-1' };
const validatedColor = validator.validateIpcData(validColorData, 'change-note-color');
assert(validatedColor.color === 'gradient-1', 'Valid color data should pass');

// Test invalid IPC data
assertThrows(() => validator.validateIpcData(null, 'save-note-content'), 'Null IPC data should throw');
assertThrows(() => validator.validateIpcData({}, 'save-note-content'), 'Missing required fields should throw');
assertThrows(() => validator.validateIpcData({ id: 'bad id', content: 'test' }, 'save-note-content'), 'Invalid note ID should throw');
assertThrows(() => validator.validateIpcData({ id: 'note_1' }, 'unknown-message'), 'Unknown message type should throw');

console.log('');

// ======================
// Window Bounds Validation Tests
// ======================
console.log('📋 Window Bounds Validation Tests:');

// Test valid bounds
const validBounds = { x: 100, y: 100, width: 300, height: 400 };
const validatedBounds = validator.validateWindowBounds(validBounds);
assert(validatedBounds.x === 100, 'Valid X coordinate should pass');
assert(validatedBounds.y === 100, 'Valid Y coordinate should pass');
assert(validatedBounds.width === 300, 'Valid width should pass');
assert(validatedBounds.height === 400, 'Valid height should pass');

// Test bounds clamping
const clampedBounds = validator.validateWindowBounds({ x: -10000, y: 10000, width: 50, height: 5000 });
assert(clampedBounds.x >= -5000, 'X should be clamped to minimum');
assert(clampedBounds.y <= 5000, 'Y should be clamped to maximum');
assert(clampedBounds.width >= 100, 'Width should be clamped to minimum');
assert(clampedBounds.height <= 3000, 'Height should be clamped to maximum');

// Test invalid bounds
assertThrows(() => validator.validateWindowBounds(null), 'Null bounds should throw');
assertThrows(() => validator.validateWindowBounds({ x: 'invalid' }), 'Non-numeric coordinates should throw');

console.log('');

// ======================
// Rate Limiting Tests
// ======================
console.log('📋 Rate Limiting Tests:');

const rateLimiter = validator.createRateLimiter(3, 1000); // 3 requests per second

// Test normal usage
assert(rateLimiter('test') === true, 'First request should pass');
assert(rateLimiter('test') === true, 'Second request should pass');
assert(rateLimiter('test') === true, 'Third request should pass');

// Test rate limit exceeded
assertThrows(() => rateLimiter('test'), 'Fourth request should be rate limited');

console.log('');

// ======================
// Comprehensive Note Data Validation Tests
// ======================
console.log('📋 Comprehensive Note Data Validation Tests:');

const validNoteData = {
  id: 'note_123',
  content: 'Hello world!',
  color: 'gradient-1',
  bounds: { x: 100, y: 100, width: 300, height: 400 },
  timestamp: Date.now()
};

const validatedNote = validator.validateNoteData(validNoteData);
assert(validatedNote.id === 'note_123', 'Note data ID should be validated');
assert(validatedNote.content === 'Hello world!', 'Note data content should be validated');
assert(validatedNote.color === 'gradient-1', 'Note data color should be validated');
assert(validatedNote.bounds.x === 100, 'Note data bounds should be validated');

// Test note data with XSS attempt
const xssNoteData = {
  id: 'note_123',
  content: '<script>alert("xss")</script>Hello',
  color: 'gradient-1'
};

const sanitizedNote = validator.validateNoteData(xssNoteData);
assert(!sanitizedNote.content.includes('<script>'), 'XSS content should be sanitized');
assert(sanitizedNote.content.includes('Hello'), 'Safe content should remain');

console.log('');

// ======================
// HTML Sanitization Tests
// ======================
console.log('📋 HTML Sanitization Tests:');

// Test allowed tags
const allowedHtml = validator.sanitizeHtml('<b>Bold</b> and <i>italic</i> text');
assert(allowedHtml.includes('<b>'), 'Bold tags should be allowed');
assert(allowedHtml.includes('<i>'), 'Italic tags should be allowed');

// Test dangerous tags removal
const dangerousHtml = validator.sanitizeHtml('<script>alert(1)</script><b>Safe</b>');
assert(!dangerousHtml.includes('<script>'), 'Script tags should be removed');
assert(dangerousHtml.includes('<b>'), 'Safe tags should remain');

console.log('');

// ======================
// Security ID Generation Tests
// ======================
console.log('📋 Security ID Generation Tests:');

const secureId1 = validator.generateSecureNoteId();
const secureId2 = validator.generateSecureNoteId();

assert(typeof secureId1 === 'string', 'Generated ID should be a string');
assert(secureId1.startsWith('note_'), 'Generated ID should have correct prefix');
assert(secureId1 !== secureId2, 'Generated IDs should be unique');
assert(secureId1.length > 10, 'Generated ID should have sufficient length');
assert(/^[a-zA-Z0-9_]+$/.test(secureId1), 'Generated ID should only contain safe characters');

console.log('');

// ======================
// Test Summary
// ======================
console.log('📊 Test Summary:');
console.log(`Total Tests: ${testResults.total}`);
console.log(`Passed: ${testResults.passed}`);
console.log(`Failed: ${testResults.failed}`);
console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

if (testResults.failed === 0) {
  console.log('🎉 All security validation tests passed!');
  process.exit(0);
} else {
  console.log('⚠️ Some security tests failed. Please review the implementation.');
  process.exit(1);
}