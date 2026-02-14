// Dashboard functionality

document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
});

function loadDashboard() {
    const sessions = Storage.get('sessions') || [];
    const competitions = Storage.get('competitions') || [];
    const pbs = Storage.get('personalBests') || {};

    // Update streak
    updateStreak(sessions);

    // Update today's status
    updateTodayStatus(sessions);

    // Update next competition
    updateNextCompetition(competitions);

    // Update PB progress
    updatePBProgress(pbs);

    // Update recent sessions
    updateRecentSessions(sessions);

    // Update accountability calendar
    updateAccountabilityCalendar(sessions);
}

function updateStreak(sessions) {
    const currentStreak = Helpers.calculateStreak(sessions);
    const longestStreak = Helpers.getLongestStreak(sessions);
    const monthSessions = Helpers.getMonthSessions(sessions);

    document.getElementById('currentStreak').textContent = currentStreak;
    document.getElementById('longestStreak').textContent = longestStreak;
    document.getElementById('monthSessions').textContent = monthSessions.length;
}

function updateTodayStatus(sessions) {
    const today = Helpers.getToday();
    const todaySession = sessions.find(s => s.date === today);
    const container = document.getElementById('todayStatus');

    if (todaySession) {
        const qualityEmojis = {
            5: '🔥',
            4: '✅',
            3: '👍',
            2: '😐',
            1: '😞'
        };

        container.innerHTML = `
            <div class="today-logged">
                <p><strong>${todaySession.type.charAt(0).toUpperCase() + todaySession.type.slice(1)} Session</strong> ${qualityEmojis[todaySession.quality]}</p>
                <p class="session-notes">${todaySession.workout.substring(0, 100)}${todaySession.workout.length > 100 ? '...' : ''}</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <p>No session logged yet today</p>
            <a href="training.html" class="btn btn-primary">Log Session</a>
        `;
    }
}

function updateNextCompetition(competitions) {
    const today = new Date();
    const upcoming = competitions
        .filter(c => new Date(c.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    const container = document.getElementById('nextCompetition');

    if (upcoming.length > 0) {
        const next = upcoming[0];
        const daysUntil = Helpers.daysBetween(Helpers.getToday(), next.date);
        const importanceEmoji = {
            major: '🏆',
            important: '⭐',
            standard: '📍'
        };

        container.innerHTML = `
            <div class="next-comp-info">
                <p><strong>${importanceEmoji[next.importance]} ${next.name}</strong></p>
                <p class="competition-date">${new Date(next.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p class="days-until">${daysUntil} days away</p>
            </div>
        `;
    } else {
        container.innerHTML = `
            <p class="no-data">No upcoming competitions</p>
            <a href="goals.html" class="btn btn-secondary">Add Competition</a>
        `;
    }
}

function updatePBProgress(pbs) {
    // 400m progress (from 47.83 to 45.99)
    const current400 = Helpers.timeToSeconds(pbs['400m'].time);
    const target400 = 45.99;
    const start400 = 47.83;
    
    if (current400) {
        const progress400 = ((start400 - current400) / (start400 - target400)) * 100;
        document.getElementById('progress400m').style.width = Math.min(Math.max(progress400, 0), 100) + '%';
    }

    // 800m progress (to 106.00 seconds = 1:46.00)
    if (pbs['800m'].time) {
        const current800 = Helpers.timeToSeconds(pbs['800m'].time);
        const target800 = 106.00; // 1:46.00
        const estimated800 = 115.00; // Estimated starting point based on 400m time
        
        const progress800 = ((estimated800 - current800) / (estimated800 - target800)) * 100;
        document.getElementById('progress800m').style.width = Math.min(Math.max(progress800, 0), 100) + '%';
    }
}

function updateRecentSessions(sessions) {
    const recent = sessions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const container = document.getElementById('recentSessionsList');

    if (recent.length === 0) {
        container.innerHTML = '<p class="no-data">No sessions logged yet</p>';
        return;
    }

    const qualityEmojis = {
        5: '🔥',
        4: '✅',
        3: '👍',
        2: '😐',
        1: '😞'
    };

    container.innerHTML = recent.map(session => `
        <div class="session-item-mini">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span><strong>${new Date(session.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</strong> - ${session.type}</span>
                <span>${qualityEmojis[session.quality]}</span>
            </div>
        </div>
    `).join('');
}

function updateAccountabilityCalendar(sessions) {
    const container = document.getElementById('accountabilityCalendar');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create calendar grid
    let html = '<div class="accountability-calendar">';
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = Helpers.formatDate(new Date(year, month, day));
        const hasSession = sessions.some(s => s.date === date);
        const isFuture = new Date(date) > today;
        const isToday = Helpers.isToday(date);
        
        let className = 'calendar-day';
        if (isToday) className += ' today';
        if (isFuture) className += ' future';
        else if (hasSession) className += ' logged';
        else className += ' missed';
        
        html += `<div class="${className}">${day}</div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}
