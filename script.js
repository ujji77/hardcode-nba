document.addEventListener('DOMContentLoaded', function() {
    // Create the grid structure
    const grid = document.querySelector('.grid');
    createGridStructure(grid);
  
    // Load the player database and add change event listener to the dropdown
    loadPlayerDatabase(grid);
});

// Function to load player database and set up the dropdown
function loadPlayerDatabase(grid) {
    d3.csv("Player Database.csv").then(function(database) {
        const dropdown = document.getElementById("player-dropdown");
        database.forEach(function(player) {
            let option = new Option(player.Name, player.File);
            dropdown.add(option);
        });

        // Load initial player data or any default player if necessary
        loadPlayerData(database[0].File, grid);

        // Set up event listener for dropdown changes
        dropdown.addEventListener("change", function(event) {
            const selectedFile = event.target.value;
            loadPlayerData(selectedFile, grid);
        });
    });
}

// Function to load specific player data CSV and render the graph
function loadPlayerData(filenameWithoutExtension, grid) {
    const filename = `${filenameWithoutExtension}.csv`; // Add the .csv extension
    d3.csv(filename).then(function(playerData) {
        renderGraph(playerData, grid);
    }).catch(function(error) {
        console.error("Failed to load file:", filename, "Error:", error);
    });

    // Update the player information
    updatePlayerInfo(filenameWithoutExtension);
}

// New function to update the player information
function updatePlayerInfo(playerName) {
    d3.csv("Player Database.csv").then(function(players) {
        const player = players.find(p => p.File.includes(playerName));
        if (player) {
            // Assuming 'lebron.png' is in the same directory as your HTML file
            document.getElementById("player-image").src = 'images/' + playerName.toLowerCase() + '.png';
            document.getElementById("player-name").textContent = player.Name;
            document.getElementById("player-meta").textContent = `${player.Team} • ${player.Number} • ${player.Position}`;
        }
    });
}


// Function to render the graph based on player data
function renderGraph(data, grid) {
    // Clear any previous tooltips
    grid.querySelectorAll('.tooltip').forEach(tooltip => tooltip.remove());

    // Set the color scale for the boxes
    var colorScale = d3.scaleLinear()
        .domain([0, 20, 25, 30, 35])
        .range(["#ebedf0", "#c6e48b", "#9ec9a7", "#7bc96f", "#239a3b"]);

    // Update boxes with player data
    data.forEach(function(d) {
        var coords = d.COORDINATE.split(',');
        var row = parseInt(coords[1], 10);
        var col = parseInt(coords[0], 10);

        // Find the specific box
        var box = grid.querySelector(`.box[data-row="${row}"][data-col="${col}"]`);
        if (box) {
            box.style.backgroundColor = colorScale(+d.PTS);
            var resultColor = d.RESULT.startsWith('W') ? 'lightgreen' : (d.RESULT.startsWith('L') ? 'red' : 'white');
            var tooltipText = `${d.DATE}: <b>${d.PTS} points ${d.OPPONENT}</b> | <span style='color: ${resultColor}'>${d.RESULT}</span>`;
            
            // Create and append tooltip
            var tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = tooltipText;
            box.appendChild(tooltip);
        }
    });
}

// Function to create grid structure
function createGridStructure(grid) {
    const days = ["", "M", "T", "W", "T", "F", "S", "S"];
    const months = ["", "Oct", "", "Nov", "", "", "", "", "Dec", "", "", "", "", "Jan", "", "", "", "Feb", "", "", "", "Mar", "", "", "", "Apr"];

    // Create month and day labels, and default boxes
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 26; col++) {
            let div = document.createElement('div');
            if (col === 1 && row > 1) { // Day labels
                div.className = 'label';
                div.textContent = days[row - 1];
            } else if (row === 1) { // Month labels
                div.className = 'label';
                div.textContent = months[col - 1];
            } else { // Default boxes
                div.className = 'box';
                div.setAttribute('data-row', row);
                div.setAttribute('data-col', col);
            }
            grid.appendChild(div);
        }
    }
}
