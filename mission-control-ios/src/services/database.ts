import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local Database Service
 * Uses AsyncStorage as SQLite abstraction for local data persistence
 * Features:
 * - Task storage
 * - Memory/notes storage
 * - Team data caching
 * - Offline-first operations
 */

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'review' | 'queued' | 'in-progress' | 'complete';
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface Memory {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  model?: string;
  status?: 'active' | 'idle' | 'offline';
  lastSeen?: string;
}

interface DbSchema {
  tasks: Task[];
  memories: Memory[];
  team: TeamMember[];
  status?: any;
  gapAnalysis?: any;
}

const DB_STORAGE_KEY = 'mission_control_db';
const TASK_COLLECTION_KEY = 'mission_control_tasks';
const MEMORY_COLLECTION_KEY = 'mission_control_memories';
const TEAM_COLLECTION_KEY = 'mission_control_team';

class Database {
  private initialized = false;

  /**
   * Initialize database
   */
  async init() {
    try {
      const existing = await AsyncStorage.getItem(DB_STORAGE_KEY);
      if (!existing) {
        await this.setupCollections();
      }
      this.initialized = true;
      console.log('[Database] Initialized');
    } catch (error) {
      console.error('[Database] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Setup default collections
   */
  private async setupCollections() {
    const schema: DbSchema = {
      tasks: [],
      memories: [],
      team: [],
    };

    await AsyncStorage.setItem(DB_STORAGE_KEY, JSON.stringify(schema));
  }

  /**
   * Get entire database
   */
  async getDb(): Promise<DbSchema> {
    try {
      const data = await AsyncStorage.getItem(DB_STORAGE_KEY);
      return data ? JSON.parse(data) : { tasks: [], memories: [], team: [] };
    } catch (error) {
      console.error('[Database] Failed to get DB:', error);
      return { tasks: [], memories: [], team: [] };
    }
  }

  /**
   * Save database
   */
  private async saveDb(db: DbSchema) {
    try {
      await AsyncStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    } catch (error) {
      console.error('[Database] Failed to save DB:', error);
      throw error;
    }
  }

  // ===== TASKS =====

  /**
   * Get all tasks
   */
  async getTasks(filter?: { status?: string; assignee?: string }): Promise<Task[]> {
    try {
      const db = await this.getDb();
      let tasks = db.tasks || [];

      if (filter?.status) {
        tasks = tasks.filter(t => t.status === filter.status);
      }
      if (filter?.assignee) {
        tasks = tasks.filter(t => t.assignee === filter.assignee);
      }

      return tasks;
    } catch (error) {
      console.error('[Database] Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    try {
      const tasks = await this.getTasks();
      return tasks.find(t => t.id === id) || null;
    } catch (error) {
      console.error('[Database] Failed to get task:', error);
      return null;
    }
  }

  /**
   * Create task
   */
  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const now = new Date().toISOString();
      const task: Task = {
        ...data,
        id: this.generateId(),
        createdAt: now,
        updatedAt: now,
      };

      const db = await this.getDb();
      db.tasks = [task, ...(db.tasks || [])];
      await this.saveDb(db);

      console.log('[Database] Task created:', task.id);
      return task;
    } catch (error) {
      console.error('[Database] Failed to create task:', error);
      throw error;
    }
  }

  /**
   * Update task
   */
  async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const db = await this.getDb();
      const index = (db.tasks || []).findIndex(t => t.id === id);

      if (index === -1) return null;

      const task: Task = {
        ...(db.tasks || [])[index],
        ...updates,
        id, // Don't allow ID change
        updatedAt: new Date().toISOString(),
      };

      (db.tasks || [])[index] = task;
      await this.saveDb(db);

      console.log('[Database] Task updated:', id);
      return task;
    } catch (error) {
      console.error('[Database] Failed to update task:', error);
      throw error;
    }
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const initialLength = (db.tasks || []).length;
      db.tasks = (db.tasks || []).filter(t => t.id !== id);

      if ((db.tasks || []).length < initialLength) {
        await this.saveDb(db);
        console.log('[Database] Task deleted:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Database] Failed to delete task:', error);
      throw error;
    }
  }

  /**
   * Clear all tasks
   */
  async clearTasks() {
    try {
      const db = await this.getDb();
      db.tasks = [];
      await this.saveDb(db);
      console.log('[Database] Tasks cleared');
    } catch (error) {
      console.error('[Database] Failed to clear tasks:', error);
    }
  }

  // ===== MEMORIES =====

  /**
   * Get all memories
   */
  async getMemories(date?: string): Promise<Memory[]> {
    try {
      const db = await this.getDb();
      let memories = db.memories || [];

      if (date) {
        const dateStr = date.substring(0, 10); // YYYY-MM-DD
        memories = memories.filter(m => m.date.substring(0, 10) === dateStr);
      }

      return memories;
    } catch (error) {
      console.error('[Database] Failed to get memories:', error);
      return [];
    }
  }

  /**
   * Get memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    try {
      const memories = await this.getMemories();
      return memories.find(m => m.id === id) || null;
    } catch (error) {
      console.error('[Database] Failed to get memory:', error);
      return null;
    }
  }

  /**
   * Create memory
   */
  async createMemory(data: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>): Promise<Memory> {
    try {
      const now = new Date().toISOString();
      const memory: Memory = {
        ...data,
        id: this.generateId(),
        date: data.date || now,
        createdAt: now,
        updatedAt: now,
      };

      const db = await this.getDb();
      db.memories = [memory, ...(db.memories || [])];
      await this.saveDb(db);

      console.log('[Database] Memory created:', memory.id);
      return memory;
    } catch (error) {
      console.error('[Database] Failed to create memory:', error);
      throw error;
    }
  }

  /**
   * Update memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | null> {
    try {
      const db = await this.getDb();
      const index = (db.memories || []).findIndex(m => m.id === id);

      if (index === -1) return null;

      const memory: Memory = {
        ...(db.memories || [])[index],
        ...updates,
        id,
        updatedAt: new Date().toISOString(),
      };

      (db.memories || [])[index] = memory;
      await this.saveDb(db);

      console.log('[Database] Memory updated:', id);
      return memory;
    } catch (error) {
      console.error('[Database] Failed to update memory:', error);
      throw error;
    }
  }

  /**
   * Delete memory
   */
  async deleteMemory(id: string): Promise<boolean> {
    try {
      const db = await this.getDb();
      const initialLength = (db.memories || []).length;
      db.memories = (db.memories || []).filter(m => m.id !== id);

      if ((db.memories || []).length < initialLength) {
        await this.saveDb(db);
        console.log('[Database] Memory deleted:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[Database] Failed to delete memory:', error);
      throw error;
    }
  }

  // ===== TEAM =====

  /**
   * Get all team members
   */
  async getTeam(): Promise<TeamMember[]> {
    try {
      const db = await this.getDb();
      return db.team || [];
    } catch (error) {
      console.error('[Database] Failed to get team:', error);
      return [];
    }
  }

  /**
   * Get team member by ID
   */
  async getTeamMember(id: string): Promise<TeamMember | null> {
    try {
      const team = await this.getTeam();
      return team.find(m => m.id === id) || null;
    } catch (error) {
      console.error('[Database] Failed to get team member:', error);
      return null;
    }
  }

  /**
   * Update team members (replaces entire team list)
   */
  async setTeam(members: TeamMember[]) {
    try {
      const db = await this.getDb();
      db.team = members;
      await this.saveDb(db);
      console.log('[Database] Team updated:', members.length, 'members');
    } catch (error) {
      console.error('[Database] Failed to set team:', error);
      throw error;
    }
  }

  // ===== CACHE =====

  /**
   * Store cached data (status, gap analysis, etc.)
   */
  async setCached(key: string, data: any) {
    try {
      const db = await this.getDb();
      if (!db.status) db.status = {};
      db.status[key] = {
        data,
        cachedAt: new Date().toISOString(),
      };
      await this.saveDb(db);
    } catch (error) {
      console.error('[Database] Failed to cache data:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCached(key: string): Promise<any | null> {
    try {
      const db = await this.getDb();
      const cached = db.status?.[key];
      return cached ? cached.data : null;
    } catch (error) {
      console.error('[Database] Failed to get cached data:', error);
      return null;
    }
  }

  /**
   * Clear entire database
   */
  async clear() {
    try {
      await AsyncStorage.removeItem(DB_STORAGE_KEY);
      await this.setupCollections();
      console.log('[Database] Cleared');
    } catch (error) {
      console.error('[Database] Failed to clear:', error);
    }
  }

  /**
   * Get database stats
   */
  async getStats() {
    try {
      const db = await this.getDb();
      return {
        tasks: (db.tasks || []).length,
        memories: (db.memories || []).length,
        team: (db.team || []).length,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[Database] Failed to get stats:', error);
      return { tasks: 0, memories: 0, team: 0 };
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const database = new Database();

export { Task, Memory, TeamMember, DbSchema };
export default database;
