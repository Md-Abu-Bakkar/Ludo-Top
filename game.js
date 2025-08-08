// Replace renderBoard() function
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    // Create 15x15 grid
    for (let row = 1; row <= 15; row++) {
        for (let col = 1; col <= 15; col++) {
            const square = document.createElement('div');
            square.className = 'board-square';
            square.style.gridColumn = col;
            square.style.gridRow = row;
            
            // Determine square type
            if ((row === 7 || row === 8 || row === 9) && 
                (col === 7 || col === 8 || col === 9)) {
                // Center star
                square.className += ' center-star';
            } else if ((row >= 4 && row <= 12) && (col === 7 || col === 8 || col === 9)) {
                // Vertical path
                square.className += ' path-square path-' + (row <= 7 ? 'red' : 'yellow');
            } else if ((col >= 4 && col <= 12) && (row === 7 || row === 8 || row === 9)) {
                // Horizontal path
                square.className += ' path-square path-' + (col <= 7 ? 'blue' : 'green');
            } else if ((row === 6 && col === 7) || (row === 7 && col === 6) || 
                       (row === 7 && col === 12) || (row === 6 && col === 9) || 
                       (row === 9 && col === 7) || (row === 9 && col === 9) || 
                       (row === 7 && col === 10) || (row === 10 && col === 7)) {
                // Safe squares
                square.className += ' safe-square';
            }
            
            board.appendChild(square);
        }
    }
    
    // Create home areas
    const homeRed = document.createElement('div');
    homeRed.className = 'home-area home-red';
    board.appendChild(homeRed);
    
    const homeBlue = document.createElement('div');
    homeBlue.className = 'home-area home-blue';
    board.appendChild(homeBlue);
    
    const homeGreen = document.createElement('div');
    homeGreen.className = 'home-area home-green';
    board.appendChild(homeGreen);
    
    const homeYellow = document.createElement('div');
    homeYellow.className = 'home-area home-yellow';
    board.appendChild(homeYellow);
    
    // Create tokens in home areas
    createTokens('red', homeRed);
    createTokens('blue', homeBlue);
    createTokens('green', homeGreen);
    createTokens('yellow', homeYellow);
}

function createTokens(color, homeArea) {
    for (let i = 0; i < 4; i++) {
        const token = document.createElement('div');
        token.className = `token token-${color}`;
        token.dataset.color = color;
        token.dataset.id = i;
        token.textContent = i + 1;
        
        // Position tokens in home area
        const row = Math.floor(i / 2) + 1;
        const col = (i % 2) + 1;
        token.style.gridColumn = col;
        token.style.gridRow = row;
        
        token.addEventListener('click', () => handleTokenClick(color, i));
        homeArea.appendChild(token);
        
        // Initialize game state
        if (!gameState.playerPositions[color]) {
            gameState.playerPositions[color] = {};
        }
        gameState.playerPositions[color][i] = { area: 'home', row, col };
    }
}
