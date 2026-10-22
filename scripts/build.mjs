import { readFile, writeFile, mkdir, cp, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// ---------- 数据源 ----------
const photoData = JSON.parse(await readFile(path.join(root, 'content/photos.json'), 'utf8'));
const storyData = JSON.parse(await readFile(path.join(root, 'content/stories.json'), 'utf8'));

assert.ok(Array.isArray(photoData.categories) && photoData.categories.length > 0, 'photos.json needs at least one category');
assert.ok(Array.isArray(photoData.photos), 'photos.json photos must be an array');
assert.ok(Array.isArray(storyData.statuses) && storyData.statuses.length > 0, 'stories.json needs at least one status');
assert.ok(Array.isArray(storyData.works), 'stories.json works must be an array');

// ---------- 校验图片库 ----------
const photoIds = new Set();
for (const photo of photoData.photos) {
  assert.ok(/^[a-z0-9][a-z0-9-]*$/.test(photo.id), `Invalid photo id: ${photo.id}`);
  assert.ok(!photoIds.has(photo.id), `Duplicate photo id: ${photo.id}`);
  photoIds.add(photo.id);
  assert.ok(photo.src.startsWith('./photos/') && !photo.src.includes('..'), `Photo ${photo.id} must live under src/photos`);
  assert.ok(photo.title?.trim(), `Photo ${photo.id} needs a title`);
  assert.ok(photo.description?.trim(), `Photo ${photo.id} needs a description`);
  assert.ok(photoData.categories.includes(photo.category), `Photo ${photo.id} has unknown category: ${photo.category}`);
  assert.ok(Array.isArray(photo.tags), `Photo ${photo.id} tags must be an array`);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(photo.date), `Photo ${photo.id} date must be YYYY-MM-DD`);
  await access(path.join(root, 'src', photo.src));
}

// ---------- 校验剧情库 ----------
const workIds = new Set();
for (const work of storyData.works) {
  assert.ok(/^[a-z0-9][a-z0-9-]*$/.test(work.id), `Invalid work id: ${work.id}`);
  assert.ok(!workIds.has(work.id), `Duplicate work id: ${work.id}`);
  workIds.add(work.id);
  assert.ok(work.title?.trim(), `Work ${work.id} needs a title`);
  assert.ok(work.logline?.trim(), `Work ${work.id} needs a logline`);
  assert.ok(storyData.statuses.includes(work.status), `Work ${work.id} has unknown status: ${work.status}`);
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(work.updated), `Work ${work.id} updated must be YYYY-MM-DD`);
  assert.ok(/^content\/stories\/[a-z0-9-]+\.md$/.test(work.file), `Work ${work.id} file must be content/stories/<id>.md`);
  await access(path.join(root, work.file));
  assert.ok(Array.isArray(work.episodes), `Work ${work.id} episodes must be an array`);
  const numbers = new Set();
  for (const episode of work.episodes) {
    assert.ok(Number.isInteger(episode.n) && episode.n > 0, `Work ${work.id} episode needs a positive number`);
    assert.ok(!numbers.has(episode.n), `Work ${work.id} duplicate episode ${episode.n}`);
    numbers.add(episode.n);
    assert.ok(episode.title?.trim() && episode.summary?.trim(), `Work ${work.id} episode ${episode.n} needs title and summary`);
  }
}

// ---------- 生成图片库 ----------
const photoCounts = category => photoData.photos.filter(photo => photo.category === category).length;
const categoryFilters = ['全部', ...photoData.categories]
  .map(category => `<button class="chip" type="button" data-category="${escape(category)}" aria-pressed="${category === '全部'}">${escape(category)}<span>${category === '全部' ? photoData.photos.length : photoCounts(category)}</span></button>`)
  .join('\n');

const photoGrid = photoData.photos.length
  ? `<div class="photo-grid">${photoData.photos.map((photo, index) => `<figure class="photo-card" data-category="${escape(photo.category)}" data-search="${escape([photo.title, photo.description, photo.category, ...photo.tags].join(' '))}"><button type="button" data-photo-index="${index}" aria-label="查看照片：${escape(photo.title)}"><img src="${escape(photo.src)}" alt="${escape(photo.description)}" loading="lazy" decoding="async"></button><figcaption><div class="photo-card-top"><strong>${escape(photo.title)}</strong><span class="photo-category">${escape(photo.category)}</span></div><p>${escape(photo.description)}</p>${photo.tags.length ? `<div class="tag-row">${photo.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div>` : ''}</figcaption></figure>`).join('\n')}</div>`
  : `<div class="empty-state"><div class="empty-reel" aria-hidden="true"><svg viewBox="0 0 96 60" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="4" y="6" width="88" height="48" rx="4"/><path d="M4 16h88M4 44h88"/><rect x="12" y="9" width="8" height="5"/><rect x="28" y="9" width="8" height="5"/><rect x="44" y="9" width="8" height="5"/><rect x="60" y="9" width="8" height="5"/><rect x="76" y="9" width="8" height="5"/><rect x="12" y="46" width="8" height="5"/><rect x="28" y="46" width="8" height="5"/><rect x="44" y="46" width="8" height="5"/><rect x="60" y="46" width="8" height="5"/><rect x="76" y="46" width="8" height="5"/><circle cx="48" cy="30" r="7"/></svg><span>REEL 001 · WAITING FOR FOOTAGE</span></div><div class="empty-copy"><h3>素材盘已就绪，<br>等第一批照片入库。</h3><p>把照片发过来，每张都会配上标题、描述和标签，<br>入库后即可按分类检索、点击放大。</p><span class="empty-note">支持：人物 / 场景 / 服装造型 / 道具 / 氛围参考</span></div></div>`;

// ---------- 生成剧情库 ----------
const workCounts = status => storyData.works.filter(work => work.status === status).length;
const statusFilters = ['全部', ...storyData.statuses]
  .map(status => `<button class="chip" type="button" data-status="${escape(status)}" aria-pressed="${status === '全部'}">${escape(status)}<span>${status === '全部' ? storyData.works.length : workCounts(status)}</span></button>`)
  .join('\n');

const statusClass = status => ({ '小说原文': 'status-draft', '改编中': 'status-wip', '剧本完成': 'status-done' })[status] || 'status-draft';

const workList = storyData.works.length
  ? storyData.works.map(work => `<article class="work-card" data-status="${escape(work.status)}" data-search="${escape([work.title, work.genre, work.logline, work.status, ...work.episodes.map(e => e.title + ' ' + e.summary)].join(' '))}"><div class="work-head"><div><span class="work-genre">${escape(work.genre)}</span><h3>${escape(work.title)}</h3></div><span class="work-status ${statusClass(work.status)}">${escape(work.status)}</span></div><p class="work-logline">${escape(work.logline)}</p>${work.episodes.length ? `<details class="episode-list"><summary>分集大纲 · 共 ${work.episodes.length} 集</summary><ol>${work.episodes.map(episode => `<li><strong>第${episode.n}集 · ${escape(episode.title)}</strong><p>${escape(episode.summary)}</p></li>`).join('')}</ol></details>` : '<p class="episode-pending">分集大纲整理中。</p>'}<div class="work-foot"><span>更新于 ${escape(work.updated)}</span><a href="https://github.com/Jupyter001/book/blob/main/${escape(work.file)}" target="_blank" rel="noopener">阅读全文 <span aria-hidden="true">↗</span></a></div></article>`).join('\n')
  : `<div class="empty-state"><div class="empty-reel" aria-hidden="true"><svg viewBox="0 0 96 60" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="14" y="6" width="68" height="48" rx="4"/><path d="M26 18h44M26 28h44M26 38h28"/></svg><span>SCRIPT · TO BE WRITTEN</span></div><div class="empty-copy"><h3>剧情库虚位以待，<br>等你的小说开笔。</h3><p>把小说剧情和改编想法发过来，<br>这里会整理出分集短剧剧本：原文、改编进度、分集大纲一目了然。</p><span class="empty-note">流程：小说原文 → 改编中 → 剧本完成</span></div></div>`;

// ---------- 汇总数据 ----------
const episodeCount = storyData.works.reduce((sum, work) => sum + work.episodes.length, 0);
const libraryData = JSON.stringify({ photos: photoData.photos }).replace(/</g, '\\u003c');

const values = {
  PHOTO_COUNT: photoData.photos.length,
  WORK_COUNT: storyData.works.length,
  EPISODE_COUNT: episodeCount,
  CATEGORY_FILTERS: categoryFilters,
  PHOTO_GRID: photoGrid,
  STATUS_FILTERS: statusFilters,
  WORK_LIST: workList,
  LIBRARY_DATA: libraryData
};

let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
for (const [key, value] of Object.entries(values)) html = html.replaceAll('{{' + key + '}}', String(value));
assert.ok(!/\{\{[A-Z_]+\}\}/.test(html), 'Unresolved page templates');

await mkdir(path.join(root, 'dist'), { recursive: true });
await cp(path.join(root, 'src/assets'), path.join(root, 'dist/assets'), { recursive: true });
await cp(path.join(root, 'src/photos'), path.join(root, 'dist/photos'), { recursive: true });
await writeFile(path.join(root, 'dist/index.html'), html);
console.log(`Built drama library: ${photoData.photos.length} photos, ${storyData.works.length} works, ${episodeCount} episodes.`);
