document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('interview-date').valueAsDate = new Date();
    
    renderInterviews();
    
    document.getElementById('add-interview-btn').addEventListener('click', openModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('interview-form').addEventListener('submit', saveInterview);
});

function openModal(interview = null) {
    const modal = document.getElementById('interview-modal');
    const form = document.getElementById('interview-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('interview-date').valueAsDate = new Date();
    
    if (interview && interview.id) {
        title.textContent = 'Edit Interview Notes';
        document.getElementById('interview-id').value = interview.id;
        document.getElementById('interview-company').value = interview.company;
        document.getElementById('interview-date').value = interview.date;
        document.getElementById('interview-type').value = interview.type;
        document.getElementById('interview-score').value = interview.score;
        document.getElementById('interview-questions').value = interview.questions;
        document.getElementById('interview-feedback').value = interview.feedback;
    } else {
        title.textContent = 'Add Interview Notes';
        document.getElementById('interview-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('interview-modal');
    modal.classList.remove('active');
}

function saveInterview(e) {
    e.preventDefault();
    
    const id = document.getElementById('interview-id').value;
    const company = document.getElementById('interview-company').value;
    const date = document.getElementById('interview-date').value;
    const type = document.getElementById('interview-type').value;
    const score = document.getElementById('interview-score').value;
    const questions = document.getElementById('interview-questions').value;
    const feedback = document.getElementById('interview-feedback').value;
    
    let interviews = Store.get('interviews') || [];
    
    if (id) {
        const index = interviews.findIndex(i => i.id === id);
        if (index !== -1) {
            interviews[index] = { id, company, date, type, score, questions, feedback };
        }
    } else {
        const newInterview = {
            id: Date.now().toString(),
            company,
            date,
            type,
            score,
            questions,
            feedback
        };
        interviews.push(newInterview);
    }
    
    Store.set('interviews', interviews);
    closeModal();
    renderInterviews();
}

function deleteInterview(id) {
    if (confirm('Are you sure you want to delete these notes?')) {
        let interviews = Store.get('interviews') || [];
        interviews = interviews.filter(i => i.id !== id);
        Store.set('interviews', interviews);
        renderInterviews();
    }
}

function editInterview(id) {
    const interviews = Store.get('interviews') || [];
    const interview = interviews.find(i => i.id === id);
    if (interview) {
        openModal(interview);
    }
}

function renderInterviews() {
    const interviews = Store.get('interviews') || [];
    const container = document.getElementById('interviews-grid');
    
    // Sort by date desc
    interviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (interviews.length === 0) {
        container.style.display = 'block';
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <p>No interview notes yet. Record your first mock interview!</p>
            </div>
        `;
        return;
    }
    
    container.style.display = 'grid';
    container.innerHTML = interviews.map(i => {
        // Simple badge color based on score
        let scoreColor = '';
        if (i.score >= 8) scoreColor = 'background: linear-gradient(135deg, #10b981, #059669);';
        else if (i.score >= 5) scoreColor = 'background: linear-gradient(135deg, #f59e0b, #d97706);';
        else scoreColor = 'background: linear-gradient(135deg, #ef4444, #b91c1c);';

        return `
            <div class="interview-card">
                <div class="interview-header">
                    <div>
                        <div class="interview-company">${i.company}</div>
                        <div class="interview-date">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            ${i.date}
                        </div>
                    </div>
                    <div class="score-badge" style="${scoreColor}">
                        ${i.score}
                    </div>
                </div>
                <div class="interview-body">
                    <div class="section-title">Type</div>
                    <div style="margin-bottom: 1rem;"><span class="badge badge-info">${i.type}</span></div>
                    
                    <div class="section-title">Questions Asked</div>
                    <div class="interview-content">${escapeHTML(i.questions)}</div>
                    
                    <div class="section-title">Feedback</div>
                    <div class="interview-content" style="margin-bottom: 0;">${escapeHTML(i.feedback)}</div>
                </div>
                <div class="interview-footer">
                    <span style="font-size: 0.75rem; color: var(--text-secondary);">ID: ${i.id.slice(-5)}</span>
                    <div class="interview-actions">
                        <button class="btn-icon edit" onclick="editInterview('${i.id}')" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon delete" onclick="deleteInterview('${i.id}')" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Simple HTML escaper to prevent basic injection from local storage text areas
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
