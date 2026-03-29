/**
 * EXAMPLE: How to integrate AgentBriefingApproval into TaskDetailsPanel
 * This is a reference implementation showing the complete flow.
 */

import React, { useState, useEffect } from 'react';
import AgentBriefingApproval from './sections/AgentBriefingApproval';

export default function TaskDetailsPanelWithBriefing({ taskId, onClose }) {
  const [task, setTask] = useState(null);
  const [showBriefingApproval, setShowBriefingApproval] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      }
    } catch (err) {
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!task) {
    return <div className="p-6 text-center">Task not found</div>;
  }

  const { task: taskData, agent, agentBriefing } = task;

  // ============================================
  // BRIEFING APPROVAL HANDLERS
  // ============================================

  const handleBriefingApproved = async () => {
    console.log('✅ Briefing approved by user');
    
    // 1. Close the approval modal
    setShowBriefingApproval(false);
    
    // 2. Update task status to 'working' (agent will start execution)
    try {
      await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'working' }),
      });
      
      // 3. Reload task to show updated status
      loadTaskDetails();
      
      // 4. Optional: Show success notification
      console.log('Task moved to "working" status - agent execution started');
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleChangesRequested = async () => {
    console.log('📝 Changes requested - agent will revise briefing');
    
    // 1. Close the approval modal
    setShowBriefingApproval(false);
    
    // 2. Update task status to 'review' (agent redrafts briefing)
    try {
      await fetch(`http://localhost:3000/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'review' }),
      });
      
      // 3. Reload task
      loadTaskDetails();
      
      // 4. Optional: Notify agent (via message/email)
      console.log('Task returned to review - agent notified of changes needed');
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  return (
    <>
      {/* Main Task Details Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-300 shadow-lg overflow-y-auto z-40">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 p-4 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{taskData.title}</h2>
            <p className="text-xs text-gray-600 mt-1">
              {taskData.status.toUpperCase()} • {taskData.category || 'general'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Task Description */}
          <div>
            <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Description</p>
            <p className="text-sm text-gray-800">{taskData.description}</p>
          </div>

          {/* Agent Info */}
          {agent && (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs font-semibold text-blue-900 uppercase mb-2">Assigned To</p>
              <p className="text-sm font-medium text-blue-900">{agent.name}</p>
              <p className="text-xs text-blue-600 mt-1">{agent.specialty}</p>
            </div>
          )}

          {/* BRIEFING SECTION: Show briefing review button */}
          {agentBriefing && taskData.status === 'review' && (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-purple-900">✨ Execution Plan Ready</p>
                <span className="text-xs bg-purple-200 text-purple-900 px-2 py-1 rounded-full font-semibold">
                  Awaiting Approval
                </span>
              </div>
              <p className="text-xs text-purple-800 mb-3">
                Agent has submitted a detailed execution plan. Review and approve to start work.
              </p>
              <button
                onClick={() => setShowBriefingApproval(true)}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg text-sm font-semibold transition"
              >
                📋 Review Execution Plan
              </button>
            </div>
          )}

          {/* If briefing already approved */}
          {agentBriefing && taskData.status === 'working' && (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-xs font-semibold text-green-900 uppercase mb-1">✅ Plan Approved</p>
              <p className="text-xs text-green-700">
                Approved on {new Date(agentBriefing.approvedAt || new Date()).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Optional: Show existing briefing summary */}
          {agentBriefing && (
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase mb-2">Plan Summary</p>
              
              {agentBriefing.deliverables && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 font-medium">
                    📦 {agentBriefing.deliverables.length} Deliverables
                  </p>
                </div>
              )}
              
              {agentBriefing.milestones && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 font-medium">
                    🎯 {agentBriefing.milestones.length} Milestones
                  </p>
                </div>
              )}
              
              {agentBriefing.timeline && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 font-medium">⏱️ {agentBriefing.timeline}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* BRIEFING APPROVAL MODAL - Rendered on top */}
      {/* ============================================ */}
      {showBriefingApproval && agentBriefing && (
        <AgentBriefingApproval
          taskId={taskId}
          agentName={agent?.name || 'Agent'}
          briefing={agentBriefing}
          onApprove={() => {
            console.log('User clicked Approve');
            handleBriefingApproved();
          }}
          onRequestChanges={() => {
            console.log('User requested changes');
            handleChangesRequested();
          }}
          onClose={() => {
            console.log('User closed modal');
            setShowBriefingApproval(false);
          }}
        />
      )}
    </>
  );
}

/**
 * WORKFLOW DIAGRAM
 * 
 * Task Created
 *      ↓
 * Status: "review"
 *      ↓
 * Agent submits briefing → agentBriefing populated
 *      ↓
 * UI shows "Review Execution Plan" button
 *      ↓
 * User clicks button → AgentBriefingApproval modal opens
 *      ├─→ [APPROVE] → handleBriefingApproved() → status: "working" → agent executes
 *      └─→ [REQUEST CHANGES] → handleChangesRequested() → status: "review" → agent revises
 * 
 * SUCCESS PATH:
 * working → complete (when agent finishes)
 * 
 * REVISION PATH:
 * review → agent resubmits briefing → user reviews again → approve or request changes again
 */

/**
 * DATA STRUCTURE EXPECTED:
 * 
 * task = {
 *   task: {
 *     id: "task-123",
 *     title: "Build API",
 *     description: "Create REST API",
 *     status: "review",
 *     category: "development"
 *   },
 *   agent: {
 *     name: "Lucy",
 *     title: "Senior Developer",
 *     specialty: "Backend systems"
 *   },
 *   agentBriefing: {
 *     title: "API Development Plan",
 *     description: "Build RESTful API with authentication",
 *     deliverables: [
 *       { title: "Auth endpoints", description: "Login/logout/register" },
 *       { title: "API routes", description: "CRUD operations" },
 *       { title: "Tests", description: "Unit and integration tests" }
 *     ],
 *     milestones: [
 *       { title: "Auth setup", dueDate: "2026-03-20" },
 *       { title: "API complete", dueDate: "2026-03-25" },
 *       { title: "Testing done", dueDate: "2026-03-28" }
 *     ],
 *     timeline: "Week 1: Setup, Week 2: Implementation, Week 3: Testing",
 *     blockers: ["Database access needed", "Need third-party API keys"],
 *     estimatedHours: 40,
 *     approvedAt: null  // Set when user approves
 *   }
 * }
 */
