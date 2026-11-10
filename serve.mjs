// Tiny static server for local preview, the Node twin of serve.py, for a
// machine without Python.  node serve.mjs [port]
// Same behaviour: serves this file's own folder on http://localhost:4173,
// knows AVIF (or the browser refuses to decode the frames), and sends
// no-cache with Last-Modified, so a plain reload shows edits while unchanged
// files come back 304.
import { createServer } from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = +(process.env.PORT || process.argv[2] || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.m4a': 'audio/mp4', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.ico': 'image/x-icon', '.txt': 'text/plain' };

createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = normalize(join(ROOT, p));
  try {
    if (!f.startsWith(ROOT)) throw 0;
    let s = await stat(f);
    if (s.isDirectory()) { f = join(f, 'index.html'); s = await stat(f); }
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Last-Modified', s.mtime.toUTCString());
    const since = req.headers['if-modified-since'];
    if (since && Math.floor(s.mtimeMs / 1000) <= Date.parse(since) / 1000) { res.writeHead(304).end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(await readFile(f));
  } catch { res.writeHead(404).end('not found'); console.log('404', p); }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://localhost:${PORT}`));
