window.addEventListener('DOMContentLoaded', event => {
    // Initialize Simple-DataTables
    const datatablesSimple = document.getElementById('datatablesSimple');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple, {
            responsive: true,
        });
    }
});


window.addEventListener('DOMContentLoaded', event => {
    // Initialize Simple-DataTables
    const datatablesSimple = document.getElementById('datatablesProcess');
    if (datatablesSimple) {
        new simpleDatatables.DataTable(datatablesSimple, {
            columns: [
                { select: 0, sortable: false }, // Disable sorting for the first column (index 0)
            ],
            responsive: true,
        });
        
        // Freeze the first column
        const table = document.getElementById('datatablesProcess');
        const firstColumnCells = table.querySelectorAll('td:first-child, th:first-child');
        
        // Apply a class to freeze the first column
        firstColumnCells.forEach(cell => {
            cell.classList.add('frozen-column');
        });
    }
});
