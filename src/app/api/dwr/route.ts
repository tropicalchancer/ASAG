import { NextResponse } from 'next/server';
import { getFormsForDate, fetchFormData } from '@/lib/goformz';

export async function GET(req: Request) {
  try {
    // Check if environment variables are set
    if (!process.env.GOFORMZ_CLIENT_ID || !process.env.GOFORMZ_CLIENT_SECRET || !process.env.GOFORMZ_TEMPLATE_ID) {
      return NextResponse.json(
        { 
          error: 'Missing API credentials',
          message: 'Please set GOFORMZ_CLIENT_ID, GOFORMZ_CLIENT_SECRET, and GOFORMZ_TEMPLATE_ID in your .env.local file'
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    const target = dateStr ? new Date(dateStr) : yesterday();

    console.log("Fetching forms for date:", target.toISOString());
    const forms = await getFormsForDate(target);   // ALWAYS an array
    console.log("API Response - forms:", JSON.stringify(forms, null, 2));

    if (forms.length === 0) {                     // ← graceful empty day
      console.log("No forms found for date:", target.toISOString());
      return NextResponse.json([]);
    }

    console.log(`Found ${forms.length} forms, fetching details...`);
    const rows = await Promise.all(forms.map(f => fetchFormData(f.id)));
    return NextResponse.json(rows);
  } catch (err) {
    console.error("DWR API error:", err);
    return NextResponse.json({ error: "GoFormz request failed" }, { status: 500 });
  }
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
} 