
class Board3D {
    constructor() {
        this.SIZE = 4;
        this.LAYER_SIZE = this.SIZE * this.SIZE;
        this.board = Array(this.SIZE * this.SIZE * this.SIZE).fill('-');
    }

    at(x, y, z) {
        return this.board[x + y * this.SIZE + z * this.LAYER_SIZE];
    }

    setAt(x, y, z, value) {
        this.board[x + y * this.SIZE + z * this.LAYER_SIZE] = value;
    }

    isCellEmpty(x, y, z) {
        return this.at(x, y, z) === '-';
    }

    clear() {
        this.board.fill('-');
    }

    getCellPriority(x, y, z) {
        const center = Math.floor(this.SIZE / 2);
        return -(Math.abs(x - center) + Math.abs(y - center) + Math.abs(z - center));
    }
}

class Game {
    constructor() {
        this.COMPUTER = 'O';
        this.HUMAN = 'X';
        this.SIZE = 4;
        this.board = new Board3D();
        this.currentPlayer = this.HUMAN;
        this.gameEnded = false;
        this.vsComputer = false;
        this.maxDepth = 2;
    }

    showInstructions() {
        console.log("\nWelcome to 3D Tic-Tac-Toe (4x4x4)!");
    }

    checkLine(player, x, y, z, dx, dy, dz) {
        const winningLine = [];
        for (let i = 0; i < this.SIZE; i++) {
            const nx = x + i * dx;
            const ny = y + i * dy;
            const nz = z + i * dz;
            
            // Check bounds
            if (nx < 0 || nx >= this.SIZE || ny < 0 || ny >= this.SIZE || nz < 0 || nz >= this.SIZE) {
                return { result: false, line: [] };
            }
            
            if (this.board.at(nx, ny, nz) !== player) {
                return { result: false, line: [] };
            }
            winningLine.push([nx, ny, nz]);
        }
        return { result: true, line: winningLine };
    }

    checkWinner(player) {
        // Check straight lines (x, y, z axes)
        for (let i = 0; i < this.SIZE; i++) {
            for (let j = 0; j < this.SIZE; j++) {
                let result = this.checkLine(player, 0, i, j, 1, 0, 0);
                if (result.result) return result;
                
                result = this.checkLine(player, i, 0, j, 0, 1, 0);
                if (result.result) return result;
                
                result = this.checkLine(player, i, j, 0, 0, 0, 1);
                if (result.result) return result;
            }
        }
        
        // Check 3D diagonals
        const diagonals = [
            {x:0, y:0, z:0, dx:1, dy:1, dz:1},
            {x:0, y:this.SIZE-1, z:0, dx:1, dy:-1, dz:1},
            {x:this.SIZE-1, y:0, z:0, dx:-1, dy:1, dz:1},
            {x:this.SIZE-1, y:this.SIZE-1, z:0, dx:-1, dy:-1, dz:1}
        ];
        
        for (const diag of diagonals) {
            const result = this.checkLine(player, diag.x, diag.y, diag.z, diag.dx, diag.dy, diag.dz);
            if (result.result) return result;
        }
        
        // Check face diagonals
        for (let z = 0; z < this.SIZE; z++) {
            const result1 = this.checkLine(player, 0, 0, z, 1, 1, 0);
            if (result1.result) return result1;
            
            const result2 = this.checkLine(player, 0, this.SIZE-1, z, 1, -1, 0);
            if (result2.result) return result2;
        }
        
        return { result: false, line: [] };
    }

    isTie() {
        for (let x = 0; x < this.SIZE; x++) {
            for (let y = 0; y < this.SIZE; y++) {
                for (let z = 0; z < this.SIZE; z++) {
                    if (this.board.isCellEmpty(x, y, z)) return false;
                }
            }
        }
        return true;
    }

    playerMove(x, y, z) {
        // Convert to 0-based index
        x--;
        y--;
        z--;
        
        if (x < 0 || x >= this.SIZE || y < 0 || y >= this.SIZE || z < 0 || z >= this.SIZE) {
            throw new Error("Invalid coordinates. Please enter three numbers between 1 and 4.");
        }
        
        if (!this.board.isCellEmpty(x, y, z)) {
            throw new Error("That cell is already occupied. Try again.");
        }
        
        this.board.setAt(x, y, z, this.currentPlayer);
        return true;
    }

    evaluate() {
        const computerWin = this.checkWinner(this.COMPUTER).result;
        const humanWin = this.checkWinner(this.HUMAN).result;
        
        if (computerWin) return +1000;
        if (humanWin) return -1000;
        return 0;
    }

    minimax(depth, isMax, alpha, beta, maxDepth) {
        const score = this.evaluate();
        if (score === 1000 || score === -1000 || this.isTie() || depth === maxDepth) {
            return score;
        }

        // Generate all possible moves with priorities
        const moves = [];
        for (let x = 0; x < this.SIZE; x++) {
            for (let y = 0; y < this.SIZE; y++) {
                for (let z = 0; z < this.SIZE; z++) {
                    if (this.board.isCellEmpty(x, y, z)) {
                        const priority = this.board.getCellPriority(x, y, z);
                        moves.push({ x, y, z, score: priority });
                    }
                }
            }
        }
        
        // Sort moves by priority (best moves first)
        moves.sort((a, b) => b.score - a.score);

        if (isMax) {
            let best = -Infinity;
            for (const move of moves) {
                this.board.setAt(move.x, move.y, move.z, this.COMPUTER);
                const current = this.minimax(depth + 1, false, alpha, beta, maxDepth);
                this.board.setAt(move.x, move.y, move.z, '-');
                
                best = Math.max(best, current);
                alpha = Math.max(alpha, best);
                if (beta <= alpha) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (const move of moves) {
                this.board.setAt(move.x, move.y, move.z, this.HUMAN);
                const current = this.minimax(depth + 1, true, alpha, beta, maxDepth);
                this.board.setAt(move.x, move.y, move.z, '-');
                
                best = Math.min(best, current);
                beta = Math.min(beta, best);
                if (beta <= alpha) break;
            }
            return best;
        }
    }

    addRandomnessToScore(score) {
        return score + Math.floor(Math.random() * 101) - 50; // Random factor between -50 and 50
    }
    

    async findBestMove() {
        let bestVal = -Infinity;
        let bestX = -1, bestY = -1, bestZ = -1;
        const moves = [];

        // Generate all possible moves with priorities
        for (let x = 0; x < this.SIZE; x++) {
            for (let y = 0; y < this.SIZE; y++) {
                for (let z = 0; z < this.SIZE; z++) {
                    if (this.board.isCellEmpty(x, y, z)) {
                        const priority = this.board.getCellPriority(x, y, z);
                        moves.push({ x, y, z, score: priority });
                    }
                }
            }
        }

        // Sort moves by priority (best moves first)
        moves.sort((a, b) => b.score - a.score);

        // Iterative Deepening: Try different depths
        for (let depth = 1; depth <= this.maxDepth; depth++) {
            let bestMoveScore = -Infinity;
            for (const move of moves) {
                this.board.setAt(move.x, move.y, move.z, this.COMPUTER);
                let moveVal = this.minimax(0, false, -Infinity, Infinity, depth);
                moveVal = this.addRandomnessToScore(moveVal);
                this.board.setAt(move.x, move.y, move.z, '-');

                if (moveVal > bestMoveScore) {
                    bestX = move.x;
                    bestY = move.y;
                    bestZ = move.z;
                    bestMoveScore = moveVal;
                }

                if (bestMoveScore === 1000) break;
            }
            
            if (bestMoveScore !== -Infinity) {
                bestVal = bestMoveScore;
                break;
            }
        }

        return { x: bestX, y: bestY, z: bestZ };
    }

    async computerMove() {
        const { x, y, z } = await this.findBestMove();
        this.board.setAt(x, y, z, this.COMPUTER);
    }


    async playMove(x, y, z) {
        if (this.gameEnded) return { gameOver: true };

        try {
            // Human move (both players in multiplayer are HUMAN)
            if (this.currentPlayer === this.HUMAN || 
               (this.currentPlayer === this.COMPUTER && !this.vsComputer)) {
                this.playerMove(x, y, z);
            } else if (this.vsComputer && this.currentPlayer === this.COMPUTER) {
                await this.computerMove();
            }

            const winnerCheck = this.checkWinner(this.currentPlayer);
            if (winnerCheck.result) {
                this.gameEnded = true;
                return { 
                    gameOver: true, 
                    winner: this.currentPlayer, 
                    winningLine: winnerCheck.line 
                };
            } else if (this.isTie()) {
                this.gameEnded = true;
                return { gameOver: true, winner: null, message: "It's a tie!"  };
            } else {
                // Switch players
                // In multiplayer: X -> O -> X -> O
                // In singleplayer: X -> Computer (O) -> X
                this.currentPlayer = this.currentPlayer === this.HUMAN ? 
                    (this.vsComputer ? this.COMPUTER : 'O') : 'X';
                return { gameOver: false };
            }
        } catch (error) {
            console.log(error.message);
            return { gameOver: false, error: error.message };
        }
    }

    startGame(mode, difficulty) {
        this.board.clear();
        this.currentPlayer = 'X'; // X always starts first
        this.gameEnded = false;
        this.vsComputer = mode === 2; // 1 = multiplayer, 2 = vs computer

        if (this.vsComputer) {
            switch (difficulty) {
                case 1: this.maxDepth = 2; break; // Easy
                case 2: this.maxDepth = 4; break; // Difficult
                case 3: this.maxDepth = 6; break; // Insane
                default: this.maxDepth = 2; // Default to Easy
            }
        } else {
            // Multiplayer mode - no computer moves
            this.maxDepth = 0;
        }
    }
}

const SoundManager = {
    play: function(soundName) {
        const sound = document.getElementById(`${soundName}-sound`);
        if (!sound) return;
        
        sound.currentTime = 0;
        sound.play().catch(e => {
            console.error(`Failed to play ${soundName}:`, e);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    let currentLayer = 0;

    // DOM Elements
    const mainMenu = document.getElementById('main-menu');
    const difficultyMenu = document.getElementById('difficulty-menu');
    const gameScreen = document.getElementById('game-screen');
    const rulesModal = document.getElementById('rules-modal');
    const gameoverModal = document.getElementById('gameover-modal');
    
    // Buttons
    const singleplayerBtn = document.getElementById('singleplayer-btn');
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const rulesBtn = document.getElementById('rules-btn');
    const easyBtn = document.getElementById('easy-btn');
    const difficultBtn = document.getElementById('difficult-btn');
    const insaneBtn = document.getElementById('insane-btn');
    const backBtn = document.getElementById('back-btn');
    const resetBtn = document.getElementById('reset-btn');
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const closeRulesBtn = document.getElementById('close-rules-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const returnMenuBtn = document.getElementById('return-menu-btn');

    // Game elements
    const turnIndicator = document.getElementById('turn-indicator');
    const thinkingIndicator = document.getElementById('thinking-indicator');
    const gameoverTitle = document.getElementById('gameover-title');
    const gameoverSubtitle = document.getElementById('gameover-subtitle');
    const introScreen = document.getElementById("intro-screen");

    // PLAY button takes user to main menu
    document.getElementById("play-btn").addEventListener("click", () => {
        introScreen.classList.remove("active");
        mainMenu.classList.add("active");
    });

    // HOW TO PLAY opens rules modal
    document.getElementById("howtoplay-btn").addEventListener("click", () => {
        rulesModal.style.display = "flex";
    });

    // Close rules modal when "GOT IT!" is clicked
    document.getElementById("close-rules-btn").addEventListener("click", () => {
        rulesModal.style.display = "none";
    });

    // Initialize the board UI
    function initializeBoard() {
        const layers = document.querySelectorAll('.board-layer');
        layers.forEach((layer, z) => {
            layer.innerHTML = '';
            
            for (let y = 0; y < game.SIZE; y++) {
                for (let x = 0; x < game.SIZE; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    cell.dataset.z = z;
                    
                    cell.addEventListener('click', () => handleCellClick(x, y, z));
                    layer.appendChild(cell);
                }
            }
        });
    }

    // Update the board display
    function updateBoard(winningLine = []) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const z = parseInt(cell.dataset.z);
            
            const value = game.board.at(x, y, z);
            cell.textContent = value === '-' ? '' : value;
            cell.className = 'cell';
            
            if (value === 'X') cell.classList.add('x');
            if (value === 'O') cell.classList.add('o');
            
            // Highlight winning cells
            const isWinningCell = winningLine.some(pos => 
                pos[0] === x && pos[1] === y && pos[2] === z
            );
            if (isWinningCell) cell.classList.add('winning-cell');
        });
        
        // Update turn indicator
        if (!game.gameEnded) {
            turnIndicator.textContent = `PLAYER ${game.currentPlayer} TURN`;
            turnIndicator.className = game.currentPlayer === 'X' ? 'x-turn' : 'o-turn';
        }
    }

    // Handle cell clicks
    async function handleCellClick(x, y, z) {
        if (game.gameEnded) return;
        
        if (game.vsComputer && game.currentPlayer === game.COMPUTER) return;
        
        try {
            SoundManager.play('place');
            const moveResult = await game.playMove(x + 1, y + 1, z + 1);
            updateBoard();
            
            if (moveResult.gameOver) {
                SoundManager.play(moveResult.winner ? 'win' : 'draw');
                showGameOver(moveResult.winner, moveResult.winningLine || []);
            } else if (game.vsComputer && game.currentPlayer === game.COMPUTER) {
                thinkingIndicator.style.display = 'flex';
                const computerMoveResult = await game.playMove();
                thinkingIndicator.style.display = 'none';
                updateBoard();
                
                if (computerMoveResult.gameOver) {
                    SoundManager.play(computerMoveResult.winner ? 'win' : 'draw');
                    showGameOver(computerMoveResult.winner, computerMoveResult.winningLine || []);
                }
            }
        } catch (error) {
            alert(error.message);
        }
    }

    // Show game over modal
    function showGameOver(winner, winningLine = []) {
        if (winningLine.length > 0) updateBoard(winningLine);
        
        if (winner) {
            gameoverTitle.textContent = `${winner === game.COMPUTER ? 'COMPUTER' : 'PLAYER ' + winner} WINS!`;
            
            if (winningLine.length > 0) {
                const [x1, y1, z1] = winningLine[0];
                const [x2, y2, z2] = winningLine[winningLine.length - 1];
                
                if (x1 !== x2 && y1 !== y2 && z1 !== z2) {
                    gameoverSubtitle.textContent = '3D Diagonal Victory!';
                } else if (z1 === z2) {
                    gameoverSubtitle.textContent = 'Layer ' + (z1 + 1) + ' Victory';
                } else {
                    gameoverSubtitle.textContent = 'Multi-Layer Victory';
                }
            }
        } else {
            gameoverTitle.textContent = "IT'S A TIE!";
            gameoverSubtitle.textContent = 'Board is full';
        }
        
        gameoverModal.style.display = 'flex';
    }

    // Switch between layers
    function setupLayerButtons() {
        const layerButtons = document.querySelectorAll('.layer-btn');
        const layers = document.querySelectorAll('.board-layer');
        
        layerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const layerIndex = parseInt(button.dataset.layer);
                layerButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                layers.forEach(layer => layer.classList.remove('active'));
                layers[layerIndex].classList.add('active');
                currentLayer = layerIndex;
            });
        });
    }

    // Screen navigation
    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    function startNewGame(mode, difficulty) {
        game.startGame(mode, difficulty);
        initializeBoard();
        updateBoard();
        showScreen(gameScreen);
    }

    // Event listeners
    singleplayerBtn.addEventListener('click', () => showScreen(difficultyMenu));
    multiplayerBtn.addEventListener('click', () => startNewGame(1, 0));
    easyBtn.addEventListener('click', () => startNewGame(2, 1));
    difficultBtn.addEventListener('click', () => startNewGame(2, 2));
    insaneBtn.addEventListener('click', () => startNewGame(2, 3));
    backBtn.addEventListener('click', () => showScreen(mainMenu));
    rulesBtn.addEventListener('click', () => rulesModal.style.display = 'flex');
    closeRulesBtn.addEventListener('click', () => rulesModal.style.display = 'none');
    resetBtn.addEventListener('click', () => {
        game.startGame(game.vsComputer ? 2 : 1, game.maxDepth);
        initializeBoard();
        updateBoard();
    });
    mainMenuBtn.addEventListener('click', () => showScreen(introScreen));
    playAgainBtn.addEventListener('click', () => {
        gameoverModal.style.display = 'none';
        game.startGame(game.vsComputer ? 2 : 1, game.maxDepth);
        initializeBoard();
        updateBoard();
    });
    returnMenuBtn.addEventListener('click', () => {
        gameoverModal.style.display = 'none';
        showScreen(mainMenu);
    });

    window.addEventListener('click', (e) => {
        if (e.target === rulesModal) rulesModal.style.display = 'none';
        if (e.target === gameoverModal) gameoverModal.style.display = 'none';
    });


    // Initialize
    initializeBoard();
    setupLayerButtons();
});
