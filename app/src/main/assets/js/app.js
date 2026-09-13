var currentPage = 'home';

var levels = [
  { id: 'n5', name: 'N5', title: 'N5 — Pemula', description: 'Pelajaran untuk pemula absolut. Mulai dari kana dasar.' },
  { id: 'n4', name: 'N4', title: 'N4 — Menengah Bawah', description: 'Bangun fondasi grammar dan vocab.' },
  { id: 'n3', name: 'N3', title: 'N3 — Menengah', description: 'Tingkatkan kemampuan membaca dan mendengar.' }
];

function init() {
  loadTheme();
  renderHome();
  var toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.addEventListener('click', toggleTheme);
}

function renderHome() {
  currentPage = 'home';
  var main = document.getElementById('home');
  main.innerHTML = '<p>Pilih level belajarmu:</p><div id="level-cards">' +
    levels.map(function(l) {
      return '<div class="card" data-level="' + l.id + '"><h2>' + l.name + '</h2><p>' + l.description + '</p></div>';
    }).join('') +
    '</div>';
  main.querySelectorAll('.card').forEach(function(card) {
    card.addEventListener('click', function() { goLevel(card.dataset.level); });
  });
}

function goLevel(id) {
  var level = levels.find(function(l) { return l.id === id; });
  if (!level) return;
  currentPage = 'level:' + id;
  var main = document.getElementById('home');
  main.innerHTML =
    '<div class="page-header"><button class="back-btn" id="back-btn">← Kembali</button><h2>' + level.name + '</h2></div>' +
    '<h1>' + level.title + '</h1>' +
    '<p>' + level.description + '</p>' +
    '<div class="placeholder">Materi menyusul</div>';
  var backBtn = document.getElementById('back-btn');
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
  var html = document.documentElement;
  var current = html.getAttribute('data-theme');
  var next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  try { localStorage.setItem('wakaru-theme', next); } catch(e) {}
  var btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
  var btn = document.getElementById('theme-toggle');
  var saved = null;
  try { saved = localStorage.getItem('wakaru-theme'); } catch(e) {}
  var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

init();
