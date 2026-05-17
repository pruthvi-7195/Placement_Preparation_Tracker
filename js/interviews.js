/* Interviews — notes CRUD */
let editingInterviewId = null;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar('interviews');
  document.getElementById('addBtn').addEventListener('click', () => openInterviewModal());
  document.getElementById('interviewForm').addEventListener('submit', saveInterview);
  document.getElementById('cancelBtn').addEventListener('click', () => closeModal('interviewModal'));
  ['searchInput', 'filterType', 'sortSelect']
    .forEach(id => document.getElementById(id).addEventListener('input', renderInterviews));
  renderInterviews();
});

function getInterviews() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const t = document.getElementById('filterType').value;
  const sort = document.getElementById('sortSelect').value;

  let list = Store.get(KEYS.interviews).filter(it => {
    if (t && it.type !== t) return false;
    if (q && !it.company.toLowerCase().includes(q)) return false;
    return true;
  });
  if (sort === 'score-desc') list.sort((a, b) => (b.score || 0) - (a.score || 0));
  else if (sort === 'score-asc') list.sort((a, b) => (a.score || 0) - (b.score || 0));
  else if (sort === 'company') list.sort((a, b) => a.company.localeCompare(b.company));
  else list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return list;
}

function renderInterviews() {
  const list = getInterviews();
  const wrap = document.getElementById('interviewList');
  if (!list.length) {
    wrap.innerHTML = `<div class="empty"><div class="icon">💼</div><h3>No interview notes</h3><p>Save your first mock interview to start tracking.</p></div>`;
    return;
  }
  wrap.innerHTML = list.map(it => `
    <div class="interview-card">
      <div class="head">
        <div>
          <div class="company">${escapeHtml(it.company)}</div>
          <div class="type">${escapeHtml(it.type)} • ${fmtDate(it.date)}</div>
        </div>
        <div class="score">${it.score}/10</div>
      </div>
      <div>
        <div class="label">Questions</div>
        <div class="text">${escapeHtml(it.questions)}</div>
      </div>
      <div>
        <div class="label">Feedback</div>
        <div class="text">${escapeHtml(it.feedback)}</div>
      </div>
      <div class="actions">
        <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
      </div>
    </div>
  `).join('');
  wrap.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openInterviewModal(b.dataset.edit)));
  wrap.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteInterview(b.dataset.del)));
}

function openInterviewModal(id = null) {
  editingInterviewId = id;
  const form = document.getElementById('interviewForm');
  form.reset();
  document.getElementById('modalTitle').textContent = id ? 'Edit Interview' : 'Add Interview Notes';
  if (id) {
    const it = Store.get(KEYS.interviews).find(x => x.id === id);
    if (it) {
      form.company.value = it.company;
      form.type.value = it.type;
      form.questions.value = it.questions;
      form.feedback.value = it.feedback;
      form.score.value = it.score;
      form.date.value = it.date;
    }
  } else {
    form.date.value = todayISO();
    form.type.value = 'Technical';
    form.score.value = 7;
  }
  openModal('interviewModal');
}

function saveInterview(e) {
  e.preventDefault();
  const f = e.target;
  const data = {
    company: f.company.value.trim(),
    type: f.type.value,
    questions: f.questions.value.trim(),
    feedback: f.feedback.value.trim(),
    score: Number(f.score.value),
    date: f.date.value
  };
  const ok = validate([
    { value: data.company, errorId: 'err-company', rules: [V.required, V.maxLen(80)] },
    { value: data.type, errorId: 'err-type', rules: [V.required] },
    { value: data.questions, errorId: 'err-questions', rules: [V.required, V.maxLen(2000)] },
    { value: data.feedback, errorId: 'err-feedback', rules: [V.maxLen(1000)] },
    { value: f.score.value, errorId: 'err-score', rules: [V.required, V.range(0, 10)] },
    { value: data.date, errorId: 'err-date', rules: [V.required] }
  ]);
  if (!ok) return;

  const list = Store.get(KEYS.interviews);
  if (editingInterviewId) {
    const i = list.findIndex(x => x.id === editingInterviewId);
    if (i >= 0) list[i] = { ...list[i], ...data };
    toast('Interview updated');
  } else {
    list.push({ id: uid(), ...data });
    toast('Interview saved');
    logActivity();
  }
  Store.set(KEYS.interviews, list);
  closeModal('interviewModal');
  renderInterviews();
}

function deleteInterview(id) {
  if (!confirm('Delete this interview note?')) return;
  Store.set(KEYS.interviews, Store.get(KEYS.interviews).filter(x => x.id !== id));
  toast('Interview deleted', 'warning');
  renderInterviews();
}
