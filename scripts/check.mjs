import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Script } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');

// 结构检查
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML IDs');
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), `Missing anchor: ${target}`);
for (const [, target] of html.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g)) await access(path.join(root, 'dist', target));
assert.ok(html.includes('lang="zh-CN"'));
assert.equal([...html.matchAll(/<h1\b/g)].length, 1, 'Exactly one h1 required');
for (const section of ['week0', 'photos', 'stories', 'workflow']) assert.ok(ids.includes(section), `Missing section: ${section}`);
assert.ok(html.includes('https://github.com/Jupyter001/book/blob/main/content/characters/README.md'), 'Week 0 character guide link missing');
assert.ok(!/lorem ipsum|TODO|待填写|example\.com/i.test(html), 'Unfinished content');
assert.ok(html.includes('<link rel="canonical" href="https://jupyter001.github.io/book/">'));
assert.ok(!html.includes('chatgpt.site'), 'Old hosting metadata');
assert.ok(!/旅行手记|环游世界|我的足迹/.test(html), 'Travel content must not appear on the drama library page');
const characterTemplate = JSON.parse(await readFile(path.join(root, 'content/characters/template.json'), 'utf8'));
assert.equal(characterTemplate.status, 'draft', 'Character template must start unapproved');
assert.equal(characterTemplate.visualDesign.status, 'draft', 'Visual design must start unapproved');
assert.equal(characterTemplate.sound.enabled, false, 'Sound design must remain optional');

// 数据一致性
const photoData = JSON.parse(await readFile(path.join(root, 'content/photos.json'), 'utf8'));
const storyData = JSON.parse(await readFile(path.join(root, 'content/stories.json'), 'utf8'));
assert.equal([...html.matchAll(/class="photo-card"/g)].length, photoData.photos.length, 'Photo cards out of sync');
assert.equal([...html.matchAll(/class="work-card"/g)].length, storyData.works.length, 'Work cards out of sync');
for (const photo of photoData.photos) assert.ok(html.includes(escapeHtml(photo.description)), 'Missing photo description: ' + photo.id);
for (const work of storyData.works) assert.ok(html.includes('<h3>' + escapeHtml(work.title) + '</h3>'), 'Missing work: ' + work.title);
const embedded = JSON.parse(html.match(/<script id="library-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(embedded, { photos: photoData.photos }, 'Embedded library data is stale');

// 发布辅助文件
const sitemap = await readFile(path.join(root, 'dist/sitemap.xml'), 'utf8');
assert.ok(sitemap.includes('<loc>https://jupyter001.github.io/book/</loc>'));
const notFound = await readFile(path.join(root, 'dist/404.html'), 'utf8');
assert.ok(notFound.includes('href="/book/"'));
new Script(await readFile(path.join(root, 'dist/assets/main.js'), 'utf8'), { filename: 'main.js' });

console.log(`Passed: ${photoData.photos.length} photos, ${storyData.works.length} works, anchors, assets, metadata, 404 page, JavaScript syntax.`);

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
