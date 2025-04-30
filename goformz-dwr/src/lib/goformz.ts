import axios from 'axios';

// TODO: Update these field names to match your GoFormz template
interface DWRForm {
  date: string;
  name: string;
  job: string;
  location: string;
  work: string;
  machine: string;
  unit: string;
  hours: string | number;
  notes: string;
}

interface GoFormzForm {
  id: string;
  fields: Record<string, { value: string }>;
}

// Create axios instance for OAuth token requests
const authApi = axios.create({
  baseURL: 'https://accounts.goformz.com/connect',
});

// Create axios instance for GoFormz API
const goformzApi = axios.create({
  baseURL: 'https://api.goformz.com/v2',
});

// Get OAuth access token
async function getAccessToken(): Promise<string> {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      scope: 'public_api',
      client_id: process.env.GOFORMZ_CLIENT_ID!,
      client_secret: process.env.GOFORMZ_CLIENT_SECRET!
    });
    const response = await authApi.post('/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// 3. Implement token caching (simplified example)
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

async function getCachedAccessToken(): Promise<string> {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
    return cachedToken;
  }
  const token = await getAccessToken();
  cachedToken = token;
  tokenExpiry = Date.now() + 3600000; // Assume 1 hour expiry for example
  return token;
}

export async function getFormsForDate(target: Date): Promise<GoFormzForm[]> {
  const accessToken = await getCachedAccessToken();
  
  // Build start = 00:00:00 UTC of target date
  // End = 23:59:59 UTC of target date
  // This gives us a full 24 hour window in UTC time
  const start = new Date(target);
  start.setUTCHours(0, 0, 0, 0);
  
  const end = new Date(target);
  end.setUTCHours(23, 59, 59, 999);
  
  console.log(`Date range for ${target.toDateString()}: ${start.toISOString()} to ${end.toISOString()}`);

  // Use the templates/{id}/formz endpoint that works
  const endpoint = `/templates/${process.env.GOFORMZ_TEMPLATE_ID}/formz`;
  const params = new URLSearchParams({
    status: "complete",
    modifiedDateStart: start.toISOString(),
    modifiedDateEnd: end.toISOString(),
    take: "100"
  });

  try {
    console.log(`Fetching forms from: ${goformzApi.defaults.baseURL}${endpoint}?${params.toString()}`);
    const response = await goformzApi.get(`${endpoint}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (response.data && Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} forms in direct array`);
      return response.data;
    }
    
    return [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("GoFormz API Error:", error.response?.status, error.response?.data);
    } else {
      console.error("Non-Axios error:", String(error));
    }
    return [];
  }
}

export function getYesterdayForms(date: Date): Promise<GoFormzForm[]> {
  return getFormsForDate(date);
}

export async function fetchFormData(formId: string): Promise<DWRForm> {
  const accessToken = await getCachedAccessToken();
  const response = await goformzApi.get(`/forms/${formId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const form = response.data;
  
  // TODO: Update these field mappings to match your GoFormz template field names
  return {
    date: form.fields['DWR_Date']?.value || '',
    name: form.fields['Employee_Name']?.value || '',
    job: form.fields['Job_Number']?.value || '',
    location: form.fields['Location']?.value || '',
    work: form.fields['Work_Description']?.value || '',
    machine: form.fields['Machine']?.value || '',
    unit: form.fields['Unit_Number']?.value || '',
    hours: form.fields['Hours']?.value || '',
    notes: form.fields['Notes']?.value || '',
  };
} 