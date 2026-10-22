import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../dist/', import.meta.url));
const basePath = '/book';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === basePath) { res.writeHead(302, { Location: basePath + '/' }); res.end(); return; }
    if (pathname.startsWith(basePath + '/')) pathname = pathname.slice(basePath.length);
    const requested = path.resolve(root, '.' + pathname);
    const relative = path.relative(root, requested);
    if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); res.end('Forbidden'); return; }
    const file = (await stat(requested)).isDirectory() ? path.join(requested, 'index.html') : requested;
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    try { res.end(await readFile(path.join(root, '404.html'))); } catch { res.end('Not found'); }
  }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + server.address().port + basePath + '/'));
