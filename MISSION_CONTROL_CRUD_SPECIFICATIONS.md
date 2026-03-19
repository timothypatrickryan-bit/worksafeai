# Mission Control CRUD Specifications
## Comprehensive Work Specifications for Project & Task Management UIs

**Version:** 1.0  
**Date:** 2026-03-19  
**Status:** Ready for Team Delegation  
**Estimated Total Effort:** 72-88 hours  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Project CRUD Workflows](#project-crud-workflows)
4. [Task CRUD Workflows](#task-crud-workflows)
5. [Component Structure](#component-structure)
6. [API Specifications](#api-specifications)
7. [State Management](#state-management)
8. [Validation Rules](#validation-rules)
9. [Sample Data Initialization](#sample-data-initialization)
10. [Effort Estimates & Dependencies](#effort-estimates--dependencies)

---

## Executive Summary

This document provides ready-to-implement specifications for a Mission Control interface supporting full CRUD operations on Projects and Tasks. The design follows React best practices with proper state management, form validation, error handling, and API integration patterns.

**Key Deliverables:**
- 6 Modal/Form components (Project Create/Edit/Delete, Task Create/Edit/Delete)
- 2 Modal containers (confirmation dialogs)
- Unified API client with standardized error handling
- Complete Redux/Zustand state slices
- Sample data initialization script
- Full validation schema

**Target Platforms:** Web (responsive), Desktop (Electron optional)

---

## Architecture Overview

### Tech Stack
- **React 18+** with TypeScript
- **State Management:** Zustand (lightweight) or Redux Toolkit (flexible)
- **Forms:** React Hook Form + Zod for validation
- **HTTP Client:** Axios with interceptors
- **UI Components:** Headless UI / Radix + Tailwind CSS
- **Database:** Supabase PostgreSQL (assumed backend)

### Directory Structure

```
src/
├── components/
│   ├── modals/
│   │   ├── ProjectCreateModal.tsx
│   │   ├── ProjectEditModal.tsx
│   │   ├── ProjectDeleteConfirm.tsx
│   │   ├── TaskCreateModal.tsx
│   │   ├── TaskEditModal.tsx
│   │   └── TaskDeleteConfirm.tsx
│   ├── forms/
│   │   ├── ProjectForm.tsx
│   │   └── TaskForm.tsx
│   └── common/
│       └── ConfirmationDialog.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useTasks.ts
│   └── useFormState.ts
├── api/
│   ├── client.ts
│   ├── projectApi.ts
│   └── taskApi.ts
├── store/
│   ├── projectSlice.ts
│   ├── taskSlice.ts
│   ├── modalSlice.ts
│   └── store.ts
├── schemas/
│   ├── projectSchema.ts
│   └── taskSchema.ts
└── types/
    ├── models.ts
    └── api.ts
```

---

## Project CRUD Workflows

### 1. PROJECT CREATION WORKFLOW

#### 1.1 Component: ProjectCreateModal

**File:** `src/components/modals/ProjectCreateModal.tsx`

**Props:**
```typescript
interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}
```

**Component Code Stub:**
```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectCreateSchema } from '@/schemas/projectSchema';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { useProjects } from '@/hooks/useProjects';

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createProject, isLoading, error } = useProjects();
  
  const form = useForm({
    resolver: zodResolver(projectCreateSchema),
    defaultValues: {
      name: '',
      description: '',
      owner_id: '',
      status: 'active',
    },
  });

  const onSubmit = async (data: ProjectCreateData) => {
    try {
      const result = await createProject(data);
      form.reset();
      onClose();
      onSuccess?.(result);
    } catch (err) {
      form.setError('root', { message: 'Failed to create project' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
        <ProjectForm
          form={form}
          isLoading={isLoading}
          error={error}
          onSubmit={onSubmit}
          submitLabel="Create Project"
        />
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

#### 1.2 Validation Schema

**File:** `src/schemas/projectSchema.ts`

```typescript
import { z } from 'zod';

export const projectCreateSchema = z.object({
  name: z.string()
    .min(1, 'Project name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  
  owner_id: z.string()
    .uuid('Invalid owner ID')
    .min(1, 'Owner is required'),
  
  status: z.enum(['active', 'archived', 'draft'])
    .default('active'),
});

export type ProjectCreateData = z.infer<typeof projectCreateSchema>;
```

#### 1.3 API Endpoint

**Method:** `POST`  
**Path:** `/api/v1/projects`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 100 req/min per user

**Request Payload:**
```json
{
  "name": "Q2 Safety Initiative",
  "description": "Quarterly safety audit and training program",
  "owner_id": "uuid-here",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "id": "proj_abc123",
  "name": "Q2 Safety Initiative",
  "description": "Quarterly safety audit and training program",
  "owner_id": "uuid-here",
  "status": "active",
  "created_at": "2026-03-19T12:00:00Z",
  "updated_at": "2026-03-19T12:00:00Z",
  "task_count": 0
}
```

**Error Responses:**
```json
// 400 Bad Request
{
  "error": "VALIDATION_ERROR",
  "details": {
    "name": "Name must be at least 3 characters"
  }
}

// 409 Conflict
{
  "error": "PROJECT_EXISTS",
  "message": "Project with this name already exists"
}

// 401 Unauthorized
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

---

### 2. PROJECT EDIT WORKFLOW

#### 2.1 Component: ProjectEditModal

**File:** `src/components/modals/ProjectEditModal.tsx`

**Props:**
```typescript
interface ProjectEditModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}
```

**Component Code Stub:**
```typescript
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectEditSchema } from '@/schemas/projectSchema';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { useProjects } from '@/hooks/useProjects';

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}) => {
  const { updateProject, getProject, isLoading, error } = useProjects();
  
  const form = useForm({
    resolver: zodResolver(projectEditSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  });

  useEffect(() => {
    if (isOpen && projectId) {
      getProject(projectId).then(project => {
        form.reset({
          name: project.name,
          description: project.description || '',
          status: project.status,
        });
      });
    }
  }, [isOpen, projectId]);

  const onSubmit = async (data: ProjectEditData) => {
    try {
      const result = await updateProject(projectId, data);
      onClose();
      onSuccess?.(result);
    } catch (err) {
      form.setError('root', { message: 'Failed to update project' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Project</h2>
        <ProjectForm
          form={form}
          isLoading={isLoading}
          error={error}
          onSubmit={onSubmit}
          submitLabel="Update Project"
        />
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

#### 2.2 Edit Validation Schema

```typescript
export const projectEditSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  
  status: z.enum(['active', 'archived', 'draft'])
    .optional(),
}).refine(
  obj => Object.keys(obj).length > 0,
  { message: 'At least one field must be updated' }
);

export type ProjectEditData = z.infer<typeof projectEditSchema>;
```

#### 2.3 API Endpoint

**Method:** `PATCH`  
**Path:** `/api/v1/projects/:projectId`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 100 req/min per user

**Request Payload:** (partial update — all fields optional)
```json
{
  "name": "Q2 Safety Initiative - Updated",
  "description": "Updated description",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "id": "proj_abc123",
  "name": "Q2 Safety Initiative - Updated",
  "description": "Updated description",
  "owner_id": "uuid-here",
  "status": "active",
  "created_at": "2026-03-19T12:00:00Z",
  "updated_at": "2026-03-19T13:30:00Z",
  "task_count": 5
}
```

---

### 3. PROJECT DELETE WORKFLOW

#### 3.1 Component: ProjectDeleteConfirm

**File:** `src/components/modals/ProjectDeleteConfirm.tsx`

**Props:**
```typescript
interface ProjectDeleteConfirmProps {
  isOpen: boolean;
  projectId: string;
  projectName: string;
  taskCount: number;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}
```

**Component Code Stub:**
```typescript
import React from 'react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useProjects } from '@/hooks/useProjects';

export const ProjectDeleteConfirm: React.FC<ProjectDeleteConfirmProps> = ({
  isOpen,
  projectId,
  projectName,
  taskCount,
  onClose,
  onConfirm,
}) => {
  const { deleteProject, isLoading } = useProjects();

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      onClose();
      onConfirm();
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Delete Project"
      isDangerous={true}
      isLoading={isLoading}
      onClose={onClose}
      onConfirm={handleDelete}
    >
      <div className="space-y-3">
        <p>
          Are you sure you want to delete <strong>{projectName}</strong>?
        </p>
        
        {taskCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This project has {taskCount} associated tasks.
            </p>
            <p className="text-sm text-red-700 mt-1">
              Deleting this project will:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside mt-2">
              <li>Archive all {taskCount} tasks</li>
              <li>Remove task-project associations</li>
              <li>Preserve task history and assignments</li>
            </ul>
          </div>
        )}
        
        <p className="text-sm text-gray-600">
          This action cannot be undone.
        </p>
      </div>
    </ConfirmationDialog>
  );
};
```

#### 3.2 Cascade Rules & Business Logic

**Deletion Cascade Behavior:**

| Action | Rule |
|--------|------|
| Delete Project | Archive project (soft delete), set status to 'deleted' |
| Associated Tasks | Set `project_id = NULL`, archive task, emit audit event |
| Task Assignments | Preserve assignment records (archived) |
| Audit Trail | Log deletion with user_id, timestamp, project_id |
| Data Retention | Keep soft-deleted records for 90 days before hard delete |

**Soft Delete Implementation:**
```sql
-- Instead of actual deletion
UPDATE projects 
SET status = 'deleted', 
    deleted_at = NOW(),
    updated_at = NOW()
WHERE id = $1
  AND owner_id = $2;

-- Cascade to tasks
UPDATE tasks 
SET project_id = NULL, 
    status = 'archived',
    updated_at = NOW()
WHERE project_id = $1;
```

#### 3.3 API Endpoint

**Method:** `DELETE`  
**Path:** `/api/v1/projects/:projectId`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 10 req/min per user (destructive)

**Query Parameters:**
```
?confirm=true  (required confirmation flag)
?cascade=true  (default: true, archive related tasks)
```

**Request Payload:** (optional — confirmation body)
```json
{
  "reason": "Project completed",
  "confirm": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "project_id": "proj_abc123",
  "archived_task_count": 5,
  "deleted_at": "2026-03-19T14:00:00Z"
}
```

**Error Responses:**
```json
// 403 Forbidden (not owner)
{
  "error": "FORBIDDEN",
  "message": "You don't have permission to delete this project"
}

// 404 Not Found
{
  "error": "NOT_FOUND",
  "message": "Project not found"
}

// 422 Unprocessable Entity (cascade failure)
{
  "error": "CASCADE_FAILED",
  "message": "Failed to archive dependent tasks",
  "details": {
    "task_ids": ["task_123", "task_124"]
  }
}
```

---

## Task CRUD Workflows

### 4. TASK CREATION WORKFLOW

#### 4.1 Component: TaskCreateModal

**File:** `src/components/modals/TaskCreateModal.tsx`

**Props:**
```typescript
interface TaskCreateModalProps {
  isOpen: boolean;
  projectId?: string; // Pre-select project
  onClose: () => void;
  onSuccess?: (task: Task) => void;
}
```

**Component Code Stub:**
```typescript
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskCreateSchema } from '@/schemas/taskSchema';
import { TaskForm } from '@/components/forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}) => {
  const { createTask, isLoading, error } = useTasks();
  const { projects } = useProjects();

  const form = useForm({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: {
      title: '',
      description: '',
      project_id: projectId || '',
      assignee_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: null,
    },
  });

  useEffect(() => {
    if (projectId) {
      form.setValue('project_id', projectId);
    }
  }, [projectId, form]);

  const onSubmit = async (data: TaskCreateData) => {
    try {
      const result = await createTask(data);
      form.reset();
      onClose();
      onSuccess?.(result);
    } catch (err) {
      form.setError('root', { message: 'Failed to create task' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
        <TaskForm
          form={form}
          isLoading={isLoading}
          error={error}
          projects={projects}
          onSubmit={onSubmit}
          submitLabel="Create Task"
        />
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

#### 4.2 Task Form Component

**File:** `src/components/forms/TaskForm.tsx`

```typescript
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TaskCreateData } from '@/schemas/taskSchema';

interface TaskFormProps {
  form: UseFormReturn<TaskCreateData>;
  isLoading: boolean;
  error?: string | null;
  projects: Project[];
  assignees?: User[];
  onSubmit: (data: TaskCreateData) => Promise<void>;
  submitLabel: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  form,
  isLoading,
  error,
  projects,
  assignees = [],
  onSubmit,
  submitLabel,
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = form;
  const selectedProjectId = watch('project_id');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g., Complete safety audit"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          placeholder="Task details and context"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Project Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          {...register('project_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <p className="text-red-500 text-sm mt-1">{errors.project_id.message}</p>
        )}
      </div>

      {/* Assignee Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assign To
        </label>
        <select
          {...register('assignee_id')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Unassigned</option>
          {assignees.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Priority
        </label>
        <select
          {...register('priority')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          {...register('status')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          {...register('due_date')}
          type="date"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.due_date && (
          <p className="text-red-500 text-sm mt-1">{errors.due_date.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Creating...' : submitLabel}
      </button>
    </form>
  );
};
```

#### 4.3 Task Validation Schema

**File:** `src/schemas/taskSchema.ts`

```typescript
import { z } from 'zod';

export const taskCreateSchema = z.object({
  title: z.string()
    .min(1, 'Task title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  
  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  
  project_id: z.string()
    .uuid('Invalid project ID')
    .min(1, 'Project is required'),
  
  assignee_id: z.string()
    .uuid('Invalid assignee ID')
    .optional(),
  
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .default('medium'),
  
  status: z.enum(['todo', 'in_progress', 'review', 'done'])
    .default('todo'),
  
  due_date: z.date()
    .refine(
      date => date > new Date(),
      { message: 'Due date must be in the future' }
    )
    .optional(),
});

export type TaskCreateData = z.infer<typeof taskCreateSchema>;
```

#### 4.4 API Endpoint

**Method:** `POST`  
**Path:** `/api/v1/tasks`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 100 req/min per user

**Request Payload:**
```json
{
  "title": "Complete safety audit for Building A",
  "description": "Comprehensive safety review and documentation",
  "project_id": "proj_abc123",
  "assignee_id": "user_xyz789",
  "priority": "high",
  "status": "todo",
  "due_date": "2026-04-15"
}
```

**Response (201 Created):**
```json
{
  "id": "task_def456",
  "title": "Complete safety audit for Building A",
  "description": "Comprehensive safety review and documentation",
  "project_id": "proj_abc123",
  "assignee_id": "user_xyz789",
  "priority": "high",
  "status": "todo",
  "due_date": "2026-04-15",
  "created_at": "2026-03-19T12:00:00Z",
  "updated_at": "2026-03-19T12:00:00Z",
  "created_by": "user_current",
  "comments_count": 0
}
```

---

### 5. TASK EDIT WORKFLOW

#### 5.1 Component: TaskEditModal

**File:** `src/components/modals/TaskEditModal.tsx`

```typescript
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskEditSchema } from '@/schemas/taskSchema';
import { TaskForm } from '@/components/forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

interface TaskEditModalProps {
  isOpen: boolean;
  taskId: string;
  onClose: () => void;
  onSuccess?: (task: Task) => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  taskId,
  onClose,
  onSuccess,
}) => {
  const { updateTask, getTask, isLoading, error } = useTasks();
  const { projects } = useProjects();

  const form = useForm({
    resolver: zodResolver(taskEditSchema),
    defaultValues: {
      title: '',
      description: '',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: null,
    },
  });

  useEffect(() => {
    if (isOpen && taskId) {
      getTask(taskId).then(task => {
        form.reset({
          title: task.title,
          description: task.description || '',
          project_id: task.project_id,
          assignee_id: task.assignee_id || '',
          priority: task.priority,
          status: task.status,
          due_date: task.due_date ? new Date(task.due_date) : null,
        });
      });
    }
  }, [isOpen, taskId]);

  const onSubmit = async (data: TaskEditData) => {
    try {
      const result = await updateTask(taskId, data);
      onClose();
      onSuccess?.(result);
    } catch (err) {
      form.setError('root', { message: 'Failed to update task' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
        <TaskForm
          form={form}
          isLoading={isLoading}
          error={error}
          projects={projects}
          onSubmit={onSubmit}
          submitLabel="Update Task"
        />
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

#### 5.2 Edit Validation Schema

```typescript
export const taskEditSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  
  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  
  project_id: z.string()
    .uuid('Invalid project ID')
    .optional(),
  
  assignee_id: z.string()
    .uuid('Invalid assignee ID')
    .optional()
    .nullable(),
  
  priority: z.enum(['low', 'medium', 'high', 'critical'])
    .optional(),
  
  status: z.enum(['todo', 'in_progress', 'review', 'done'])
    .optional(),
  
  due_date: z.date()
    .refine(
      date => date > new Date(),
      { message: 'Due date must be in the future' }
    )
    .optional()
    .nullable(),
}).refine(
  obj => Object.keys(obj).some(key => obj[key] !== undefined),
  { message: 'At least one field must be updated' }
);

export type TaskEditData = Partial<TaskCreateData>;
```

#### 5.3 API Endpoint — Partial Updates

**Method:** `PATCH`  
**Path:** `/api/v1/tasks/:taskId`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 100 req/min per user

**Request Payload:** (all fields optional, partial update)
```json
{
  "status": "in_progress",
  "assignee_id": "user_new789",
  "priority": "critical"
}
```

**Response (200 OK):**
```json
{
  "id": "task_def456",
  "title": "Complete safety audit for Building A",
  "description": "Comprehensive safety review and documentation",
  "project_id": "proj_abc123",
  "assignee_id": "user_new789",
  "priority": "critical",
  "status": "in_progress",
  "due_date": "2026-04-15",
  "created_at": "2026-03-19T12:00:00Z",
  "updated_at": "2026-03-19T14:15:30Z",
  "created_by": "user_original",
  "updated_by": "user_current"
}
```

**Full Update Behavior:**
```typescript
// Backend logic for PATCH
export const patchTask = (taskId, updates) => {
  // Only update fields that are explicitly provided
  const validUpdates = Object.fromEntries(
    Object.entries(updates).filter(([_, v]) => v !== undefined)
  );
  
  // Merge with existing data
  return db.tasks.update(taskId, validUpdates);
};
```

---

### 6. TASK DELETE WORKFLOW

#### 6.1 Component: TaskDeleteConfirm

**File:** `src/components/modals/TaskDeleteConfirm.tsx`

```typescript
import React from 'react';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { useTasks } from '@/hooks/useTasks';

interface TaskDeleteConfirmProps {
  isOpen: boolean;
  taskId: string;
  taskTitle: string;
  assignee?: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const TaskDeleteConfirm: React.FC<TaskDeleteConfirmProps> = ({
  isOpen,
  taskId,
  taskTitle,
  assignee,
  onClose,
  onConfirm,
}) => {
  const { deleteTask, isLoading } = useTasks();

  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      onClose();
      onConfirm();
    } catch (err) {
      // Error handled by hook
    }
  };

  if (!isOpen) return null;

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Delete Task"
      isDangerous={true}
      isLoading={isLoading}
      onClose={onClose}
      onConfirm={handleDelete}
    >
      <div className="space-y-3">
        <p>
          Are you sure you want to delete <strong>{taskTitle}</strong>?
        </p>
        
        {assignee && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Assigned to:</strong> {assignee}
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              The assignee will no longer see this task.
            </p>
          </div>
        )}
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>What happens:</strong>
          </p>
          <ul className="text-sm text-blue-700 list-disc list-inside mt-2">
            <li>Task status changes to 'deleted'</li>
            <li>Comments and history are archived</li>
            <li>Assignment records are preserved (for audit)</li>
          </ul>
        </div>
        
        <p className="text-sm text-gray-600">
          This action cannot be undone.
        </p>
      </div>
    </ConfirmationDialog>
  );
};
```

#### 6.2 Impact Analysis

**Deletion Rules & Impact:**

| Entity | Action | Impact |
|--------|--------|--------|
| Task | Soft delete (status = 'deleted') | Task hidden from normal views |
| Assignments | Preserved (archived) | Audit trail remains intact |
| Comments | Archived | Historical context retained |
| Notifications | Cleared | Assignee no longer notified |
| Project Tasks Count | Decremented | Project task_count updated |
| Timeline | Logged | Deletion timestamp recorded |

#### 6.3 API Endpoint

**Method:** `DELETE`  
**Path:** `/api/v1/tasks/:taskId`  
**Auth:** Bearer token (JWT)  
**Rate Limit:** 10 req/min per user

**Query Parameters:**
```
?confirm=true     (required)
?cascade=false    (default: false, don't delete comments)
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "task_id": "task_def456",
  "archived_comments": 3,
  "deleted_at": "2026-03-19T15:00:00Z"
}
```

**Error Responses:**
```json
// 403 Forbidden
{
  "error": "FORBIDDEN",
  "message": "Only task creator or project owner can delete this task"
}

// 409 Conflict
{
  "error": "TASK_IN_REVIEW",
  "message": "Cannot delete task while it's in 'review' status"
}
```

---

## Component Structure

### Component Dependency Tree

```
App
├── ProjectCreateModal
│   └── ProjectForm
├── ProjectEditModal
│   └── ProjectForm
├── ProjectDeleteConfirm
│   └── ConfirmationDialog
├── TaskCreateModal
│   └── TaskForm
├── TaskEditModal
│   └── TaskForm
└── TaskDeleteConfirm
    └── ConfirmationDialog
```

### Common Components

#### ConfirmationDialog

**File:** `src/components/common/ConfirmationDialog.tsx`

```typescript
import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  isDangerous = false,
  isLoading = false,
  children,
  onClose,
  onConfirm,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        
        <div className="mb-6">
          {children}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## API Specifications

### Base Configuration

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.missioncontrol.local/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

export const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle errors globally
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Client Methods

**File:** `src/api/projectApi.ts`

```typescript
import { client } from './client';

export const projectApi = {
  async create(data: ProjectCreateData): Promise<Project> {
    const { data: response } = await client.post('/projects', data);
    return response;
  },

  async getById(projectId: string): Promise<Project> {
    const { data } = await client.get(`/projects/${projectId}`);
    return data;
  },

  async list(filters?: { status?: string }): Promise<Project[]> {
    const { data } = await client.get('/projects', { params: filters });
    return data;
  },

  async update(projectId: string, data: ProjectEditData): Promise<Project> {
    const { data: response } = await client.patch(`/projects/${projectId}`, data);
    return response;
  },

  async delete(projectId: string): Promise<void> {
    await client.delete(`/projects/${projectId}`, {
      params: { confirm: true },
    });
  },
};
```

**File:** `src/api/taskApi.ts`

```typescript
import { client } from './client';

export const taskApi = {
  async create(data: TaskCreateData): Promise<Task> {
    const { data: response } = await client.post('/tasks', data);
    return response;
  },

  async getById(taskId: string): Promise<Task> {
    const { data } = await client.get(`/tasks/${taskId}`);
    return data;
  },

  async list(filters?: { project_id?: string; status?: string }): Promise<Task[]> {
    const { data } = await client.get('/tasks', { params: filters });
    return data;
  },

  async update(taskId: string, data: TaskEditData): Promise<Task> {
    const { data: response } = await client.patch(`/tasks/${taskId}`, data);
    return response;
  },

  async delete(taskId: string): Promise<void> {
    await client.delete(`/tasks/${taskId}`, {
      params: { confirm: true },
    });
  },
};
```

### Error Handling Pattern

```typescript
// Standardized error response types
export interface ApiErrorResponse {
  error: string; // Error code (e.g., "VALIDATION_ERROR")
  message: string; // User-friendly message
  details?: Record<string, any>; // Field-level errors or additional context
  timestamp: string; // ISO timestamp
}

// Utility to parse API errors
export const parseApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
```

---

## State Management

### Zustand Store (Recommended for this use case)

**File:** `src/store/projectSlice.ts`

```typescript
import { create } from 'zustand';
import { projectApi } from '@/api/projectApi';

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (data: ProjectCreateData) => Promise<Project>;
  updateProject: (id: string, data: ProjectEditData) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectApi.list();
      set({ projects, error: null });
    } catch (error) {
      set({ error: parseApiError(error), projects: [] });
    } finally {
      set({ loading: false });
    }
  },

  createProject: async (data) => {
    set({ loading: true });
    try {
      const project = await projectApi.create(data);
      set(state => ({
        projects: [...state.projects, project],
        error: null,
      }));
      return project;
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true });
    try {
      const updated = await projectApi.update(id, data);
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updated : p),
        error: null,
      }));
      return updated;
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await projectApi.delete(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

**File:** `src/store/taskSlice.ts`

```typescript
import { create } from 'zustand';
import { taskApi } from '@/api/taskApi';

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: (filters?: { project_id?: string }) => Promise<void>;
  createTask: (data: TaskCreateData) => Promise<Task>;
  updateTask: (id: string, data: TaskEditData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (filters) => {
    set({ loading: true });
    try {
      const tasks = await taskApi.list(filters);
      set({ tasks, error: null });
    } catch (error) {
      set({ error: parseApiError(error), tasks: [] });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (data) => {
    set({ loading: true });
    try {
      const task = await taskApi.create(data);
      set(state => ({
        tasks: [...state.tasks, task],
        error: null,
      }));
      return task;
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, data) => {
    set({ loading: true });
    try {
      const updated = await taskApi.update(id, data);
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updated : t),
        error: null,
      }));
      return updated;
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id) => {
    set({ loading: true });
    try {
      await taskApi.delete(id);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: parseApiError(error) });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
```

### Custom Hooks

**File:** `src/hooks/useProjects.ts`

```typescript
import { useProjectStore } from '@/store/projectSlice';

export const useProjects = () => {
  const store = useProjectStore();
  
  return {
    projects: store.projects,
    isLoading: store.loading,
    error: store.error,
    fetchProjects: store.fetchProjects,
    createProject: store.createProject,
    getProject: (id: string) => store.projects.find(p => p.id === id),
    updateProject: store.updateProject,
    deleteProject: store.deleteProject,
    clearError: store.clearError,
  };
};
```

**File:** `src/hooks/useTasks.ts`

```typescript
import { useTaskStore } from '@/store/taskSlice';

export const useTasks = () => {
  const store = useTaskStore();
  
  return {
    tasks: store.tasks,
    isLoading: store.loading,
    error: store.error,
    fetchTasks: store.fetchTasks,
    createTask: store.createTask,
    getTask: (id: string) => store.tasks.find(t => t.id === id),
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    clearError: store.clearError,
  };
};
```

---

## Validation Rules

### Project Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| name | Required, 3-100 chars | "Name must be 3-100 characters" |
| description | Optional, max 500 chars | "Description max 500 characters" |
| owner_id | Required UUID | "Owner ID is invalid" |
| status | One of: active, archived, draft | "Invalid status" |

**Server-Side Validation:**
```sql
-- PostgreSQL constraints
ALTER TABLE projects ADD CONSTRAINT project_name_length 
  CHECK (length(name) >= 3 AND length(name) <= 100);

ALTER TABLE projects ADD CONSTRAINT project_status_valid 
  CHECK (status IN ('active', 'archived', 'draft'));

ALTER TABLE projects ADD CONSTRAINT project_owner_exists 
  FOREIGN KEY (owner_id) REFERENCES users(id);
```

### Task Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| title | Required, 5-200 chars | "Title must be 5-200 characters" |
| description | Optional, max 2000 chars | "Description max 2000 characters" |
| project_id | Required UUID | "Project ID is invalid" |
| assignee_id | Optional UUID | "Assignee ID is invalid" |
| priority | One of: low, medium, high, critical | "Invalid priority" |
| status | One of: todo, in_progress, review, done | "Invalid status" |
| due_date | Optional, future date | "Due date must be in future" |

---

## Sample Data Initialization

### Sample Data Script

**File:** `scripts/init-sample-data.ts`

```typescript
import { client } from '@/api/client';
import { ProjectCreateData } from '@/schemas/projectSchema';
import { TaskCreateData } from '@/schemas/taskSchema';

const ADMIN_USER_ID = '550e8400-e29b-41d4-a716-446655440000'; // Mock UUID

const SAMPLE_PROJECTS: ProjectCreateData[] = [
  {
    name: 'Q2 Safety Audit',
    description: 'Quarterly safety assessment across all facilities',
    owner_id: ADMIN_USER_ID,
    status: 'active',
  },
  {
    name: 'Equipment Maintenance',
    description: 'Preventive maintenance schedule for industrial equipment',
    owner_id: ADMIN_USER_ID,
    status: 'active',
  },
  {
    name: 'Employee Training Program',
    description: 'Annual safety and compliance training initiative',
    owner_id: ADMIN_USER_ID,
    status: 'draft',
  },
];

const SAMPLE_TASKS_BY_PROJECT: Record<number, TaskCreateData[]> = {
  0: [ // Q2 Safety Audit tasks
    {
      title: 'Inspect Building A electrical systems',
      description: 'Check all electrical panels, breakers, and grounding',
      project_id: '', // Will be filled after project creation
      assignee_id: '',
      priority: 'high',
      status: 'todo',
      due_date: new Date('2026-04-10'),
    },
    {
      title: 'Review safety documentation',
      description: 'Audit all safety procedures and documentation',
      project_id: '',
      assignee_id: '',
      priority: 'high',
      status: 'in_progress',
      due_date: new Date('2026-04-05'),
    },
  ],
  1: [ // Equipment Maintenance tasks
    {
      title: 'Calibrate pressure gauges',
      description: 'Monthly calibration of all pressure measurement devices',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: new Date('2026-03-25'),
    },
    {
      title: 'Oil change for hydraulic systems',
      description: 'Scheduled oil change and filter replacement',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      status: 'done',
      due_date: new Date('2026-03-20'),
    },
    {
      title: 'Inspect conveyor belt system',
      description: 'Check for wear, alignment, and safety guards',
      project_id: '',
      assignee_id: '',
      priority: 'high',
      status: 'review',
      due_date: new Date('2026-04-15'),
    },
  ],
  2: [ // Employee Training tasks
    {
      title: 'Schedule training sessions',
      description: 'Plan and book training instructor and facility',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: new Date('2026-04-01'),
    },
    {
      title: 'Prepare training materials',
      description: 'Create slides, handouts, and assessment materials',
      project_id: '',
      assignee_id: '',
      priority: 'high',
      status: 'todo',
      due_date: new Date('2026-04-05'),
    },
  ],
};

export async function initializeSampleData() {
  console.log('🌱 Initializing sample data...');

  try {
    // Create projects
    const createdProjects: any[] = [];
    for (const projectData of SAMPLE_PROJECTS) {
      const response = await client.post('/projects', projectData);
      createdProjects.push(response.data);
      console.log(`✅ Created project: ${response.data.name}`);
    }

    // Create tasks for each project
    for (let i = 0; i < createdProjects.length; i++) {
      const project = createdProjects[i];
      const projectTasks = SAMPLE_TASKS_BY_PROJECT[i] || [];

      for (const taskData of projectTasks) {
        const taskWithProject = {
          ...taskData,
          project_id: project.id,
        };
        const response = await client.post('/tasks', taskWithProject);
        console.log(`✅ Created task: ${response.data.title}`);
      }
    }

    console.log('✨ Sample data initialized successfully!');
    return {
      projects: createdProjects.length,
      tasks: Object.values(SAMPLE_TASKS_BY_PROJECT).flat().length,
    };
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
    throw error;
  }
}

// Usage:
// import { initializeSampleData } from '@/scripts/init-sample-data';
// initializeSampleData().then(result => console.log(result));
```

### Database Setup Script (Supabase)

**File:** `supabase/migrations/001_init_schema.sql`

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(name, owner_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done', 'deleted')),
  due_date DATE,
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'project' or 'task'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete'
  user_id UUID NOT NULL REFERENCES users(id),
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### Type Definitions

**File:** `src/types/models.ts`

```typescript
export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  status: 'active' | 'archived' | 'draft' | 'deleted';
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  assignee_id?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'deleted';
  due_date?: string;
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  comments_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface AuditLog {
  id: string;
  entity_type: 'project' | 'task';
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  user_id: string;
  changes: Record<string, any>;
  created_at: string;
}
```

---

## Effort Estimates & Dependencies

### Work Breakdown Structure

#### Phase 1: Foundation (Week 1)
| Item | Task | Owner | Effort | Status |
|------|------|-------|--------|--------|
| 1.1 | Schema definitions (Zod) | Chief | 4h | Blocker: None |
| 1.2 | Type definitions | Chief | 2h | Depends: 1.1 |
| 1.3 | API client & interceptors | Johnny | 4h | Blocker: None |
| 1.4 | Error handling utilities | Johnny | 2h | Depends: 1.3 |
| 1.5 | Zustand store setup | Velma | 4h | Depends: 1.1, 1.3 |
| 1.6 | Common UI components | Velma | 6h | Blocker: None |
| **Phase 1 Total** | | | **22h** | |

#### Phase 2: Project CRUD (Week 1-2)
| Item | Task | Owner | Effort | Status |
|------|------|-------|--------|--------|
| 2.1 | ProjectForm component | Velma | 4h | Depends: 1.6 |
| 2.2 | ProjectCreateModal | Johnny | 3h | Depends: 2.1, 1.5 |
| 2.3 | ProjectEditModal | Johnny | 3h | Depends: 2.1, 1.5 |
| 2.4 | ProjectDeleteConfirm | Velma | 2h | Depends: 1.6 |
| 2.5 | Project API integration tests | Chief | 4h | Depends: 1.3 |
| **Phase 2 Total** | | | **16h** | |

#### Phase 3: Task CRUD (Week 2)
| Item | Task | Owner | Effort | Status |
|------|------|-------|--------|--------|
| 3.1 | TaskForm component | Velma | 5h | Depends: 1.6 |
| 3.2 | TaskCreateModal | Johnny | 3h | Depends: 3.1, 1.5 |
| 3.3 | TaskEditModal | Johnny | 3h | Depends: 3.1, 1.5 |
| 3.4 | TaskDeleteConfirm | Velma | 2h | Depends: 1.6 |
| 3.5 | Task API integration tests | Chief | 4h | Depends: 1.3 |
| **Phase 3 Total** | | | **17h** | |

#### Phase 4: Integration & QA (Week 2-3)
| Item | Task | Owner | Effort | Status |
|------|------|-------|--------|--------|
| 4.1 | Sample data script | Chief | 4h | Depends: 1.1, 1.3 |
| 4.2 | Database migrations | Chief | 3h | Blocker: None |
| 4.3 | E2E testing (create flows) | Velma | 6h | Depends: 2.1-2.4, 3.1-3.4 |
| 4.4 | E2E testing (edit flows) | Velma | 6h | Depends: 2.1-2.4, 3.1-3.4 |
| 4.5 | E2E testing (delete flows) | Johnny | 4h | Depends: 2.4, 3.4 |
| 4.6 | UI/UX polish & accessibility | Velma | 4h | Depends: All components |
| **Phase 4 Total** | | | **27h** | |

#### Phase 5: Documentation & Handoff (Week 3)
| Item | Task | Owner | Effort | Status |
|------|------|-------|--------|--------|
| 5.1 | Component storybook stories | Velma | 4h | Depends: All components |
| 5.2 | API documentation (OpenAPI) | Chief | 3h | Depends: 1.3 |
| 5.3 | Developer guide & setup | Johnny | 3h | Blocker: None |
| 5.4 | Deployment & environment setup | Chief | 2h | Blocker: None |
| **Phase 5 Total** | | | **12h** | |

### Total Effort by Role
- **Chief:** 23 hours (Schema, API, DB, testing)
- **Johnny:** 19 hours (API client, modals, E2E, docs)
- **Velma:** 28 hours (UI components, forms, E2E, polish)
- **TOTAL:** 70 hours (approximately 2 weeks with parallel work)

### Critical Path

```
1. Foundation (1.1-1.6) → 22h
2. Project Schema + API → Project CRUD → 20h
3. Task Schema + API → Task CRUD → 20h
4. Integration & QA → 27h
5. Documentation → 12h

Parallel tracks: Phases 2 & 3 can run concurrently
Expected timeline: 3 weeks (full-time team)
```

### Dependency Map

```
┌─ Phase 1: Foundation (22h)
│  ├─ 1.1 Schema definitions
│  ├─ 1.2 Type definitions (→ 1.1)
│  ├─ 1.3 API client
│  ├─ 1.4 Error utilities (→ 1.3)
│  ├─ 1.5 State management (→ 1.1, 1.3)
│  └─ 1.6 Common UI (independent)
│
├─ Phase 2: Project CRUD (16h, → Phase 1)
│  ├─ 2.1 ProjectForm (→ 1.6)
│  ├─ 2.2 ProjectCreateModal (→ 2.1, 1.5)
│  ├─ 2.3 ProjectEditModal (→ 2.1, 1.5)
│  ├─ 2.4 ProjectDeleteConfirm (→ 1.6)
│  └─ 2.5 API tests (→ 1.3)
│
├─ Phase 3: Task CRUD (17h, → Phase 1, parallel with 2)
│  ├─ 3.1 TaskForm (→ 1.6)
│  ├─ 3.2 TaskCreateModal (→ 3.1, 1.5)
│  ├─ 3.3 TaskEditModal (→ 3.1, 1.5)
│  ├─ 3.4 TaskDeleteConfirm (→ 1.6)
│  └─ 3.5 API tests (→ 1.3)
│
├─ Phase 4: Integration & QA (27h, → 2 & 3)
│  ├─ 4.1 Sample data (→ 1.1, 1.3)
│  ├─ 4.2 DB migrations
│  ├─ 4.3-4.5 E2E testing (→ all components)
│  └─ 4.6 Polish & a11y
│
└─ Phase 5: Documentation (12h, → all)
```

---

## Ready for Delegation

### Assignment Summary

**Chief** - Architecture & Backend Integration
- [ ] 1.1 Schema definitions (4h)
- [ ] 1.2 Type definitions (2h)
- [ ] 1.3 API client & interceptors (4h)
- [ ] 1.4 Error utilities (2h)
- [ ] 2.5 Project API tests (4h)
- [ ] 3.5 Task API tests (4h)
- [ ] 4.1 Sample data initialization (4h)
- [ ] 4.2 Database migrations (3h)
- [ ] 5.2 OpenAPI documentation (3h)
- [ ] 5.4 Deployment setup (2h)

**Johnny** - Forms & API Integration
- [ ] 1.3 API client (shared with Chief)
- [ ] 2.2 ProjectCreateModal (3h)
- [ ] 2.3 ProjectEditModal (3h)
- [ ] 3.2 TaskCreateModal (3h)
- [ ] 3.3 TaskEditModal (3h)
- [ ] 4.5 Delete flows E2E testing (4h)
- [ ] 5.3 Developer guide (3h)

**Velma** - UI & Component Development
- [ ] 1.5 Zustand store setup (4h)
- [ ] 1.6 Common components (6h)
- [ ] 2.1 ProjectForm (4h)
- [ ] 2.4 ProjectDeleteConfirm (2h)
- [ ] 3.1 TaskForm (5h)
- [ ] 3.4 TaskDeleteConfirm (2h)
- [ ] 4.3-4.4 E2E create/edit testing (12h)
- [ ] 4.6 Polish & accessibility (4h)
- [ ] 5.1 Storybook stories (4h)

### Next Steps

1. **Copy this document** to your project repo as `MISSION_CONTROL_CRUD_SPECIFICATIONS.md`
2. **Create GitHub issues** from each work item with effort estimates
3. **Assign to team members** based on the delegation summary above
4. **Track progress** using project board (Kanban or similar)
5. **Daily standups** to address blockers

### Success Criteria

- [ ] All components render without errors
- [ ] All CRUD operations work end-to-end
- [ ] API integration tests pass (>90% coverage)
- [ ] Sample data initializes successfully
- [ ] E2E tests pass for all workflows
- [ ] Accessibility score >90 (Lighthouse)
- [ ] Documentation complete and published
- [ ] Ready for production deployment

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-19  
**Owner:** Mission Control Team  
**Status:** ✅ Ready for Immediate Implementation
