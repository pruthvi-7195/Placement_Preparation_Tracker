document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    document.getElementById('problem-date').valueAsDate = new Date();
    
    renderProblems();
    
    // Event Listeners
    document.getElementById('add-problem-btn').addEventListener('click', openModal);
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    document.getElementById('problem-form').addEventListener('submit', saveProblem);
    
    document.getElementById('filter-difficulty').addEventListener('change', renderProblems);
    document.getElementById('filter-platform').addEventListener('change', renderProblems);
});

function openModal(problem = null) {
    const modal = document.getElementById('problem-modal');
    const form = document.getElementById('problem-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('problem-date').valueAsDate = new Date();
    
    if (problem && problem.id) {
        title.textContent = 'Edit Problem';
        document.getElementById('problem-id').value = problem.id;
        document.getElementById('problem-name').value = problem.name;
        document.getElementById('problem-platform').value = problem.platform;
        document.getElementById('problem-difficulty').value = problem.difficulty;
        document.getElementById('problem-status').value = problem.status;
        document.getElementById('problem-date').value = problem.date;
    } else {
        title.textContent = 'Add Problem';
        document.getElementById('problem-id').value = '';
    }
    
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('problem-modal');
    modal.classList.remove('active');
}

function saveProblem(e) {
    e.preventDefault();
    
    const id = document.getElementById('problem-id').value;
    const name = document.getElementById('problem-name').value;
    const platform = document.getElementById('problem-platform').value;
    const difficulty = document.getElementById('problem-difficulty').value;
    const status = document.getElementById('problem-status').value;
    const date = document.getElementById('problem-date').value;
    
    let problems = Store.get('problems') || [];
    
    if (id) {
        // Update
        const index = problems.findIndex(p => p.id === id);
        if (index !== -1) {
            problems[index] = { id, name, platform, difficulty, status, date };
        }
    } else {
        // Create
        const newProblem = {
            id: Date.now().toString(),
            name,
            platform,
            difficulty,
            status,
            date
        };
        problems.push(newProblem);
    }
    
    Store.set('problems', problems);
    closeModal();
    renderProblems();
}

function deleteProblem(id) {
    if (confirm('Are you sure you want to delete this problem?')) {
        let problems = Store.get('problems') || [];
        problems = problems.filter(p => p.id !== id);
        Store.set('problems', problems);
        renderProblems();
    }
}

function editProblem(id) {
    const problems = Store.get('problems') || [];
    const problem = problems.find(p => p.id === id);
    if (problem) {
        openModal(problem);
    }
}

function renderProblems() {
    let problems = Store.get('problems') || [];
    const container = document.getElementById('problems-container');
    
    // Apply filters
    const difficultyFilter = document.getElementById('filter-difficulty').value;
    const platformFilter = document.getElementById('filter-platform').value;
    
    if (difficultyFilter !== 'All') {
        problems = problems.filter(p => p.difficulty === difficultyFilter);
    }
    
    if (platformFilter !== 'All') {
        problems = problems.filter(p => p.platform === platformFilter);
    }
    
    // Sort by date desc
    problems.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (problems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <p>No problems found. Adjust filters or add a new one!</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Problem Name</th>
                    <th>Platform</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    problems.forEach(p => {
        let diffClass = 'badge-info';
        if (p.difficulty === 'Easy') diffClass = 'badge-success';
        if (p.difficulty === 'Medium') diffClass = 'badge-warning';
        if (p.difficulty === 'Hard') diffClass = 'badge-danger';
        
        let statusClass = 'status-solved';
        if (p.status === 'Attempted') statusClass = 'status-attempted';
        if (p.status === 'Review') statusClass = 'status-review';
        
        html += `
            <tr>
                <td style="font-weight: 500;">${p.name}</td>
                <td>${p.platform}</td>
                <td><span class="badge ${diffClass}">${p.difficulty}</span></td>
                <td><span class="status-badge ${statusClass}">${p.status}</span></td>
                <td style="color: var(--text-secondary); font-size: 0.875rem;">${p.date}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="editProblem('${p.id}')" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button class="btn-icon delete" onclick="deleteProblem('${p.id}')" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}
