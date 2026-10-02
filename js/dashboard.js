document.addEventListener('DOMContentLoaded', () => {
    updateDashboardStats();
    renderRecentProblems();
    renderUpcomingGoals();
});

function updateDashboardStats() {
    const problems = Store.get('problems') || [];
    const goals = Store.get('goals') || [];
    const interviews = Store.get('interviews') || [];

    // Problems Solved
    document.getElementById('stat-problems').textContent = problems.length;

    // Today's Goals
    const today = new Date().toISOString().split('T')[0];
    const todaysGoals = goals.filter(g => g.deadline === today);
    const completedToday = todaysGoals.filter(g => g.status === 'completed').length;
    document.getElementById('stat-goals').textContent = `${completedToday}/${todaysGoals.length}`;

    // Mock Interviews
    document.getElementById('stat-interviews').textContent = interviews.length;

    // Calculate Streak (Simple logic based on problem dates)
    const streak = calculateStreak(problems);
    document.getElementById('stat-streak').textContent = `${streak} Days`;
}

function calculateStreak(problems) {
    if (problems.length === 0) return 0;
    
    // Get unique dates
    const dates = [...new Set(problems.map(p => p.date))].sort((a, b) => new Date(b) - new Date(a));
    
    if (dates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let currentDate = new Date(dates[0]);
    currentDate.setHours(0,0,0,0);
    
    // If the last problem wasn't today or yesterday, streak is 0
    const diffTime = Math.abs(today - currentDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0;
    
    streak = 1;
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i]);
        prevDate.setHours(0,0,0,0);
        
        const diff = Math.abs(currentDate - prevDate);
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        
        if (days === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }
    
    return streak;
}

function renderRecentProblems() {
    const problems = Store.get('problems') || [];
    const container = document.getElementById('recent-problems');
    
    if (problems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No problems solved yet. Start practicing!</p>
            </div>
        `;
        return;
    }
    
    // Sort by date desc and take top 5
    const recent = problems.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Problem Name</th>
                    <th>Platform</th>
                    <th>Difficulty</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    recent.forEach(p => {
        let badgeClass = 'badge-info';
        if (p.difficulty === 'Easy') badgeClass = 'badge-success';
        if (p.difficulty === 'Medium') badgeClass = 'badge-warning';
        if (p.difficulty === 'Hard') badgeClass = 'badge-danger';
        
        html += `
            <tr>
                <td style="font-weight: 500;">${p.name}</td>
                <td>${p.platform}</td>
                <td><span class="badge ${badgeClass}">${p.difficulty}</span></td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    container.innerHTML = html;
}

function renderUpcomingGoals() {
    const goals = Store.get('goals') || [];
    const container = document.getElementById('upcoming-goals');
    
    const pending = goals.filter(g => g.status === 'pending')
                         .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
                         .slice(0, 5);
                         
    if (pending.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No upcoming goals. Set some targets!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    pending.forEach(g => {
        let priorityColor = g.priority === 'High' ? 'var(--danger)' : 
                            (g.priority === 'Medium' ? 'var(--warning)' : 'var(--success)');
                            
        html += `
            <div class="goal-item">
                <div>
                    <div class="goal-title">${g.title}</div>
                    <div class="goal-meta">Due: ${g.deadline}</div>
                </div>
                <span class="badge" style="background-color: ${priorityColor}20; color: ${priorityColor}">
                    ${g.priority}
                </span>
            </div>
        `;
    });
    
    container.innerHTML = html;
}
