import { NextResponse } from 'next/server';
import type { LeadAttributionInput } from '@/lib/lead-attribution';
import { createContactLead } from '@/lib/leads';
import { getProjectTypeLabel, isProjectTypeId } from '@/lib/project-types';
import { site } from '@/lib/site-data';

export const runtime = 'nodejs';

type ContactRequestBody = {
  attribution?: LeadAttributionInput;
  details?: unknown;
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  projectType?: unknown;
};

function getTextField(
  value: unknown,
  fieldName: string,
  { required = true, maxLength = 120 }: { required?: boolean; maxLength?: number } = {}
) {
  if (typeof value !== 'string') {
    if (required) {
      throw new Error(`${fieldName} is required.`);
    }

    return '';
  }

  const trimmed = value.trim();

  if (required && !trimmed) {
    throw new Error(`${fieldName} is required.`);
  }

  if (trimmed.length > maxLength) {
    throw new Error(`${fieldName} is too long.`);
  }

  return trimmed;
}

function validateEmail(value: unknown) {
  const email = getTextField(value, 'Email address', { maxLength: 120 });
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new Error('Enter a valid email address.');
  }

  return email.toLowerCase();
}

function validatePhone(value: unknown) {
  const phone = getTextField(value, 'Phone number', { maxLength: 24 });
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    throw new Error('Enter a valid phone number.');
  }

  return phone;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactRequestBody;
    const name = getTextField(body.name, 'Full name', { maxLength: 80 });
    const email = validateEmail(body.email);
    const phone = validatePhone(body.phone);
    const details = getTextField(body.details, 'Project details', { maxLength: 2400 });

    if (typeof body.projectType !== 'string' || !isProjectTypeId(body.projectType)) {
      return NextResponse.json({ error: 'Select a valid project type.' }, { status: 400 });
    }

    const projectLabel = getProjectTypeLabel(body.projectType);

    await createContactLead({
      attribution: body.attribution,
      customerName: name,
      details,
      email,
      phone,
      serviceType: projectLabel,
    });

    console.log('--- NEW CONTACT INQUIRY ---');
    console.log(`To: ${site.email}`);
    console.log(`From: ${name} (${email}, ${phone})`);
    console.log(`Service: ${projectLabel}`);
    console.log(`Message: ${details}`);
    console.log('---------------------------');

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
