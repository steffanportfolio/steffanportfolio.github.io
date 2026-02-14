// Training log functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeTrainingLog();
});

function initializeTrainingLog() {
    // Set today's date as default
    document.getElementById('sessionDate').valueAsDate = new Date();

    // Show/hide track details based on session type
    document.getElementById('sessionType').addEventListener('change', function() {
        const trackDetails = document.getElementById('trackDetailsGroup');
        trackDetails.style.display = this.value === 'track' ? 'block' : 'none';
    });

    // Handle form submission
    document.getElementById('sessionForm').addEventListener('submit', handleSessionSubmit);

    // Load session history
    loadSessionHistory();

    // Set up filters
    document.getElementById('filterType').addEventListener('change', loadSessionHistory);
    document.getElementById('filterPeriod').addEventListener('change', loadSessionHistory);
}

function handleSessionSubmit(e) {
    e.preventDefault();

    const sessionData = {
        date: document.getElementById('sessionDate').value,
        type: document.getElementById('sessionType').value,
        trackFocus: document.getElementById('trackFocus').value,
        workout: document.getElementById('sessionWorkout').value,
        quality: parseInt(document.querySelector('input[name="quality"]:checked')?.value || 3),
        focusPoints: Array.from(document.querySelectorAll('.focus-reminder:checked')).map(cb => cb.value),
        notes: document.getElementById('sessionNotes').value,
        whoopRecovery: document.getElementById('whoopRecovery').value || null,
        whoopStrain: document.getElementById('whoopStrain').value || null
    };

    // Create session
    const session = DataModels.createSession(sessionData);

    // Save to storage
    const sessions = Storage.get('sessions') || [];
    
    // Check if session already exists for this date and update it, or add new
    const existingIndex = sessions.findIndex(s => s.date === session.date);
    if (existingIndex >= 0) {
        if (confirm('A session already exists for this date. Replace it?')) {
            sessions[existingIndex] = session;
        } else {
            return;
        }
    } else {
        sessions.push(session);
    }
    
    Storage.set('sessions', sessions);

    // Show success message
    alert('Session logged successfully!');

    // Reset form
    document.getElementById('sessionForm').reset();
    document.getElementById('sessionDate').valueAsDate = new Date();

    // Reload history
    loadSessionHistory();
}

function loadSessionHistory() {
    const sessions = Storage.get('sessions') || [];
    const filterType = document.getElementById('filterType').value;
    const filterPeriod = parseInt(document.getElementById('filterPeriod').value);

    // Apply filters
    let filtered = sessions;

    // Type filter
    if (filterType !== 'all') {
        filtered = filtered.filter(s => s.type === filterType);
    }

    // Period filter
    if (filterPeriod !== 'all') {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filterPeriod);
        filtered = filtered.filter(s => new Date(s.date) >= cutoffDate);
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById('sessionHistory');

    if (filtered.length === 0) {
        container.innerHTML = '<p class="no-data">No sessions match your filters.</p>';
        return;
    }

    const qualityEmojis = {
        5: '🔥 Excellent',
        4: '✅ Good',
        3: '👍 Okay',
        2: '😐 Below Par',
        1: '😞 Poor'
    };

    const typeLabels = {
        track: 'Track Session',
        gym: 'Gym Session',
        recovery: 'Recovery',
        race: 'Competition'
    };

    container.innerHTML = filtered.map(session => `
        <div class="session-item">
            <div class="session-header">
                <span class="session-date">${new Date(session.date).toLocaleDateString('en-GB', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                })}</span>
                <span class="session-type">${typeLabels[session.type]}</span>
            </div>
            ${session.trackFocus ? `<p style="color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem;">Focus: ${session.trackFocus}</p>` : ''}
            <div class="session-quality">${qualityEmojis[session.quality]}</div>
            ${session.workout ? `<p><strong>Workout:</strong> ${session.workout}</p>` : ''}
            ${session.focusPoints.length > 0 ? `
                <p style="margin-top: 0.5rem;"><strong>Technical Focus:</strong></p>
                <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                    ${session.focusPoints.map(point => `<li>${getFocusPointLabel(point)}</li>`).join('')}
                </ul>
            ` : ''}
            ${session.notes ? `<p class="session-notes"><strong>Notes:</strong> ${session.notes}</p>` : ''}
            ${session.whoopRecovery || session.whoopStrain ? `
                <div style="display: flex; gap: 1rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
                    ${session.whoopRecovery ? `<span><strong>Recovery:</strong> ${session.whoopRecovery}%</span>` : ''}
                    ${session.whoopStrain ? `<span><strong>Strain:</strong> ${session.whoopStrain}</span>` : ''}
                </div>
            ` : ''}
            <button class="btn btn-small" style="margin-top: 1rem;" onclick="deleteSession('${session.id}')">Delete</button>
        </div>
    `).join('');
}

function getFocusPointLabel(value) {
    const labels = {
        'posture': 'Maintained upright posture',
        'relaxation': 'Stayed relaxed through shoulders',
        'arm-drive': 'Strong arm drive',
        'knee-lift': 'High knee lift',
        'acceleration': 'Controlled acceleration',
        'finish': 'Strong finish through line'
    };
    return labels[value] || value;
}

function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) {
        return;
    }

    const sessions = Storage.get('sessions') || [];
    const filtered = sessions.filter(s => s.id !== sessionId);
    Storage.set('sessions', filtered);
    
    loadSessionHistory();
}
