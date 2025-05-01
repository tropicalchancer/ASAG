import axios from 'axios';

const GOFORMZ_API_URL = 'https://api.goformz.com/v2';
const TEMPLATE_ID = '6c178ac1-dc28-45c1-8f5e-e1f4586f5182';
const WEBHOOK_ID = '6c178ac1-dc28-45c1-8f5e-e1f4586f5182';

async function testWebhook() {
  try {
    // First get an access token using username/password
    const authResponse = await axios.post(
      'https://api.goformz.com/oauth/token',
      {
        grant_type: 'password',
        username: 'accounting@allistonsandandgravel.com',
        password: 'T@pper21'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const token = authResponse.data.access_token;
    console.log('Got access token');

    // Get a specific webhook by ID
    const response = await axios.get(
      `${GOFORMZ_API_URL}/webhooks/${WEBHOOK_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Webhook details:', JSON.stringify(response.data, null, 2));

    // Test the webhook endpoint with a sample payload
    const samplePayload = {
      EventType: 'form.complete',
      EntityId: TEMPLATE_ID,
      Timestamp: Date.now().toString(),
      Item: {
        Id: 'test-form-id',
        Url: 'https://api.goformz.com/v2/formz/test-form-id'
      }
    };

    console.log('Sending test webhook payload:', JSON.stringify(samplePayload, null, 2));

    // Send the test webhook to our endpoint
    const webhookResponse = await axios.post(
      'http://localhost:3000/api/goformz/webhook',
      samplePayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from('accounting@allistonsandandgravel.com:T@pper21').toString('base64')}`
        }
      }
    );

    console.log('Webhook response:', webhookResponse.status, webhookResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('Error:', error);
    }
  }
}

// Run the test
testWebhook(); 