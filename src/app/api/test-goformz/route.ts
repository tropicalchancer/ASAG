import { NextResponse } from 'next/server';
import axios from 'axios';

// Direct API test to understand GoFormz responses
export async function GET(req: Request) {
  try {
    // Get the date from query parameters
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || '';
    const target = dateStr ? new Date(dateStr) : new Date();
    
    // Verify environment variables
    if (!process.env.GOFORMZ_CLIENT_ID || !process.env.GOFORMZ_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Missing OAuth credentials' },
        { status: 400 }
      );
    }
    
    // 1. First get an access token
    const tokenResponse = await getAccessToken();
    
    // 2. Format the request details
    const templateId = process.env.GOFORMZ_TEMPLATE_ID || '';
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);
    
    // 3. Try different API endpoints to see which one works
    const results = {
      token: {
        success: true,
        message: 'Token retrieved successfully'
      },
      endpoints: {
        v2templates: await testEndpoint(
          tokenResponse.access_token,
          `/templates/${templateId}/formz`,
          {
            status: 'complete',
            modifiedDateStart: start.toISOString(),
            modifiedDateEnd: end.toISOString(),
            take: '100'
          }
        ),
        v2formz: await testEndpoint(
          tokenResponse.access_token,
          '/formz',
          {
            templateId: templateId,
            status: 'complete',
            modifiedDate: `${start.toISOString()},${end.toISOString()}`,
            pageSize: '100'
          }
        ),
        v2FormsGet: await testEndpoint(
          tokenResponse.access_token,
          '/forms',
          {
            templateId: templateId,
            status: 'Completed',
            modifiedDateStart: start.toISOString(),
            modifiedDateEnd: end.toISOString(),
            pageSize: '100'
          }
        )
      },
      request: {
        date: target.toISOString(),
        start: start.toISOString(),
        end: end.toISOString(),
        templateId: templateId
      }
    };
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { 
        error: 'API test failed',
        message: axios.isAxiosError(error) 
          ? `${error.message} - ${JSON.stringify(error.response?.data)}` 
          : String(error)
      },
      { status: 500 }
    );
  }
}

async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'public_api',
    client_id: process.env.GOFORMZ_CLIENT_ID!,
    client_secret: process.env.GOFORMZ_CLIENT_SECRET!
  });
  
  const response = await axios.post('https://accounts.goformz.com/connect/token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data;
}

async function testEndpoint(token: string, endpoint: string, params: Record<string, string>) {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    
    const url = `https://api.goformz.com/v2${endpoint}?${queryParams.toString()}`;
    console.log(`Testing endpoint: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return {
      success: true,
      status: response.status,
      url: url,
      data: response.data,
      dataKeys: Object.keys(response.data || {})
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status,
        url: error.config?.url,
        error: error.message,
        response: error.response?.data
      };
    }
    
    return {
      success: false,
      error: String(error)
    };
  }
} 