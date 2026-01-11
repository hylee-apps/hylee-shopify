#!/usr/bin/env node
/**
 * validate-structure.js
 * 
 * Validates that the project follows the expected directory structure.
 * Run with: pnpm validate:structure
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Required directories that MUST exist
const REQUIRED_DIRS = [
  'docs',
  'theme',
  'theme/assets',
  'theme/snippets',
  'theme/sections',
  'theme/templates',
  'theme/layout',
  'theme/config',
  'theme/locales',
  'tests',
  'tests/components',
  'tests/e2e',
  'scripts',
];

// Required files that MUST exist
const REQUIRED_FILES = [
  'docs/DEVELOPMENT_GUIDELINES.md',
  'docs/ARCHITECTURE.md',
  'docs/COMPONENT_INVENTORY.md',
  'docs/IMPLEMENTATION_PLAN.md',
  'theme/assets/theme-variables.css',
  'theme/layout/theme.liquid',
  'tests/README.md',
];

// Forbidden patterns - files/dirs that should NOT exist
const FORBIDDEN_PATTERNS = [
  // React artifacts
  'src/App.tsx',
  'src/main.tsx',
  'src/components/**/*.tsx',
  // Misc
  'SETUP_COMPLETE.md',
  'SHOPIFY_THEME_PLAN.md',
];

// Naming conventions to enforce
const NAMING_RULES = [
  {
    dir: 'theme/assets',
    pattern: /^(component|section|template|theme)-[\w-]+\.(css|js)$|^(constants|pubsub|global)\.js$|^base\.css$/,
    message: 'CSS files should be named component-*, section-*, template-*, or theme-*.css'
  },
];

let errors = [];
let warnings = [];

function checkPath(relativePath, mustExist = true) {
  const fullPath = path.join(ROOT, relativePath);
  const exists = fs.existsSync(fullPath);
  
  if (mustExist && !exists) {
    errors.push(`Missing required: ${relativePath}`);
    return false;
  }
  
  if (!mustExist && exists) {
    errors.push(`Forbidden file exists: ${relativePath}`);
    return false;
  }
  
  return true;
}

function checkNamingConventions() {
  for (const rule of NAMING_RULES) {
    const dirPath = path.join(ROOT, rule.dir);
    
    if (!fs.existsSync(dirPath)) continue;
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      // Skip directories
      if (stat.isDirectory()) continue;
      
      // Skip non-css/js files (like images)
      if (!file.endsWith('.css') && !file.endsWith('.js')) continue;
      
      if (!rule.pattern.test(file)) {
        warnings.push(`Naming convention: ${rule.dir}/${file} - ${rule.message}`);
      }
    }
  }
}

function checkForbiddenPatterns() {
  for (const pattern of FORBIDDEN_PATTERNS) {
    // Simple pattern matching (no glob for now)
    if (pattern.includes('**')) {
      // Handle glob patterns
      const basePath = pattern.split('**')[0];
      const fullBase = path.join(ROOT, basePath);
      
      if (fs.existsSync(fullBase)) {
        // Check if there are any .tsx files recursively
        const checkDir = (dir) => {
          if (!fs.existsSync(dir)) return;
          const items = fs.readdirSync(dir);
          for (const item of items) {
            const itemPath = path.join(dir, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
              checkDir(itemPath);
            } else if (pattern.endsWith('.tsx') && item.endsWith('.tsx')) {
              errors.push(`Forbidden file exists: ${itemPath.replace(ROOT + '/', '')}`);
            }
          }
        };
        checkDir(fullBase);
      }
    } else {
      checkPath(pattern, false);
    }
  }
}

function checkComponentCSSLinkage() {
  const snippetsDir = path.join(ROOT, 'theme/snippets');
  const assetsDir = path.join(ROOT, 'theme/assets');
  
  if (!fs.existsSync(snippetsDir) || !fs.existsSync(assetsDir)) return;
  
  const snippets = fs.readdirSync(snippetsDir).filter(f => f.endsWith('.liquid'));
  const cssFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('component-') && f.endsWith('.css'));
  
  // Extract component names from CSS files
  const cssComponentNames = new Set(
    cssFiles.map(f => f.replace('component-', '').replace('.css', ''))
  );
  
  // Check that major snippets have corresponding CSS (just a warning)
  const coreComponents = ['button', 'badge', 'card', 'input', 'select', 'checkbox', 'radio-group', 'label', 'textarea', 'form'];
  
  for (const component of coreComponents) {
    if (!cssComponentNames.has(component)) {
      warnings.push(`Core component missing CSS: theme/assets/component-${component}.css`);
    }
  }
}

function main() {
  console.log('🔍 Validating project structure...\n');
  
  // Check required directories
  console.log('Checking required directories...');
  for (const dir of REQUIRED_DIRS) {
    checkPath(dir);
  }
  
  // Check required files
  console.log('Checking required files...');
  for (const file of REQUIRED_FILES) {
    checkPath(file);
  }
  
  // Check forbidden patterns
  console.log('Checking for forbidden files...');
  checkForbiddenPatterns();
  
  // Check naming conventions
  console.log('Checking naming conventions...');
  checkNamingConventions();
  
  // Check component CSS linkage
  console.log('Checking component CSS linkage...');
  checkComponentCSSLinkage();
  
  // Report results
  console.log('\n' + '='.repeat(50) + '\n');
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(w => console.log(`  - ${w}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Errors:\n');
    errors.forEach(e => console.log(`  - ${e}`));
    console.log('\n' + '='.repeat(50));
    console.log(`\n❌ Structure validation FAILED with ${errors.length} error(s)\n`);
    process.exit(1);
  } else {
    console.log('='.repeat(50));
    console.log('\n✅ Structure validation PASSED\n');
    process.exit(0);
  }
}

main();
