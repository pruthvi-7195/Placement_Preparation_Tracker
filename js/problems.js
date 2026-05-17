/* Problems tracker — CRUD + search + filter + sort */
let editingProblemId = null;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar('problems');
  document.getElementById('addBtn').addEventListener('click', () => openProblemModal());
  document.getElementById('problemForm').addEventListener('submit', saveProblem);
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('problemModal'));
  ['searchInput', 'filterDifficulty', 'filterPlatform', 'filterStatus', 'sortSelect']
    .forEach(id => document.getElementById(id).addEventListener('input', renderProblems));
  renderProblems();
});

function getList() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const dif = document.getElementById('filterDifficulty').value;
  const plat = document.getElementById('filterPlatform').value;
  const stat = document.getElementById('filterStatus').value;
  const sort = document.getElementById('sortSelect').value;

  let list = Store.get(KEYS.problems).filter(p => {
    if (dif && p.difficulty !== dif) return false;
    if (plat && p.platform !== plat) return false;
    if (stat && p.status !== stat) return false;
    if (q && !p.name.toLowerCase().includes(q)) return false;
    return true;
  });
  const order = { Easy: 1, Medium: 2, Hard: 3 };
  if (sort === 'date-desc') list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  else if (sort === 'date-asc') list.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (sort === 'difficulty') list.sort((a, b) => (order[a.difficulty]||0) - (order[b.difficulty]||0));
  return list;
}

function renderProblems() {
  const list = getList();
  const wrap = document.getElementById('problemList');
  if (!list.length) {
    wrap.innerHTML = `<div class="empty"><div class="icon">🧩</div><h3>No problems found</h3><p>Add a problem or adjust filters.</p></div>`;
    return;
  }
  wrap.innerHTML = list.map(p => `
    <div class="row problem-row">
      <div>
        <div class="name">${escapeHtml(p.name)}</div>
        <div class="platform">${escapeHtml(p.platform)}</div>
      </div>
      <div><span class="tag tag-${p.difficulty.toLowerCase()}">${p.difficulty}</span></div>
      <div><span class="tag tag-${p.status.toLowerCase()}">${p.status}</span></div>
      <div style="color:var(--text-muted);font-size:0.85rem">${fmtDate(p.date)}</div>
      <div></div>
      <div class="actions">
        <button class="btn btn-secondary btn-sm" data-edit="${p.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">Delete</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openProblemModal(b.dataset.edit)));
  wrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteProblem(b.dataset.del)));
}

function openProblemModal(id = null) {
  editingProblemId = id;
  const form = document.getElementById('problemForm');
  form.reset();
  document.getElementById('modalTitle').textContent = id ? 'Edit Problem' : 'Add Problem';
  if (id) {
    const p = Store.get(KEYS.problems).find(x => x.id === id);
    if (p) {
      form.name.value = p.name;
      form.platform.value = p.platform;
      form.difficulty.value = p.difficulty;
      form.status.value = p.status;
      form.date.value = p.date;
    }
  } else {
    form.date.value = todayISO();
  }
  openModal('problemModal');
}

function saveProblem(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    name: f.name.value.trim(),
    platform: f.platform.value,
    difficulty: f.difficulty.value,
    status: f.status.value,
    date: f.date.value
  };
  const ok = validate([
    { value: data.name, errorId: 'err-name', rules: [V.required, V.maxLen(120)] },
    { value: data.platform, errorId: 'err-platform', rules: [V.required] },
    { value: data.difficulty, errorId: 'err-difficulty', rules: [V.required] },
    { value: data.status, errorId: 'err-status', rules: [V.required] },
    { value: data.date, errorId: 'err-date', rules: [V.required] }
  ]);
  if (!ok) return;

  const list = Store.get(KEYS.problems);
  if (editingProblemId) {
    const i = list.findIndex(x => x.id === editingProblemId);
    if (i >= 0) list[i] = { ...list[i], ...data };
    toast('Problem updated');
  } else {
    list.push({ id: uid(), ...data });
    toast('Problem added');
    if (data.status === 'Solved') logActivity();
  }
  Store.set(KEYS.problems, list);
  closeModal('problemModal');
  renderProblems();
}

function deleteProblem(id) {
  if (!confirm('Delete this problem?')) return;
  Store.set(KEYS.problems, Store.get(KEYS.problems).filter(x => x.id !== id));
  toast('Problem deleted', 'warning');
  renderProblems();
}
