/* Dashboard — aggregates data and renders stats + recent activity */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar('dashboard');
  renderStats();
  renderRecent();
});

function renderStats() {
  const problems = Store.get(KEYS.problems);
  const goals = Store.get(KEYS.goals);
  const interviews = Store.get(KEYS.interviews);
  const today = todayISO();

  const solved = problems.filter(p => p.status === 'Solved').length;
  const todayGoals = goals.filter(g => g.deadline === today && g.status !== 'Done').length;
  const interviewCount = interviews.length;
  const streak = updateStreak();

  animate('#stat-solved', solved);
  animate('#stat-goals', todayGoals);
  animate('#stat-interviews', interviewCount);
  animate('#stat-streak', streak);
}

function animate(sel, target) {
  const el = document.querySelector(sel);
  if (!el) return;
  const dur = 700;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    el.textContent = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderRecent() {
  const problems = Store.get(KEYS.problems)
    .slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 5);
  const list = document.getElementById('recent-list');
  if (!list) return;
  if (!problems.length) {
    list.innerHTML = `<div class="empty"><div class="icon">📋</div><h3>No activity yet</h3><p>Start solving problems to see them here.</p></div>`;
    return;
  }
  list.innerHTML = problems.map(p => `
    <div class="recent-item">
      <div>
        <div style="font-weight:600">${escapeHtml(p.name)}</div>
        <div class="meta">${escapeHtml(p.platform)} • ${fmtDate(p.date)}</div>
      </div>
      <span class="tag tag-${(p.difficulty || '').toLowerCase()}">${escapeHtml(p.difficulty)}</span>
    </div>
  `).join('');
}
