# Redis Caching Strategy

## Overview

JTSA Backend uses Redis for caching expensive database queries, particularly:
- Dashboard statistics (employee count, project count, today's JTSAs, weekly completed)
- JTSA lists with filtering
- Company tier limits
- Hazards and mitigations

## Setup

### Local Development

1. **Install Redis** (macOS):
```bash
brew install redis
```

2. **Start Redis**:
```bash
redis-server
```

3. **Test connection**:
```bash
redis-cli ping
# Expected: PONG
```

### Environment Variable

Add to `.env`:
```
REDIS_URL=redis://localhost:6379
```

If `REDIS_URL` is not set, caching is disabled gracefully (logs warning).

### Production

Use a managed Redis service:
- **AWS ElastiCache**
- **Google Cloud Memorystore**
- **Redis Cloud**
- **Heroku Redis**

Example production URL:
```
REDIS_URL=redis://:password@redis-server-url:6379
```

---

## Cache Tiers

| Cache Key | TTL | Purpose |
|-----------|-----|---------|
| `dashboard:*:stats` | 5 min | Dashboard overview stats |
| `jtsa:*:list:*:*` | 5 min | JTSA list with filtering |
| `company:*:tier` | 10 min | Company subscription tier |
| `project:*:hazards` | 10 min | Project hazards |
| `hazard:*:mitigations` | 10 min | Hazard mitigations |

## Usage

### Automatic Caching (Middleware)

Routes are cached using the `cachedResponse` middleware:

```javascript
router.get('/companies/:id/dashboard',
  authenticateToken,
  cachedResponse(
    (req) => cacheService.keys.dashboardStats(req.params.id),
    cacheService.TTL.DASHBOARD_STATS
  ),
  async (req, res) => { ... }
);
```

The middleware:
1. Checks if response exists in cache
2. If hit: returns cached response
3. If miss: allows request to proceed, then caches response before returning

### Manual Cache Operations

```javascript
const cacheService = require('../services/cacheService');

// Get value
const cached = await cacheService.get('key');

// Set value (with TTL in seconds)
await cacheService.set('key', { data: 'value' }, 300);

// Delete key
await cacheService.delete('key');

// Delete all keys matching pattern
await cacheService.deletePattern('dashboard:*');

// Clear all cache
await cacheService.clear();
```

## Cache Invalidation

Cache is automatically invalidated when data changes:

### JTSA Operations
- **Create JTSA** → Invalidates all company cache (`*:company_id:*`)
- **Update JTSA** → Invalidates company cache
- **Complete JTSA** → Invalidates company + project cache

### Example: Invalidate Company Cache
```javascript
const { invalidateCompanyCache } = require('../middleware/cache');

// After updating company
await invalidateCompanyCache(companyId);

// All company-related caches are cleared:
// - dashboard:companyId:stats
// - jtsa:companyId:list:*:*
// - company:companyId:tier
// etc.
```

## Monitoring

### Check Cache Keys
```bash
redis-cli
KEYS *
```

### Check Memory Usage
```bash
redis-cli
INFO memory
```

### Monitor Real-time Activity
```bash
redis-cli
MONITOR
```

---

## Performance Impact

With caching enabled:

| Metric | Without Cache | With Cache |
|--------|---------------|-----------|
| Dashboard load time | ~200-500ms | ~50-100ms |
| JTSA list load time | ~150-400ms | ~30-80ms |
| DB queries per request | 3-5 | 0 (cache hits) |

Cache hit rate typically **70-80%** on dashboard/list endpoints after 1 minute of activity.

---

## Troubleshooting

### Cache not working?

1. Check Redis is running:
```bash
redis-cli ping
```

2. Check `REDIS_URL` is set in `.env`

3. Check logs:
```
Cache service: enabled  # Good
Cache service: disabled # Redis not available
```

4. Check network connectivity:
```bash
redis-cli -u redis://url ping
```

### Cache stale data?

Reduce TTL in `cacheService.js`:
```javascript
this.TTL = {
  DASHBOARD_STATS: 60,  // 1 minute instead of 5
  // ...
};
```

### Clear specific cache?

```javascript
await cacheService.deletePattern('company:abc123:*');
```

---

## Best Practices

1. **Cache read-heavy endpoints only** — list, dashboard, details
2. **Don't cache write operations** — POST, PATCH, DELETE should return fresh data
3. **Invalidate on updates** — clear cache when data changes
4. **Use appropriate TTLs** — balance freshness vs performance
5. **Monitor cache misses** — track cache effectiveness
6. **Graceful degradation** — app works without Redis (just slower)

---

## Future Enhancements

- [ ] Cache warming (pre-populate cache on startup)
- [ ] Cache statistics/metrics dashboard
- [ ] Conditional cache invalidation (smart patterns)
- [ ] WebSocket cache syncing (real-time updates)
- [ ] Distributed caching (multi-server deployments)
