const { z } = require('zod');

// Auth schemas
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Full name required'),
  companyName: z.string().min(2, 'Company name required'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

// Company schemas
const updateCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters').optional(),
});

// Project schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name required'),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'archived']).optional(),
});

// JTSA schemas
const createJTSASchema = z.object({
  taskDescription: z.string().min(10, 'Task description must be at least 10 characters'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(), // Defaults to today
});

const updateJTSASchema = z.object({
  taskDescription: z.string().min(10).optional(),
  status: z.enum(['in_progress', 'completed']).optional(),
});

const addParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

// Hazard schemas
const createHazardSchema = z.object({
  description: z.string().min(5, 'Hazard description required'),
  severity: z.enum(['low', 'medium', 'high']).optional(),
});

const acknowledgeHazardSchema = z.object({
  userAcknowledged: z.boolean(),
});

// Mitigation schemas
const createMitigationSchema = z.object({
  mitigationPlan: z.string().min(10, 'Mitigation plan must be at least 10 characters'),
});

const acceptMitigationSchema = z.object({
  userAccepted: z.boolean(),
});

// Company schemas
const inviteEmployeeSchema = z.object({
  email: z.string().email('Invalid email'),
  fullName: z.string().min(2, 'Full name required'),
  role: z.enum(['project_manager', 'safety_manager', 'employee']),
});

const updateCompanySchema = z.object({
  name: z.string().min(2).optional(),
});

// Auth accept-invite schema
const acceptInviteSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  token: z.string().min(8, 'Invalid token'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

// Pagination query params
const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z.string().optional(),
  date: z.string().optional(),
});

// Utility function to validate request data
const validate = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    return { success: false, errors: error.errors };
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createJTSASchema,
  updateJTSASchema,
  addParticipantSchema,
  createHazardSchema,
  acknowledgeHazardSchema,
  createMitigationSchema,
  acceptMitigationSchema,
  inviteEmployeeSchema,
  acceptInviteSchema,
  paginationSchema,
  updateCompanySchema,
  validate,
};
