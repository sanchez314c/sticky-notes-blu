// ELECTRON SECURITY VALIDATION SCRIPT
// This script validates that all security measures are properly implemented

const fs = require('fs');
const path = require('path');

class SecurityValidator {
  constructor() {
    this.results = [];
    this.basePath = __dirname;
  }

  // Check if a file contains specific security configurations (async version)
  async checkFileContains(filename, patterns, description) {
    try {
      const filePath = path.join(this.basePath, filename);
      const content = await fs.promises.readFile(filePath, 'utf8');
      
      const results = patterns.map(pattern => {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return {
          pattern: pattern.toString(),
          found: regex.test(content)
        };
      });

      const allFound = results.every(r => r.found);
      
      this.results.push({
        test: description,
        file: filename,
        passed: allFound,
        details: results
      });

      return allFound;
    } catch (error) {
      this.results.push({
        test: description,
        file: filename,
        passed: false,
        error: error.message
      });
      return false;
    }
  }

  // Validate context isolation
  async validateContextIsolation() {
    return await this.checkFileContains('main.js', [
      /contextIsolation:\s*true/,
      /nodeIntegration:\s*false/,
      /nodeIntegrationInWorker:\s*false/,
      /nodeIntegrationInSubFrames:\s*false/
    ], 'Context Isolation Enforcement');
  }

  // Validate sandbox implementation
  async validateSandbox() {
    return await this.checkFileContains('main.js', [
      /sandbox:\s*true/
    ], 'Sandbox Enforcement');
  }

  // Validate remote module deprecation
  async validateRemoteModule() {
    return await this.checkFileContains('main.js', [
      /enableRemoteModule:\s*false/
    ], 'Remote Module Disabled');
  }

  // Validate preload security
  async validatePreloadSecurity() {
    return await this.checkFileContains('preload.js', [
      /validateNoteId/,
      /validateContent/,
      /validateColor/,
      /checkRateLimit/,
      /contextBridge\.exposeInMainWorld/
    ], 'Preload Script Security');
  }

  // Validate WebPreferences hardening
  async validateWebPreferences() {
    return await this.checkFileContains('main.js', [
      /webSecurity:\s*true/,
      /allowRunningInsecureContent:\s*false/,
      /experimentalFeatures:\s*false/,
      /navigateOnDragDrop:\s*false/,
      /safeDialogs:\s*true/
    ], 'WebPreferences Hardening');
  }

  // Validate navigation restrictions
  async validateNavigationRestrictions() {
    return await this.checkFileContains('main.js', [
      /will-navigate/,
      /new-window/,
      /will-attach-webview/,
      /event\.preventDefault\(\)/
    ], 'Navigation Restrictions');
  }

  // Validate Content Security Policy
  async validateCSP() {
    return await this.checkFileContains('index.html', [
      /Content-Security-Policy/,
      /default-src 'self'/,
      /connect-src 'none'/,
      /frame-src 'none'/,
      /object-src 'none'/
    ], 'Content Security Policy');
  }

  // Validate input validation (parallel execution)
  async validateInputValidation() {
    const [mainValidation, preloadValidation] = await Promise.all([
      this.checkFileContains('main.js', [
        /validateNoteData/,
        /sanitizeNoteId/,
        /sanitizeContent/,
        /console\.warn/
      ], 'Main Process Input Validation'),
      this.checkFileContains('preload.js', [
        /validateNoteId/,
        /validateContent/,
        /validateColor/,
        /throw new Error/
      ], 'Preload Input Validation')
    ]);
    return mainValidation && preloadValidation;
  }

  // Validate rate limiting
  async validateRateLimiting() {
    return await this.checkFileContains('preload.js', [
      /checkRateLimit/,
      /rateLimits/,
      /resetTime/,
      /Rate limit exceeded/
    ], 'Rate Limiting');
  }

  // Validate resource limits
  async validateResourceLimits() {
    return await this.checkFileContains('main.js', [
      /stickyNotes\.size >= 50/,
      /Maximum number of notes/,
      /content\.length > 100000/
    ], 'Resource Limits');
  }

  // Run all security validations (parallel execution)
  async runAllValidations() {
    console.log('🔒 Running Electron Security Validation...\n');

    const tests = [
      { name: 'Context Isolation', test: () => this.validateContextIsolation() },
      { name: 'Sandbox Enforcement', test: () => this.validateSandbox() },
      { name: 'Remote Module Deprecation', test: () => this.validateRemoteModule() },
      { name: 'Preload Security', test: () => this.validatePreloadSecurity() },
      { name: 'WebPreferences Hardening', test: () => this.validateWebPreferences() },
      { name: 'Navigation Restrictions', test: () => this.validateNavigationRestrictions() },
      { name: 'Content Security Policy', test: () => this.validateCSP() },
      { name: 'Input Validation', test: () => this.validateInputValidation() },
      { name: 'Rate Limiting', test: () => this.validateRateLimiting() },
      { name: 'Resource Limits', test: () => this.validateResourceLimits() }
    ];

    let passed = 0;
    let total = tests.length;

    // Run all tests in parallel for better performance
    const results = await Promise.allSettled(
      tests.map(async (test) => {
        try {
          const result = await test.test();
          return { name: test.name, result, error: null };
        } catch (error) {
          return { name: test.name, result: false, error };
        }
      })
    );

    // Display results
    results.forEach((promiseResult, index) => {
      if (promiseResult.status === 'fulfilled') {
        const { name, result, error } = promiseResult.value;
        const status = result ? '✅' : '❌';
        console.log(`${status} ${name}`);
        if (result) passed++;
        if (error) console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ ${tests[index].name} - Promise rejected: ${promiseResult.reason}`);
      }
    });

    console.log(`\n📊 Security Validation Results: ${passed}/${total} tests passed\n`);

    if (passed === total) {
      console.log('🎉 All security measures are properly implemented!');
    } else {
      console.log('⚠️  Some security measures need attention. Check the details below:\n');
      this.results.forEach(result => {
        if (!result.passed) {
          console.log(`❌ ${result.test} (${result.file}):`);
          if (result.error) {
            console.log(`   Error: ${result.error}`);
          } else if (result.details) {
            result.details.forEach(detail => {
              if (!detail.found) {
                console.log(`   Missing: ${detail.pattern}`);
              }
            });
          }
          console.log();
        }
      });
    }

    return passed === total;
  }

  // Generate security report (async version)
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      passed: this.results.filter(r => r.passed).length,
      total: this.results.length,
      results: this.results
    };

    await fs.promises.writeFile(
      path.join(this.basePath, 'security-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('📄 Security report generated: security-report.json');
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  (async () => {
    const validator = new SecurityValidator();
    const allPassed = await validator.runAllValidations();
    await validator.generateReport();
    
    process.exit(allPassed ? 0 : 1);
  })();
}

module.exports = SecurityValidator;