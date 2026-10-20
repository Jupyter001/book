import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content/travels.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
assert.ok(data.cities.length > 0, 'At least one visited city is required');
assert.equal(new Set(data.cities.map(city => city.id)).size, data.cities.length, 'City IDs must be unique');
assert.equal(new Set(data.cities.map(city => city.name)).size, data.cities.length, 'City names must be unique');
const photos = [];
for (const city of data.cities) {
  assert.ok(/^[a-z][a-z-]*$/.test(city.id), 'Invalid city ID');
  assert.ok(city.name && city.english && city.region && Array.isArray(city.photos), 'Incomplete city data');
  for (const photo of city.photos) {
    assert.ok(photo.src.startsWith('./photos/') && !photo.src.includes('..'), 'Photos must be local files under src/photos');
    assert.ok(photo.alt?.trim(), 'Photos need descriptive alternative text');
    await access(path.join(root, 'src', photo.src));
    photos.push({ ...photo, city: city.name });
  }
}
const regions = ['全部', '北方', '西北', '华东', '华中', '华南', '云南'];
for (const city of data.cities) assert.ok(regions.includes(city.region) && city.region !== '全部', 'Unknown region');
const filters = regions.map(region => `<button class="region-filter" type="button" data-region="${escape(region)}" aria-pressed="${region === '全部'}">${escape(region)}<span>${region === '全部' ? data.cities.length : data.cities.filter(city => city.region === region).length}</span></button>`).join('\n');
const cities = data.cities.map((city, index) => `<article class="city-card" data-region="${escape(city.region)}" data-search="${escape(city.name + ' ' + city.english)}"><div class="city-card-top"><span class="city-number">${String(index + 1).padStart(2, '0')}</span><span class="city-region">${escape(city.region)}</span></div><h3>${escape(city.name)}</h3><span class="city-english">${escape(city.english)}</span><span class="city-visited" aria-label="已到访">✓</span></article>`).join('\n');
const album = photos.length
  ? `<div class="photo-grid">${photos.map((photo, index) => `<figure class="photo-card"><button type="button" data-photo-index="${index}" aria-label="查看${escape(photo.city)}的照片：${escape(photo.alt)}"><img src="${escape(photo.src)}" alt="${escape(photo.alt)}" loading="lazy" decoding="async"></button><figcaption><strong>${escape(photo.city)}</strong><span>${escape(photo.caption || '')}</span></figcaption></figure>`).join('\n')}</div>`
  : `<div class="album-empty"><div class="empty-film" aria-hidden="true"><svg viewBox="0 0 72 58" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="5" y="4" width="62" height="49" rx="3"/><circle cx="49" cy="19" r="6"/><path d="m6 45 18-22 16 18 9-10 18 15"/></svg><span>MEMORIES TO COME</span></div><div class="album-empty-copy"><h3>先把脚印留下，<br>再让照片说话。</h3><p>这里会慢慢装下旅途中的照片。<br>下一次更新，把地名变成看得见的回忆。</p><span class="album-note">照片将在后续旅行手记中更新</span></div></div>`;
const values = { CITY_COUNT: data.cities.length, REGION_FILTERS: filters, CITY_LIST: cities, ALBUM_CONTENT: album, TRAVEL_DATA: JSON.stringify(data).replace(/</g, '\\u003c') };
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
for (const [key, value] of Object.entries(values)) html = html.replaceAll('{{' + key + '}}', String(value));
assert.ok(!/\{\{[A-Z_]+\}\}/.test(html), 'Unresolved page templates');
await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'src/assets'), path.join(root, 'dist/assets'), { recursive: true });
await cp(path.join(root, 'src/photos'), path.join(root, 'dist/photos'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), html);
console.log(`Built travel journal: ${data.cities.length} cities, ${photos.length} photos.`);
