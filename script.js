document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.grid');
    const days = ["", "M", "T", "W", "T", "F", "S", "S"];
    const months = ["", "Oct", "", "Nov", "", "", "", "", "Dec", "", "", "", "", "Jan", "", "", "", "Feb", "", "", "", "Mar", "", "", "", "Apr"];

    // Create month labels in the first row
    for (let col = 0; col < 26; col++) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = months[col];
        grid.appendChild(label);
    }

    // Create day labels in the first column
    for (let row = 1; row <= 8; row++) {
        const label = document.createElement('div');
        label.className = 'label';
        label.textContent = days[row - 1];
        label.style.gridColumn = 1;
        label.style.gridRow = row + 1; // +1 because the first row is for months
        grid.appendChild(label);
    }

    // Event listener for file input change
    document.getElementById("file-input").addEventListener("change", function(event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function() {
                var data = d3.csvParse(reader.result);
                renderGraph(data);
            };
        }
    });
});

// Function to render graph
function renderGraph(data) {
    // Define color scale
    var colorScale = d3.scaleLinear()
                   .domain([0, 20, 25, 30, 35])
                   .range(["#ebedf0", "#c6e48b", "#9ec9a7", "#7bc96f", "#239a3b"]);
  
    // Select the graph container
    var graphContainer = d3.select("#chart .grid");

    // Clear previous elements
    graphContainer.selectAll(".box").remove();

    // Create elements for each data point
    data.forEach(function(d) {
        var coords = d.COORDINATE.split(',');
        var row = parseInt(coords[1], 10) + 1; // +1 to adjust for the first row of month labels
        var col = parseInt(coords[0], 10) + 1; // +1 to adjust for the first column of day labels

        graphContainer.append("div")
            .attr("class", "box")
            .attr("style", "grid-row: " + row + "; grid-column: " + col + ";")
            .style("background-color", function() {
                return colorScale(+d.PTS); // Assuming PTS is points
            })
            .append("title")
            .text(d.DATE + ": " + d.PTS + " points");
    });
}
