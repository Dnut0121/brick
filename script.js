class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.initializeBoard();
        this.updateDisplay();
        this.bindEvents();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
    
    initializeBoard() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });
        
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.resetGame();
            this.hideGameOver();
        });
    }
    
    move(direction) {
        const oldBoard = this.board.map(row => [...row]);
        let moved = false;
        
        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.render();
            
            if (this.checkWin() && !this.gameWon) {
                this.gameWon = true;
                this.showGameOver('축하합니다!', '2048을 달성했습니다!');
            } else if (this.checkGameOver()) {
                this.gameOver = true;
                this.showGameOver('게임 오버!', '더 이상 움직일 수 없습니다.');
            }
        }
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.board[i].filter(val => val !== 0);
            const merged = this.mergeRow(row);
            
            while (merged.length < 4) {
                merged.push(0);
            }
            
            if (JSON.stringify(this.board[i]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            this.board[i] = merged;
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.board[i].filter(val => val !== 0);
            const merged = this.mergeRow(row);
            
            while (merged.length < 4) {
                merged.unshift(0);
            }
            
            if (JSON.stringify(this.board[i]) !== JSON.stringify(merged)) {
                moved = true;
            }
            
            this.board[i] = merged;
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            const merged = this.mergeRow(column);
            
            while (merged.length < 4) {
                merged.push(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== merged[i]) {
                    moved = true;
                }
                this.board[i][j] = merged[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            const column = [];
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            const merged = this.mergeRow(column);
            
            while (merged.length < 4) {
                merged.unshift(0);
            }
            
            for (let i = 0; i < 4; i++) {
                if (this.board[i][j] !== merged[i]) {
                    moved = true;
                }
                this.board[i][j] = merged[i];
            }
        }
        return moved;
    }
    
    mergeRow(row) {
        const merged = [];
        let i = 0;
        
        while (i < row.length) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
                merged.push(row[i] * 2);
                this.score += row[i] * 2;
                i += 2;
            } else {
                merged.push(row[i]);
                i++;
            }
        }
        
        return merged;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    checkGameOver() {
        // 빈 셀이 있는지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 인접한 셀과 합칠 수 있는지 확인
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.board[i][j];
                
                // 오른쪽 셀 확인
                if (j < 3 && this.board[i][j + 1] === current) {
                    return false;
                }
                
                // 아래쪽 셀 확인
                if (i < 3 && this.board[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
        
        document.getElementById('best-score').textContent = this.bestScore;
    }
    
    render() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${i}-${j}`;
                gameBoard.appendChild(cell);
                
                if (this.board[i][j] !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${this.board[i][j]}`;
                    tile.textContent = this.board[i][j];
                    cell.appendChild(tile);
                }
            }
        }
    }
    
    showGameOver(title, message) {
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
        document.getElementById('game-over').style.display = 'flex';
    }
    
    hideGameOver() {
        document.getElementById('game-over').style.display = 'none';
    }
    
    resetGame() {
        this.board = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        this.updateDisplay();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
