import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost } from '../functions/api/contact.js';

const env = { RESEND_API_KEY: 'k', MAIL_FROM: 'Site <w@empiremedservice.com>' };
const good = { form_type: 'contact', name: 'Ana Ruiz', email: 'ana@example.com', message: 'Hello' };
const audit = { form_type: 'audit', name: 'Ana', practice: 'Acme Clinic', email: 'a@example.com', phone: '+1 513 555 0100', specialty: 'Cardiology', volume: 'Not sure' };
const call = (body, { headers = {}, e = env } = {}) => onRequestPost({ env: e, request: new Request('https://empiremedservice.com/api/contact', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }) });
function stubMail(status = 200) { const sent = []; globalThis.fetch = async (u, i) => { sent.push(JSON.parse(i.body)); return new Response('{}', { status }); }; return sent; }

test('valid contact form emails info@ with reply-to', async () => {
  const sent = stubMail(); const r = await call(good);
  assert.equal(r.status, 200); assert.equal(sent.length, 1);
  assert.deepEqual(sent[0].to, ['info@empiremedservice.com']); assert.equal(sent[0].reply_to, 'ana@example.com');
});
test('valid audit form includes all fields', async () => {
  const sent = stubMail(); const r = await call(audit);
  assert.equal(r.status, 200); for (const v of ['Acme Clinic', 'Cardiology', 'Not sure']) assert.ok(sent[0].text.includes(v));
});
test('missing required fields return field errors and send nothing', async () => {
  const sent = stubMail(); const r = await call({ form_type: 'contact', email: 'bad' }); const j = await r.json();
  assert.equal(r.status, 422); assert.deepEqual(Object.keys(j.fieldErrors).sort(), ['email', 'message', 'name']); assert.equal(sent.length, 0);
});
test('audit rejects a specialty that is not in the list', async () => {
  stubMail(); const r = await call({ ...audit, specialty: 'Nope' }); assert.equal(r.status, 422);
});
test('honeypot reports success without sending', async () => {
  const sent = stubMail(); const r = await call({ ...good, company_website: 'http://spam' });
  assert.equal(r.status, 200); assert.equal(sent.length, 0);
});
test('line breaks cannot reach the subject line', async () => {
  const sent = stubMail(); await call({ ...good, name: 'Ana\r\nBcc: x@y.z' });
  assert.ok(!/[\r\n]/.test(sent[0].subject));
});
test('cross-origin posts are refused', async () => {
  const sent = stubMail(); const r = await call(good, { headers: { origin: 'https://evil.example' } });
  assert.equal(r.status, 403); assert.equal(sent.length, 0);
});
test('oversized and malformed bodies are refused', async () => {
  stubMail();
  assert.equal((await call(good, { headers: { 'content-length': '999999' } })).status, 413);
  assert.equal((await call('{nope')).status, 400);
  assert.equal((await call('null')).status, 400);
});
test('missing configuration and provider failure give a clear error', async () => {
  stubMail(); assert.equal((await call(good, { e: {} })).status, 503);
  stubMail(500); const r = await call(good); assert.equal(r.status, 502); assert.match((await r.json()).error, /email or call/);
});
test('no-JS submission redirects to the thank-you page', async () => {
  stubMail();
  const r = await onRequestPost({ env, request: new Request('https://empiremedservice.com/api/contact', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(good) }) });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/thanks/');
});
