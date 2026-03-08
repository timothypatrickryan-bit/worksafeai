# Integration Testing Guide

## Overview

JTSA Backend uses **Jest** + **Supertest** for integration tests. Tests cover:
- Authentication (register, login, refresh, logout)
- Billing (subscribe, change tier, status, cancel)
- JTSA workflow (create, list, update, complete)
- Hazards & mitigations
- Role-based access control

## Setup

### Install Dependencies
```bash
npm install --save-dev jest supertest
```

### Environment Variables

Create `.env.test` for test-specific configuration:
```
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-test-key
JWT_SECRET=test-secret-key-here
OPENAI_API_KEY=sk-test-key
STRIPE_SECRET_KEY=sk_test_key
STRIPE_WEBHOOK_SECRET=whsec_test_key
```

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Single Test File
```bash
npm test -- auth.test.js
```

### Specific Test Suite
```bash
npm test -- --testNamePattern="Authentication"
```

## Test Structure

```
src/__tests__/
├── setup.js           # Jest setup + utilities
├── auth.test.js       # Authentication tests
├── billing.test.js    # Billing/subscription tests
├── jtsa.test.js       # JTSA workflow tests
└── ...
```

## Writing Tests

### Basic Test Structure
```javascript
describe('Feature Name', () => {
  let token, userId;

  beforeAll(async () => {
    // Setup: login, create data
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'pass' });
    token = res.body.accessToken;
  });

  it('should do something', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });
});
```

### Making Requests
```javascript
// GET
await request(app)
  .get('/api/endpoint')
  .set('Authorization', `Bearer ${token}`)
  .query({ filter: 'value' });

// POST
await request(app)
  .post('/api/endpoint')
  .set('Authorization', `Bearer ${token}`)
  .send({ data: 'value' });

// PATCH
await request(app)
  .patch('/api/endpoint/:id')
  .set('Authorization', `Bearer ${token}`)
  .send({ updated: 'value' });

// DELETE
await request(app)
  .delete('/api/endpoint/:id')
  .set('Authorization', `Bearer ${token}`);
```

### Common Assertions
```javascript
expect(res.statusCode).toBe(200);
expect(res.body).toHaveProperty('id');
expect(res.body.status).toBe('active');
expect(res.body.items).toHaveLength(5);
expect(res.body.email).toMatch(/@test\.com$/);
expect(res.body.error).toContain('Invalid');
```

## Test Scenarios

### Authentication Tests
- ✅ Register new user
- ✅ Login with correct credentials
- ✅ Reject wrong password
- ✅ Refresh token
- ✅ Access protected routes

### Billing Tests
- ✅ Create subscription
- ✅ Upgrade tier
- ✅ Check status
- ✅ Cancel subscription
- ✅ Verify tier limits

### JTSA Tests
- ✅ Create JTSA (auto-generates hazards)
- ✅ List JTSAs
- ✅ Update JTSA
- ✅ Acknowledge hazards
- ✅ Manage participants

### Role-Based Access
- ✅ Owner permissions
- ✅ Admin permissions
- ✅ Employee limitations
- ✅ Cross-company isolation

## Test Database

Tests use the **same Supabase instance** specified in `.env.test`.

**⚠️ Important:**
- Tests create real records in Supabase
- Use separate test database or cleanup after tests
- Each test run adds data (consider truncating tables in beforeAll/afterAll)

### Cleanup Example
```javascript
afterAll(async () => {
  // Clean up test data
  const supabase = req.app.locals.supabase;
  await supabase.from('users').delete().eq('email', 'test@test.com');
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Debugging Tests

### Run Single Test with Logs
```bash
NODE_DEBUG=* npm test -- auth.test.js --verbose
```

### Pause on Failure
```javascript
it('should debug', async () => {
  debugger; // Will pause if run with --inspect
  // Test code
});
```

### Run with Inspector
```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

## Common Issues

### Tests Timeout
Increase timeout in jest config:
```javascript
jest: {
  testTimeout: 30000 // 30 seconds
}
```

### Connection Issues
Ensure `.env.test` has correct Supabase credentials:
```bash
# Test connection
curl $SUPABASE_URL/health
```

### Flaky Tests
- Avoid hardcoded dates (use `new Date()`)
- Use unique emails for each test run
- Clean up test data between runs
- Set appropriate waits for async operations

## Best Practices

1. **Test real workflows** — Auth → Create → List → Update → Delete
2. **Test error cases** — Invalid input, missing auth, duplicate records
3. **Use meaningful names** — `should reject duplicate email` not `test1`
4. **Setup/teardown** — Use beforeAll/afterAll for setup
5. **Keep tests focused** — One behavior per test
6. **Mock external APIs** — Don't make real OpenAI calls (use mocks)
7. **Test both success and failure** — Happy path + error cases
8. **Document complex tests** — Add comments for non-obvious assertions

## Future Enhancements

- [ ] Mock external APIs (OpenAI, Stripe, SendGrid)
- [ ] Database seeding/fixtures
- [ ] Performance benchmarks
- [ ] API load testing
- [ ] E2E tests (Playwright)
- [ ] Coverage badges
- [ ] Test result dashboard

## Running in Production

**Never run tests against production!**

Always use separate test database:
```bash
# Production
npm test -- --testEnvironment=production

# Test (safe)
npm test -- --testEnvironment=test
```

## See Also

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- `src/__tests__/` — Test files
- `package.json` — Jest config
