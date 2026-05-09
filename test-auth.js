const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function parseJwt (token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

async function runTest() {
  try {
    const ts = Date.now();
    const email = `testuser_${ts}@example.com`;
    console.log(`1. Registering user ${email}...`);
    
    const regData = JSON.stringify({ email, password: "password123", full_name: "Test User" });
    const regRes = await makeRequest({
      hostname: 'localhost', port: 4000, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regData) }
    }, regData);
    
    const regJson = JSON.parse(regRes.data);
    const token = regJson.data?.accessToken;
    
    console.log("Token payload:", parseJwt(token));
    
    console.log("2. Creating PC build...");

    const buildData = JSON.stringify({ name: `Smoke build ${ts}` });
    const buildRes = await makeRequest({
      hostname: 'localhost', port: 4000, path: '/api/pc-builder', method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(buildData)
      }
    }, buildData);

    const buildJson = JSON.parse(buildRes.data);
    const buildId = buildJson.data?.id;
    console.log("PC Builder Create Status:", buildRes.status);
    console.log("PC Builder Create Response:", buildRes.data);

    console.log("3. Fetching PC build detail...");

    const pcRes = await makeRequest({
      hostname: 'localhost', port: 4000, path: `/api/pc-builder/${buildId}`, method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    console.log("PC Builder Status:", pcRes.status);
    console.log("PC Builder Response:", pcRes.data);

  } catch (error) {
    console.error("Test failed:", error);
  }
}

runTest();
