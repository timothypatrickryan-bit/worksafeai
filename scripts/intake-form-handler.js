#!/usr/bin/env node

/**
 * Interactive Intake Form Handler for Mission Control
 * Manages Ryan Family Financial Plan intake form submissions
 * 
 * Usage:
 *   node intake-form-handler.js read <formId>
 *   node intake-form-handler.js submit <formId> <responses.json>
 *   node intake-form-handler.js validate <formId> <responses.json>
 *   node intake-form-handler.js status <formId>
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
  WORKSPACE: process.env.HOME + '/.openclaw/workspace',
  PROJECT_DIR: process.env.HOME + '/.openclaw/workspace/projects/ryan-family-financial-plan',
  SCHEMA_FILE: process.env.HOME + '/.openclaw/workspace/projects/ryan-family-financial-plan/intake-form-schema.json',
  SUBMISSIONS_DIR: process.env.HOME + '/.openclaw/workspace/projects/ryan-family-financial-plan/submissions'
};

// Load form schema
function loadSchema() {
  try {
    const data = fs.readFileSync(CONFIG.SCHEMA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    console.error(`ERROR loading schema: ${e.message}`);
    return null;
  }
}

// Display form in interactive format
function displayForm(schema) {
  console.log(`\n═══════════════════════════════════════════════════════════════\n`);
  console.log(`📋 ${schema.formName}`);
  console.log(`📌 Project: ${schema.projectId}`);
  console.log(`📅 Created: ${schema.createdAt}`);
  console.log(`\n═══════════════════════════════════════════════════════════════\n`);

  schema.sections.forEach(section => {
    console.log(`\n📑 Section ${section.order}: ${section.sectionName}`);
    console.log(`   ${section.description}\n`);

    section.fields.forEach(field => {
      const required = field.required ? ' (required)' : '';
      const readonly = field.readonly ? ' [read-only, auto-calculated]' : '';

      switch (field.type) {
        case 'text':
        case 'email':
        case 'tel':
        case 'currency':
        case 'number':
          console.log(`   ${field.fieldId}:`);
          console.log(`     Label: ${field.label}${required}${readonly}`);
          console.log(`     Type: ${field.type}`);
          console.log(`     Placeholder: ${field.placeholder || 'N/A'}`);
          break;
        case 'select':
          console.log(`   ${field.fieldId}:`);
          console.log(`     Label: ${field.label}${required}${readonly}`);
          console.log(`     Type: select`);
          console.log(`     Options: ${field.options.join(', ')}`);
          break;
        case 'textarea':
          console.log(`   ${field.fieldId}:`);
          console.log(`     Label: ${field.label}${required}${readonly}`);
          console.log(`     Type: textarea (multiline)`);
          break;
      }
      console.log('');
    });
  });

  console.log(`═══════════════════════════════════════════════════════════════\n`);
  console.log(`📝 INSTRUCTIONS:`);
  console.log(`1. Fill in your information in a JSON file`);
  console.log(`2. Submit with: node intake-form-handler.js submit ryan-family-financial-plan responses.json`);
  console.log(`\n📋 EXAMPLE JSON FORMAT:\n`);

  console.log(JSON.stringify({
    formId: 'ryan-family-financial-plan-intake',
    submittedAt: '2026-03-28T22:15:00Z',
    responses: {
      name: 'Timothy Ryan',
      email: 'tim.ryan@pro-tel.com',
      phone: '+1 (607) XXX-XXXX',
      'household-status': 'Single',
      dependents: 0,
      'employment-status': 'Self-Employed',
      employer: 'Pro-Tel (Professional Teleconcepts, LLC)',
      'annual-salary': 150000,
      'bonus-comp': 25000,
      'other-income': 5000,
      'years-in-role': 5,
      'employment-stability': 'Stable',
      'checking-balance': 15000,
      'savings-balance': 45000,
      'emergency-fund-target': 60000,
      'investments-401k': 250000,
      'credit-card-balance': 0,
      'mortgage-balance': 0,
      'short-term-goals': 'Optimize tax situation, build business',
      'medium-term-goals': 'Expand Pro-Tel, invest in infrastructure',
      'long-term-goals': 'Generational wealth, business growth',
      'financial-concerns': 'Want to maximize efficiency and growth'
    }
  }, null, 2));
}

// Validate form submission
function validateSubmission(schema, responses) {
  const errors = [];
  const warnings = [];

  schema.sections.forEach(section => {
    section.fields.forEach(field => {
      const value = responses[field.fieldId];

      // Check required fields
      if (field.required && !value) {
        errors.push(`❌ ${field.label} is required`);
      }

      // Validate types
      if (value) {
        if ((field.type === 'currency' || field.type === 'number') && isNaN(value)) {
          errors.push(`❌ ${field.label} must be a number`);
        }
        if (field.type === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.push(`❌ ${field.label} must be a valid email`);
        }
      }
    });
  });

  return { valid: errors.length === 0, errors, warnings };
}

// Process submission
function processSubmission(schema, responses) {
  // Calculate totals
  const totalAssets =
    (parseFloat(responses['checking-balance']) || 0) +
    (parseFloat(responses['savings-balance']) || 0) +
    (parseFloat(responses['investments-401k']) || 0) +
    (parseFloat(responses['brokerage-balance']) || 0) +
    (parseFloat(responses['real-estate-equity']) || 0) +
    (parseFloat(responses['business-equity']) || 0) +
    (parseFloat(responses['other-assets']) || 0);

  const totalDebt =
    (parseFloat(responses['credit-card-balance']) || 0) +
    (parseFloat(responses['mortgage-balance']) || 0) +
    (parseFloat(responses['auto-loan-balance']) || 0) +
    (parseFloat(responses['student-loan-balance']) || 0) +
    (parseFloat(responses['other-debt']) || 0);

  const netWorth = totalAssets - totalDebt;

  const monthlyExpenses =
    (parseFloat(responses['housing-total']) || 0) +
    (parseFloat(responses['transportation-total']) || 0) +
    (parseFloat(responses['food-total']) || 0) +
    (parseFloat(responses['healthcare-total']) || 0) +
    (parseFloat(responses['personal-lifestyle']) || 0) +
    (parseFloat(responses['family-dependents']) || 0) +
    (parseFloat(responses['other-expenses']) || 0);

  const annualIncome =
    (parseFloat(responses['annual-salary']) || 0) +
    (parseFloat(responses['bonus-comp']) || 0) +
    (parseFloat(responses['other-income']) || 0);

  return {
    totalAssets: totalAssets.toFixed(2),
    totalDebt: totalDebt.toFixed(2),
    netWorth: netWorth.toFixed(2),
    monthlyExpenses: monthlyExpenses.toFixed(2),
    annualIncome: annualIncome.toFixed(2),
    annualBurnRate: (monthlyExpenses * 12).toFixed(2),
    savingsRate: annualIncome > 0 ? (((annualIncome - monthlyExpenses * 12) / annualIncome) * 100).toFixed(1) : 'N/A'
  };
}

// Save submission
function saveSubmission(schema, responses) {
  if (!fs.existsSync(CONFIG.SUBMISSIONS_DIR)) {
    fs.mkdirSync(CONFIG.SUBMISSIONS_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `submission-${timestamp}.json`;
  const filepath = path.join(CONFIG.SUBMISSIONS_DIR, filename);

  const calculated = processSubmission(schema, responses);

  const submission = {
    formId: schema.formId,
    submittedAt: new Date().toISOString(),
    responses,
    calculated,
    status: 'submitted',
    reviewedAt: null,
    reviewedBy: null,
    notes: null
  };

  fs.writeFileSync(filepath, JSON.stringify(submission, null, 2));
  return filepath;
}

// Main commands
function main() {
  const command = process.argv[2];
  const formId = process.argv[3];
  const dataPath = process.argv[4];

  const schema = loadSchema();
  if (!schema) process.exit(1);

  switch (command) {
    case 'read':
    case 'view':
      displayForm(schema);
      break;

    case 'submit':
      if (!dataPath) {
        console.error('Usage: node intake-form-handler.js submit <formId> <responses.json>');
        process.exit(1);
      }
      try {
        const responses = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const validation = validateSubmission(schema, responses);

        if (!validation.valid) {
          console.error('\n❌ VALIDATION FAILED:\n');
          validation.errors.forEach(e => console.error(e));
          process.exit(1);
        }

        const filepath = saveSubmission(schema, responses);
        const calculated = processSubmission(schema, responses);

        console.log('\n✅ SUBMISSION RECEIVED\n');
        console.log(`📁 Saved to: ${filepath}\n`);
        console.log('📊 FINANCIAL SUMMARY:\n');
        console.log(`   Total Assets:        $${calculated.totalAssets}`);
        console.log(`   Total Debt:          $${calculated.totalDebt}`);
        console.log(`   Net Worth:           $${calculated.netWorth}`);
        console.log(`   Monthly Expenses:    $${calculated.monthlyExpenses}`);
        console.log(`   Annual Income:       $${calculated.annualIncome}`);
        console.log(`   Annual Burn Rate:    $${calculated.annualBurnRate}`);
        console.log(`   Savings Rate:        ${calculated.savingsRate}%\n`);
        console.log('✨ Maxwell Reid will review this within 2-3 business days.\n');
      } catch (e) {
        console.error(`ERROR processing submission: ${e.message}`);
        process.exit(1);
      }
      break;

    case 'validate':
      if (!dataPath) {
        console.error('Usage: node intake-form-handler.js validate <formId> <responses.json>');
        process.exit(1);
      }
      try {
        const responses = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const validation = validateSubmission(schema, responses);

        if (validation.valid) {
          console.log('✅ Validation passed!');
        } else {
          console.error('❌ Validation failed:\n');
          validation.errors.forEach(e => console.error(e));
        }
        process.exit(validation.valid ? 0 : 1);
      } catch (e) {
        console.error(`ERROR validating: ${e.message}`);
        process.exit(1);
      }
      break;

    case 'status':
      if (fs.existsSync(CONFIG.SUBMISSIONS_DIR)) {
        const submissions = fs.readdirSync(CONFIG.SUBMISSIONS_DIR).length;
        console.log(`\n📊 Form Status:`);
        console.log(`   Form ID: ${schema.formId}`);
        console.log(`   Status: ${schema.status}`);
        console.log(`   Submissions: ${submissions}\n`);
      } else {
        console.log(`\n📊 Form Status:`);
        console.log(`   Form ID: ${schema.formId}`);
        console.log(`   Status: ${schema.status}`);
        console.log(`   Submissions: 0\n`);
      }
      break;

    default:
      console.error('Usage:');
      console.error('  node intake-form-handler.js read');
      console.error('  node intake-form-handler.js submit <formId> <responses.json>');
      console.error('  node intake-form-handler.js validate <formId> <responses.json>');
      console.error('  node intake-form-handler.js status <formId>');
      process.exit(1);
  }
}

main();
