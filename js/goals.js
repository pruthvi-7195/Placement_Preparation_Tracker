/* Goals tracker */
let editingGoalId = null;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar('goals');
  document.getElementById('addBtn').addEventListener('click', () => openGoalModal());
  document.getElementById('goalForm').addEventListener('submit', saveGoal);
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('goalModal'));
  ['searchInput', 'filterPriority', 'filterStatus', 'sortSelect']
    .forEach(id => document.getElementById(id).addEventListener('input', renderGoals));
  renderGoals();
});

function getGoals() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const pri = document.getElementById('filterPriority').value;
  const stat = document.getElementById('filterStatus').value;
  const sort = document.getElementById('sortSelect').value;

  let list = Store.get(KEYS.goals).filter(g => {
    if (pri && g.priority !== pri) return false;
    if (stat && g.status !== stat) return false;
    if (q && !g.title.toLowerCase().includes(q)) return false;
    return true;
  });
  const order = { High: 1, Medium: 2, Low: 3 };
  if (sort === 'deadline') list.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''));
  else if (sort === 'priority') list.sort((a, b) => (order[a.priority]||9) - (order[b.priority]||9));
  else list.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  return list;
}

function renderGoals() {
  const list = getGoals();
  const wrap = document.getElementById('goalList');
  if (!list.length) {
    wrap.innerHTML = `<div class="empty"><div class="icon">🎯</div><h3>No goals yet</h3><p>Add your first goal to stay on track.</p></div>`;
    return;
  }
  const priClass = { High: 'high', Medium: 'mid', Low: 'low' };
  wrap.innerHTML = list.map(g => `
    <div class="row goal-row ${g.status === 'Done' ? 'done' : ''}">
      <input type="checkbox" ${g.status === 'Done' ? 'checked' : ''} data-toggle="${g.id}" />
      <div class="title">${escapeHtml(g.title)}</div>
      <div style="color:var(--text-muted);font-size:0.85rem">📅 ${fmtDate(g.deadline)}</div>
      <div><span class="tag tag-${priClass[g.priority]}">${g.priority}</span></div>
      <div><span class="tag tag-${g.status === 'Done' ? 'solved' : 'pending'}">${g.status}</span></div>
      <div class="actions">
        <button class="btn btn-secondary btn-sm" data-edit="${g.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${g.id}">Delete</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('change', () => toggleGoal(b.dataset.toggle)));
  wrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openGoalModal(b.dataset.edit)));
  wrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteGoal(b.dataset.del)));
}

function openGoalModal(id = null) {
  editingGoalId = id;
  const form = document.getElementById('goalForm');
  form.reset();
  document.getElementById('modalTitle').textContent = id ? 'Edit Goal' : 'Add Goal';
  if (id) {
    const g = Store.get(KEYS.goals).find(x => x.id === id);
    if (g) {
      form.title.value = g.title;
      form.deadline.value = g.deadline;
      form.priority.value = g.priority;
      form.status.value = g.status;
    }
  } else {
    form.deadline.value = todayISO();
    form.priority.value = 'Medium';
    form.status.value = 'Pending';
  }
  openModal('goalModal');
}

function saveGoal(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    title: f.title.value.trim(),
    deadline: f.deadline.value,
    priority: f.priority.value,
    status: f.status.value
  };
  const ok = validate([
    { value: data.title, errorId: 'err-title', rules: [V.required, V.maxLen(200)] },
    { value: data.deadline, errorId: 'err-deadline', rules: [V.required] },
    { value: data.priority, errorId: 'err-priority', rules: [V.required] },
    { value: data.status, errorId: 'err-status', rules: [V.required] }
  ]);
  if (!ok) return;

  const list = Store.get(KEYS.goals);
  if (editingGoalId) {
    const i = list.findIndex(x => x.id === editingGoalId);
    if (i >= 0) list[i] = { ...list[i], ...data };
    toast('Goal updated');
  } else {
    list.push({ id: uid(), created: todayISO(), ...data });
    toast('Goal added');
  }
  Store.set(KEYS.goals, list);
  if (data.status === 'Done') logActivity();
  closeModal('goalModal');
  renderGoals();
}

function toggleGoal(id) {
  const list = Store.get(KEYS.goals);
  const g = list.find(x => x.id === id);
  if (!g) return;
  g.status = g.status === 'Done' ? 'Pending' : 'Done';
  Store.set(KEYS.goals, list);
  if (g.status === 'Done') { logActivity(); toast('Goal completed!'); }
  renderGoals();
}

function deleteGoal(id) {
  if (!confirm('Delete this goal?')) return;
  Store.set(KEYS.goals, Store.get(KEYS.goals).filter(x => x.id !== id));
  toast('Goal deleted', 'warning');
  renderGoals();
}
