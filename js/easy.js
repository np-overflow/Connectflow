const ROWS = 6;
const COLS = 7;
const PLAYER1 = "player1";
const PLAYER2 = "player2";
const MAX_DEPTH = 5;
let currentPlayer = PLAYER1;
let gameBoard = [];
let isPlayerTurn = true;
let playerWins = 0;
let cpuWins = 0;

const gameContainer = document.getElementById("game-board");
const restartButton = document.getElementById("restart-btn");
const notification = document.getElementById("notification");

function createBoard() {
  gameBoard = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  gameContainer.innerHTML = "";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      gameContainer.appendChild(cell);
    }
  }
}

function handleCellClick(event) {
  if (!isPlayerTurn) return;
  const col = parseInt(event.target.dataset.col, 10); // Convert col to number
  console.log(`Player 1 clicked column: ${col}`);
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!gameBoard[row][col]) {
      gameBoard[row][col] = currentPlayer;
      console.log(`Player 1 placed at row: ${row}, column: ${col}`);
      updateBoard();
      if (checkWin(row, col, currentPlayer)) {
        console.log(`Player 1 wins!`);
        displayNotification(`Congratulations, You Win!!`);
        isPlayerTurn = false; // Prevent further moves
        return;
      }
      currentPlayer = PLAYER2;
      isPlayerTurn = false;
      console.log("Switching to AI turn...");
      setTimeout(() => {
        aiMove();
        if (!isPlayerTurn) {
          console.log(
            "Game ended during AI move, not switching turn back to Player 1"
          );
          return; // If the game ended during AI move, do not change turn
        }
        currentPlayer = PLAYER1;
        isPlayerTurn = true;
        console.log("Switching back to Player 1 turn...");
      }, 500); // Give a slight delay before AI moves
      return;
    }
  }
  console.log("Column is full, cannot place a disc here.");
}

function aiMove() {
  if (Math.random() < 0.4) {
    // 10% chance to blunder
    console.log("CPU blunders! Placing a random tile.");
    const validColumns = getValidColumns(gameBoard);
    const randomCol =
      validColumns[Math.floor(Math.random() * validColumns.length)];
    makeAiMove(randomCol);
  } else {
    const { col } = minimax(gameBoard, MAX_DEPTH, true, -Infinity, Infinity);
    makeAiMove(col);
  }
}

function makeAiMove(col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!gameBoard[row][col]) {
      gameBoard[row][col] = PLAYER2;
      updateBoard();
      if (checkWin(row, col, PLAYER2)) {
        displayNotification(`Connect Bot wins!`);
        isPlayerTurn = false; // Prevent further moves
        return;
      }
      currentPlayer = PLAYER1;
      isPlayerTurn = true;
      return;
    }
  }
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  const validColumns = getValidColumns(board);
  if (depth === 0 || validColumns.length === 0) {
    return { score: evaluateBoard(board), col: null };
  }
  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestCol = null;
    for (const col of validColumns) {
      const row = getNextOpenRow(board, col);
      board[row][col] = PLAYER2;
      const { score } = minimax(board, depth - 1, false, alpha, beta);
      board[row][col] = null;
      if (score > maxEval) {
        maxEval = score;
        bestCol = col;
      }
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, col: bestCol };
  } else {
    let minEval = Infinity;
    let bestCol = null;
    for (const col of validColumns) {
      const row = getNextOpenRow(board, col);
      board[row][col] = PLAYER1;
      const { score } = minimax(board, depth - 1, true, alpha, beta);
      board[row][col] = null;
      if (score < minEval) {
        minEval = score;
        bestCol = col;
      }
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return { score: minEval, col: bestCol };
  }
}

function getNextOpenRow(board, col) {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (!board[row][col]) {
      return row;
    }
  }
  return null;
}

function evaluateBoard(board) {
  let score = 0;
  // Prioritise centre column
  for (let row = 0; row < ROWS; row++) {
    if (board[row][Math.floor(COLS / 2)] === PLAYER2) score += 3;
    if (board[row][Math.floor(COLS / 2)] === PLAYER1) score -= 3;
  }
  // Score for 2, 3, 4 in a row
  score += scorePosition(board, PLAYER2);
  score -= scorePosition(board, PLAYER1);
  return score;
}

function scorePosition(board, player) {
  let score = 0;
  // Horizontal
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [
        board[row][col],
        board[row][col + 1],
        board[row][col + 2],
        board[row][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }
  // Vertical
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS - 3; row++) {
      const window = [
        board[row][col],
        board[row + 1][col],
        board[row + 2][col],
        board[row + 3][col],
      ];
      score += evaluateWindow(window, player);
    }
  }
  // Diagonal /
  for (let row = 0; row < ROWS - 3; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [
        board[row][col],
        board[row + 1][col + 1],
        board[row + 2][col + 2],
        board[row + 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }
  // Diagonal \
  for (let row = 3; row < ROWS; row++) {
    for (let col = 0; col < COLS - 3; col++) {
      const window = [
        board[row][col],
        board[row - 1][col + 1],
        board[row - 2][col + 2],
        board[row - 3][col + 3],
      ];
      score += evaluateWindow(window, player);
    }
  }
  return score;
}

function evaluateWindow(window, player) {
  let score = 0;
  const opponent = player === PLAYER2 ? PLAYER1 : PLAYER2;
  const playerCount = window.filter((cell) => cell === player).length;
  const emptyCount = window.filter((cell) => cell === null).length;
  const opponentCount = window.filter((cell) => cell === opponent).length;

  if (playerCount === 4) {
    score += 100;
  } else if (playerCount === 3 && emptyCount === 1) {
    score += 5;
  } else if (playerCount === 2 && emptyCount === 2) {
    score += 2;
  }
  if (opponentCount === 3 && emptyCount === 1) {
    score -= 4;
  }
  return score;
}

function getValidColumns(board) {
  const validColumns = [];
  for (let col = 0; col < COLS; col++) {
    if (!board[0][col]) {
      validColumns.push(col);
    }
  }
  return validColumns;
}

function updateBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = gameContainer.querySelector(
        `[data-row='${row}'][data-col='${col}']`
      );
      cell.classList.remove(PLAYER1, PLAYER2);
      if (gameBoard[row][col]) {
        cell.classList.add(gameBoard[row][col]);
      }
    }
  }
}

function checkWin(row, col, player) {
  const win =
    checkDirection(row, col, player, 1, 0) || // Horizontal
    checkDirection(row, col, player, 0, 1) || // Vertical
    checkDirection(row, col, player, 1, 1) || // Diagonal \
    checkDirection(row, col, player, 1, -1); // Diagonal /

  if (win) {
    console.log(`${player} wins!`);
    if (player === PLAYER1) {
      playerWins++;
      document.getElementById(
        "player-wins"
      ).textContent = `Player Wins: ${playerWins}`;
    } else if (player === PLAYER2) {
      cpuWins++;
      document.getElementById("cpu-wins").textContent = `CPU Wins: ${cpuWins}`;
    }
  }
  return win;
}

function checkDirection(row, col, player, rowDir, colDir) {
  console.log(
    `Checking direction for ${player} starting at row: ${row}, col: ${col}`
  );
  let count = 0;
  for (let i = -3; i <= 3; i++) {
    const r = row + i * rowDir;
    const c = col + i * colDir;
    if (
      r >= 0 &&
      r < ROWS &&
      c >= 0 &&
      c < COLS &&
      gameBoard[r][c] === player
    ) {
      count++;
      console.log(
        `Found ${player} at row: ${r}, col: ${c}. Current count: ${count}`
      );
      if (count === 4) {
        console.log(`${player} wins with a count of 4 in a row!`);
        return true;
      }
    } else {
      count = 0;
    }
  }
  return false;
}

function displayNotification(message) {
  notification.textContent = message;
  notification.style.display = "block";
}

function resetGame() {
  createBoard();
  currentPlayer = PLAYER1;
  isPlayerTurn = true;
  notification.style.display = "none";
}

restartButton.addEventListener("click", resetGame);

createBoard();
