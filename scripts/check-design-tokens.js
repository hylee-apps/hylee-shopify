#!/usr/bin/env node

/**
 * Design Token Validation Script
 * Ensures colors, spacing, and other design values use tokens instead of hardcoded values
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to detect hardcoded values
const HARDCODED_PATTERNS = {
  colors: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g,
  rgbColors: /rgba?\([^)]+\)/g,
  spacing: /\b\d+px\b/g,
};

// Allowed exceptions (e.g., 0px, transparent)
const ALLOWED_VALUES = ['0px', '1px', 'transparent', '#000', '#fff', '#000000', '#ffffff'];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Check for hardcoded colors
  const colors = content.match(HARDCODED_PATTERNS.colors);
  if (colors) {
    const filteredColors = colors.filter(c => !ALLOWED_VALUES.includes(c));
    if (filteredColors.length > 0) {
      issues.push({
        type: 'color',
        values: filteredColors,
        message: 'Use CSS variables or design tokens instead of hardcoded hex colors'
      });
    }
  }
  
  // Check for hardcoded spacing
  const spacing = content.match(HARDCODED_PATTERNS.spacing);
  if (spacing) {
    const filteredSpacing = spacing.filter(s => !ALLOWED_VALUES.includes(s));
    if (filteredSpacing.length > 0) {
      issues.push({
        type: 'spacing',
        values: filteredSpacing,
        message: 'Use spacing variables (rem, em, or design tokens) instead of px values'
      });
    }
  }
  
  return issues;
}

function main() {
  console.log('🎨 Checking for hardcoded design values...\n');
  
  const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' })
    .split('\n')
    .filter(file => 
      (file.endsWith('.css') || file.endsWith('.tsx') || file.endsWith('.ts')) &&
      fs.existsSync(file)
    );
  
  if (changedFiles.length === 0) {
    console.log('✅ No style files changed.\n');
    return true;
  }
  
  let hasIssues = false;
  
  changedFiles.forEach(file => {
    const issues = checkFile(file);
    
    if (issues.length > 0) {
      hasIssues = true;
      console.log(`⚠️  ${file}:`);
      issues.forEach(issue => {
        console.log(`  ${issue.type}: ${issue.values.join(', ')}`);
        console.log(`  → ${issue.message}\n`);
      });
    }
  });
  
  if (hasIssues) {
    console.log('💡 Tip: Define design tokens in CSS variables or settings_schema.json\n');
    return false;
  }
  
  console.log('✅ No hardcoded design values found!\n');
  return true;
}

const isValid = main();
process.exit(isValid ? 0 : 1);
