// Game state
const gameState = {
    players: [],
    currentPlayer: null,
    diceValue: 0,
    board: {},
    tokens: [],
    playerPositions: {},
    gameStarted: false,
    gameEnded: false
};

// Initialize game
function initGame() {
    renderBoard();
    setupPlayers();
    updateUI();
    
    // Event listeners
    document.getElementById('rollDice').addEventListener('click', rollDice);
}

// Render the Ludo board
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    // Create home areas
    const colors = ['red', 'blue', 'green', 'yellow'];
    const positions = [
        { top: '10px', left: '10px' },   // Red (top-left)
        { top: '10px', right: '10px' },   // Blue (top-right)
        { bottom: '10px', right: '10px' }, // Green (bottom-right)
        { bottom: '10px', left: '10px' }   // Yellow (bottom-left)
    ];
    
    colors.forEach((color, index) => {
        const home = document.createElement('div');
        home.className = `home-area ${color}-home`;
        Object.assign(home.style, positions[index]);
        board.appendChild(home);
        
        // Create 4 tokens for each player
        for (let i = 0; i < 4; i++) {
            const token = document.createElement('div');
            token.className = `token token-${color}`;
            token.dataset.color = color;
            token.dataset.id = i;
            token.textContent = i + 1;
            
            // Position tokens in home area
            const offsetX = (i % 2) * 40;
            const offsetY = Math.floor(i / 2) * 40;
            token.style.top = `${parseInt(positions[index].top || positions[index].bottom) + offsetY}px`;
            token.style.left = `${parseInt(positions[index].left || positions[index].right) + offsetX}px`;
            
            token.addEventListener('click', () => handleTokenClick(color, i));
            board.appendChild(token);
            
            // Initialize game state
            if (!gameState.playerPositions[color]) {
                gameState.playerPositions[color] = {};
            }
            gameState.playerPositions[color][i] = 'home';
        }
    });
    
    // Create safe spots
    const safeSpots = [
        { top: '50%', left: '20%' },
        { top: '20%', left: '50%' },
        { top: '50%', left: '80%' },
        { top: '80%', left: '50%' }
    ];
    
    safeSpots.forEach(spot => {
        const safeSpot = document.createElement('div');
        safeSpot.className = 'safe-spot';
        Object.assign(safeSpot.style, spot);
        board.appendChild(safeSpot);
    });
}

// Setup players
function setupPlayers() {
    // In a real implementation, this would come from Telegram WebApp.initData
    gameState.players = [
        { id: 'player1', name: 'Player 1', color: 'red', isBot: false },
        { id: 'player2', name: 'Player 2', color: 'blue', isBot: true },
        { id: 'player3', name: 'Player 3', color: 'green', isBot: true },
        { id: 'player4', name: 'Player 4', color: 'yellow', isBot: true }
    ];
    
    gameState.currentPlayer = gameState.players[0];
    gameState.gameStarted = true;
}

// Roll dice
function rollDice() {
    const diceBtn = document.getElementById('rollDice');
    diceBtn.disabled = true;
    
    // Animate dice roll
    let rolls = 0;
    const maxRolls = 10;
    const diceInterval = setInterval(() => {
        gameState.diceValue = Math.floor(Math.random() * 6) + 1;
        document.getElementById('diceResult').textContent = gameState.diceValue;
        rolls++;
        
        if (rolls >= maxRolls) {
            clearInterval(diceInterval);
            afterDiceRoll();
        }
    }, 100);
}

function afterDiceRoll() {
    const currentPlayer = gameState.currentPlayer;
    showMessage(`${currentPlayer.name} rolled a ${gameState.diceValue}`);
    
    // Check if player has any movable tokens
    const movableTokens = checkMovableTokens(currentPlayer.color, gameState.diceValue);
    
    if (movableTokens.length === 0) {
        showMessage(`${currentPlayer.name} has no valid moves`);
        setTimeout(nextTurn, 1500);
    } else {
        // Highlight movable tokens
        movableTokens.forEach(tokenId => {
            const token = document.querySelector(`.token-${currentPlayer.color}[data-id="${tokenId}"]`);
            token.style.boxShadow = '0 0 10px 5px white';
        });
    }
}

function checkMovableTokens(color, diceValue) {
    const movableTokens = [];
    const positions = gameState.playerPositions[color];
    
    for (let i = 0; i < 4; i++) {
        if (positions[i] === 'home' && diceValue === 6) {
            movableTokens.push(i);
        } else if (positions[i] !== 'home' && positions[i] !== 'finished') {
            movableTokens.push(i);
        }
    }
    
    return movableTokens;
}

function handleTokenClick(color, tokenId) {
    if (color !== gameState.currentPlayer.color) return;
    
    const positions = gameState.playerPositions[color];
    const currentPosition = positions[tokenId];
    const diceValue = gameState.diceValue;
    
    // Check if move is valid
    if (currentPosition === 'home' && diceValue !== 6) return;
    
    // Move token
    if (currentPosition === 'home') {
        positions[tokenId] = 'start';
    } else {
        // In a real game, this would calculate the new position on the board
        positions[tokenId] = (parseInt(currentPosition) || 0) + diceValue;
        
        // Check if token reached finish
        if (positions[tokenId] >= 57) { // 57 is just an example finish position
            positions[tokenId] = 'finished';
            showMessage(`${gameState.currentPlayer.name}'s token reached home!`);
        }
    }
    
    // Update token position visually
    updateTokenPosition(color, tokenId, positions[tokenId]);
    
    // Check for cuts
    checkForCuts(color, tokenId, positions[tokenId]);
    
    // Reset dice and move to next player if not 6
    if (diceValue !== 6) {
        nextTurn();
    } else {
        document.getElementById('rollDice').disabled = false;
    }
    
    // Check for winner
    checkWinner();
}

function updateTokenPosition(color, tokenId, position) {
    const token = document.querySelector(`.token-${color}[data-id="${tokenId}"]`);
    
    // Reset highlight
    token.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // In a real game, this would calculate exact coordinates based on position
    if (position === 'home') {
        const homePositions = {
            red: { top: '10px', left: '10px' },
            blue: { top: '10px', right: '10px' },
            green: { bottom: '10px', right: '10px' },
            yellow: { bottom: '10px', left: '10px' }
        };
        
        const offsetX = (tokenId % 2) * 40;
        const offsetY = Math.floor(tokenId / 2) * 40;
        token.style.top = `${parseInt(homePositions[color].top || homePositions[color].bottom || 0) + offsetY}px`;
        token.style.left = `${parseInt(homePositions[color].left || homePositions[color].right || 0) + offsetX}px`;
    } else if (position === 'start') {
        // Position at starting point
        const startPositions = {
            red: { top: '30%', left: '10%' },
            blue: { top: '10%', left: '70%' },
            green: { top: '70%', left: '90%' },
            yellow: { top: '90%', left: '30%' }
        };
        Object.assign(token.style, startPositions[color]);
    } else if (position === 'finished') {
        // Position in finish area
        const finishPositions = {
            red: { top: '45%', left: '45%' },
            blue: { top: '45%', left: '45%' },
            green: { top: '45%', left: '45%' },
            yellow: { top: '45%', left: '45%' }
        };
        Object.assign(token.style, finishPositions[color]);
    } else {
        // Move along the path (simplified for this example)
        const pathPositions = calculatePathPosition(color, position);
        Object.assign(token.style, pathPositions);
    }
}

function calculatePathPosition(color, position) {
    // Simplified path calculation - in a real game this would be more complex
    const pathLength = 56; // Total positions in the path
    const normalizedPos = position % pathLength;
    const segment = Math.floor(normalizedPos / (pathLength / 4));
    const segmentPos = normalizedPos % (pathLength / 4);
    
    switch (color) {
        case 'red':
            switch (segment) {
                case 0: return { top: `${30 - segmentPos * 0.5}%`, left: `${10 + segmentPos * 1.5}%` };
                case 1: return { top: `${10 + segmentPos * 1.5}%`, left: `${70 - segmentPos * 0.5}%` };
                case 2: return { top: `${70 + segmentPos * 0.5}%`, left: `${30 - segmentPos * 1.5}%` };
                case 3: return { top: `${90 - segmentPos * 1.5}%`, left: `${30 + segmentPos * 0.5}%` };
            }
            break;
        // Similar for other colors...
    }
    
    return { top: '50%', left: '50%' };
}

function checkForCuts(color, tokenId, newPosition) {
    // Check if this position cuts any opponent's token
    // In a real game, this would be more complex
    for (const [playerColor, positions] of Object.entries(gameState.playerPositions)) {
        if (playerColor === color) continue;
        
        for (const [opponentTokenId, opponentPosition] of Object.entries(positions)) {
            if (opponentPosition === newPosition && opponentPosition !== 'home' && opponentPosition !== 'finished') {
                // Cut the opponent's token
                positions[opponentTokenId] = 'home';
                updateTokenPosition(playerColor, opponentTokenId, 'home');
                
                showMessage(`${gameState.currentPlayer.name} cut ${playerColor}'s token!`);
                
                // In a real game, we'd have proper player names
                if (!gameState.currentPlayer.isBot) {
                    showMessage(`You cut ${playerColor}'s token!`, 'player');
                }
            }
        }
    }
}

function nextTurn() {
    const currentIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayer.id);
    const nextIndex = (currentIndex + 1) % gameState.players.length;
    gameState.currentPlayer = gameState.players[nextIndex];
    gameState.diceValue = 0;
    
    updateUI();
    
    document.getElementById('diceResult').textContent = '0';
    document.getElementById('rollDice').disabled = false;
    
    showMessage(`${gameState.currentPlayer.name}'s turn`);
    
    if (gameState.currentPlayer.isBot) {
        // Bot's turn - auto play after delay
        setTimeout(() => {
            rollDice();
            setTimeout(() => {
                const movableTokens = checkMovableTokens(gameState.currentPlayer.color, gameState.diceValue);
                if (movableTokens.length > 0) {
                    const randomToken = movableTokens[Math.floor(Math.random() * movableTokens.length)];
                    handleTokenClick(gameState.currentPlayer.color, randomToken);
                }
            }, 1000);
        }, 1500);
    }
}

function checkWinner() {
    const player = gameState.currentPlayer;
    const positions = gameState.playerPositions[player.color];
    
    // Check if all tokens are finished
    const allFinished = Object.values(positions).every(pos => pos === 'finished');
    
    if (allFinished) {
        gameState.gameEnded = true;
        showMessage(`🎉 ${player.name} is the winner!`, 'winner');
        
        // Update leaderboard
        updateLeaderboard(player.name);
        
        // Disable game controls
        document.getElementById('rollDice').disabled = true;
    }
}

function updateLeaderboard(winnerName) {
    // In a real game, this would update the server-side leaderboard
    const leaderboardBody = document.getElementById('leaderboardBody');
    
    // Simplified - just add the winner to the list
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>1</td>
        <td>${winnerName}</td>
        <td>1</td>
    `;
    leaderboardBody.prepend(newRow);
}

function showMessage(message, type = 'info') {
    const messagesDiv = document.getElementById('gameMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    
    // Auto-remove after delay
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function updateUI() {
    document.getElementById('playerInfo').textContent = 
        `Current Player: ${gameState.currentPlayer.name}`;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
