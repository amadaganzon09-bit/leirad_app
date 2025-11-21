// This file is intentionally left empty as the main JavaScript logic 
// is handled by the React application in index.tsx
console.log('Main JavaScript file loaded');

    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.keyCode === 123)) {
            e.preventDefault();
        }
    });