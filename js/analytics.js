/* Analytics — counters, progress, weekly bar chart, consistency grid */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar('analytics');
  renderMetrics();
  renderWeeklyChart();
  renderConsistency();
});

function animateCount(sel, target, suffix = '') {
  const el = document.querySelector(sel);
  if (!el) return;
  const dur = 900, start = performance.now();
  function step(now) {
    const p = Math.min(1, (now - start) / dur);
    const v = target * (1 - Math.pow(1 - p, 3));
    el.textContent = Math.round(v) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function renderMetrics() {
  const problems = Store.get(KEYS.problems);
  const goals = Store.get(KEYS.goals);
  const interviews = Store.get(KEYS.interviews);

  const solved = problems.filter(p => p.status === 'Solved').length;
  const total = problems.length;
  const goalDone = goals.filter(g => g.status === 'Done').length;
  const goalPct = goals.length ? Math.round(goalDone * 100 / goals.length) : 0;
  const avgScore = interviews.length
    ? (interviews.reduce((s, i) => s + Number(i.score || 0), 0) / interviews.length).toFixed(1)
    : '0.0';

  animateCount('#m-solved', solved);
  animateCount('#m-total', total);
  animateCount('#m-goalpct', goalPct, '%');
  document.querySelector('#m-avgscore').textContent = avgScore;

  // progress bars
  const solvedPct = total ? Math.round(solved * 100 / total) : 0;
  setTimeout(() => {
    document.querySelector('#bar-solved').style.width = solvedPct + '%';
    document.querySelector('#bar-goals').style.width = goalPct + '%';
  }, 100);
  document.querySelector('#bar-solved-label').textContent = `${solved}/${total} (${solvedPct}%)`;
  document.querySelector('#bar-goals-label').textContent = `${goalDone}/${goals.length} (${goalPct}%)`;
}

function renderWeeklyChart() {
  const activity = Store.get(KEYS.activity, {});
  const days = [];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push(activity[key] || 0);
    labels.push(d.toLocaleDateString(undefined, { weekday: 'short' }));
  }
  const max = Math.max(...days, 1);
  const chart = document.getElementById('weeklyChart');
  const labelRow = document.getElementById('weeklyLabels');
  chart.innerHTML = days.map(v => `<div class="bar" style="height:0">${v || ''}</div>`).join('');
  labelRow.innerHTML = labels.map(l => `<span>${l}</span>`).join('');
  setTimeout(() => {
    chart.querySelectorAll('.bar').forEach((b, i) => {
      b.style.height = `${Math.max(4, (days[i] / max) * 100)}%`;
    });
  }, 80);
}

function renderConsistency() {
  const activity = Store.get(KEYS.activity, {});
  const grid = document.getElementById('consistencyGrid');
  const today = todayISO();
  const cells = [];
  // last 28 days
  for (let i = 27; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const cls = ['day-cell'];
    if (activity[key]) cls.push('active');
    if (key === today) cls.push('today');
    cells.push(`<div class="${cls.join(' ')}" title="${key}: ${activity[key]||0} actions">${d.getDate()}</div>`);
  }
  grid.innerHTML = cells.join('');

  const streak = Store.get(KEYS.streak, 0);
  document.getElementById('streakLine').textContent = `Current streak: ${streak} day${streak === 1 ? '' : 's'}`;
}
