document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('change', function() {
        if (darkModeToggle.checked) {
            // Change colors for dark mode
            document.body.classList.add('dark-mode');
        } else {
            // Revert back to light mode colors
            document.body.classList.remove('dark-mode');
        }
    });

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
    const filename = `data/${filenameWithoutExtension}.csv`; // Path to the CSV folder
    
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
            // Update player stats
            document.getElementById('ppg').textContent = player.PPG;
            document.getElementById('pgpos').textContent = player.PPGpos;

            document.getElementById('apg').textContent = player.APG;
            document.getElementById('apgpos').textContent = player.APGpos;

            document.getElementById('rpg').textContent = player.RPG;
            document.getElementById('rpgpos').textContent = player.RPGpos;

            document.getElementById('fg').textContent = player.FG;
            document.getElementById('fgp').textContent = player.FGpos;
        }
    }).catch(function(error) {
        console.error("Error updating player info:", error);
    });
}

// Convert a date string to grid coordinates
function dateToCoordinates(dateStr) {
    // Extract day of week, day number, and month
    const dateMatch = dateStr.trim().match(/(\w+)\s+(\d+)\s+(\w+)/);
    
    if (!dateMatch) {
        console.error("Failed to parse date:", dateStr);
        return null;
    }
    
    const dayOfWeek = dateMatch[1];
    const dayNum = parseInt(dateMatch[2], 10);
    const month = dateMatch[3];
    
    // Day of week mapping to rows
    const dayToRow = {
        'Monday': 2,
        'Tuesday': 3,
        'Wednesday': 4,
        'Thursday': 5,
        'Friday': 6,
        'Saturday': 7,
        'Sunday': 8
    };
    
    // Get the row based on day of week
    const row = dayToRow[dayOfWeek];
    if (!row) {
        console.error("Unknown day of week:", dayOfWeek);
        return null;
    }
    
    // Convert date string to Date object for better calculation
    // The format is "Weekday DD Month", so we need to add the year
    const year = (month === 'January' || month === 'February' || month === 'March' || month === 'April') ? 2025 : 2024;
    
    // Map abbreviated months to full names for better parsing
    const monthMap = {
        'Oct': 'October',
        'Nov': 'November',
        'Dec': 'December',
        'Jan': 'January',
        'Feb': 'February',
        'Mar': 'March',
        'Apr': 'April'
    };
    
    const fullMonth = monthMap[month] || month;
    const dateObj = new Date(`${fullMonth} ${dayNum}, ${year}`);
    
    // Calculate the column based on the date's position in the season
    // Our grid starts on Monday, October 21, 2024
    const startDate = new Date(2024, 9, 21); // 9 = October (0-indexed months)
    
    // Calculate weeks since start date (each column represents a week)
    const weeksSinceStart = Math.floor((dateObj - startDate) / (7 * 24 * 60 * 60 * 1000));
    
    // Column calculation (add 2 because first column is for labels)
    const col = weeksSinceStart + 2;
    
    return { col, row };
}

// Function to render the graph based on player data
function renderGraph(data, grid) {
    // Clear any previous graph data
    grid.querySelectorAll('.box').forEach(box => {
        box.style.backgroundColor = ''; // Clear box color
        const tooltip = box.querySelector('.tooltip');
        if (tooltip) {
            tooltip.remove(); // Clear tooltip
        }
        box.removeEventListener('click', boxClickHandler); // Remove event listener
    });

    // Set the color scale for the boxes
    var colorScale = d3.scaleLinear()
        .domain([0, 20, 25, 30, 35, 100])
        .range(["#ebedf0", "#c6e48b", "#9ec9a7", "#7bc96f", "#239a3b", "#002100"]);

    // Update boxes with player data
    data.forEach(function(d) {
        // Use the date to determine the coordinates
        const coords = dateToCoordinates(d.DATE);
        
        if (!coords) {
            console.error("Failed to determine coordinates for date:", d.DATE);
            return; // Skip this data point
        }
        
        var row = coords.row;
        var col = coords.col;

        // Find the specific box
        var box = grid.querySelector(`.box[data-row="${row}"][data-col="${col}"]`);
        if (box) {
            box.style.backgroundColor = colorScale(+d.PTS);
            var resultColor = d.RESULT.startsWith('W') ? '#4CAF50' : (d.RESULT.startsWith('L') ? 'red' : 'white');
            var tooltipText = `${d.DATE}: <b>${d.PTS} points ${d.OPPONENT}</b> | <b><span style='color: ${resultColor}'>${d.RESULT}</span></b>`;
            
            // Create and append tooltip
            var tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = tooltipText;
            box.appendChild(tooltip);

            // Add event listener for mobile tap
            box.addEventListener('click', boxClickHandler);
        } else {
            console.error(`No box found for row=${row}, col=${col}`);
        }
    });

    // Define event handler for box click
    function boxClickHandler(event) {
        event.preventDefault();
        // Remove any existing toasts
        var existingToasts = document.querySelectorAll('.toast');
        existingToasts.forEach(toast => toast.remove());
        // Create and append new toast
        var tooltipText = event.currentTarget.querySelector('.tooltip').innerHTML;
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<div>${tooltipText}</div><button class="close-btn">×</button>`;
        document.body.appendChild(toast);
        // Apply animation class
        setTimeout(function() {
            toast.classList.add('show');
        }, 100); // Delay the animation to ensure smoothness
        // Add event listener to close button
        var closeBtn = toast.querySelector('.close-btn');
        closeBtn.addEventListener('click', function() {
            toast.classList.remove('show');
            // Remove the toast after animation completes
            setTimeout(function() {
                toast.remove();
            }, 500); // Wait for animation to complete (500ms)
        });
    }
}

// Function to create grid structure
function createGridStructure(grid) {
    const days = ["", "M", "T", "W", "T", "F", "S", "S"];
    
    // Generate month labels based on our date range
    // From Monday Oct 21, 2024 to Sunday Apr 13, 2025
    const months = Array(27).fill(""); // Initialize with empty strings
    
    // Place month labels at their correct positions
    // These positions were calculated based on when each month starts in the grid
    months[2] = "Oct";   // October starts at column 2
    months[4] = "Nov";   // November starts around column 4
    months[8] = "Dec";   // December starts around column 8
    months[12] = "Jan";  // January starts around column 12
    months[16] = "Feb";  // February starts around column 16 
    months[20] = "Mar";  // March starts around column 20
    months[25] = "Apr";  // April starts around column 25

    // Create month and day labels, and default boxes
    for (let row = 1; row <= 8; row++) {
        for (let col = 1; col <= 26; col++) {
            let div = document.createElement('div');
            if (col === 1 && row > 1) { // Day labels
                div.className = 'label';
                div.textContent = days[row - 1];
            } else if (row === 1) { // Month labels
                div.className = 'label';
                div.textContent = months[col];
            } else { // Default boxes
                div.className = 'box';
                div.setAttribute('data-row', row);
                div.setAttribute('data-col', col);
            }
            grid.appendChild(div);
        }
    }
}