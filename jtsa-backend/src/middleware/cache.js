const cacheService = require('../services/cacheService');

/**
 * Cache middleware — wrapper for automatic cache get/set
 * Usage: app.get('/route', cachedResponse(cacheKey, ttl), handler)
 *
 * The handler should call cacheService.set(key, value, ttl) to cache
 * Or this can auto-cache based on req.cacheData
 */

const cachedResponse = (keyBuilder, ttl) => {
  return async (req, res, next) => {
    // Build cache key
    const cacheKey = typeof keyBuilder === 'function' ? keyBuilder(req) : keyBuilder;

    // Try to get from cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      console.log(`Cache hit: ${cacheKey}`);
      return res.json(cached);
    }

    console.log(`Cache miss: ${cacheKey}`);

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cacheService.set(cacheKey, data, ttl);
      return originalJson(data);
    };

    next();
  };
};

/**
 * Invalidate cache keys based on company/project/jtsa changes
 * Call after create/update/delete operations
 */
const invalidateCache = async (pattern) => {
  const count = await cacheService.deletePattern(pattern);
  if (count > 0) {
    console.log(`Invalidated ${count} cache keys matching: ${pattern}`);
  }
  return count;
};

/**
 * Invalidate company-specific cache
 */
const invalidateCompanyCache = (companyId) => {
  return invalidateCache(`*:${companyId}:*`);
};

/**
 * Invalidate project-specific cache
 */
const invalidateProjectCache = (projectId) => {
  return invalidateCache(`project:${projectId}:*`);
};

/**
 * Invalidate JTSA-specific cache
 */
const invalidateJtsaCache = (jtsa_id) => {
  return invalidateCache(`*:jtsa:${jtsa_id}:*`);
};

module.exports = {
  cachedResponse,
  invalidateCache,
  invalidateCompanyCache,
  invalidateProjectCache,
  invalidateJtsaCache,
};
