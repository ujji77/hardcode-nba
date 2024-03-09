document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    const days = ["", "M", "T", "W", "T", "F", "S", "S"];
    const months = ["", "Oct", "", "Nov", "", "", "", "", "Dec", "", "", "", "", "Jan", "", "", "", "Feb", "", "", "", "Mar", "", "", "", "Apr"];

    // Create month and day labels, and default boxes
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 26; col++) {
            if (col === 1 && row > 1) { // Day labels
                const label = document.createElement('div');
                label.className = 'label';
                label.textContent = days[row - 1];
                label.style.gridColumn = col;
                label.style.gridRow = row;
                grid.appendChild(label);
            } else if (row === 1) { // Month labels
                const label = document.createElement('div');
                label.className = 'label';
                label.textContent = months[col - 1];
                label.style.gridColumn = col;
                label.style.gridRow = row;
                grid.appendChild(label);
            } else { // Default boxes
                const box = document.createElement('div');
                box.className = 'box';
                box.setAttribute('data-row', row);
                box.setAttribute('data-col', col);
                grid.appendChild(box);
            }
        }
    }

    // Event listener for file input change
    document.getElementById("file-input").addEventListener("change", function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
                var data = d3.csvParse(reader.result);
                renderGraph(data, grid);
            };
        }
    });
});

// Function to render graph
function renderGraph(data, grid) {
    var colorScale = d3.scaleLinear()
                   .domain([0, 20, 25, 30, 35])
                   .range(["#ebedf0", "#c6e48b", "#9ec9a7", "#7bc96f", "#239a3b"]);
  
    // Update boxes with data
    data.forEach(function(d) {
        var coords = d.COORDINATE.split(',');
        var row = parseInt(coords[1], 10);
        var col = parseInt(coords[0], 10);

        // Find the box with the specific row and column
        var box = grid.querySelector('.box[data-row="' + row + '"][data-col="' + col + '"]');
        if (box) {
            box.style.backgroundColor = colorScale(+d.PTS);
            var tooltipText = d.DATE + ": " + d.PTS + " points " + d.OPPONENT;
            var tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            box.appendChild(tooltip);
        }
    });
}
