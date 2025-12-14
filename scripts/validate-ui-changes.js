#!/usr/bin/env node

/**
 * UI Change Validation Script
 * Ensures that UI changes include proper documentation and screenshots
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DOCS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
const SRC_DIR = path.join(__dirname, '..', 'src', 'components');

// Get changed files from git
function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

// Check if component files were changed
function hasComponentChanges(files) {
  return files.some(file => 
    file.startsWith('src/components/') && 
    (file.endsWith('.tsx') || file.endsWith('.ts'))
  );
}

// Check if screenshots directory has recent additions
function hasRecentScreenshots(componentName) {
  const componentScreenshotDir = path.join(DOCS_DIR, componentName);
  
  if (!fs.existsSync(componentScreenshotDir)) {
    return false;
  }
  
  const files = fs.readdirSync(componentScreenshotDir);
  const today = new Date().toISOString().split('T')[0];
  
  return files.some(file => file.includes(today));
}

// Main validation
function validateUIChanges() {
  console.log('🔍 Validating UI changes...\n');
  
  const changedFiles = getChangedFiles();
  
  if (!hasComponentChanges(changedFiles)) {
    console.log('✅ No component changes detected. Skipping screenshot validation.\n');
    return true;
  }
  
  console.log('📸 Component changes detected. Checking for screenshots...\n');
  
  const componentFiles = changedFiles.filter(file => 
    file.startsWith('src/components/') && 
    (file.endsWith('.tsx') || file.endsWith('.ts'))
  );
  
  let missingScreenshots = false;
  
  componentFiles.forEach(file => {
    const componentName = path.basename(file, path.extname(file));
    console.log(`  Checking: ${componentName}...`);
    
    if (!hasRecentScreenshots(componentName)) {
      console.log(`    ❌ Missing screenshots for ${componentName}`);
      missingScreenshots = true;
    } else {
      console.log(`    ✅ Screenshots found`);
    }
  });
  
  if (missingScreenshots) {
    console.log('\n⚠️  Missing screenshots for component changes!');
    console.log('\nPlease add before/after screenshots to:');
    console.log('  docs/screenshots/[component-name]/before-[feature]-[date].png');
    console.log('  docs/screenshots/[component-name]/after-[feature]-[date].png\n');
    return false;
  }
  
  console.log('\n✅ All UI changes have proper documentation!\n');
  return true;
}

// Run validation
const isValid = validateUIChanges();
process.exit(isValid ? 0 : 1);
