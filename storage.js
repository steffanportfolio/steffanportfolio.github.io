// Storage management for the athletics platform
// Uses localStorage for persistent data storage

const Storage = {
    // Get data from localStorage
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    // Set data in localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },

    // Clear all data
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// Data structure initializers
const DataModels = {
    // Training session model
    createSession(data) {
        return {
            id: Date.now().toString(),
            date: data.date,
            type: data.type,
            trackFocus: data.trackFocus || null,
            workout: data.workout || '',
            quality: data.quality || 3,
            focusPoints: data.focusPoints || [],
            notes: data.notes || '',
            whoopRecovery: data.whoopRecovery || null,
            whoopStrain: data.whoopStrain || null,
            createdAt: new Date().toISOString()
        };
    },

    // Competition model
    createCompetition(data) {
        return {
            id: Date.now().toString(),
            name: data.name,
            date: data.date,
            importance: data.importance,
            createdAt: new Date().toISOString()
        };
    },

    // Personal best model
    createPB(event, time, date) {
        return {
            event,
            time,
            date,
            recordedAt: new Date().toISOString()
        };
    }
};

// Initialize default data if not exists
function initializeStorage() {
    if (!Storage.get('sessions')) {
        Storage.set('sessions', []);
    }
    if (!Storage.get('competitions')) {
        Storage.set('competitions', []);
    }
    if (!Storage.get('personalBests')) {
        Storage.set('personalBests', {
            '200m': { time: '21.80', date: null },
            '400m': { time: '47.83', date: null },
            '800m': { time: null, date: null }
        });
    }
    if (!Storage.get('profile')) {
        Storage.set('profile', {
            name: 'Your Name',
            instagram: '@your_instagram',
            email: 'your.email@example.com',
            about: '',
            philosophy: '',
            partnership: '',
            photo: null
        });
    }
    if (!Storage.get('hydration')) {
        Storage.set('hydration', {});
    }
}

// Helper functions
const Helpers = {
    // Calculate days between two dates
    daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    // Format date as YYYY-MM-DD
    formatDate(date) {
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    },

    // Get today's date as YYYY-MM-DD
    getToday() {
        return this.formatDate(new Date());
    },

    // Check if date is today
    isToday(date) {
        return date === this.getToday();
    },

    // Calculate current streak
    calculateStreak(sessions) {
        if (!sessions || sessions.length === 0) return 0;

        // Sort sessions by date (most recent first)
        const sorted = [...sessions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const today = this.getToday();
        let streak = 0;
        let currentDate = new Date(today);

        // Check if there's a session today or yesterday
        const mostRecentDate = sorted[0].date;
        const daysSinceRecent = this.daysBetween(mostRecentDate, today);
        
        if (daysSinceRecent > 1) return 0; // Streak broken

        // Count consecutive days
        for (let i = 0; i < sorted.length; i++) {
            const sessionDate = sorted[i].date;
            const expectedDate = this.formatDate(currentDate);
            
            if (sessionDate === expectedDate) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    },

    // Get longest streak
    getLongestStreak(sessions) {
        if (!sessions || sessions.length === 0) return 0;

        const sorted = [...sessions].sort((a, b) => new Date(a.date) - new Date(b.date));
        let longestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(sorted[i - 1].date);
            const currDate = new Date(sorted[i].date);
            const dayDiff = this.daysBetween(prevDate, currDate);

            if (dayDiff === 1) {
                currentStreak++;
                longestStreak = Math.max(longestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return longestStreak;
    },

    // Get sessions for current month
    getMonthSessions(sessions) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        return sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate.getFullYear() === year && sessionDate.getMonth() === month;
        });
    },

    // Time string to seconds
    timeToSeconds(timeStr) {
        if (!timeStr) return null;
        
        // Handle MM:SS.MS format (e.g., "1:46.00")
        if (timeStr.includes(':')) {
            const parts = timeStr.split(':');
            const minutes = parseInt(parts[0]);
            const seconds = parseFloat(parts[1]);
            return minutes * 60 + seconds;
        }
        
        // Handle SS.MS format (e.g., "47.83")
        return parseFloat(timeStr);
    },

    // Seconds to time string
    secondsToTime(seconds, includeMinutes = false) {
        if (!seconds) return null;
        
        if (includeMinutes || seconds >= 60) {
            const mins = Math.floor(seconds / 60);
            const secs = (seconds % 60).toFixed(2);
            return `${mins}:${secs.padStart(5, '0')}`;
        }
        
        return seconds.toFixed(2);
    }
};

// Initialize storage on page load
if (typeof window !== 'undefined') {
    initializeStorage();
}
