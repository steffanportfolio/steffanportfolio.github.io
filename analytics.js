// Analytics functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
});

function initializeAnalytics() {
    loadAnalytics();
}

function loadAnalytics() {
    const sessions = Storage.get('sessions') || [];
    
    if (sessions.length === 0) {
        return; // No data yet
    }
    
    // Quality distribution
    updateQualityDistribution(sessions);
    
    // Whoop stats
    updateWhoopStats(sessions);
    
    // Weekly breakdown
    updateWeeklyBreakdown(sessions);
    
    // Focus tracking
    updateFocusTracking(sessions);
    
    // Insights
    generateInsights(sessions);
}

function updateQualityDistribution(sessions) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    sessions.forEach(s => {
        distribution[s.quality]++;
    });
    
    document.getElementById('excellentCount').textContent = distribution[5];
    document.getElementById('goodCount').textContent = distribution[4];
    document.getElementById('okayCount').textContent = distribution[3];
    document.getElementById('belowCount').textContent = distribution[2];
    document.getElementById('poorCount').textContent = distribution[1];
}

function updateWhoopStats(sessions) {
    const withRecovery = sessions.filter(s => s.whoopRecovery);
    const withStrain = sessions.filter(s => s.whoopStrain);
    
    if (withRecovery.length > 0) {
        const avgRecovery = withRecovery.reduce((sum, s) => sum + parseInt(s.whoopRecovery), 0) / withRecovery.length;
        document.getElementById('avgRecovery').textContent = avgRecovery.toFixed(0) + '%';
    } else {
        document.getElementById('avgRecovery').textContent = '-';
    }
    
    if (withStrain.length > 0) {
        const avgStrain = withStrain.reduce((sum, s) => sum + parseFloat(s.whoopStrain), 0) / withStrain.length;
        document.getElementById('avgStrain').textContent = avgStrain.toFixed(1);
    } else {
        document.getElementById('avgStrain').textContent = '-';
    }
    
    // Correlation between recovery and quality
    if (withRecovery.length >= 5) {
        const highRecoverySessions = withRecovery.filter(s => parseInt(s.whoopRecovery) >= 67);
        const lowRecoverySessions = withRecovery.filter(s => parseInt(s.whoopRecovery) < 67);
        
        const avgQualityHigh = highRecoverySessions.reduce((sum, s) => sum + s.quality, 0) / highRecoverySessions.length;
        const avgQualityLow = lowRecoverySessions.reduce((sum, s) => sum + s.quality, 0) / lowRecoverySessions.length;
        
        if (avgQualityHigh > avgQualityLow + 0.5) {
            document.getElementById('recoveryQualityCorr').textContent = 'Higher recovery correlates with better session quality';
        } else if (avgQualityLow > avgQualityHigh + 0.5) {
            document.getElementById('recoveryQualityCorr').textContent = 'Interesting: Lower recovery doesn\'t seem to hurt your performance';
        } else {
            document.getElementById('recoveryQualityCorr').textContent = 'Recovery and session quality show moderate correlation';
        }
    }
}

function updateWeeklyBreakdown(sessions) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Sunday
    
    const weekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
    
    if (weekSessions.length === 0) {
        document.getElementById('weeklyBreakdown').innerHTML = '<p class="no-data">No data for current week</p>';
        return;
    }
    
    const types = {};
    weekSessions.forEach(s => {
        types[s.type] = (types[s.type] || 0) + 1;
    });
    
    const typeLabels = {
        track: 'Track Sessions',
        gym: 'Gym Sessions',
        recovery: 'Recovery Runs',
        race: 'Competitions'
    };
    
    const html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            ${Object.entries(types).map(([type, count]) => `
                <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem;">
                    <div style="font-size: 2rem; font-weight: 700; color: var(--primary);">${count}</div>
                    <div style="color: var(--text-secondary);">${typeLabels[type]}</div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('weeklyBreakdown').innerHTML = html;
}

function updateFocusTracking(sessions) {
    const trackSessions = sessions.filter(s => s.type === 'track' && s.focusPoints.length > 0);
    
    if (trackSessions.length === 0) {
        return;
    }
    
    const focusCounts = {
        'posture': 0,
        'relaxation': 0,
        'arm-drive': 0,
        'knee-lift': 0,
        'acceleration': 0,
        'finish': 0
    };
    
    trackSessions.forEach(s => {
        s.focusPoints.forEach(point => {
            if (focusCounts.hasOwnProperty(point)) {
                focusCounts[point]++;
            }
        });
    });
    
    const total = trackSessions.length;
    
    Object.entries(focusCounts).forEach(([focus, count]) => {
        const percentage = (count / total) * 100;
        const fillEl = document.getElementById(`focus-${focus}`);
        const pctEl = document.getElementById(`focus-${focus}-pct`);
        
        if (fillEl && pctEl) {
            fillEl.style.width = percentage + '%';
            pctEl.textContent = percentage.toFixed(0) + '%';
        }
    });
}

function generateInsights(sessions) {
    const insights = [];
    
    // Consistency insight
    const streak = Helpers.calculateStreak(sessions);
    if (streak >= 7) {
        insights.push(`🔥 Outstanding! You're on a ${streak}-day streak. Consistency is key to improvement.`);
    } else if (streak >= 3) {
        insights.push(`✅ Good momentum with a ${streak}-day streak. Keep it going!`);
    }
    
    // Quality insight
    const recentSessions = sessions.slice(-10);
    const avgQuality = recentSessions.reduce((sum, s) => sum + s.quality, 0) / recentSessions.length;
    
    if (avgQuality >= 4) {
        insights.push(`💪 Your last 10 sessions averaged ${avgQuality.toFixed(1)}/5 quality. You're training well!`);
    } else if (avgQuality < 3) {
        insights.push(`⚠️ Session quality has been lower recently. Consider: Are you recovering enough? Is training load appropriate?`);
    }
    
    // Training balance
    const last30Days = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 30);
        return sessionDate >= cutoff;
    });
    
    const trackCount = last30Days.filter(s => s.type === 'track').length;
    const gymCount = last30Days.filter(s => s.type === 'gym').length;
    
    if (gymCount < trackCount * 0.3) {
        insights.push(`🏋️ Consider adding more gym sessions. Strength work is crucial for 400m/800m performance.`);
    }
    
    // Whoop insights
    const whoopSessions = sessions.filter(s => s.whoopRecovery && s.whoopStrain);
    if (whoopSessions.length >= 5) {
        const highStrainLowRecovery = whoopSessions.filter(s => 
            parseFloat(s.whoopStrain) > 15 && parseInt(s.whoopRecovery) < 50
        );
        
        if (highStrainLowRecovery.length > 2) {
            insights.push(`⚠️ You've had ${highStrainLowRecovery.length} sessions with high strain on low recovery. Prioritize rest!`);
        }
    }
    
    // Competition prep
    const competitions = Storage.get('competitions') || [];
    const upcomingComps = competitions.filter(c => {
        const daysUntil = Helpers.daysBetween(Helpers.getToday(), c.date);
        return daysUntil > 0 && daysUntil <= 30;
    });
    
    if (upcomingComps.length > 0) {
        const nextComp = upcomingComps[0];
        const daysUntil = Helpers.daysBetween(Helpers.getToday(), nextComp.name);
        
        if (daysUntil <= 14) {
            insights.push(`🏆 ${nextComp.name} is in ${daysUntil} days. Focus on quality over volume, prioritize recovery.`);
        }
    }
    
    const container = document.getElementById('insightsList');
    
    if (insights.length === 0) {
        container.innerHTML = '<p class="no-data">Keep logging sessions to unlock personalized insights</p>';
    } else {
        container.innerHTML = insights.map(insight => `
            <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 0.5rem; margin: 0.75rem 0; border-left: 3px solid var(--primary);">
                ${insight}
            </div>
        `).join('');
    }
}
