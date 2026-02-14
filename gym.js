// Gym program functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeGym();
});

function initializeGym() {
    loadCurrentProgram();
    
    document.getElementById('currentProgramForm').addEventListener('submit', handleProgramSubmit);
}

function loadCurrentProgram() {
    const program = Storage.get('gymProgram') || {
        phase: 'general-prep',
        sessionsPerWeek: 2,
        notes: ''
    };
    
    document.getElementById('programPhase').value = program.phase;
    document.getElementById('sessionPerWeek').value = program.sessionsPerWeek;
    document.getElementById('programNotes').value = program.notes;
}

function handleProgramSubmit(e) {
    e.preventDefault();
    
    const program = {
        phase: document.getElementById('programPhase').value,
        sessionsPerWeek: parseInt(document.getElementById('sessionPerWeek').value),
        notes: document.getElementById('programNotes').value,
        updatedAt: new Date().toISOString()
    };
    
    Storage.set('gymProgram', program);
    alert('Gym program settings saved!');
}

function openProgramBuilder() {
    alert('Program Builder feature coming soon! For now, use the recommended programs above as templates and log your gym sessions in the Training Log.');
}
