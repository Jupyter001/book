document.documentElement.classList.add('js');

// ---------- 移动端导航 ----------
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '打开导航');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); }
});
window.matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = new Date().getFullYear();

// ---------- 通用筛选 ----------
function setupFilter({ cards, chips, searchInput, emptyNote, statusNote, dataKey, allLabel, noun }) {
  if (!cards.length) return;
  let active = allLabel;
  function apply() {
    const query = searchInput.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => {
      const matches = (active === allLabel || card.dataset[dataKey] === active)
        && card.dataset.search.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) count++;
    });
    emptyNote.hidden = count !== 0;
    statusNote.textContent = '显示 ' + count + ' / ' + cards.length + ' ' + noun;
  }
  chips.forEach(chip => chip.addEventListener('click', () => {
    active = chip.dataset[dataKey];
    chips.forEach(item => item.setAttribute('aria-pressed', String(item === chip)));
    apply();
  }));
  searchInput.addEventListener('input', apply);
  const tools = searchInput.closest('[data-enhance]');
  if (tools) tools.hidden = false;
}

setupFilter({
  cards: [...document.querySelectorAll('.photo-card')],
  chips: [...document.querySelectorAll('[data-category]')],
  searchInput: document.querySelector('#photo-search'),
  emptyNote: document.querySelector('#photo-empty'),
  statusNote: document.querySelector('#photo-status'),
  dataKey: 'category',
  allLabel: '全部',
  noun: '张照片'
});

setupFilter({
  cards: [...document.querySelectorAll('.work-card')],
  chips: [...document.querySelectorAll('[data-status]')],
  searchInput: document.querySelector('#story-search'),
  emptyNote: document.querySelector('#story-empty'),
  statusNote: document.querySelector('#story-status'),
  dataKey: 'status',
  allLabel: '全部',
  noun: '部作品'
});

// ---------- 照片查看器 ----------
const libraryData = JSON.parse(document.querySelector('#library-data').textContent);
const photos = libraryData.photos || [];
const dialog = document.querySelector('.photo-dialog');
if (photos.length) {
  let photoIndex = 0;
  let photoOpener;
  function showPhoto(index) {
    photoIndex = index;
    const photo = photos[index];
    document.querySelector('#photo-title').textContent = photo.title;
    const image = dialog.querySelector('.dialog-image');
    image.src = photo.src;
    image.alt = photo.description;
    dialog.querySelector('.photo-caption').textContent = photo.description;
    dialog.querySelector('.dialog-tags').innerHTML = (photo.tags || []).map(() => '<span class="tag"></span>').join('');
    dialog.querySelectorAll('.dialog-tags .tag').forEach((tagEl, i) => { tagEl.textContent = photo.tags[i]; });
    dialog.querySelector('.photo-position').textContent = (index + 1) + ' / ' + photos.length;
    dialog.querySelector('[data-photo-step="-1"]').disabled = index === 0;
    dialog.querySelector('[data-photo-step="1"]').disabled = index === photos.length - 1;
  }
  document.querySelectorAll('[data-photo-index]').forEach(button => button.addEventListener('click', () => {
    photoOpener = button;
    showPhoto(Number(button.dataset.photoIndex));
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  dialog.querySelectorAll('[data-photo-step]').forEach(button => button.addEventListener('click', () => {
    const next = photoIndex + Number(button.dataset.photoStep);
    if (next >= 0 && next < photos.length) showPhoto(next);
  }));
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); photoOpener?.focus(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' && photoIndex < photos.length - 1) { event.preventDefault(); showPhoto(photoIndex + 1); }
    if (event.key === 'ArrowLeft' && photoIndex > 0) { event.preventDefault(); showPhoto(photoIndex - 1); }
  });
} else {
  dialog.remove();
}

// ---------- 导航高亮 ----------
if ('IntersectionObserver' in window) {
  const links = [...navigation.querySelectorAll('a[href^="#"]')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, { rootMargin: '-15% 0px -60% 0px' });
  document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
}
