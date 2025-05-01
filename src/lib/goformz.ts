import axios from 'axios';
import { getAccessToken } from './goformzAuth';

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
  formId: string;
  fields: Record<string, { value: string }>;
}

// Create axios instance for GoFormz API
const goformzApi = axios.create({
  baseURL: 'https://api.goformz.com/v2',
});

export async function getFormsForDate(target: Date): Promise<GoFormzForm[]> {
  const accessToken = await getAccessToken();
  
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
    
    // Handle both direct array and paginated responses
    const items = Array.isArray(response.data) ? response.data : response.data.items ?? [];
    console.log(`Found ${items.length} forms`);
    return items;
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
  const accessToken = await getAccessToken();
  const response = await goformzApi.get(`/formz/${formId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  const form = response.data;
  
  // Updated field mappings to match Honda DWR template
  return {
    date: form.fields['Date']?.value || '',
    name: form.fields['Employee Name']?.value || '',
    job: form.fields['Job Number']?.value || '',
    location: form.fields['Location']?.value || '',
    work: form.fields['Work Description']?.value || '',
    machine: form.fields['Machine']?.value || '',
    unit: form.fields['Unit Number']?.value || '',
    hours: form.fields['Hours']?.value || '',
    notes: form.fields['Notes']?.value || '',
  };
}