import { NextResponse } from 'next/server';
import { site } from '@/lib/site-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, details, projectType } = body;

    // Basic validation
    if (!name || !email || !details || !projectType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // LOGGING FOR VERIFICATION
    // In a production environment, this is where you would integrate with Resend, SendGrid, or Postmark.
    console.log('--- NEW CONTACT INQUIRY ---');
    console.log(`To: ${site.email}`); // wakalaep915@gmail.com
    console.log(`From: ${name} (${email})`);
    console.log(`Service: ${projectType}`);
    console.log(`Message: ${details}`);
    console.log('---------------------------');

    /**
     * EXAMPLE RESEND INTEGRATION (Instruction for User):
     * 
     * 1. npm install resend
     * 2. Add RESEND_API_KEY to your .env.local
     * 3. Update this route:
     * 
     * import { Resend } from 'resend';
     * const resend = new Resend(process.env.RESEND_API_KEY);
     * 
     * await resend.emails.send({
     *   from: 'Wakala Website <onboarding@resend.dev>',
     *   to: site.email,
     *   subject: `New ${projectType} Inquiry from ${name}`,
     *   text: `Details: ${details}\n\nClient Email: ${email}`,
     * });
     */

    // Simulate a network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500 }
    );
  }
}
