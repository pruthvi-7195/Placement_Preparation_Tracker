document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('goal-deadline').valueAsDate = new Date();
    
    renderGoals();
    
    document.getElementById('add-goal-btn').addEventListener('click', () => {
        document.getElementById('goal-form').reset();
        document.getElementById('goal-deadline').valueAsDate = new Date();
        document.getElementById('goal-modal').classList.add('active');
    });
    
    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('goal-modal').classList.remove('active');
    });
    
    document.getElementById('goal-form').addEventListener('submit', saveGoal);
});

function saveGoal(e) {
    e.preventDefault();
    
    const title = document.getElementById('goal-title').value;
    const deadline = document.getElementById('goal-deadline').value;
    const priority = document.getElementById('goal-priority').value;
    
    let goals = Store.get('goals') || [];
    
    const newGoal = {
        id: Date.now().toString(),
        title,
        deadline,
        priority,
        status: 'pending' // pending, completed
    };
    
    goals.push(newGoal);
    Store.set('goals', goals);
    
    document.getElementById('goal-modal').classList.remove('active');
    renderGoals();
}

function toggleGoalStatus(id) {
    let goals = Store.get('goals') || [];
    const index = goals.findIndex(g => g.id === id);
    
    if (index !== -1) {
        goals[index].status = goals[index].status === 'pending' ? 'completed' : 'pending';
        Store.set('goals', goals);
        renderGoals();
    }
}

function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this goal?')) {
        let goals = Store.get('goals') || [];
        goals = goals.filter(g => g.id !== id);
        Store.set('goals', goals);
        renderGoals();
    }
}

function renderGoals() {
    const goals = Store.get('goals') || [];
    const pendingContainer = document.getElementById('pending-goals-container');
    const completedContainer = document.getElementById('completed-goals-container');
    
    const pending = goals.filter(g => g.status === 'pending').sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const completed = goals.filter(g => g.status === 'completed').sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
    
    // Render Pending
    if (pending.length === 0) {
        pendingContainer.innerHTML = `
            <div class="empty-state">
                <p>No pending goals. Great job!</p>
            </div>
        `;
    } else {
        pendingContainer.innerHTML = pending.map(g => createGoalHTML(g)).join('');
    }
    
    // Render Completed
    if (completed.length === 0) {
        completedContainer.innerHTML = `
            <div class="empty-state">
                <p>No completed goals yet.</p>
            </div>
        `;
    } else {
        completedContainer.innerHTML = completed.map(g => createGoalHTML(g)).join('');
    }
}

function createGoalHTML(goal) {
    let priorityClass = 'badge-info';
    if (goal.priority === 'High') priorityClass = 'badge-danger';
    if (goal.priority === 'Medium') priorityClass = 'badge-warning';
    if (goal.priority === 'Low') priorityClass = 'badge-success';
    
    const isCompleted = goal.status === 'completed';
    
    return `
        <div class="goal-card ${isCompleted ? 'completed' : ''}">
            <input type="checkbox" class="goal-checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleGoalStatus('${goal.id}')">
            <div class="goal-content">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-meta">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -1px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${goal.deadline}
                    </span>
                    <span class="badge ${priorityClass}">${goal.priority}</span>
                </div>
            </div>
            <div class="goal-actions">
                <button class="btn-delete-goal" onclick="deleteGoal('${goal.id}')" title="Delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `;
}
