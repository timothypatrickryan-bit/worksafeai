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
   * Initialize Redis connection with timeout
   */
  async init() {
    try {
      if (!process.env.REDIS_URL) {
        // Redis is optional - just skip if not configured
        return false;
      }

      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            // Give up after 3 retries (quick fail)
            if (retries > 3) return new Error('Redis reconnect failed');
            return Math.min(retries * 100, 500);
          },
          connectTimeout: 2000,
        },
      });

      this.client.on('error', (err) => {
        console.warn('⚠️ Redis connection error (non-critical):', err.message);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('✓ Redis cache enabled');
        this.connected = true;
      });

      // Set a timeout for the connection attempt
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 3000)
      );

      try {
        await Promise.race([connectPromise, timeoutPromise]);
        return true;
      } catch (error) {
        console.warn('⚠️ Redis unavailable (caching disabled):', error.message);
        this.connected = false;
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Redis initialization skipped:', error.message);
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
   * Delete multiple keys matching pattern.
   * Uses SCAN instead of KEYS to avoid blocking the Redis event loop on
   * large key spaces (KEYS is O(N) and blocks all other commands).
   */
  async deletePattern(pattern) {
    if (!this.client || !this.connected) return 0;

    try {
      let cursor = 0;
      const allKeys = [];

      do {
        const result = await this.client.scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        if (result.keys && result.keys.length > 0) {
          allKeys.push(...result.keys);
        }
      } while (cursor !== 0);

      if (allKeys.length > 0) {
        await this.client.del(allKeys);
      }
      return allKeys.length;
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
   * Sanitize cache key to prevent injection
   */
  _sanitizeKey(value) {
    if (!value) return 'null';
    return String(value).replace(/[^a-zA-Z0-9\-_]/g, '_');
  }

  /**
   * Cache key builders - with input sanitization
   */
  get keys() {
    const sanitize = this._sanitizeKey.bind(this);
    return {
      dashboardStats: (companyId) => `dashboard:${sanitize(companyId)}:stats`,
      jtsaList: (companyId, status, date) => `jtsa:${sanitize(companyId)}:list:${sanitize(status || 'all')}:${sanitize(date || 'all')}`,
      companyTier: (companyId) => `company:${sanitize(companyId)}:tier`,
      projectHazards: (projectId) => `project:${sanitize(projectId)}:hazards`,
      jtsa: (jtsa_id) => `jtsa:${sanitize(jtsa_id)}`,
      mitigations: (hazardId) => `hazard:${sanitize(hazardId)}:mitigations`,
    };
  }

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
