let currentPage = 'home';

const levels = [
  { id: 'n5', name: 'N5', title: 'N5 — Pemula', description: 'Pelajaran untuk pemula absolut. Mulai dari kana dasar.', icon: 'あ' },
  { id: 'n4', name: 'N4', title: 'N4 — Menengah Bawah', description: 'Bangun fondasi grammar dan vocab.', icon: '漢' },
  { id: 'n3', name: 'N3', title: 'N3 — Menengah', description: 'Tingkatkan kemampuan membaca dan mendengar.', icon: '文' }
];

function init() {
  loadTheme();
  renderHome();
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
}

function renderHome() {
  currentPage = 'home';
  const main = document.getElementById('home');
  main.innerHTML = '<p>Pilih level belajarmu:</p><div id="level-cards">' +
    levels.map(l =>
      `<div class="card" data-level="${l.id}"><span class="card-icon">${l.icon}</span><div class="card-body"><h2>${l.name}</h2><p>${l.description}</p></div></div>`
    ).join('') +
    '</div>';
  main.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => { goLevel(card.dataset.level); });
  });
}

function goLevel(id) {
  const level = levels.find(l => l.id === id);
  if (!level) return;
  currentPage = `level:${id}`;
  const main = document.getElementById('home');
  main.innerHTML =
    `<div class="page-header"><button class="back-btn" id="back-btn">← Kembali</button><h2>${level.name}</h2></div>` +
    `<h1>${level.title}</h1>` +
    `<p>${level.description}</p>` +
    '<div class="placeholder">Materi menyusul</div>';
  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', renderHome);
}

function wakaruGoBack() {
  if (currentPage !== 'home') {
    renderHome();
    return 'true';
  }
  return 'false';
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('wakaru-theme', next); } catch(e) {}
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
  const btn = document.getElementById('theme-toggle');
  let saved = null;
  try { saved = localStorage.getItem('wakaru-theme'); } catch(e) {}
  const theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

init();
