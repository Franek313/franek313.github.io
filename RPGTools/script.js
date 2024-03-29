const toggleButton = document.getElementById('toggleButton');
const sidePanel = document.getElementById('sidePanel');

toggleButton.addEventListener('click', function() {
    if (sidePanel.style.left === '-250px') {
        sidePanel.style.left = '0'; // Wysuwaj panel
    } else {
        sidePanel.style.left = '-250px'; // Schowaj panel
    }
});