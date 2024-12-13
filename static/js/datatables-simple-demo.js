window.addEventListener('DOMContentLoaded', event => {
    // Initialize Simple-DataTables
    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple, {
            responsive: true,
        });
    }
});
