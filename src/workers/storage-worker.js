/**
 * Enhanced Storage Worker - Handles CPU-intensive file operations in separate thread
 * Prevents blocking the main thread during large file operations and complex processing
 */

const { parentPort } = require('worker_threads');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib').promises;


// Storage operations handler
parentPort.on('message', async (message) => {
  const { operation, data, id } = message;

  try {
    let result;

    switch (operation) {
      case 'save':
        result = await saveData(data);
        break;
      
      case 'load':
        result = await loadData(data.path);
        break;
      
      case 'backup':
        result = await createBackup(data);
        break;
      
      case 'compress':
        result = await compressData(data);
        break;
      
      case 'validate':
        result = await validateData(data);
        break;
      
      case 'hash':
        result = await generateFileHash(data.path, data.algorithm);
        break;
      
      case 'readLarge':
        result = await readLargeFile(data.path, data.chunkSize);
        break;
      
      case 'search':
        result = await searchInFile(data.path, data.pattern);
        break;
      
      case 'bulkProcess':
        result = await bulkFileProcess(data.operations);
        break;
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    parentPort.postMessage({ id, success: true, result });
  } catch (error) {
    parentPort.postMessage({ 
      id, 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

/**
 * Save data to file with atomic write operation
 */
async function saveData({ path: filePath, data, options = {} }) {
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write to temporary file first
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await fs.writeFile(tempPath, content, { encoding: 'utf8', ...options });
    
    // Atomic rename
    await fs.rename(tempPath, filePath);
    
    return { path: filePath, size: content.length };
  } catch (error) {
    // Cleanup temp file if it exists
    try {
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

/**
 * Load data from file with error handling
 */
async function loadData(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Try to parse as JSON, otherwise return as string
    try {
      return { data: JSON.parse(content), type: 'json' };
    } catch (parseError) {
      return { data: content, type: 'text' };
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { data: null, type: 'missing' };
    }
    throw error;
  }
}

/**
 * Create backup of data
 */
async function createBackup({ path: filePath, maxBackups = 5 }) {
  try {
    const backupDir = path.join(path.dirname(filePath), '.backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${fileName}.${timestamp}.backup`);
    
    // Copy original file to backup
    await fs.copyFile(filePath, backupPath);
    
    // Clean up old backups
    const backupFiles = await fs.readdir(backupDir);
    const relevantBackups = backupFiles
      .filter(file => file.startsWith(fileName))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        stat: null
      }));
    
    // Get file stats for sorting by creation time
    for (const backup of relevantBackups) {
      backup.stat = await fs.stat(backup.path);
    }
    
    // Sort by creation time (newest first)
    relevantBackups.sort((a, b) => b.stat.mtime - a.stat.mtime);
    
    // Remove excess backups
    if (relevantBackups.length > maxBackups) {
      const toDelete = relevantBackups.slice(maxBackups);
      await Promise.all(toDelete.map(backup => fs.unlink(backup.path)));
    }
    
    return { backupPath, cleanedUp: Math.max(0, relevantBackups.length - maxBackups) };
  } catch (error) {
    throw new Error(`Backup failed: ${error.message}`);
  }
}

/**
 * Compress data using gzip
 */
async function compressData(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  const compressed = await zlib.gzip(Buffer.from(content, 'utf8'));
  
  return {
    original: content.length,
    compressed: compressed.length,
    ratio: compressed.length / content.length,
    data: compressed.toString('base64')
  };
}

/**
 * Generate file hash for integrity checking
 */
async function generateFileHash(filePath, algorithm = 'sha256') {
  const data = await fs.readFile(filePath);
  const hash = crypto.createHash(algorithm);
  hash.update(data);
  return {
    algorithm,
    hash: hash.digest('hex'),
    size: data.length
  };
}

/**
 * Read large files in chunks to prevent memory overflow
 */
async function readLargeFile(filePath, chunkSize = 64 * 1024) {
  const chunks = [];
  const fileHandle = await fs.open(filePath, 'r');
  
  try {
    const stats = await fileHandle.stat();
    const buffer = Buffer.alloc(chunkSize);
    let position = 0;
    
    while (position < stats.size) {
      const { bytesRead } = await fileHandle.read(buffer, 0, chunkSize, position);
      chunks.push(buffer.subarray(0, bytesRead).toString('utf8'));
      position += bytesRead;
      
      // Yield control to prevent blocking
      await new Promise(resolve => setImmediate(resolve));
    }
    
    return {
      content: chunks.join(''),
      chunks: chunks.length,
      size: stats.size
    };
  } finally {
    await fileHandle.close();
  }
}

/**
 * Search for patterns in file content
 */
async function searchInFile(filePath, pattern) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  const regex = new RegExp(pattern, 'gi');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    
    while ((match = regex.exec(line)) !== null) {
      matches.push({
        line: i + 1,
        column: match.index + 1,
        match: match[0],
        context: line.trim()
      });
    }
    
    // Yield control for large files
    if (i % 1000 === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  
  return { matches, totalLines: lines.length };
}

/**
 * Process multiple file operations in batch
 */
async function bulkFileProcess(operations) {
  const results = [];
  const total = operations.length;
  
  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];
    try {
      let result;
      
      switch (operation.type) {
        case 'read':
          result = await loadData(operation.path);
          break;
        case 'write':
          result = await saveData({ path: operation.path, data: operation.data });
          break;
        case 'hash':
          result = await generateFileHash(operation.path, operation.algorithm);
          break;
        default:
          throw new Error(`Unknown bulk operation: ${operation.type}`);
      }
      
      results.push({ success: true, data: result, operation: operation.type });
    } catch (error) {
      results.push({ success: false, error: error.message, operation: operation.type });
    }
    
    // Report progress every 10 operations
    if (parentPort && i % 10 === 0) {
      parentPort.postMessage({
        type: 'progress',
        current: i + 1,
        total,
        percentage: Math.round(((i + 1) / total) * 100)
      });
    }
    
    // Yield control every 5 operations
    if (i % 5 === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  
  return { results, processed: operations.length };
}

/**
 * Validate data structure and content
 */
async function validateData(data) {
  const issues = [];
  
  try {
    if (typeof data === 'string') {
      // Try parsing as JSON
      JSON.parse(data);
    }
    
    // Check for common issues
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        // Validate array elements
        data.forEach((item, index) => {
          if (item && typeof item === 'object' && !item.id) {
            issues.push(`Array item at index ${index} missing id field`);
          }
        });
      } else {
        // Validate object properties
        const requiredFields = ['id'];
        requiredFields.forEach(field => {
          if (!(field in data)) {
            issues.push(`Missing required field: ${field}`);
          }
        });
      }
    }
    
    return { valid: issues.length === 0, issues, size: JSON.stringify(data).length };
  } catch (error) {
    return { valid: false, issues: [`Validation error: ${error.message}`] };
  }
}