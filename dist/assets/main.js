document.documentElement.classList.add('js');
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

const cityCards = [...document.querySelectorAll('.city-card')];
const search = document.querySelector('#city-search');
const filterButtons = [...document.querySelectorAll('.region-filter')];
let activeRegion = '全部';
function filterCities() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  cityCards.forEach(card => {
    const matches = (activeRegion === '全部' || card.dataset.region === activeRegion)
      && card.dataset.search.toLocaleLowerCase().includes(query);
    card.hidden = !matches;
    if (matches) count++;
  });
  document.querySelector('#city-empty').hidden = count !== 0;
  document.querySelector('#city-status').textContent = '显示 ' + count + ' / ' + cityCards.length + ' 座城市';
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  activeRegion = button.dataset.region;
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  filterCities();
}));
search.addEventListener('input', filterCities);
document.querySelectorAll('[data-enhance]').forEach(element => { element.hidden = false; });

const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
}
document.querySelector('.copy-email').addEventListener('click', async event => {
  const email = event.currentTarget.dataset.email;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    showToast('邮箱已复制，期待你的来信。');
  } catch {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('.email-address'));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    showToast('请手动复制邮箱：' + email);
  }
});

const travelData = JSON.parse(document.querySelector('#travel-data').textContent);
const photos = travelData.cities.flatMap(city => city.photos.map(photo => ({ ...photo, city: city.name })));
const dialog = document.querySelector('.photo-dialog');
let photoIndex = 0;
let photoOpener;
function showPhoto(index) {
  photoIndex = index;
  const photo = photos[index];
  document.querySelector('#photo-title').textContent = photo.city;
  const image = document.querySelector('.dialog-image');
  image.src = photo.src;
  image.alt = photo.alt;
  document.querySelector('.photo-caption').textContent = photo.caption || '';
  document.querySelector('.photo-position').textContent = (index + 1) + ' / ' + photos.length;
  document.querySelector('[data-photo-step="-1"]').disabled = index === 0;
  document.querySelector('[data-photo-step="1"]').disabled = index === photos.length - 1;
}
document.querySelectorAll('[data-photo-index]').forEach(button => button.addEventListener('click', () => {
  photoOpener = button;
  showPhoto(Number(button.dataset.photoIndex));
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
document.querySelectorAll('[data-photo-step]').forEach(button => button.addEventListener('click', () => {
  const next = photoIndex + Number(button.dataset.photoStep);
  if (next >= 0 && next < photos.length) showPhoto(next);
}));
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); photoOpener?.focus(); });
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' && photoIndex < photos.length - 1) { event.preventDefault(); showPhoto(photoIndex + 1); }
  if (event.key === 'ArrowLeft' && photoIndex > 0) { event.preventDefault(); showPhoto(photoIndex - 1); }
});

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
