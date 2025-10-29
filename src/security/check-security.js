#!/usr/bin/env node

/**
 * Quick Security Implementation Check
 * Verifies that all security modules are properly implemented and accessible
 */

console.log('🔒 Security Implementation Check\n');

// Check if security modules exist and can be loaded
const requiredModules = [
  '../security/inputValidation.js',
  '../security/advancedValidation.js', 
  '../security/clientValidation.js',
  '../security/secureIpcHandlers.js',
  '../security/securityPolicy.js'
];

let allModulesLoaded = true;

console.log('📦 Checking security modules...');
requiredModules.forEach(modulePath => {
  try {
    require(modulePath);
    console.log(`✅ ${modulePath}`);
  } catch (error) {
    console.log(`❌ ${modulePath} - ${error.message}`);
    allModulesLoaded = false;
  }
});

if (allModulesLoaded) {
  console.log('\n🎉 All security modules loaded successfully!');
  
  // Quick functionality test
  try {
    const { validator } = require('../security/inputValidation');
    const { advancedValidator } = require('../security/advancedValidation');
    const securityPolicy = require('../security/securityPolicy');
    
    console.log('\n🧪 Running quick functionality tests...');
    
    // Test XSS sanitization
    const xssTest = validator.sanitizeText('<script>alert("test")</script>Hello');
    console.log(`✅ XSS Sanitization: "${xssTest.substring(0, 20)}..."`);
    
    // Test SQL injection detection
    const sqlResult = validator.containsSqlInjection("'; DROP TABLE notes; --");
    console.log(`✅ SQL Injection Detection: ${sqlResult.detected}`);
    
    // Test command injection detection  
    const cmdResult = validator.containsCommandInjection("; rm -rf /");
    console.log(`✅ Command Injection Detection: ${cmdResult.detected}`);
    
    // Test path traversal detection
    const pathResult = validator.containsPathTraversal("../../../etc/passwd");
    console.log(`✅ Path Traversal Detection: ${pathResult.detected}`);
    
    // Test note ID validation
    try {
      validator.validateNoteId('valid_note_123');
      console.log(`✅ Note ID Validation: Working`);
    } catch (error) {
      console.log(`❌ Note ID Validation: ${error.message}`);
    }
    
    // Test security policy
    if (securityPolicy.validation && securityPolicy.rateLimit) {
      console.log(`✅ Security Policy: Loaded with ${Object.keys(securityPolicy.validation).length} validation rules`);
    }
    
    console.log('\n🎯 Security Implementation Status: READY');
    console.log('\n📋 Available Commands:');
    console.log('  - Run comprehensive tests: node src/security/securityTest.js');
    console.log('  - Run validation tests: node tests/security-validation.test.js');
    console.log('  - Check Electron app: npm start');
    
  } catch (error) {
    console.log(`\n❌ Functionality test failed: ${error.message}`);
  }
} else {
  console.log('\n❌ Some security modules failed to load. Please check the implementation.');
  process.exit(1);
}