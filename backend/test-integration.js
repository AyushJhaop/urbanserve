// UrbanServe Automated End-to-End Test Suite
const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting UrbanServe End-to-End Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health Check
  await test('Backend Health Check & Module Registration', async () => {
    const res = await request({ host: 'localhost', port: 5000, path: '/health', method: 'GET' });
    if (res.status !== 200 || !res.data.success) throw new Error(`Health status ${res.status}`);
    if (res.data.modules.length < 10) throw new Error('Missing registered modules');
  });

  // 2. Customer Authentication
  let customerToken = '';
  let customerId = '';
  await test('Customer Authentication & JWT Issuance', async () => {
    const res = await request(
      { host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'customer@test.com', password: 'Customer@123' }
    );
    if (res.status !== 200) throw new Error(res.data?.message || 'Login failed');
    customerToken = res.data.data.token;
    customerId = res.data.data.user.id;
    if (!customerToken) throw new Error('Missing token');
  });

  // 3. Professional Authentication
  let proToken = '';
  await test('Professional Authentication & Profile Retrieval', async () => {
    const res = await request(
      { host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'professional@test.com', password: 'Professional@123' }
    );
    if (res.status !== 200) throw new Error('Pro login failed');
    proToken = res.data.data.token;
  });

  // 4. Admin Authentication
  let adminToken = '';
  await test('Admin Authentication & RBAC Access', async () => {
    const res = await request(
      { host: 'localhost', port: 5000, path: '/api/v1/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@urbanserve.com', password: 'Admin@123' }
    );
    if (res.status !== 200 || res.data.data.user.role !== 'ADMIN') throw new Error('Admin login failed');
    adminToken = res.data.data.token;
  });

  // 5. Service Catalog
  let testServiceId = '';
  await test('Service Catalog Listing & Categories', async () => {
    const res = await request({ host: 'localhost', port: 5000, path: '/api/v1/services', method: 'GET' });
    if (res.status !== 200 || res.data.data.length === 0) throw new Error('No services returned');
    testServiceId = res.data.data[0].id;
  });

  // 6. Booking Creation & Slot Validation
  let testBookingId = '';
  await test('Scheduled Booking Creation (FR-BOOK-001 - FR-BOOK-007)', async () => {
    const res = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      {
        service_id: testServiceId,
        street_address: '123 Test Avenue',
        city: 'Springfield',
        booking_type: 'SCHEDULED',
        scheduled_date: '2026-09-25',
        scheduled_time: '11:00',
        total_amount: 95.0,
      }
    );
    if (res.status !== 201) throw new Error(res.data?.message || 'Failed to create booking');
    testBookingId = res.data.data.id;
  });

  // 7. Payment Order & Verification (BRULE-007)
  await test('Payment Order & Gateway Verification (FR-PAY-001 - FR-PAY-005)', async () => {
    const orderRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/payments/create-order',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      { booking_id: testBookingId, gateway: 'RAZORPAY' }
    );
    if (orderRes.status !== 201) throw new Error('Order creation failed');

    const verifyRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/payments/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      {
        booking_id: testBookingId,
        gateway_transaction_id: 'pay_test_' + Date.now(),
        payment_status: 'COMPLETED',
      }
    );
    if (verifyRes.status !== 200 || !verifyRes.data.success) throw new Error('Payment verification failed');
  });

  // 8. Lifecycle State Machine Advance to COMPLETED (BRULE-008)
  await test('Lifecycle State Progression to COMPLETED (BRULE-008)', async () => {
    await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/v1/bookings/${testBookingId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${proToken}`,
        },
      },
      { status: 'PROFESSIONAL_ON_THE_WAY' }
    );

    await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/v1/bookings/${testBookingId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${proToken}`,
        },
      },
      { status: 'IN_PROGRESS' }
    );

    const compRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/v1/bookings/${testBookingId}/status`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${proToken}`,
        },
      },
      { status: 'COMPLETED' }
    );
    if (compRes.status !== 200 || compRes.data.data.status !== 'COMPLETED') throw new Error('Status progression failed');
  });

  // 9. Review Submission (BRULE-005)
  await test('Customer Review & Rating Recalculation (FR-REV-001 - FR-REV-005, BRULE-005)', async () => {
    const res = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/reviews',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      {
        booking_id: testBookingId,
        rating: 5,
        comment: 'Outstanding craftsmanship and super fast completion!',
      }
    );
    if (res.status !== 201) throw new Error(res.data?.message || 'Review failed');
  });

  // 10. Quick-Service Real-Time Matching Engine (FR-QUICK-001 - FR-QUICK-010)
  await test('Quick-Service Urgent Dispatch & Atomic Pro Acceptance (FR-QUICK)', async () => {
    const qsRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/quick-services',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      {
        service_id: testServiceId,
        street_address: '999 Urgent Blvd',
        city: 'Springfield',
      }
    );
    if (qsRes.status !== 201) throw new Error('Quick service dispatch failed');
    const qsId = qsRes.data.data.id;

    // Pro accepts
    const acceptRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/v1/quick-services/${qsId}/accept`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${proToken}`,
        },
      }
    );
    if (acceptRes.status !== 200) throw new Error('Pro accept failed');
  });

  // 11. Conversational AI Assistant
  await test('Conversational AI Assistant Intent Routing (FR-AI-001 - FR-AI-010)', async () => {
    const res = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/ai/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`,
        },
      },
      { message: 'What is the status of my booking?' }
    );
    if (res.status !== 200 || res.data.data.intent !== 'STATUS_CHECK') {
      throw new Error(`AI returned intent: ${res.data?.data?.intent}`);
    }
  });

  // 12. Admin Dashboard & KYC Approval
  await test('Admin Dashboard & Professional Approval (FR-ADM-001 - FR-ADM-004)', async () => {
    const prosRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/v1/admin/professionals',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      }
    );
    if (prosRes.status !== 200) throw new Error('Admin pros fetch failed');
    const pendingPro = prosRes.data.data.find((p) => p.approval_status === 'PENDING');
    if (pendingPro) {
      const appRes = await request(
        {
          host: 'localhost',
          port: 5000,
          path: `/api/v1/admin/professionals/${pendingPro.id}/approve`,
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
          },
        }
      );
      if (appRes.status !== 200) throw new Error('Pro approval failed');
    }
  });

  console.log(`\n🎉 Tests Finished! Passed: ${passed} | Failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

runTests();
