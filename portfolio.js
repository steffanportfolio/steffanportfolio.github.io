// Portfolio functionality

document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
});

function initializePortfolio() {
    loadProfile();
}

function loadProfile() {
    const profile = Storage.get('profile') || {};
    
    if (profile.name) {
        document.getElementById('athleteName').textContent = profile.name;
    }
    
    if (profile.instagram) {
        const links = document.querySelectorAll('#instagramLink, #instagramContact');
        links.forEach(el => el.textContent = profile.instagram);
    }
    
    if (profile.email) {
        document.getElementById('emailContact').textContent = profile.email;
    }
    
    if (profile.about) {
        document.getElementById('aboutText').innerHTML = profile.about;
    }
    
    if (profile.philosophy) {
        document.getElementById('philosophyText').innerHTML = profile.philosophy;
    }
    
    if (profile.partnership) {
        document.getElementById('partnershipText').innerHTML = profile.partnership;
    }
    
    if (profile.photo) {
        document.getElementById('athletePhotoDisplay').innerHTML = `<img src="${profile.photo}" alt="Athlete Photo">`;
    }
    
    loadHighlights();
    loadResults();
}

function editProfile() {
    const name = prompt('Enter your name:', document.getElementById('athleteName').textContent);
    if (name) {
        document.getElementById('athleteName').textContent = name;
        
        const profile = Storage.get('profile') || {};
        profile.name = name;
        Storage.set('profile', profile);
    }
}

function saveAbout() {
    const about = document.getElementById('aboutText').innerHTML;
    const profile = Storage.get('profile') || {};
    profile.about = about;
    Storage.set('profile', profile);
    alert('About section saved!');
}

function savePhilosophy() {
    const philosophy = document.getElementById('philosophyText').innerHTML;
    const profile = Storage.get('profile') || {};
    profile.philosophy = philosophy;
    Storage.set('profile', profile);
    alert('Training philosophy saved!');
}

function savePartnership() {
    const partnership = document.getElementById('partnershipText').innerHTML;
    const profile = Storage.get('profile') || {};
    profile.partnership = partnership;
    Storage.set('profile', profile);
    alert('Partnership information saved!');
}

function saveContact() {
    const email = document.getElementById('emailContact').textContent;
    const instagram = document.getElementById('instagramContact').textContent;
    
    const profile = Storage.get('profile') || {};
    profile.email = email;
    profile.instagram = instagram;
    Storage.set('profile', profile);
    
    // Update other instagram displays
    document.getElementById('instagramLink').textContent = instagram;
    
    alert('Contact information saved!');
}

function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = e.target.result;
            document.getElementById('athletePhotoDisplay').innerHTML = `<img src="${photoData}" alt="Athlete Photo">`;
            
            const profile = Storage.get('profile') || {};
            profile.photo = photoData;
            Storage.set('profile', profile);
        };
        reader.readAsDataURL(file);
    }
}

function loadHighlights() {
    const highlights = Storage.get('highlights') || [];
    const container = document.getElementById('highlightsList');
    
    // Always show default highlights plus custom ones
    const defaultHighlights = `
        <div class="highlight-item">
            <div class="highlight-year">2024</div>
            <div class="highlight-content">
                <strong>NCAA Division I Competition</strong>
                <p>Competed at Division I level while completing undergraduate studies</p>
            </div>
        </div>
        <div class="highlight-item">
            <div class="highlight-year">2025</div>
            <div class="highlight-content">
                <strong>Return to GB National Competition</strong>
                <p>Transitioned to professional training focus with dedicated coaching</p>
            </div>
        </div>
    `;
    
    const customHighlights = highlights.map(h => `
        <div class="highlight-item">
            <div class="highlight-year">${h.year}</div>
            <div class="highlight-content">
                <strong>${h.title}</strong>
                <p>${h.description}</p>
                <button class="btn btn-small" onclick="deleteHighlight('${h.id}')" style="margin-top: 0.5rem;">Delete</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = defaultHighlights + customHighlights;
}

function addHighlight() {
    const year = prompt('Year:');
    if (!year) return;
    
    const title = prompt('Achievement title:');
    if (!title) return;
    
    const description = prompt('Description:');
    if (!description) return;
    
    const highlights = Storage.get('highlights') || [];
    highlights.push({
        id: Date.now().toString(),
        year,
        title,
        description
    });
    
    Storage.set('highlights', highlights);
    loadHighlights();
}

function deleteHighlight(id) {
    const highlights = Storage.get('highlights') || [];
    const filtered = highlights.filter(h => h.id !== id);
    Storage.set('highlights', filtered);
    loadHighlights();
}

function loadResults() {
    const results = Storage.get('results') || [];
    const container = document.getElementById('resultsList');
    
    if (results.length === 0) {
        container.innerHTML = '<p class="no-data">Add competition results to showcase your performance</p>';
        return;
    }
    
    container.innerHTML = results.map(r => `
        <div class="highlight-item">
            <div class="highlight-year">${new Date(r.date).getFullYear()}</div>
            <div class="highlight-content">
                <strong>${r.competition}</strong>
                <p>${r.event} - ${r.time} ${r.position ? `(${r.position})` : ''}</p>
                ${r.notes ? `<p style="font-size: 0.875rem; color: var(--text-secondary);">${r.notes}</p>` : ''}
                <button class="btn btn-small" onclick="deleteResult('${r.id}')" style="margin-top: 0.5rem;">Delete</button>
            </div>
        </div>
    `).join('');
}

function addResult() {
    const competition = prompt('Competition name:');
    if (!competition) return;
    
    const date = prompt('Date (YYYY-MM-DD):');
    if (!date) return;
    
    const event = prompt('Event (e.g., 400m, 800m):');
    if (!event) return;
    
    const time = prompt('Time:');
    if (!time) return;
    
    const position = prompt('Position (optional, e.g., 1st, 2nd):');
    const notes = prompt('Notes (optional):');
    
    const results = Storage.get('results') || [];
    results.push({
        id: Date.now().toString(),
        competition,
        date,
        event,
        time,
        position,
        notes
    });
    
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    Storage.set('results', results);
    loadResults();
}

function deleteResult(id) {
    const results = Storage.get('results') || [];
    const filtered = results.filter(r => r.id !== id);
    Storage.set('results', filtered);
    loadResults();
}
