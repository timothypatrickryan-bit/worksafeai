/**
 * Core type definitions for Mission Control API
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  last_login: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  project: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  output: string | null;
}

export interface DashboardStats {
  totalTasks: number;
  executingTasks: number;
  completedTasks: number;
  activeAgents: number;
  systemHealth: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ErrorDetails {
  code: string;
  message: string;
  statusCode: number;
}
