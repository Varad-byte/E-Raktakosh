/**
 * Automated Test Suite for BBIMS Backend API
 * Tests all CRUD endpoints and contract compliance.
 */

const http = require('node:http');

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json'
      }
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

async function runTests() {
  console.log('🧪 Starting BBIMS Backend Automated API Tests...\n');
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
    // 1. Health Check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'GET /api/health returns healthy');

    // 2. Inventory - GET
    const invList = await request('GET', '/api/inventory');
    assert(invList.status === 200 && Array.isArray(invList.data) && invList.data.length > 0, 'GET /api/inventory returns array of batches');

    // 3. Inventory - POST
    const newBatch = {
      bloodGroup: 'O+',
      units: 10,
      collectionDate: '2026-11-10',
      expiryDate: '2026-12-15',
      donorId: 'DNR-101',
      notes: 'Test Automated Batch'
    };
    const createdBatch = await request('POST', '/api/inventory', newBatch);
    assert(createdBatch.status === 201 && createdBatch.data.id && createdBatch.data.bloodGroup === 'O+', 'POST /api/inventory creates new batch');
    const testBatchId = createdBatch.data.id;

    // 4. Inventory - PUT
    const updatedBatch = await request('PUT', `/api/inventory/${testBatchId}`, { units: 15, notes: 'Updated notes' });
    assert(updatedBatch.status === 200 && updatedBatch.data.units === 15, 'PUT /api/inventory/:id updates batch');

    // 5. Inventory - DELETE
    const deletedBatch = await request('DELETE', `/api/inventory/${testBatchId}`);
    assert(deletedBatch.status === 200 && deletedBatch.data.success, 'DELETE /api/inventory/:id deletes batch');

    // 6. Donors - GET
    const donorList = await request('GET', '/api/donors');
    assert(donorList.status === 200 && Array.isArray(donorList.data) && donorList.data.length > 0, 'GET /api/donors returns donors array');

    // 7. Donors - POST
    const newDonor = {
      fullName: 'Anita Sharma',
      age: 28,
      gender: 'Female',
      bloodGroup: 'B+',
      contactPhone: '9899112233',
      city: 'Delhi',
      lastDonationDate: '2026-10-01'
    };
    const createdDonor = await request('POST', '/api/donors', newDonor);
    assert(createdDonor.status === 201 && createdDonor.data.id && createdDonor.data.fullName === 'Anita Sharma', 'POST /api/donors creates donor');
    const testDonorId = createdDonor.data.id;

    // 8. Donors - PUT
    const updatedDonor = await request('PUT', `/api/donors/${testDonorId}`, { city: 'Noida' });
    assert(updatedDonor.status === 200 && updatedDonor.data.city === 'Noida', 'PUT /api/donors/:id updates donor');

    // 9. Donors - DELETE
    const deletedDonor = await request('DELETE', `/api/donors/${testDonorId}`);
    assert(deletedDonor.status === 200 && deletedDonor.data.success, 'DELETE /api/donors/:id deletes donor');

    // 10. Blood Requests - GET
    const reqList = await request('GET', '/api/requests');
    assert(reqList.status === 200 && Array.isArray(reqList.data), 'GET /api/requests returns requests array');

    // 11. Blood Requests - POST
    const newReq = {
      patientName: 'Ravi Teja',
      hospitalName: 'Apollo City Hospital',
      bloodGroup: 'AB+',
      units: 2,
      contactPhone: '9988776655',
      requestDate: '2026-11-11',
      status: 'Pending'
    };
    const createdReq = await request('POST', '/api/requests', newReq);
    assert(createdReq.status === 201 && createdReq.data.id && createdReq.data.status === 'Pending', 'POST /api/requests creates request');
    const testReqId = createdReq.data.id;

    // 12. Blood Requests - PATCH Status
    const patchStatus = await request('PATCH', `/api/requests/${testReqId}/status`, { status: 'Approved' });
    assert(patchStatus.status === 200 && patchStatus.data.status === 'Approved', 'PATCH /api/requests/:id/status updates status');

    // 13. Blood Requests - DELETE
    const deletedReq = await request('DELETE', `/api/requests/${testReqId}`);
    assert(deletedReq.status === 200 && deletedReq.data.success, 'DELETE /api/requests/:id deletes request');

    // 14. Donations - GET
    const donList = await request('GET', '/api/donations');
    assert(donList.status === 200 && Array.isArray(donList.data), 'GET /api/donations returns donations array');

    // 15. Donations - POST
    const newDonation = {
      donorId: 'DNR-101',
      donorName: 'Rajesh Sharma',
      bloodGroup: 'A+',
      units: 1,
      donationDate: '2026-11-11',
      status: 'Completed'
    };
    const createdDonation = await request('POST', '/api/donations', newDonation);
    assert(createdDonation.status === 201 && createdDonation.data.id, 'POST /api/donations creates donation record');

    // 16. Donations - DELETE
    const deletedDonation = await request('DELETE', `/api/donations/${createdDonation.data.id}`);
    assert(deletedDonation.status === 200 && deletedDonation.data.success, 'DELETE /api/donations/:id deletes donation');

    // 17. Settings - GET & POST
    const settings = await request('GET', '/api/settings');
    assert(settings.status === 200 && typeof settings.data.lowStockThreshold === 'number', 'GET /api/settings returns settings');

    const updatedSettings = await request('POST', '/api/settings', {
      ...settings.data,
      lowStockThreshold: 6
    });
    assert(updatedSettings.status === 200 && updatedSettings.data.lowStockThreshold === 6, 'POST /api/settings updates settings');

    // Restore threshold
    await request('POST', '/api/settings', { ...settings.data, lowStockThreshold: 5 });

    // 18. API v1 alias check
    const v1Inventory = await request('GET', '/api/v1/inventory');
    assert(v1Inventory.status === 200 && Array.isArray(v1Inventory.data), 'GET /api/v1/inventory works identical to /api/inventory');

    // 19. 404 Error Check
    const notFound = await request('GET', '/api/nonexistent-route');
    assert(notFound.status === 404 && notFound.data.success === false, '404 handler returns structured JSON error');

    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// If executed directly, run tests
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
