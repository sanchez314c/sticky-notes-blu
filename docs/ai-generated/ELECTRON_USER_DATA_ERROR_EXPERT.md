# ELECTRON USER DATA ERROR EXPERT 3: CORRUPTION & RECOVERY SCENARIOS

## 🔍 CORRUPTED NOTE CONTENT RECOVERY

### Detection Algorithms

```javascript
// Content Integrity Validator
class ContentIntegrityValidator {
    constructor() {
        this.checksumCache = new Map();
        this.validationRules = new Map();
        this.recoveryStrategies = new Map();
    }

    // JSON Content Validation
    validateJSONContent(content, noteId) {
        try {
            const parsed = JSON.parse(content);
            
            // Schema validation
            const validationResult = this.validateSchema(parsed);
            if (!validationResult.isValid) {
                return {
                    isCorrupted: true,
                    type: 'SCHEMA_VIOLATION',
                    errors: validationResult.errors,
                    recovery: 'PARTIAL_RECOVERY'
                };
            }

            // Checksum verification
            const currentChecksum = this.calculateChecksum(content);
            const storedChecksum = this.checksumCache.get(noteId);
            
            if (storedChecksum && currentChecksum !== storedChecksum) {
                return {
                    isCorrupted: true,
                    type: 'CHECKSUM_MISMATCH',
                    currentChecksum,
                    storedChecksum,
                    recovery: 'VERSION_HISTORY'
                };
            }

            return { isCorrupted: false };
        } catch (error) {
            return {
                isCorrupted: true,
                type: 'JSON_PARSE_ERROR',
                error: error.message,
                recovery: 'TEXT_EXTRACTION'
            };
        }
    }

    // HTML Content Validation
    validateHTMLContent(html, noteId) {
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const issues = [];

        // Check for malformed tags
        const unclosedTags = this.findUnclosedTags(html);
        if (unclosedTags.length > 0) {
            issues.push({
                type: 'UNCLOSED_TAGS',
                tags: unclosedTags,
                severity: 'MEDIUM'
            });
        }

        // Check for dangerous content
        const dangerousElements = dom.querySelectorAll('script, object, embed, iframe');
        if (dangerousElements.length > 0) {
            issues.push({
                type: 'DANGEROUS_CONTENT',
                elements: Array.from(dangerousElements).map(el => el.tagName),
                severity: 'HIGH'
            });
        }

        // Validate structure integrity
        const structureIssues = this.validateHTMLStructure(dom);
        issues.push(...structureIssues);

        return {
            isCorrupted: issues.some(i => i.severity === 'HIGH'),
            issues,
            recovery: this.getHTMLRecoveryStrategy(issues)
        };
    }

    // Text Content Validation
    validateTextContent(text, noteId) {
        const issues = [];

        // Character encoding validation
        if (this.hasEncodingIssues(text)) {
            issues.push({
                type: 'ENCODING_ISSUES',
                severity: 'MEDIUM'
            });
        }

        // Length validation
        if (text.length > 1000000) { // 1MB text limit
            issues.push({
                type: 'EXCESSIVE_LENGTH',
                length: text.length,
                severity: 'HIGH'
            });
        }

        // Null byte detection
        if (text.includes('\0')) {
            issues.push({
                type: 'NULL_BYTES',
                severity: 'HIGH'
            });
        }

        return {
            isCorrupted: issues.some(i => i.severity === 'HIGH'),
            issues,
            recovery: 'SANITIZATION'
        };
    }

    // Checksum calculation
    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
```

### Recovery Strategies

```javascript
// Content Recovery Manager
class ContentRecoveryManager {
    constructor(versionHistory, backupManager) {
        this.versionHistory = versionHistory;
        this.backupManager = backupManager;
        this.recoveryStrategies = new Map();
        this.initializeStrategies();
    }

    initializeStrategies() {
        this.recoveryStrategies.set('PARTIAL_RECOVERY', this.partialRecovery.bind(this));
        this.recoveryStrategies.set('VERSION_HISTORY', this.versionHistoryRecovery.bind(this));
        this.recoveryStrategies.set('TEXT_EXTRACTION', this.textExtractionRecovery.bind(this));
        this.recoveryStrategies.set('BACKUP_RESTORE', this.backupRestoreRecovery.bind(this));
    }

    async recoverContent(noteId, corruptedContent, validationResult) {
        const strategy = this.recoveryStrategies.get(validationResult.recovery);
        if (!strategy) {
            throw new Error(`Unknown recovery strategy: ${validationResult.recovery}`);
        }

        try {
            const recoveryResult = await strategy(noteId, corruptedContent, validationResult);
            
            // Log recovery attempt
            await this.logRecoveryAttempt(noteId, validationResult.type, recoveryResult.success);
            
            return recoveryResult;
        } catch (error) {
            return {
                success: false,
                error: error.message,
                fallback: await this.getFallbackRecovery(noteId)
            };
        }
    }

    // Partial content recovery
    async partialRecovery(noteId, corruptedContent, validationResult) {
        const recoveredParts = [];
        
        try {
            // Try to extract readable parts
            if (validationResult.type === 'JSON_PARSE_ERROR') {
                const textContent = this.extractTextFromCorruptedJSON(corruptedContent);
                recoveredParts.push({ type: 'text', content: textContent });
            }

            // Extract attachments references
            const attachmentRefs = this.extractAttachmentReferences(corruptedContent);
            if (attachmentRefs.length > 0) {
                recoveredParts.push({ type: 'attachments', refs: attachmentRefs });
            }

            // Extract metadata if possible
            const metadata = this.extractMetadata(corruptedContent);
            if (metadata) {
                recoveredParts.push({ type: 'metadata', data: metadata });
            }

            return {
                success: recoveredParts.length > 0,
                recoveredParts,
                originalLength: corruptedContent.length,
                recoveredLength: recoveredParts.reduce((sum, part) => sum + (part.content?.length || 0), 0)
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // Version history recovery
    async versionHistoryRecovery(noteId, corruptedContent, validationResult) {
        const versions = await this.versionHistory.getVersions(noteId, 10);
        
        for (const version of versions) {
            const validator = new ContentIntegrityValidator();
            const versionValidation = await validator.validateJSONContent(version.content, noteId);
            
            if (!versionValidation.isCorrupted) {
                return {
                    success: true,
                    recoveredContent: version.content,
                    versionUsed: version.timestamp,
                    dataLoss: this.calculateDataLoss(corruptedContent, version.content)
                };
            }
        }

        return { success: false, reason: 'No valid versions found' };
    }
}
```

## 📥 IMPORT/EXPORT FAILURE HANDLING

### File Format Validation

```javascript
// Import/Export Manager
class ImportExportManager {
    constructor() {
        this.supportedFormats = ['json', 'html', 'txt', 'md', 'docx'];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.validators = new Map();
        this.converters = new Map();
        this.progressCallbacks = new Map();
    }

    // File validation pipeline
    async validateImportFile(filePath, format) {
        const stats = await fs.stat(filePath);
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            metadata: {}
        };

        // Size validation
        if (stats.size > this.maxFileSize) {
            validation.errors.push({
                type: 'FILE_TOO_LARGE',
                size: stats.size,
                maxSize: this.maxFileSize
            });
            validation.isValid = false;
        }

        // Format validation
        const formatValidator = this.validators.get(format);
        if (!formatValidator) {
            validation.errors.push({
                type: 'UNSUPPORTED_FORMAT',
                format
            });
            validation.isValid = false;
        } else {
            const formatResult = await formatValidator(filePath);
            validation.errors.push(...formatResult.errors);
            validation.warnings.push(...formatResult.warnings);
            validation.metadata = { ...validation.metadata, ...formatResult.metadata };
            validation.isValid = validation.isValid && formatResult.isValid;
        }

        // Content validation
        if (validation.isValid) {
            const contentResult = await this.validateFileContent(filePath, format);
            validation.errors.push(...contentResult.errors);
            validation.warnings.push(...contentResult.warnings);
            validation.isValid = validation.isValid && contentResult.isValid;
        }

        return validation;
    }

    // Large file streaming import
    async importLargeFile(filePath, format, options = {}) {
        const progressId = this.generateProgressId();
        let currentProgress = 0;

        try {
            // Create progress tracker
            this.progressCallbacks.set(progressId, {
                onProgress: options.onProgress || (() => {}),
                onComplete: options.onComplete || (() => {}),
                onError: options.onError || (() => {})
            });

            const stream = fs.createReadStream(filePath, { 
                highWaterMark: 1024 * 1024 // 1MB chunks
            });
            
            const parser = this.createStreamingParser(format);
            const results = [];
            let processedBytes = 0;
            const totalBytes = (await fs.stat(filePath)).size;

            return new Promise((resolve, reject) => {
                stream.on('data', async (chunk) => {
                    try {
                        stream.pause(); // Backpressure control
                        
                        const parsedChunk = await parser.parseChunk(chunk);
                        results.push(...parsedChunk.items);
                        
                        processedBytes += chunk.length;
                        currentProgress = Math.round((processedBytes / totalBytes) * 100);
                        
                        this.updateProgress(progressId, currentProgress, {
                            processedItems: results.length,
                            processedBytes
                        });

                        // Memory management
                        if (results.length > 1000) {
                            await this.flushResults(results);
                            results.length = 0;
                        }

                        stream.resume();
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('end', async () => {
                    try {
                        if (results.length > 0) {
                            await this.flushResults(results);
                        }
                        
                        const finalResult = {
                            success: true,
                            totalItems: await this.getTotalImportedItems(),
                            progressId
                        };
                        
                        this.completeProgress(progressId, finalResult);
                        resolve(finalResult);
                    } catch (error) {
                        reject(error);
                    }
                });

                stream.on('error', (error) => {
                    this.errorProgress(progressId, error);
                    reject(error);
                });
            });

        } catch (error) {
            this.errorProgress(progressId, error);
            throw error;
        }
    }

    // Export with progress tracking
    async exportNotes(noteIds, format, outputPath, options = {}) {
        const progressId = this.generateProgressId();
        const totalNotes = noteIds.length;
        let exportedCount = 0;

        try {
            const exporter = this.createExporter(format);
            const outputStream = fs.createWriteStream(outputPath);
            
            await exporter.writeHeader(outputStream);

            for (const noteId of noteIds) {
                try {
                    const note = await this.getNoteForExport(noteId);
                    await exporter.writeNote(outputStream, note);
                    
                    exportedCount++;
                    const progress = Math.round((exportedCount / totalNotes) * 100);
                    
                    this.updateProgress(progressId, progress, {
                        exportedCount,
                        currentNote: note.title
                    });

                    // Allow cancellation
                    if (options.cancellationToken?.isCancelled) {
                        await exporter.writeFooter(outputStream);
                        outputStream.end();
                        return { success: false, reason: 'CANCELLED', exportedCount };
                    }

                } catch (error) {
                    // Continue with other notes, log error
                    console.error(`Failed to export note ${noteId}:`, error);
                }
            }

            await exporter.writeFooter(outputStream);
            outputStream.end();

            return {
                success: true,
                exportedCount,
                totalNotes,
                outputPath
            };

        } catch (error) {
            this.errorProgress(progressId, error);
            throw error;
        }
    }
}
```

### Format Conversion & Error Recovery

```javascript
// Format Converter with Fallback
class FormatConverter {
    constructor() {
        this.converters = new Map();
        this.fallbackStrategies = new Map();
        this.initializeConverters();
    }

    initializeConverters() {
        // HTML to Markdown converter
        this.converters.set('html->md', {
            convert: this.htmlToMarkdown.bind(this),
            fallback: this.htmlToText.bind(this)
        });

        // JSON to other formats
        this.converters.set('json->html', {
            convert: this.jsonToHtml.bind(this),
            fallback: this.jsonToText.bind(this)
        });

        // DOCX converter
        this.converters.set('docx->md', {
            convert: this.docxToMarkdown.bind(this),
            fallback: this.docxToText.bind(this)
        });
    }

    async convertWithFallback(content, fromFormat, toFormat) {
        const converterKey = `${fromFormat}->${toFormat}`;
        const converter = this.converters.get(converterKey);

        if (!converter) {
            throw new Error(`No converter available for ${converterKey}`);
        }

        try {
            // Attempt primary conversion
            const result = await converter.convert(content);
            return {
                success: true,
                content: result,
                method: 'primary'
            };
        } catch (primaryError) {
            console.warn(`Primary conversion failed: ${primaryError.message}`);
            
            try {
                // Attempt fallback conversion
                const fallbackResult = await converter.fallback(content);
                return {
                    success: true,
                    content: fallbackResult,
                    method: 'fallback',
                    warning: 'Used fallback conversion, some formatting may be lost'
                };
            } catch (fallbackError) {
                return {
                    success: false,
                    error: fallbackError.message,
                    primaryError: primaryError.message
                };
            }
        }
    }

    async htmlToMarkdown(html) {
        const TurndownService = require('turndown');
        const turndownService = new TurndownService({
            codeBlockStyle: 'fenced',
            emDelimiter: '*'
        });

        // Custom rules for better conversion
        turndownService.addRule('highlight', {
            filter: ['mark', 'highlight'],
            replacement: (content) => `==${content}==`
        });

        return turndownService.turndown(html);
    }

    async htmlToText(html) {
        // Fallback: strip all HTML tags
        return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '');
    }
}
```

## 💾 BACKUP RESTORATION FAILURES

### Backup Integrity Verification

```javascript
// Backup Restoration Manager
class BackupRestorationManager {
    constructor() {
        this.integrityChecker = new BackupIntegrityChecker();
        this.migrationManager = new DataMigrationManager();
        this.rollbackManager = new RollbackManager();
    }

    async restoreFromBackup(backupPath, options = {}) {
        const restoreId = this.generateRestoreId();
        
        try {
            // Phase 1: Backup verification
            const verificationResult = await this.integrityChecker.verify(backupPath);
            if (!verificationResult.isValid) {
                return this.handleCorruptedBackup(backupPath, verificationResult, options);
            }

            // Phase 2: Compatibility check
            const compatibilityCheck = await this.checkVersionCompatibility(backupPath);
            if (!compatibilityCheck.isCompatible) {
                const migrationResult = await this.migrationManager.migrate(
                    backupPath, 
                    compatibilityCheck.sourceVersion, 
                    compatibilityCheck.targetVersion
                );
                
                if (!migrationResult.success) {
                    throw new Error(`Migration failed: ${migrationResult.error}`);
                }
                
                backupPath = migrationResult.migratedBackupPath;
            }

            // Phase 3: Create rollback point
            const rollbackPoint = await this.rollbackManager.createRollbackPoint();

            // Phase 4: Restore data
            const restoreResult = await this.performRestore(backupPath, options);

            if (!restoreResult.success) {
                // Automatic rollback on failure
                await this.rollbackManager.rollback(rollbackPoint);
                throw new Error(`Restore failed: ${restoreResult.error}`);
            }

            return {
                success: true,
                restoreId,
                restoredItems: restoreResult.itemCount,
                rollbackPoint
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                restoreId
            };
        }
    }

    async handleCorruptedBackup(backupPath, verificationResult, options) {
        const corruptionType = verificationResult.corruptionType;
        
        switch (corruptionType) {
            case 'CHECKSUM_MISMATCH':
                return this.attemptChecksumRecovery(backupPath, verificationResult);
                
            case 'INCOMPLETE_BACKUP':
                return this.attemptPartialRestore(backupPath, verificationResult, options);
                
            case 'FORMAT_ERROR':
                return this.attemptFormatRecovery(backupPath, verificationResult);
                
            default:
                return {
                    success: false,
                    error: 'Backup is corrupted and cannot be recovered',
                    corruptionDetails: verificationResult
                };
        }
    }

    async attemptPartialRestore(backupPath, verificationResult, options) {
        const recoverableData = verificationResult.recoverableData;
        
        if (recoverableData.length === 0) {
            return {
                success: false,
                error: 'No recoverable data found in backup'
            };
        }

        // Ask user for confirmation if interactive
        if (options.interactive) {
            const confirmation = await this.requestPartialRestoreConfirmation(recoverableData);
            if (!confirmation) {
                return { success: false, error: 'User cancelled partial restore' };
            }
        }

        const partialResult = await this.restorePartialData(recoverableData);
        
        return {
            success: true,
            partial: true,
            restoredItems: partialResult.itemCount,
            skippedItems: partialResult.skippedCount,
            warnings: [`Partial restore completed. ${partialResult.skippedCount} items could not be recovered.`]
        };
    }
}

// Backup Integrity Checker
class BackupIntegrityChecker {
    async verify(backupPath) {
        const verification = {
            isValid: true,
            issues: [],
            corruptionType: null,
            recoverableData: []
        };

        try {
            // Check file structure
            const structure = await this.checkFileStructure(backupPath);
            if (!structure.isValid) {
                verification.issues.push(...structure.issues);
                verification.isValid = false;
                verification.corruptionType = 'FORMAT_ERROR';
            }

            // Check checksums
            const checksumResult = await this.verifyChecksums(backupPath);
            if (!checksumResult.isValid) {
                verification.issues.push(...checksumResult.issues);
                verification.isValid = false;
                verification.corruptionType = 'CHECKSUM_MISMATCH';
            }

            // Check completeness
            const completenessResult = await this.checkCompleteness(backupPath);
            if (!completenessResult.isComplete) {
                verification.issues.push(...completenessResult.issues);
                verification.recoverableData = completenessResult.recoverableData;
                
                if (completenessResult.recoverableData.length > 0) {
                    verification.corruptionType = 'INCOMPLETE_BACKUP';
                } else {
                    verification.isValid = false;
                    verification.corruptionType = 'TOTAL_CORRUPTION';
                }
            }

            return verification;

        } catch (error) {
            return {
                isValid: false,
                corruptionType: 'READ_ERROR',
                error: error.message
            };
        }
    }

    async checkFileStructure(backupPath) {
        // Implementation for checking backup file structure
        const stats = await fs.stat(backupPath);
        const issues = [];

        if (stats.size === 0) {
            issues.push({ type: 'EMPTY_FILE', severity: 'HIGH' });
        }

        // Check if it's a valid ZIP file (common backup format)
        if (backupPath.endsWith('.zip')) {
            const isValidZip = await this.isValidZipFile(backupPath);
            if (!isValidZip) {
                issues.push({ type: 'CORRUPTED_ZIP', severity: 'HIGH' });
            }
        }

        return {
            isValid: issues.filter(i => i.severity === 'HIGH').length === 0,
            issues
        };
    }
}
```

## 📎 LARGE FILE ATTACHMENT ERRORS

### Storage Management & Optimization

```javascript
// Attachment Manager
class AttachmentManager {
    constructor() {
        this.maxFileSize = 50 * 1024 * 1024; // 50MB per file
        this.maxTotalSize = 1 * 1024 * 1024 * 1024; // 1GB total
        this.supportedTypes = new Set(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'md']);
        this.compressionThreshold = 5 * 1024 * 1024; // 5MB
        this.storageQuotaManager = new StorageQuotaManager();
    }

    async addAttachment(noteId, filePath, options = {}) {
        try {
            // Pre-validation
            const validation = await this.validateAttachment(filePath);
            if (!validation.isValid) {
                return {
                    success: false,
                    errors: validation.errors
                };
            }

            // Storage quota check
            const quotaCheck = await this.storageQuotaManager.checkQuota(validation.fileSize);
            if (!quotaCheck.hasSpace) {
                return this.handleStorageQuotaExceeded(quotaCheck, options);
            }

            // Process large files
            if (validation.fileSize > this.compressionThreshold) {
                return this.processLargeFile(noteId, filePath, validation, options);
            }

            // Standard processing
            return this.processStandardFile(noteId, filePath, validation);

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async validateAttachment(filePath) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: [],
            fileSize: 0,
            fileType: '',
            metadata: {}
        };

        try {
            const stats = await fs.stat(filePath);
            validation.fileSize = stats.size;

            // Size validation
            if (stats.size > this.maxFileSize) {
                validation.errors.push({
                    type: 'FILE_TOO_LARGE',
                    size: stats.size,
                    maxSize: this.maxFileSize,
                    suggestion: 'Consider compressing the file or using cloud storage links'
                });
                validation.isValid = false;
            }

            // Type validation
            const extension = path.extname(filePath).toLowerCase().substring(1);
            validation.fileType = extension;

            if (!this.supportedTypes.has(extension)) {
                validation.warnings.push({
                    type: 'UNSUPPORTED_TYPE',
                    extension,
                    suggestion: 'File type may not preview correctly'
                });
            }

            // Content validation for specific types
            if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                const imageValidation = await this.validateImage(filePath);
                validation.metadata.image = imageValidation;
                if (!imageValidation.isValid) {
                    validation.errors.push(...imageValidation.errors);
                    validation.isValid = false;
                }
            }

            return validation;

        } catch (error) {
            validation.isValid = false;
            validation.errors.push({
                type: 'FILE_ACCESS_ERROR',
                error: error.message
            });
            return validation;
        }
    }

    async processLargeFile(noteId, filePath, validation, options) {
        const progressId = this.generateProgressId();
        
        try {
            // Offer compression
            if (options.allowCompression !== false && this.canCompress(validation.fileType)) {
                const compressionResult = await this.compressFile(filePath, {
                    onProgress: (progress) => this.updateProgress(progressId, progress)
                });

                if (compressionResult.success && compressionResult.sizeSaved > 0) {
                    filePath = compressionResult.compressedPath;
                    validation.fileSize = compressionResult.newSize;
                }
            }

            // Chunk-based upload for very large files
            if (validation.fileSize > 20 * 1024 * 1024) {
                return this.uploadInChunks(noteId, filePath, validation, progressId);
            }

            return this.processStandardFile(noteId, filePath, validation);

        } catch (error) {
            this.errorProgress(progressId, error);
            throw error;
        }
    }

    async uploadInChunks(noteId, filePath, validation, progressId) {
        const chunkSize = 5 * 1024 * 1024; // 5MB chunks
        const totalChunks = Math.ceil(validation.fileSize / chunkSize);
        const attachmentId = this.generateAttachmentId();
        
        let uploadedChunks = 0;
        const stream = fs.createReadStream(filePath, { highWaterMark: chunkSize });

        return new Promise((resolve, reject) => {
            const chunks = [];
            
            stream.on('data', async (chunk) => {
                try {
                    stream.pause();
                    
                    const chunkResult = await this.uploadChunk(attachmentId, uploadedChunks, chunk);
                    chunks.push(chunkResult);
                    uploadedChunks++;
                    
                    const progress = Math.round((uploadedChunks / totalChunks) * 100);
                    this.updateProgress(progressId, progress);
                    
                    stream.resume();
                } catch (error) {
                    reject(error);
                }
            });

            stream.on('end', async () => {
                try {
                    // Combine chunks
                    const combinedResult = await this.combineChunks(attachmentId, chunks);
                    
                    // Verify integrity
                    const integrityCheck = await this.verifyAttachmentIntegrity(
                        combinedResult.finalPath, 
                        validation.fileSize
                    );

                    if (!integrityCheck.isValid) {
                        throw new Error('Attachment corruption detected after upload');
                    }

                    resolve({
                        success: true,
                        attachmentId,
                        path: combinedResult.finalPath,
                        size: validation.fileSize,
                        chunks: totalChunks
                    });
                } catch (error) {
                    reject(error);
                }
            });

            stream.on('error', reject);
        });
    }

    // Storage quota management
    async handleStorageQuotaExceeded(quotaCheck, options) {
        const suggestions = [];

        // Suggest cleanup
        const cleanupCandidates = await this.storageQuotaManager.findCleanupCandidates();
        if (cleanupCandidates.length > 0) {
            suggestions.push({
                type: 'CLEANUP',
                action: 'Remove unused attachments',
                potentialSavings: cleanupCandidates.reduce((sum, c) => sum + c.size, 0),
                candidates: cleanupCandidates
            });
        }

        // Suggest compression
        const compressionCandidates = await this.storageQuotaManager.findCompressionCandidates();
        if (compressionCandidates.length > 0) {
            suggestions.push({
                type: 'COMPRESSION',
                action: 'Compress large attachments',
                potentialSavings: compressionCandidates.reduce((sum, c) => sum + c.estimatedSavings, 0),
                candidates: compressionCandidates
            });
        }

        return {
            success: false,
            error: 'STORAGE_QUOTA_EXCEEDED',
            currentUsage: quotaCheck.currentUsage,
            maxStorage: quotaCheck.maxStorage,
            required: quotaCheck.required,
            suggestions
        };
    }
}
```

## 🔤 CHARACTER ENCODING ISSUES

### Unicode & Cross-Platform Compatibility

```javascript
// Character Encoding Manager
class CharacterEncodingManager {
    constructor() {
        this.supportedEncodings = ['utf-8', 'utf-16', 'latin1', 'ascii'];
        this.unicodeNormalizer = new UnicodeNormalizer();
        this.xssPreventionEnabled = true;
    }

    async processTextContent(content, sourceEncoding = 'utf-8') {
        try {
            // Step 1: Encoding detection and conversion
            const encodingResult = await this.detectAndConvertEncoding(content, sourceEncoding);
            if (!encodingResult.success) {
                return encodingResult;
            }

            let processedContent = encodingResult.content;

            // Step 2: Unicode normalization
            const normalizedContent = this.unicodeNormalizer.normalize(processedContent);
            processedContent = normalizedContent.content;

            // Step 3: Character validation
            const validationResult = this.validateCharacters(processedContent);
            if (!validationResult.isValid) {
                processedContent = this.sanitizeInvalidCharacters(
                    processedContent, 
                    validationResult.issues
                );
            }

            // Step 4: XSS prevention
            if (this.xssPreventionEnabled) {
                processedContent = this.preventXSS(processedContent);
            }

            // Step 5: Cross-platform compatibility
            processedContent = this.ensureCrossPlatformCompatibility(processedContent);

            return {
                success: true,
                content: processedContent,
                originalEncoding: encodingResult.detectedEncoding,
                normalizations: normalizedContent.normalizations,
                sanitizations: validationResult.issues?.length || 0
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async detectAndConvertEncoding(content, sourceEncoding) {
        try {
            // First, try to detect encoding if not specified
            let detectedEncoding = sourceEncoding;
            
            if (!sourceEncoding || sourceEncoding === 'auto') {
                detectedEncoding = await this.detectEncoding(content);
            }

            // Convert to UTF-8 if necessary
            if (detectedEncoding !== 'utf-8') {
                const converted = await this.convertEncoding(content, detectedEncoding, 'utf-8');
                return {
                    success: true,
                    content: converted,
                    detectedEncoding,
                    converted: true
                };
            }

            return {
                success: true,
                content: content,
                detectedEncoding: 'utf-8',
                converted: false
            };

        } catch (error) {
            return {
                success: false,
                error: `Encoding conversion failed: ${error.message}`,
                fallback: this.createFallbackContent(content)
            };
        }
    }

    validateCharacters(content) {
        const issues = [];
        const problematicChars = [];

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const codePoint = char.codePointAt(0);

            // Check for null bytes
            if (codePoint === 0) {
                issues.push({
                    type: 'NULL_BYTE',
                    position: i,
                    severity: 'HIGH'
                });
                problematicChars.push(i);
            }

            // Check for control characters (except whitespace)
            if (codePoint < 32 && ![9, 10, 13].includes(codePoint)) {
                issues.push({
                    type: 'CONTROL_CHARACTER',
                    position: i,
                    codePoint,
                    severity: 'MEDIUM'
                });
                problematicChars.push(i);
            }

            // Check for invalid Unicode
            if (codePoint > 0x10FFFF) {
                issues.push({
                    type: 'INVALID_UNICODE',
                    position: i,
                    codePoint,
                    severity: 'HIGH'
                });
                problematicChars.push(i);
            }

            // Check for potentially dangerous characters
            if (this.isDangerousCharacter(codePoint)) {
                issues.push({
                    type: 'DANGEROUS_CHARACTER',
                    position: i,
                    codePoint,
                    character: char,
                    severity: 'MEDIUM'
                });
            }
        }

        return {
            isValid: issues.filter(i => i.severity === 'HIGH').length === 0,
            issues,
            problematicChars
        };
    }

    sanitizeInvalidCharacters(content, issues) {
        let sanitized = content;
        
        // Sort issues by position (descending) to maintain correct indices
        const sortedIssues = issues.sort((a, b) => b.position - a.position);
        
        for (const issue of sortedIssues) {
            switch (issue.type) {
                case 'NULL_BYTE':
                    sanitized = sanitized.substring(0, issue.position) + 
                               sanitized.substring(issue.position + 1);
                    break;
                    
                case 'CONTROL_CHARACTER':
                    sanitized = sanitized.substring(0, issue.position) + 
                               '�' + // Replacement character
                               sanitized.substring(issue.position + 1);
                    break;
                    
                case 'INVALID_UNICODE':
                    sanitized = sanitized.substring(0, issue.position) + 
                               '�' + 
                               sanitized.substring(issue.position + 1);
                    break;
                    
                case 'DANGEROUS_CHARACTER':
                    if (this.xssPreventionEnabled) {
                        sanitized = sanitized.substring(0, issue.position) + 
                                   this.escapeCharacter(issue.character) + 
                                   sanitized.substring(issue.position + 1);
                    }
                    break;
            }
        }
        
        return sanitized;
    }

    preventXSS(content) {
        // HTML entity encoding for dangerous characters
        const xssPatterns = [
            { pattern: /</g, replacement: '&lt;' },
            { pattern: />/g, replacement: '&gt;' },
            { pattern: /"/g, replacement: '&quot;' },
            { pattern: /'/g, replacement: '&#x27;' },
            { pattern: /&/g, replacement: '&amp;' }
        ];

        let sanitized = content;
        for (const { pattern, replacement } of xssPatterns) {
            sanitized = sanitized.replace(pattern, replacement);
        }

        // Remove or escape JavaScript protocol
        sanitized = sanitized.replace(/javascript:/gi, 'javascript\\:');
        
        // Remove or escape data URIs that might contain scripts
        sanitized = sanitized.replace(/data:[^,]*script[^,]*,/gi, '');

        return sanitized;
    }

    ensureCrossPlatformCompatibility(content) {
        // Normalize line endings to LF
        let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        // Handle platform-specific path separators
        normalized = normalized.replace(/\\/g, '/');
        
        // Ensure proper Unicode normalization
        normalized = normalized.normalize('NFC');
        
        return normalized;
    }

    isDangerousCharacter(codePoint) {
        // Characters that might be used for XSS or injection attacks
        const dangerousRanges = [
            [0x202E, 0x202E], // Right-to-left override
            [0x200E, 0x200F], // Left-to-right/right-to-left marks
            [0x2066, 0x2069], // Directional isolates
            [0xFEFF, 0xFEFF]  // Byte order mark
        ];

        return dangerousRanges.some(([start, end]) => 
            codePoint >= start && codePoint <= end
        );
    }
}

// Unicode Normalizer
class UnicodeNormalizer {
    normalize(content) {
        const normalizations = [];
        let normalized = content;

        // NFC normalization (canonical composition)
        const nfcNormalized = content.normalize('NFC');
        if (nfcNormalized !== content) {
            normalizations.push('NFC');
            normalized = nfcNormalized;
        }

        // Handle specific emoji and symbol cases
        const emojiNormalized = this.normalizeEmojis(normalized);
        if (emojiNormalized !== normalized) {
            normalizations.push('EMOJI');
            normalized = emojiNormalized;
        }

        // Handle combining character sequences
        const combiningNormalized = this.normalizeCombiningCharacters(normalized);
        if (combiningNormalized !== normalized) {
            normalizations.push('COMBINING');
            normalized = combiningNormalized;
        }

        return {
            content: normalized,
            normalizations
        };
    }

    normalizeEmojis(content) {
        // Normalize emoji variants
        return content
            .replace(/\uFE0E/g, '') // Remove text presentation selector
            .replace(/\uFE0F/g, ''); // Remove emoji presentation selector
    }

    normalizeCombiningCharacters(content) {
        // Reorder combining characters according to Unicode rules
        return content.normalize('NFC');
    }
}
```

## 🎯 USER EXPERIENCE PATTERNS

### Error Recovery UI Components

```javascript
// Error Recovery UI Manager
class ErrorRecoveryUI {
    constructor() {
        this.recoveryDialogs = new Map();
        this.progressTrackers = new Map();
    }

    async showDataCorruptionDialog(corruptionInfo, recoveryOptions) {
        const dialog = {
            type: 'error',
            title: 'Data Corruption Detected',
            message: this.formatCorruptionMessage(corruptionInfo),
            options: this.formatRecoveryOptions(recoveryOptions),
            actions: [
                {
                    label: 'Recover from backup',
                    primary: true,
                    action: 'BACKUP_RECOVERY',
                    disabled: !recoveryOptions.hasBackup
                },
                {
                    label: 'Partial recovery',
                    action: 'PARTIAL_RECOVERY',
                    disabled: !recoveryOptions.hasPartialData
                },
                {
                    label: 'Start fresh',
                    action: 'FRESH_START',
                    destructive: true
                },
                {
                    label: 'Cancel',
                    action: 'CANCEL'
                }
            ]
        };

        return this.showDialog(dialog);
    }

    async showImportProgressDialog(importId, totalItems) {
        const progressDialog = {
            type: 'progress',
            title: 'Importing Notes',
            cancellable: true,
            showProgress: true,
            showDetails: true,
            actions: [
                {
                    label: 'Cancel',
                    action: 'CANCEL_IMPORT'
                }
            ]
        };

        const dialogInstance = await this.showDialog(progressDialog);
        this.progressTrackers.set(importId, dialogInstance);
        
        return dialogInstance;
    }

    async showStorageQuotaDialog(quotaInfo, suggestions) {
        const dialog = {
            type: 'warning',
            title: 'Storage Quota Exceeded',
            message: `Storage limit reached (${this.formatBytes(quotaInfo.currentUsage)} / ${this.formatBytes(quotaInfo.maxStorage)})`,
            details: this.formatStorageDetails(quotaInfo),
            suggestions: suggestions.map(s => ({
                title: s.action,
                description: `Save approximately ${this.formatBytes(s.potentialSavings)}`,
                action: s.type,
                candidates: s.candidates
            })),
            actions: [
                {
                    label: 'Clean up files',
                    primary: true,
                    action: 'CLEANUP'
                },
                {
                    label: 'Compress attachments',
                    action: 'COMPRESS'
                },
                {
                    label: 'Cancel',
                    action: 'CANCEL'
                }
            ]
        };

        return this.showDialog(dialog);
    }

    formatCorruptionMessage(corruptionInfo) {
        const messages = {
            'JSON_PARSE_ERROR': 'Note content is corrupted and cannot be parsed.',
            'CHECKSUM_MISMATCH': 'Note content has been modified unexpectedly.',
            'ENCODING_ISSUES': 'Note contains invalid character encoding.',
            'SCHEMA_VIOLATION': 'Note structure is invalid.'
        };

        return messages[corruptionInfo.type] || 'Unknown corruption detected.';
    }

    updateImportProgress(importId, progress, details) {
        const tracker = this.progressTrackers.get(importId);
        if (tracker) {
            tracker.updateProgress(progress, {
                status: `Processing item ${details.currentItem} of ${details.totalItems}`,
                currentFile: details.currentFile,
                errors: details.errorCount || 0
            });
        }
    }

    async showRecoverySuccessNotification(recoveryResult) {
        const notification = {
            type: 'success',
            title: 'Data Recovery Complete',
            message: `Successfully recovered ${recoveryResult.recoveredItems} items`,
            duration: 5000,
            actions: recoveryResult.hasWarnings ? [
                {
                    label: 'View Details',
                    action: 'SHOW_RECOVERY_DETAILS'
                }
            ] : []
        };

        return this.showNotification(notification);
    }
}
```

This comprehensive analysis covers all critical user data error scenarios in Electron applications, providing robust detection algorithms, recovery strategies, and user-friendly error handling patterns. The implementation focuses on data integrity, graceful degradation, and maintaining user productivity even when facing data corruption or system failures.