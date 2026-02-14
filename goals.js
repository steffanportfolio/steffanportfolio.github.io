// Goals and progress functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeGoals();
});

function initializeGoals() {
    // Handle competition form submission
    document.getElementById('competitionForm').addEventListener('submit', handleCompetitionSubmit);

    // Load competitions
    loadCompetitions();

    // Load accountability bars
    loadAccountabilityBars();

    // Load PBs
    loadPBs();
}

function handleCompetitionSubmit(e) {
    e.preventDefault();

    const compData = {
        name: document.getElementById('compName').value,
        date: document.getElementById('compDate').value,
        importance: document.getElementById('compImportance').value
    };

    const competition = DataModels.createCompetition(compData);

    const competitions = Storage.get('competitions') || [];
    competitions.push(competition);
    Storage.set('competitions', competitions);

    alert('Competition added successfully!');
    
    document.getElementById('competitionForm').reset();
    loadCompetitions();
    loadAccountabilityBars();
}

function loadCompetitions() {
    const competitions = Storage.get('competitions') || [];
    const today = new Date();
    
    // Separate past and upcoming
    const upcoming = competitions.filter(c => new Date(c.date) >= today);
    const past = competitions.filter(c => new Date(c.date) < today);
    
    // Sort upcoming by date (soonest first)
    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort past by date (most recent first)
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('competitionTimeline');

    if (upcoming.length === 0 && past.length === 0) {
        container.innerHTML = '<p class="no-data">No competitions added yet. Add your first competition above!</p>';
        return;
    }

    const importanceLabels = {
        major: '🏆 Major',
        important: '⭐ Important',
        standard: '📍 Standard'
    };

    let html = '';

    if (upcoming.length > 0) {
        html += '<h3 style="margin-top: 0;">Upcoming</h3>';
        html += upcoming.map(comp => {
            const daysUntil = Helpers.daysBetween(Helpers.getToday(), comp.date);
            return `
                <div class="competition-item ${comp.importance}">
                    <div class="competition-name">${comp.name}</div>
                    <div class="competition-date">${new Date(comp.date).toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <span class="days-until">${daysUntil} days away</span>
                        <span>${importanceLabels[comp.importance]}</span>
                    </div>
                    <button class="btn btn-small" style="margin-top: 0.75rem;" onclick="deleteCompetition('${comp.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }

    if (past.length > 0) {
        html += '<h3 style="margin-top: 1.5rem;">Past</h3>';
        html += past.map(comp => {
            const daysAgo = Helpers.daysBetween(comp.date, Helpers.getToday());
            return `
                <div class="competition-item ${comp.importance}" style="opacity: 0.7;">
                    <div class="competition-name">${comp.name}</div>
                    <div class="competition-date">${new Date(comp.date).toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                        <span style="color: var(--text-secondary);">${daysAgo} days ago</span>
                        <span>${importanceLabels[comp.importance]}</span>
                    </div>
                    <button class="btn btn-small" style="margin-top: 0.75rem;" onclick="deleteCompetition('${comp.id}')">Delete</button>
                </div>
            `;
        }).join('');
    }

    container.innerHTML = html;
}

function loadAccountabilityBars() {
    const competitions = Storage.get('competitions') || [];
    const sessions = Storage.get('sessions') || [];
    const today = new Date();
    
    // Filter to upcoming competitions only
    const upcoming = competitions
        .filter(c => new Date(c.date) >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5); // Show top 5 upcoming

    const container = document.getElementById('accountabilityBars');

    if (upcoming.length === 0) {
        container.innerHTML = '<p class="no-data">Add a competition to start tracking accountability</p>';
        return;
    }

    const todayDate = Helpers.getToday();

    container.innerHTML = upcoming.map(comp => {
        const compDate = new Date(comp.date);
        const startDate = new Date(); // Today
        const totalDays = Helpers.daysBetween(todayDate, comp.date);
        
        // Generate day blocks from today to competition
        let dayBlocks = '';
        for (let i = 0; i < totalDays; i++) {
            const checkDate = new Date(startDate);
            checkDate.setDate(checkDate.getDate() + i);
            const dateStr = Helpers.formatDate(checkDate);
            
            const hasSession = sessions.some(s => s.date === dateStr);
            const isFuture = checkDate > today;
            
            let className = 'day-block';
            if (isFuture) {
                className += ' future';
            } else if (hasSession) {
                className += ' logged';
            } else {
                className += ' missed';
            }
            
            dayBlocks += `<div class="${className}" title="${dateStr}"></div>`;
        }

        return `
            <div class="accountability-bar-container">
                <div class="accountability-bar-header">
                    <span class="accountability-bar-comp-name">${comp.name}</span>
                    <span class="accountability-bar-days">${totalDays} days</span>
                </div>
                <div class="accountability-bar">
                    ${dayBlocks}
                </div>
            </div>
        `;
    }).join('');
}

function loadPBs() {
    const pbs = Storage.get('personalBests') || {};
    
    document.getElementById('pb200m').textContent = pbs['200m']?.time || '21.80';
    document.getElementById('pb400m').textContent = pbs['400m']?.time || '47.83';
    document.getElementById('pb800m').textContent = pbs['800m']?.time || 'Not yet competed';
}

function updatePB(event) {
    const currentPB = Storage.get('personalBests') || {};
    const currentTime = currentPB[event]?.time;
    
    const newTime = prompt(`Enter new ${event} PB${currentTime ? ` (current: ${currentTime})` : ''}:`);
    
    if (newTime) {
        currentPB[event] = {
            time: newTime,
            date: Helpers.getToday()
        };
        
        Storage.set('personalBests', currentPB);
        loadPBs();
        alert('Personal best updated!');
    }
}

function deleteCompetition(compId) {
    if (!confirm('Are you sure you want to delete this competition?')) {
        return;
    }

    const competitions = Storage.get('competitions') || [];
    const filtered = competitions.filter(c => c.id !== compId);
    Storage.set('competitions', filtered);
    
    loadCompetitions();
    loadAccountabilityBars();
}
