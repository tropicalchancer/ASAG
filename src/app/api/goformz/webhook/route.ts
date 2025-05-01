import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { getAccessToken } from '@/lib/goformzAuth';
import axios from 'axios';

// Required for crypto module
export const runtime = "nodejs";
// Allow long-running for retries
export const maxDuration = 60;
// Disable cache
export const revalidate = 0;

interface GoFormzWebhookPayload {
  EventType: string;
  EntityId: string;
  Timestamp: string;
  Item: {
    Id: string;
    Url: string;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Webhook received');

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new NextResponse('Method not allowed', { status: 405 });
    }

    // Verify basic auth if credentials are set
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader ? 'present' : 'missing');
    
    if (process.env.GOFORMZ_USERNAME && process.env.GOFORMZ_PW) {
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      const expectedAuth = Buffer.from(
        `${process.env.GOFORMZ_USERNAME}:${process.env.GOFORMZ_PW}`
      ).toString('base64');

      const providedAuth = authHeader.split(' ')[1];
      if (providedAuth !== expectedAuth) {
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }
    
    // Parse webhook payload
    const rawPayload = await request.text();
    console.log('Raw payload:', rawPayload);
    
    const payload = JSON.parse(rawPayload) as GoFormzWebhookPayload;
    console.log('Parsed webhook payload:', payload);
    
    // Validate payload structure
    if (
      payload.EventType !== 'form.complete' ||
      !payload.EntityId ||
      !payload.Item?.Id ||
      !payload.Timestamp
    ) {
      console.error('Invalid payload structure:', payload);
      return new NextResponse('Invalid payload', { status: 400 });
    }

    const formId = payload.Item.Id;
    const templateId = payload.EntityId;
    // Convert GoFormz timestamp to ISO date
    const completedDate = new Date(Number(payload.Timestamp.slice(0, -4))).toISOString();
    console.log('Processed data:', { formId, templateId, completedDate });

    // Check for existing form to ensure idempotency
    console.log('Checking for existing form:', formId);
    const { data: existing, error: existingError } = await supabaseServer
      .from("goformz_forms")
      .select("form_id, processing_attempts")
      .eq("form_id", formId)
      .single();

    if (existingError) {
      console.error('Error checking existing form:', existingError);
    }

    if (existing) {
      console.log(`Form ${formId} already processed`);
      return new NextResponse('Already processed', { status: 200 });
    }

    // First upsert (stub)
    console.log('Creating initial form record');
    const { error: upsertError } = await supabaseServer
      .from("goformz_forms")
      .upsert({
        form_id: formId,
        template_id: templateId,
        completed_at: completedDate,
        processing_attempts: 1,
        last_processed_at: new Date().toISOString()
      }, { ignoreDuplicates: true });

    if (upsertError) {
      console.error('Error upserting form:', upsertError);
      throw upsertError;
    }

    // Fetch full form data using the URL from the webhook
    console.log('Fetching access token');
    const token = await getAccessToken();
    console.log('Got access token:', token ? 'present' : 'missing');
    
    console.log('Fetching full form data from:', payload.Item.Url);
    const { data } = await axios.get(
      payload.Item.Url,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('Got form data:', data ? 'present' : 'missing');

    // Update with full form data
    console.log('Updating form with full data');
    const { error: updateError } = await supabaseServer
      .from("goformz_forms")
      .update({ 
        raw_json: data,
        processing_attempts: 1,
        last_processed_at: new Date().toISOString()
      })
      .eq("form_id", formId);

    if (updateError) {
      console.error('Error updating form:', updateError);
      throw updateError;
    }

    console.log('Webhook processed successfully');
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
    }
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 