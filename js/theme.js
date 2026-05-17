/* Shared utilities: storage, toast, sidebar, modal helpers, validators
   Loaded on every page before page-specific scripts. */

const Store = {
  get(key, fallback = []) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  remove(key) { localStorage.removeItem(key); }
};

const KEYS = {
  problems: 'ppt_problems',
  goals: 'ppt_goals',
  interviews: 'ppt_interviews',
  streak: 'ppt_streak',
  activity: 'ppt_activity' // YYYY-MM-DD => count of actions
};

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ===== Toast ===== */
function toast(msg, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all .3s';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

/* ===== Activity tracker (for streak + analytics) ===== */
function logActivity() {
  const map = Store.get(KEYS.activity, {});
  const t = todayISO();
  map[t] = (map[t] || 0) + 1;
  Store.set(KEYS.activity, map);
  updateStreak();
}
function updateStreak() {
  const map = Store.get(KEYS.activity, {});
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (map[key]) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  Store.set(KEYS.streak, streak);
  return streak;
}

/* ===== Sidebar (mobile) ===== */
function initSidebar(activePage) {
  const btn = document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !btn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
  if (activePage) {
    document.querySelectorAll('.nav-link').forEach(a => {
      if (a.dataset.page === activePage) a.classList.add('active');
    });
  }
}

/* ===== Modal helpers ===== */
function openModal(id) { document.getElementById(id)?.classList.add('show'); }
function closeModal(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('show');
  m.querySelectorAll('.error').forEach(e => e.textContent = '');
  m.querySelectorAll('form').forEach(f => f.reset());
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) e.target.classList.remove('show');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-backdrop.show').forEach(m => m.classList.remove('show'));
});

/* ===== Validators ===== */
const V = {
  required: (v) => v && v.trim().length > 0 ? '' : 'This field is required',
  maxLen: (n) => (v) => (v || '').length <= n ? '' : `Max ${n} characters`,
  range: (min, max) => (v) => {
    const n = Number(v);
    return (!isNaN(n) && n >= min && n <= max) ? '' : `Must be between ${min} and ${max}`;
  }
};
function validate(fields) {
  let ok = true;
  for (const f of fields) {
    const errEl = document.getElementById(f.errorId);
    let err = '';
    for (const rule of f.rules) {
      err = rule(f.value);
      if (err) break;
    }
    if (errEl) errEl.textContent = err;
    if (err) ok = false;
  }
  return ok;
}

/* ===== Theme toggle (light/dark) ===== */
(function initTheme() {
  const saved = localStorage.getItem('ppt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeToggle');
    const label = document.getElementById('themeLabel');
    const sync = () => {
      const t = document.documentElement.getAttribute('data-theme');
      if (label) label.textContent = t === 'dark' ? 'Dark' : 'Light';
      if (btn) btn.textContent = t === 'dark' ? '☀ Light' : '☾ Dark';
    };
    sync();
    btn?.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ppt_theme', next);
      sync();
    });
  });
})();
