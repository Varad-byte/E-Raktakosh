/**
 * Automated Test Suite for BBIMS Public & Customer Portal APIs
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

async function runCustomerTests() {
  console.log('🩸 Starting BBIMS Public & Customer Portal API Tests...\n');
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
    // 1. Public Inventory - Live Availability
    const invRes = await request('GET', '/api/public/inventory');
    assert(invRes.status === 200 && invRes.data.success && invRes.data.summary['A+'], 'GET /api/public/inventory returns live blood stock summary');

    // 2. Public Inventory with bloodGroup and city filters
    const filteredInv = await request('GET', '/api/public/inventory?bloodGroup=O%2B&city=Delhi');
    assert(filteredInv.status === 200 && filteredInv.data.filtersApplied.bloodGroup === 'O+', 'GET /api/public/inventory?bloodGroup=O+&city=Delhi filters correctly');

    // 3. Public Camps Listing
    const campsRes = await request('GET', '/api/public/camps');
    assert(campsRes.status === 200 && Array.isArray(campsRes.data.data) && campsRes.data.data.length > 0, 'GET /api/public/camps returns upcoming voluntary camps');

    // 4. Public Camps with search filter
    const searchCamp = await request('GET', '/api/public/camps?search=Red+Cross');
    assert(searchCamp.status === 200 && searchCamp.data.data.length > 0 && searchCamp.data.data[0].campName.includes('Red Cross'), 'GET /api/public/camps?search=Red+Cross filters by keyword');

    // 5. Citizen / Donor Login with Seed Credentials
    const citizenLogin = await request('POST', '/api/auth/login', {
      email: 'donor@eraktkosh.in',
      password: 'SecurePassword123',
      role: 'donor'
    });
    assert(citizenLogin.status === 200 && citizenLogin.data.user.role === 'donor' && citizenLogin.data.token, 'POST /api/auth/login logs in citizen donor');
    const citizenToken = citizenLogin.data.token;

    // 6. Citizen Registration with full donor fields
    const testEmail = `donor_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      role: 'donor',
      fullName: 'Sunil Gavaskar',
      age: 32,
      gender: 'Male',
      bloodGroup: 'B+',
      contactPhone: '+91 91234 56789',
      city: 'Mumbai',
      email: testEmail,
      password: 'SecurePassword123'
    });
    assert(regRes.status === 201 && regRes.data.user.role === 'donor' && regRes.data.user.fullName === 'Sunil Gavaskar', 'POST /api/auth/register creates new citizen donor');
    const newDonorToken = regRes.data.token;

    // 7. Verify /api/auth/me returns citizen profile
    const meRes = await request('GET', '/api/auth/me', null, newDonorToken);
    assert(meRes.status === 200 && meRes.data.user.role === 'donor' && meRes.data.user.bloodGroup === 'B+', 'GET /api/auth/me returns authenticated citizen profile');

    // 8. Submit Blood Requisition via POST /api/customer/requests
    const reqPayload = {
      patientName: 'Meenakshi Sundaram',
      hospitalName: 'Lilavati Hospital',
      bloodGroup: 'B+',
      units: 2,
      contactPhone: '+91 91234 56789',
      requestDate: '2026-11-12'
    };
    const submitReqRes = await request('POST', '/api/customer/requests', reqPayload, newDonorToken);
    assert(submitReqRes.status === 201 && submitReqRes.data.success && submitReqRes.data.data.patientName === 'Meenakshi Sundaram', 'POST /api/customer/requests creates new patient requisition');

    // 9. Personal Tracking History via GET /api/customer/requests
    const historyRes = await request('GET', '/api/customer/requests', null, newDonorToken);
    assert(historyRes.status === 200 && Array.isArray(historyRes.data.data) && historyRes.data.data.length >= 1, 'GET /api/customer/requests returns user tracking history');
    assert(historyRes.data.data[0].patientName === 'Meenakshi Sundaram', 'Tracking history contains submitted request details');

    // 10. Register Donation Pledge / Appointment via POST /api/customer/donate
    const campId = campsRes.data.data[0].id;
    const initialCampCount = campsRes.data.data[0].registeredCount;
    const donatePayload = {
      campId,
      appointmentDate: '2026-11-15',
      preferredSlot: 'Morning (10:00 AM)',
      donorName: 'Sunil Gavaskar',
      contactPhone: '+91 91234 56789',
      email: testEmail,
      bloodGroup: 'B+',
      city: 'Mumbai'
    };
    const donateRes = await request('POST', '/api/customer/donate', donatePayload, newDonorToken);
    assert(donateRes.status === 201 && donateRes.data.success && donateRes.data.data.status === 'Confirmed', 'POST /api/customer/donate confirms donor appointment');

    // 11. Verify Camp registration counter incremented
    const updatedCamps = await request('GET', '/api/public/camps');
    const targetCamp = updatedCamps.data.data.find(c => c.id === campId);
    assert(targetCamp && targetCamp.registeredCount === initialCampCount + 1, 'Camp registeredCount increments on new appointment');

    console.log(`\n========================================`);
    console.log(`Customer API Tests: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Customer test error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runCustomerTests();
}

module.exports = { runCustomerTests };
