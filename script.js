document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    const days = ["", "M", "T", "W", "T", "F", "S", "S"];
    const months = ["", "Oct", "", "Nov", "", "", "", "", "Dec", "", "", "", "", "Jan", "", "", "", "Feb", "", "", "", "Mar", "", "", "", "Apr"];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 26; col++) {
            if (row === 0) {
                const label = document.createElement('div');
                label.className = 'label';
                label.textContent = months[col];
                grid.appendChild(label);
            } else if (col === 0) {
                const label = document.createElement('div');
                label.className = 'label';
                label.textContent = days[row];
                grid.appendChild(label);
            } else {
                const box = document.createElement('div');
                box.className = 'box';
                // Add more logic here for contribution data if needed
                grid.appendChild(box);
            }
        }
    }
});
