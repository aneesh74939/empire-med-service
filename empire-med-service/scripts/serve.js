// Local preview: serves dist/ and runs the real form function, with email sending stubbed.
// Emails are printed to the terminal rather than sent. Usage: npm run dev [-- port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { onRequestPost } from '../functions/api/contact.js';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 8788);
const csp = readFileSync(join(dist, '_headers'), 'utf8').match(/Content-Security-Policy: (.*)/)[1];
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff': 'font/woff', '.xml': 'application/xml', '.txt': 'text/plain' };

const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url).includes('api.resend.com')) {
    if (process.env.MAIL_FAIL) return new Response('{}', { status: 500 });
    console.log('\n--- Email (not sent, local preview) ---\n' + JSON.parse(init.body).subject + '\n' + JSON.parse(init.body).text + '\n');
    return Response.json({ id: 'local' });
  }
  return realFetch(url, init);
};
const env = { RESEND_API_KEY: 'local', MAIL_FROM: 'Local <local@example.com>' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/api/contact') {
    if (req.method !== 'POST') { res.writeHead(405).end(); return; }
    const chunks = []; for await (const c of req) chunks.push(c);
    const r = new Request(url, { method: 'POST', headers: req.headers, body: Buffer.concat(chunks) });
    const out = await onRequestPost({ request: r, env });
    res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(await out.text()); return;
  }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  let file = join(dist, path);
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch { file = null; }
  let status = 200; let body;
  try { body = await readFile(file); } catch { status = 404; file = join(dist, '404.html'); body = await readFile(file); }
  res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Security-Policy': csp });
  res.end(body);
}).listen(port, () => console.log(`Preview running at http://localhost:${port}`));
