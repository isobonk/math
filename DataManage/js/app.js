/**
 * Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Study Section
    initStudySection();

    // Set default tab
    switchTab('study');
});

function switchTab(tabName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(el => {
        el.classList.remove('active');
    });

    // Deactivate buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activate target
    document.getElementById(`${tabName}-section`).classList.add('active');

    // Find button that calls this function with tabName
    const btns = document.querySelectorAll('.tab-btn');
    if (tabName === 'study') btns[0].classList.add('active');
    else btns[1].classList.add('active');
}
