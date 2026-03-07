const redis = require('redis');

/**
 * Cache Service — Redis-based caching for expensive queries
 * TTLs are configurable per cache key type
 */

class CacheService {
  constructor() {
    this.client = null;
    this.connected = false;

    // Cache TTLs (in seconds)
    this.TTL = {
      DASHBOARD_STATS: 300, // 5 minutes
      JTSA_LIST: 300, // 5 minutes
      COMPANY_TIER: 600, // 10 minutes
      HAZARDS: 600, // 10 minutes
      MITIGATIONS: 600, // 10 minutes
      USER_SESSION: 3600, // 1 hour
    };
  }

  /**
   * Initialize Redis connection
   */
  async init() {
    try {
      if (!process.env.REDIS_URL) {
        console.warn('REDIS_URL not set. Caching disabled.');
        return false;
      }

      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected');
        this.connected = true;
      });

      await this.client.connect();
      return true;
    } catch (error) {
      console.error('Redis initialization error:', error);
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (!this.client || !this.connected) return null;

    try {
      const value = await this.client.get(key);
      if (value) {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return null;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = 300) {
    if (!this.client || !this.connected) return false;

    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.setEx(key, ttl, stringValue);
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cache key
   */
  async delete(key) {
    if (!this.client || !this.connected) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async deletePattern(pattern) {
    if (!this.client || !this.connected) return 0;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache DELETEPATTERN error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (!this.client || !this.connected) return false;

    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      console.error('Cache CLEAR error:', error);
      return false;
    }
  }

  /**
   * Cache key builders
   */
  keys = {
    dashboardStats: (companyId) => `dashboard:${companyId}:stats`,
    jtsaList: (companyId, status, date) => `jtsa:${companyId}:list:${status || 'all'}:${date || 'all'}`,
    companyTier: (companyId) => `company:${companyId}:tier`,
    projectHazards: (projectId) => `project:${projectId}:hazards`,
    jtsa: (jtsa_id) => `jtsa:${jtsa_id}`,
    mitigations: (hazardId) => `hazard:${hazardId}:mitigations`,
  };

  /**
   * Invalidation patterns
   */
  patterns = {
    companyAll: (companyId) => `*:${companyId}:*`,
    projectAll: (projectId) => `project:${projectId}:*`,
    jtsa: (jtsa_id) => `*:jtsa:${jtsa_id}:*`,
  };

  /**
   * Disconnect Redis
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
      console.log('Redis disconnected');
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
