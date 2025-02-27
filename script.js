// Initialize game variables
const gridSize = 4;
const BOX_SIZE = 100; // Each Box Size
const ROWS = 4; // Number of Rows and Cols.
const COLS = 4;

let board = []; // Game board stored in a 2D array (game state)
let currentPlayer = 'red'; // Start with Player 1 (Red)
let winnerDeclared = false;

let particles = []; // To store moving particles during bursts

// Initialize the game state (empty grid)
function initializeBoard() {
    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLS; j++) {
            board[i][j] = { atoms: 0, player: null }; // Empty cell
        }
    }
    renderBoard();
}

// Render the game board based on the current state
function renderBoard() {
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = ''; // Clear the grid

    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', i);
            cell.setAttribute('data-col', j);

            // Display the number of atoms in the center of the cell
            if (board[i][j].atoms > 0) {
                const atomCount = document.createElement('span');
                atomCount.textContent = board[i][j].atoms;

                // Apply the color based on the current player
                if (board[i][j].player === 'red') {
                    atomCount.classList.add('red-number'); // Red player atom color
                } else if (board[i][j].player === 'green') {
                    atomCount.classList.add('green-number'); // Green player atom color
                }

                cell.appendChild(atomCount);
            }

            // Add mouseover and mouseout events to highlight the cell
            cell.addEventListener('mouseover', () => {
                // Highlight the cell when mouse enters
                cell.style.backgroundColor = '#555';
                cell.style.border = '2px solid #30F200'; // Add border for emphasis
                cell.style.cursor = 'pointer'; // Change cursor to pointer
            });

            cell.addEventListener('mouseout', () => {
                // Reset the cell when mouse leaves
                cell.style.backgroundColor = '';
                cell.style.border = ''; // Reset border
            });

            // Add click event to each cell
            cell.addEventListener('click', () => handleCellClick(i, j));

            gridElement.appendChild(cell);
        }
    }

    // Update particle positions (for animation)
    updateParticles();
}

// Handle the click event on a cell
function handleCellClick(row, col) {
    if (winnerDeclared) return;  // Disable clicks after the game ends

    if (board[row][col].player === currentPlayer || board[row][col].player === null) {
        placeAtom(row, col);
    }
}

// Place an atom on the selected cell and handle explosion logic
function placeAtom(row, col) {
    if (board[row][col].player === null) {
        board[row][col].player = currentPlayer;
        board[row][col].atoms = 1;
    } else {
        // Increment the number of atoms, but make sure it doesn't exceed 4
        board[row][col].atoms = Math.min(board[row][col].atoms + 1, 4);
    }

    // Check for explosion if a cell has more than its capacity
    if (board[row][col].atoms === 4) {
        explodeCell(row, col);
    }

    // Switch players after the move
    switchPlayer();
    renderBoard();

    // Check if any player has won (entire grid filled by one player)
    checkWinner();
}

// Explosion logic: send atoms to surrounding cells as particles
function explodeCell(row, col) {
    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // Up, Down, Left, Right
    ];

    const atomsToSpread = board[row][col].atoms - 1; // Keep 1 atom in the original cell
    board[row][col].atoms = 1; // Keep 1 atom in the exploded cell
    board[row][col].player = currentPlayer; // Keep the current player as the owner

    // Send atoms to neighboring cells in all four directions
    directions.forEach(([dx, dy]) => {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
            // Only spill atoms to the neighboring cell, no matter if it's empty or not
            if (board[newRow][newCol].atoms < 4) {
                // Spill atoms, but do not exceed 4 atoms in the neighboring cell
                board[newRow][newCol].atoms = Math.min(board[newRow][newCol].atoms + 1, 4);
                board[newRow][newCol].player = currentPlayer; // Set the current player as the owner

                // Add explosion effect (with animation)
                addExplosionEffect(newRow, newCol, currentPlayer);
            }
        }
    });
}

// Add explosion effect (with animation)
function addExplosionEffect(row, col, color) {
    const gridElement = document.getElementById('grid');
    const cell = gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const explosion = document.createElement('div');
    explosion.classList.add('explosion');

    // Add the correct color class (red or green)
    if (color === 'red') {
        explosion.classList.add('red-particle');
    } else {
        explosion.classList.add('green-particle');
    }

    cell.appendChild(explosion);
}

// Switch to the next player (Red <-> Green)
function switchPlayer() {
    currentPlayer = currentPlayer === 'red' ? 'green' : 'red';
}

// Update particle positions to simulate their movement
function updateParticles() {
    // Optional: You can add further particle animations here.
}

// Check if any player has won by counting the atoms on the grid
function checkWinner() {
    let redAtoms = 0;
    let greenAtoms = 0;
    let redCells = 0;
    let greenCells = 0;
    let emptyCells = 0;

    // Count the number of atoms for each player and track their filled cells
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            if (board[i][j].player === 'red') {
                redAtoms += board[i][j].atoms;
                redCells++;
            } else if (board[i][j].player === 'green') {
                greenAtoms += board[i][j].atoms;
                greenCells++;
            } else {
                emptyCells++; // Count empty cells
            }
        }
    }

    // Check if the grid is full and if one player has dominated the grid
    if (emptyCells === 0) {
        if (redCells === ROWS * COLS) {
            winnerDeclared = true;
            document.getElementById('winner').textContent = "Red Wins!";
            document.getElementById('ResultContainer').style.display = "block";
            document.getElementById('play-again').style.display = "block"; // Show Play Again button
        } else if (greenCells === ROWS * COLS) {
            winnerDeclared = true;
            document.getElementById('winner').textContent = "Green Wins!";
            document.getElementById('ResultContainer').style.display = "block";
            document.getElementById('play-again').style.display = "block"; // Show Play Again button
        } else if (redAtoms > greenAtoms) {
            winnerDeclared = true;
            document.getElementById('winner').textContent = "Red Wins!";
            document.getElementById('ResultContainer').style.display = "block";
            document.getElementById('play-again').style.display = "block"; // Show Play Again button
        } else if (greenAtoms > redAtoms) {
            winnerDeclared = true;
            document.getElementById('winner').textContent = "Green Wins!";
            document.getElementById('ResultContainer').style.display = "block";
            document.getElementById('play-again').style.display = "block"; // Show Play Again button
        }
    }
}

// Reset the game
function resetGame() {
    winnerDeclared = false;
    currentPlayer = 'red'; // Reset to player 1 (Red)
    board = []; // Clear the game board

    // Reinitialize the game board with empty cells
    for (let i = 0; i < ROWS; i++) {
        board[i] = [];
        for (let j = 0; j < COLS; j++) {
            board[i][j] = { atoms: 0, player: null }; // Empty cell
        }
    }

    // Clear the result container and hide the "Play Again" button
    document.getElementById('ResultContainer').style.display = 'none';
    document.getElementById('play-again').style.display = 'none';

    // Render the empty board
    renderBoard();
}

// Initialize the game on page load
window.onload = () => {
    initializeBoard();

    // Play again button functionality
    document.getElementById('play-again').addEventListener('click', resetGame);

    // Play Again button functionality
    document.getElementById('ok').textContent = 'Play Again'; // Change text to "Play Again"
    document.getElementById('ok').addEventListener('click', () => {
        resetGame(); // Call resetGame to reset the board
    });
};
