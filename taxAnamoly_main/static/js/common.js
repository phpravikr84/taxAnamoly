// Automatically hide flash messages after 5 seconds
document.addEventListener("DOMContentLoaded", function () {
    let alerts = document.querySelectorAll('.flash-screen');
    
    // Add fade-in effect on load
    alerts.forEach(function (alert) {
        alert.classList.add('fade-in');
    });

    // Wait 5 seconds, then add fade-out effect
    setTimeout(function () {
        alerts.forEach(function (alert) {
            alert.classList.remove('fade-in');
            alert.classList.add('fade-out');
        });
    }, 5000);

    // Optional: Remove the alert from the DOM after fade-out
    setTimeout(function () {
        alerts.forEach(function (alert) {
            alert.remove();
        });
    }, 7000); // 2 seconds after fade-out starts
});
