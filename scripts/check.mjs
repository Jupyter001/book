import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Script } from 'node:vm';
const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Missing anchor: ${target}`);
for (const [, target] of html.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g)) await access(path.join(root, 'dist', target));
assert.ok(html.includes('lang="zh-CN"'));
assert.equal([...html.matchAll(/<h1\b/g)].length, 1);
for (const section of ['about', 'journey', 'notes', 'contact']) assert.ok(ids.includes(section));
assert.ok(!/lorem ipsum|TODO|待填写|example\.com/i.test(html), 'Unfinished content');
assert.ok(html.includes('mailto:oreo0815@foxmail.com'));
assert.ok(html.includes('<link rel="canonical" href="https://jupyter001.github.io/book/">'));
assert.ok(!html.includes('chatgpt.site'), 'Old hosting metadata');
for (const [, file] of html.matchAll(/https:\/\/github\.com\/Jupyter001\/book\/blob\/main\/([^"#]+)/g)) {
  await access(path.join(root, decodeURIComponent(file)));
}
const sitemap = await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
assert.ok(sitemap.includes('<loc>https://jupyter001.github.io/book/</loc>'));
const notFound = await readFile(path.join(root, 'dist/404.html'), 'utf8');
assert.ok(notFound.includes('href="/book/"'));
new Script(await readFile(path.join(root, 'dist/assets/main.js'), 'utf8'), { filename: 'main.js' });
console.log('Passed: anchors, local assets, original notes, GitHub Pages metadata, 404 page, and JavaScript syntax.');
