document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure CSS transitions trigger
    setTimeout(() => {
        renderGoalCompletion();
        renderProblemsByDifficulty();
        renderPlatformStats();
        renderWeeklyConsistency();
    }, 100);
});

function renderGoalCompletion() {
    const goals = Store.get('goals') || [];
    if (goals.length === 0) return;
    
    const completed = goals.filter(g => g.status === 'completed').length;
    const percentage = Math.round((completed / goals.length) * 100);
    
    const circle = document.getElementById('goal-completion-circle');
    const text = document.getElementById('goal-completion-text');
    
    // Animate counter
    animateValue(text, 0, percentage, 1000, '%');
    
    // Animate circle
    circle.style.background = `conic-gradient(var(--accent-color) ${percentage * 3.6}deg, var(--bg-primary) 0deg)`;
}

function renderProblemsByDifficulty() {
    const problems = Store.get('problems') || [];
    if (problems.length === 0) return;
    
    const total = problems.length;
    const easy = problems.filter(p => p.difficulty === 'Easy').length;
    const medium = problems.filter(p => p.difficulty === 'Medium').length;
    const hard = problems.filter(p => p.difficulty === 'Hard').length;
    
    document.getElementById('val-easy').textContent = easy;
    document.getElementById('val-medium').textContent = medium;
    document.getElementById('val-hard').textContent = hard;
    
    document.getElementById('bar-easy').style.width = `${(easy / total) * 100}%`;
    document.getElementById('bar-medium').style.width = `${(medium / total) * 100}%`;
    document.getElementById('bar-hard').style.width = `${(hard / total) * 100}%`;
}

function renderPlatformStats() {
    const problems = Store.get('problems') || [];
    const container = document.getElementById('platform-stats');
    
    if (problems.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary);">No data available.</p>';
        return;
    }
    
    const platformCounts = {};
    problems.forEach(p => {
        platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
    });
    
    // Sort platforms by count
    const sortedPlatforms = Object.entries(platformCounts).sort((a, b) => b[1] - a[1]);
    
    container.innerHTML = sortedPlatforms.map(([platform, count]) => `
        <div class="platform-item">
            <span class="platform-name">${platform}</span>
            <span class="platform-count">${count}</span>
        </div>
    `).join('');
}

function renderWeeklyConsistency() {
    const problems = Store.get('problems') || [];
    const container = document.getElementById('weekly-graph');
    
    // Generate last 7 days including today
    const days = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }
    
    // Count problems per day
    const dayCounts = days.map(day => {
        const dateStr = day.toISOString().split('T')[0];
        return {
            dateStr: dateStr,
            label: day.toLocaleDateString('en-US', { weekday: 'short' }),
            count: problems.filter(p => p.date === dateStr).length
        };
    });
    
    const maxCount = Math.max(...dayCounts.map(d => d.count), 5); // Minimum 5 for scale
    
    container.innerHTML = dayCounts.map(d => {
        const heightPercentage = (d.count / maxCount) * 100;
        return `
            <div class="activity-day">
                <div class="activity-bar" style="height: ${heightPercentage}%" data-val="${d.count}"></div>
                <div class="day-label">${d.label}</div>
            </div>
        `;
    }).join('');
}

function animateValue(obj, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start) + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
