#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const stateFilePath = path.join(__dirname, '..', '.mission-control-state.json')

// Read current state
const stateData = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'))

// Initialize gapAnalysis structure with scores from March 24, 2026 assessment
// Scores on 5-point scale: 1-5 (1=Not Started, 5=Fully Achieved)
const gapAnalysis = {
  lastUpdated: new Date().toISOString(),
  assessmentDate: '2026-03-24',
  assessmentMethod: 'Daily Gap Analysis Review (system-focused)',
  swimlanes: {
    autonomy: {
      score: 2.6, // 5.2/10 converted to 5-point scale
      trend: 'improving',
      status: 'in-progress',
      description: 'Agents making routine decisions independently; edge cases escalated'
    },
    value: {
      score: 2.55, // 5.1/10 converted
      trend: 'improving',
      status: 'in-progress',
      description: '3 automations deployed; email formatting fixed'
    },
    organization: {
      score: 2.25, // 4.5/10 converted
      trend: 'stable',
      status: 'in-progress',
      description: 'Agent roles clear; coordination structure missing'
    },
    scale: {
      score: 2.25, // 4.5/10 converted
      trend: 'improving',
      status: 'in-progress',
      description: 'Can onboard agents; no standard process yet'
    },
    reliability: {
      score: 2.1, // 4.2/10 converted
      trend: 'improving',
      status: 'in-progress',
      description: 'Backup system in place; monitoring working'
    },
    human: {
      score: 2.0, // 4.0/10 converted
      trend: 'stable',
      status: 'in-progress',
      description: 'Full visibility in dashboard; decision logging needed'
    }
  },
  overallScore: 2.27, // Average of all swimlanes
  overallHealth: 'YELLOW',
  topPriority: {
    swimlane: 'value',
    gap: 'Email HTML rendering blocking premium newsletter delivery',
    effort: '30 minutes',
    status: 'pending-remediation'
  }
}

// Update state file
stateData.gapAnalysis = gapAnalysis
stateData.lastUpdate = new Date().toISOString()

fs.writeFileSync(stateFilePath, JSON.stringify(stateData, null, 2), 'utf8')

console.log('✅ Gap Analysis initialized in state file')
console.log(`   Overall Health: ${gapAnalysis.overallHealth}`)
console.log(`   Overall Score: ${gapAnalysis.overallScore.toFixed(2)}/5`)
console.log(`   Top Priority: ${gapAnalysis.topPriority.gap}`)
console.log(`   Swimlanes: ${Object.keys(gapAnalysis.swimlanes).length} configured`)
