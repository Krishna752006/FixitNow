// Quick test script to configure Razorpay credentials dynamically
// Run this with: node test-razorpay-config.js

const API_BASE_URL = 'http://localhost:5000/api';

async function testRazorpayConfig() {
  try {
    // You'll need to replace this with a valid auth token from your app
    const authToken = 'your-auth-token-here'; // Get this from localStorage in browser
    
    const response = await fetch(`${API_BASE_URL}/admin/config/razorpay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        keyId: 'rzp_test_R6hb7VAWps0Wvu',
        keySecret: 'mi9ALo2YY5XMVinWGEkWOBPw'
      }),
    });

    const data = await response.json();
    console.log('Razorpay Config Response:', data);

    // Test getting status
    const statusResponse = await fetch(`${API_BASE_URL}/admin/config/status`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const statusData = await statusResponse.json();
    console.log('Config Status:', statusData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

console.log('To use this script:');
console.log('1. Login to your app and get the auth token from localStorage');
console.log('2. Replace "your-auth-token-here" with the actual token');
console.log('3. Run: node test-razorpay-config.js');
console.log('');
console.log('Or use the RazorpayConfig component in the Provider Dashboard!');

// Uncomment the line below and add your auth token to run the test
// testRazorpayConfig();
