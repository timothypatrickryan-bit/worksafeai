/**
 * Task Validation Schema
 * 
 * Enforces consistent task structure and required fields.
 * Use when creating new tasks to ensure proper format.
 */

const Zod = require('zod');

// Enum of valid agent names
const VALID_AGENTS = [
  'Scout',      // Research specialist
  'Lucy',       // Orchestration & automation
  'Velma',      // QA & testing
  'Steven',     // Content & writing
  'Opus',       // Code review
  'Johnny',     // Design & UI
  'Laura',      // Brand strategy
];

// Task validation schema
const TaskSchema = Zod.z.object({
  id: Zod.z.string().optional(),  // Auto-generated if not provided
  title: Zod.z.string().min(5, 'Title must be at least 5 characters'),
  description: Zod.z.string().min(20, 'Description must be at least 20 characters'),
  projectId: Zod.z.string().regex(/^project-\d+$/, 'Invalid project ID format'),
  status: Zod.z.enum(['queued', 'in-progress', 'completed', 'blocked', 'archived']).default('queued'),
  
  // REQUIRED: Must assign task to someone
  assignedTo: Zod.z.enum(VALID_AGENTS)
    .describe('Required: Assign task to specific agent (Scout, Lucy, Velma, Steven, Opus, Johnny, Laura)'),
  
  priority: Zod.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimatedHours: Zod.z.number().positive().default(4),
  
  metadata: Zod.z.object({
    target: Zod.z.string().optional(),  // Email, person, system
    category: Zod.z.enum(['research', 'development', 'design', 'strategy', 'quality', 'automation']).optional(),
  }).optional(),
  
  createdAt: Zod.z.date().optional(),
  updatedAt: Zod.z.date().optional(),
});

// Validate a task
function validateTask(task) {
  try {
    const validated = TaskSchema.parse({
      ...task,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
    });
    return { valid: true, data: validated };
  } catch (err) {
    return { valid: false, errors: err.errors };
  }
}

// Create task with defaults
function createTask(input) {
  const validation = validateTask(input);
  
  if (!validation.valid) {
    const errorText = validation.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Task validation failed:\n${errorText}`);
  }
  
  return {
    id: input.id || `task-${Date.now()}`,
    ...validation.data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

module.exports = {
  TaskSchema,
  validateTask,
  createTask,
  VALID_AGENTS,
};
