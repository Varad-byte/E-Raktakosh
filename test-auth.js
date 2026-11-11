/**
 * Automated Test Suite for BBIMS Authentication API
 */

const http = require('node:http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAuthTests() {
  console.log('🔒 Starting BBIMS Authentication API Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Login with Default Seed Credentials
    const defaultLogin = await request('POST', '/api/auth/login', {
      email: 'admin@bloodbank.org',
      password: 'SecurePassword123'
    });
    assert(defaultLogin.status === 200 && defaultLogin.data.token && defaultLogin.data.user.email === 'admin@bloodbank.org', 'POST /api/auth/login with default seed credentials');
    const defaultToken = defaultLogin.data.token;

    // 2. GET /api/auth/me with valid token
    const me = await request('GET', '/api/auth/me', null, defaultToken);
    assert(me.status === 200 && me.data.user && me.data.user.nodalOfficer === 'Dr. Amit Roy', 'GET /api/auth/me returns current authenticated user');

    // 3. GET /api/auth/me without token (should fail 401)
    const meNoToken = await request('GET', '/api/auth/me');
    assert(meNoToken.status === 401 && meNoToken.data.success === false, 'GET /api/auth/me without token returns 401 Unauthorized');

    // 4. Login with Wrong Password (should fail 401)
    const badLogin = await request('POST', '/api/auth/login', {
      email: 'admin@bloodbank.org',
      password: 'WrongPassword999'
    });
    assert(badLogin.status === 401 && badLogin.data.success === false, 'POST /api/auth/login with wrong password returns 401');

    // 5. Register New Blood Bank Facility
    const uniqueEmail = `facility_${Date.now()}@bloodbank.org`;
    const regPayload = {
      facilityName: 'District Metro Blood Center',
      licenseNumber: 'DL-BB-2026-7788',
      nodalOfficer: 'Dr. Priya Sundaram',
      email: uniqueEmail,
      password: 'SecurePassword123',
      contactPhone: '+91 98123 45678',
      city: 'Bengaluru'
    };
    const regRes = await request('POST', '/api/auth/register', regPayload);
    assert(regRes.status === 201 && regRes.data.token && regRes.data.user.email === uniqueEmail, 'POST /api/auth/register creates new facility account');
    const newFacilityToken = regRes.data.token;

    // 6. Test Duplicate Registration (should fail 409)
    const dupRes = await request('POST', '/api/auth/register', regPayload);
    assert(dupRes.status === 409 && dupRes.data.success === false, 'POST /api/auth/register with duplicate email returns 409 Conflict');

    // 7. Login with New Facility Credentials
    const newLogin = await request('POST', '/api/auth/login', {
      email: uniqueEmail,
      password: 'SecurePassword123'
    });
    assert(newLogin.status === 200 && newLogin.data.user.facilityName === 'District Metro Blood Center', 'POST /api/auth/login with newly registered facility credentials');

    // 8. Test /api/v1/auth/me alias
    const v1Me = await request('GET', '/api/v1/auth/me', null, newFacilityToken);
    assert(v1Me.status === 200 && v1Me.data.user.email === uniqueEmail, 'GET /api/v1/auth/me alias returns authenticated profile');

    // 9. Logout
    const logoutRes = await request('POST', '/api/auth/logout', null, newFacilityToken);
    assert(logoutRes.status === 200 && logoutRes.data.success === true, 'POST /api/auth/logout returns 200 OK');

    console.log(`\n========================================`);
    console.log(`Auth Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Auth test execution error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runAuthTests();
}

module.exports = { runAuthTests };
