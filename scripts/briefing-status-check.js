#!/usr/bin/env node

/**
 * Briefing Status Check
 * Reports pending approvals that need Tim's attention
 * Can be displayed on dashboard or sent as notification
 * 
 * Usage: node scripts/briefing-status-check.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const WORKSPACE = path.join(__dirname, '..');

function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function checkBriefingStatus() {
  try {
    const result = await apiCall('GET', '/api/briefings');
    if (result.status !== 200) {
      console.log('❌ Unable to fetch briefings');
      process.exit(1);
    }

    const briefings = result.data.briefings || [];
    
    // Separate by status
    const awaitingApproval = briefings.filter(b => b.status === 'awaiting-approval');
    const awaitingResponse = briefings.filter(b => b.actionRequired === 'Respond');
    const approved = briefings.filter(b => b.status === 'approved');
    const complete = briefings.filter(b => b.status === 'feedback-received');

    // Display summary
    console.log('\n' + '═'.repeat(60));
    console.log('📋 BRIEFING STATUS SUMMARY');
    console.log('═'.repeat(60) + '\n');

    if (awaitingApproval.length > 0) {
      console.log(`⚠️  AWAITING YOUR APPROVAL (${awaitingApproval.length}):`);
      awaitingApproval.forEach((b, i) => {
        console.log(`   [${i + 1}] ${b.title}`);
        console.log(`       Type: ${b.type} | Est: ${b.description?.substring(0, 40)}...`);
        console.log(`       Created: ${new Date(b.timestamp).toLocaleString()}`);
      });
      console.log();
    }

    if (awaitingResponse.length > 0) {
      console.log(`❓ AWAITING YOUR RESPONSE (${awaitingResponse.length}):`);
      awaitingResponse.forEach((b, i) => {
        console.log(`   [${i + 1}] ${b.title}`);
        console.log(`       Status Request requiring your input`);
      });
      console.log();
    }

    if (approved.length > 0) {
      console.log(`✅ APPROVED & EXECUTING (${approved.length}):`);
      approved.forEach((b, i) => {
        console.log(`   [${i + 1}] ${b.title}`);
      });
      console.log();
    }

    if (complete.length > 0) {
      console.log(`📝 COMPLETED (${complete.length}):`);
      complete.forEach((b, i) => {
        console.log(`   [${i + 1}] ${b.title}`);
      });
      console.log();
    }

    // Summary
    console.log('─'.repeat(60));
    console.log(`📊 TOTAL: ${briefings.length} briefings`);
    console.log(`   Pending approval: ${awaitingApproval.length}`);
    console.log(`   Pending response: ${awaitingResponse.length}`);
    console.log(`   Approved: ${approved.length}`);
    console.log(`   Completed: ${complete.length}`);
    console.log('═'.repeat(60) + '\n');

    // Action items
    if (awaitingApproval.length > 0 || awaitingResponse.length > 0) {
      console.log('🎯 ACTION REQUIRED:');
      if (awaitingApproval.length > 0) {
        console.log(`   → Approve or reject ${awaitingApproval.length} briefing(s) at http://localhost:3001`);
      }
      if (awaitingResponse.length > 0) {
        console.log(`   → Respond to ${awaitingResponse.length} question(s) at http://localhost:3001`);
      }
      console.log();
    }

    process.exit(awaitingApproval.length > 0 || awaitingResponse.length > 0 ? 1 : 0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  checkBriefingStatus();
}

module.exports = { checkBriefingStatus };
