/**
 * Jest Test Setup
 * Provides utilities and mocks for integration tests
 */

require('dotenv').config({ path: '.env.test' });

// Suppress console logs during tests (optional)
// global.console = {
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
//   info: jest.fn(),
// };

// Test user data
global.testData = {
  company: {
    name: 'Test Company Inc',
    contact_email: 'owner@test.company',
  },
  owner: {
    email: 'owner@test.company',
    password: 'TestPassword123!',
    fullName: 'Test Owner',
  },
  employee: {
    email: 'employee@test.company',
    password: 'TestPassword456!',
    fullName: 'Test Employee',
  },
  project: {
    name: 'Test Project',
    description: 'A test project for JTSA',
  },
  jtsa: {
    taskDescription: 'Install electrical wiring in warehouse with height work up to 15 feet',
  },
};

// Helper to create test token
global.createToken = (userId, companyId, role = 'employee') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: userId, company_id: companyId, role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};
