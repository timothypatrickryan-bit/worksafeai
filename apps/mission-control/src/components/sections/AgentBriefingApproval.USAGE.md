# AgentBriefingApproval Component

## Overview

A glassmorphic React component for approving or requesting changes to agent execution plans in Mission Control. Displays task briefings with deliverables, milestones, timeline, and known blockers.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `taskId` | string | Yes | The task ID for API calls |
| `agentName` | string | No | Name of the agent submitting the plan (default: 'Agent') |
| `briefing` | object | No | Briefing data object (see structure below) |
| `onApprove` | function | No | Callback when user approves the plan |
| `onRequestChanges` | function | No | Callback when changes are requested |
| `onClose` | function | No | Callback to close the modal |

## Briefing Data Structure

```javascript
const briefing = {
  title: "Task Execution Plan",
  description: "What the agent will do",
  deliverables: [
    {
      title: "Deliverable name",
      description: "What will be delivered"
    }
  ],
  milestones: [
    {
      title: "Milestone name",
      dueDate: "2026-03-25"
    }
  ],
  timeline: "Phase 1: Research (2 days), Phase 2: Implementation (3 days), Phase 3: Testing (2 days)",
  blockers: [
    "Requires API access",
    "Dependent on other team"
  ],
  estimatedHours: 24
}
```

## Usage Example

```jsx
import AgentBriefingApproval from './sections/AgentBriefingApproval';

function TaskDetailsPanel({ taskId, agentBriefing }) {
  const [showApproval, setShowApproval] = useState(false);

  return (
    <div>
      {showApproval && (
        <AgentBriefingApproval
          taskId={taskId}
          agentName="Lucy"
          briefing={agentBriefing}
          onApprove={() => {
            console.log('Plan approved!');
            setShowApproval(false);
            // Trigger agent execution
          }}
          onRequestChanges={() => {
            console.log('Changes requested');
            setShowApproval(false);
            // Re-open briefing form
          }}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}
```

## API Endpoints Expected

The component makes POST requests to:

- `POST /api/tasks/{taskId}/briefing/approve` - Approve the briefing
- `POST /api/tasks/{taskId}/briefing/request-changes` - Request changes with feedback

## Design Features

- **Glassmorphic design** - Matches Mission Control's modern aesthetic with backdrop blur and transparency
- **Responsive layout** - Adapts to different screen sizes
- **Dual-mode actions** - "Approve & Execute" or "Request Changes" with inline feedback form
- **Visual hierarchy** - Uses emoji indicators and color coding for sections
- **Smooth transitions** - Hover effects and state changes feel polished

## Key Sections

1. **Header** - Task title, agent name, and close button
2. **Timeline Overview** - High-level timeline with estimated hours
3. **Deliverables** - Grid of deliverable items with descriptions
4. **Milestones** - List of milestones with due dates
5. **Blockers** - Warning section highlighting known blockers/dependencies
6. **Action Buttons** - Approve or request changes (with feedback form)

## State Management

The component internally manages:
- `loading` - Loading state during change requests
- `approving` - Loading state during approval
- `changeFeedback` - User feedback text for requested changes
- `showFeedbackForm` - Whether to show the feedback input form

## Notes

- All API calls include timestamps (ISO format)
- The component is self-contained and doesn't require Redux or Context
- Close button and Cancel button both dismiss the modal
- Feedback is required before sending change requests
