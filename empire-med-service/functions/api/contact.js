// Cloudflare Pages Function: POST /api/contact
// Receives the Contact and Free Audit forms and emails them through Resend (https://resend.com).
//
// Environment variables, set in Pages > Settings > Variables and Secrets:
//   RESEND_API_KEY (secret, required)  API key from Resend
//   MAIL_FROM      (required)          Sender on a domain verified in Resend,
//                                      e.g. Empire Med Service <website@empiremedservice.com>
//   MAIL_TO        (optional)          Defaults to info@empiremedservice.com
//
// To use a different mail service, replace sendEmail() only.
// Message contents are never logged.

const DEFAULT_TO = 'info@empiremedservice.com';
const MAX_BODY_BYTES = 20_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+()\-.\s\d]{7,25}$/;

const SPECIALTIES = ['Primary Care', 'Cardiology', 'Dermatology', 'Mental Health', 'Oncology', 'Radiology', 'Hospital or health system', 'Other'];
const VOLUMES = ['Under 500', '500–1,000', '1,001–5,000', '5,001–10,000', 'Over 10,000', 'Not sure'];

const FORMS = {
  contact: {
    subject: 'Website message',
    fields: {
      name: { label: 'Name', required: true, max: 120 },
      email: { label: 'Email', required: true, max: 254, type: 'email' },
      phone: { label: 'Phone', max: 25, type: 'phone' },
      message: { label: 'Message', required: true, max: 3000, multiline: true },
    },
  },
  audit: {
    subject: 'Free audit request',
    fields: {
      name: { label: 'Name', required: true, max: 120 },
      practice: { label: 'Practice name', required: true, max: 160 },
      email: { label: 'Email', required: true, max: 254, type: 'email' },
      phone: { label: 'Phone', required: true, max: 25, type: 'phone' },
      specialty: { label: 'Specialty', required: true, oneOf: SPECIALTIES },
      volume: { label: 'Monthly claim volume', required: true, oneOf: VOLUMES },
      message: { label: 'Message', max: 3000, multiline: true },
    },
  },
};

export function validate(formType, data) {
  const form = FORMS[formType];
  const clean = {};
  const errors = {};
  for (const [key, rule] of Object.entries(form.fields)) {
    let value = String(data[key] ?? '').trim();
    // Single-line fields lose all control characters; this also blocks header injection.
    value = rule.multiline ? value.replace(/[^\P{Cc}\n\r\t]/gu, '') : value.replace(/\p{Cc}/gu, ' ');
    if (!value) { if (rule.required) errors[key] = `Enter your ${rule.label.toLowerCase()}.`; clean[key] = ''; continue; }
    if (rule.max && value.length > rule.max) errors[key] = `${rule.label} must be ${rule.max} characters or fewer.`;
    else if (rule.type === 'email' && !EMAIL_RE.test(value)) errors[key] = 'Enter a valid email address.';
    else if (rule.type === 'phone' && !PHONE_RE.test(value)) errors[key] = 'Enter a valid phone number.';
    else if (rule.oneOf && !rule.oneOf.includes(value)) errors[key] = `Choose a ${rule.label.toLowerCase()} from the list.`;
    clean[key] = value;
  }
  return { clean, errors };
}

async function sendEmail(env, { to, replyTo, subject, text }) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], reply_to: replyTo, subject, text }),
  });
}

async function readBody(request) {
  const type = request.headers.get('content-type') || '';
  if (type.includes('application/json')) return request.json();
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function onRequestPost({ request, env }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');
  const respond = (status, payload) => {
    if (wantsJson) return Response.json(payload, { status, headers: { 'Cache-Control': 'no-store' } });
    // Browsers without JavaScript post the form directly.
    if (payload.ok) return new Response(null, { status: 303, headers: { Location: '/thanks/' } });
    const detail = payload.fieldErrors ? Object.values(payload.fieldErrors).join(' ') : payload.error;
    return new Response(`Your message was not sent. ${detail} Use your browser's back button to try again.`, {
      status, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  };

  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return respond(403, { ok: false, error: 'This form can only be sent from our website.' });
  }
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) {
    return respond(413, { ok: false, error: 'Your message is too long. Shorten it and try again.' });
  }

  let data;
  try { data = await readBody(request); } catch {
    return respond(400, { ok: false, error: 'The form could not be read. Refresh the page and try again.' });
  }
  if (!data || typeof data !== 'object') return respond(400, { ok: false, error: 'The form could not be read. Refresh the page and try again.' });

  // Honeypot: report success so bots learn nothing, and send nothing.
  if (data.company_website) return respond(200, { ok: true });

  const formType = data.form_type === 'audit' ? 'audit' : 'contact';
  const { clean, errors } = validate(formType, data);
  if (Object.keys(errors).length) {
    return respond(422, { ok: false, error: 'Check the highlighted fields.', fieldErrors: errors });
  }

  if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
    console.error('contact form: RESEND_API_KEY or MAIL_FROM is not set');
    return respond(503, { ok: false, error: 'Our form is unavailable right now. Please email or call us instead.' });
  }

  const form = FORMS[formType];
  const text = Object.entries(form.fields)
    .map(([key, rule]) => `${rule.label}: ${clean[key] || '(not provided)'}`)
    .join('\n');

  try {
    const res = await sendEmail(env, {
      to: env.MAIL_TO || DEFAULT_TO,
      replyTo: clean.email,
      subject: `${form.subject}: ${clean.practice || clean.name}`.slice(0, 200),
      text: `${text}\n\nSent from the ${formType} form on the website.`,
    });
    if (!res.ok) {
      console.error('contact form: mail provider returned', res.status);
      return respond(502, { ok: false, error: 'We could not send your message. Please email or call us instead.' });
    }
  } catch {
    console.error('contact form: mail provider unreachable');
    return respond(502, { ok: false, error: 'We could not send your message. Please email or call us instead.' });
  }
  return respond(200, { ok: true });
}
