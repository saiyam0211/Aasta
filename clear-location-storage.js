// Run this in your browser console to clear location storage and debug
// Open DevTools (F12) and paste this in the Console tab

console.log('Current localStorage data:');
console.log('location-storage:', localStorage.getItem('location-storage'));

// Clear the location storage
localStorage.removeItem('location-storage');

console.log('Location storage cleared! Please refresh the page.');

// If you want to see all localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));
