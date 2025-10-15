#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the deployed application endpoints
 */

import https from 'https';
import http from 'http';

const BACKEND_URL = 'https://fixit-6c7l.onrender.com';
const FRONTEND_URL = 'https://fixitnow-rho.vercel.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', reject);
  });
}

async function testEndpoint(name, url) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`📍 URL: ${url}`);
  
  try {
    const response = await makeRequest(url);
    console.log(`✅ Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const json = JSON.parse(response.data);
        console.log(`📄 Response:`, json);
      } catch (e) {
        console.log(`📄 Response: ${response.data.substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ Error: ${response.data}`);
    }
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

async function testCORS(backendUrl, origin) {
  console.log(`\n🌐 Testing CORS from ${origin}...`);
  
  return new Promise((resolve) => {
    const url = new URL(backendUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'OPTIONS',
      headers: {
        'Origin': origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ CORS Status: ${res.statusCode}`);
      console.log(`📋 CORS Headers:`, {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      });
      resolve();
    });

    req.on('error', (error) => {
      console.log(`❌ CORS Test Failed: ${error.message}`);
      resolve();
    });

    req.end();
  });
}

async function main() {
  console.log('🚀 FixItNow Deployment Verification');
  console.log('=====================================');

  // Test backend endpoints
  await testEndpoint('Backend Health Check', `${BACKEND_URL}/api/health`);
  await testEndpoint('Backend CORS Test', `${BACKEND_URL}/api/cors-test`);
  
  // Test CORS
  await testCORS(`${BACKEND_URL}/api/cors-test`, FRONTEND_URL);
  
  // Test frontend
  await testEndpoint('Frontend Home Page', FRONTEND_URL);
  
  console.log('\n✨ Verification Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. If health check fails, check Render deployment logs');
  console.log('2. If CORS fails, verify environment variables on Render');
  console.log('3. If frontend fails, check Vercel deployment');
  console.log('4. Clear browser cache and try again');
}

main().catch(console.error);
