// Test script to check the cities API endpoint
async function testCitiesApi() {
  try {
    console.log('Testing cities API endpoint...');
    
    const response = await fetch('https://ai.alviongs.com/webhook/v1/nibog/city/get-all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log('Response headers:', JSON.stringify([...response.headers.entries()], null, 2));
    
    try {
      const data = JSON.parse(text);
      console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Raw response (not JSON):', text.substring(0, 500));
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testCitiesApi();
