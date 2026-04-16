const BOARD_SIZE = 15;
const EMPTY = 0;
const PLAYER = 1;
const ROBOT = 2;
const WIN_LENGTH = 5;
const DIRECTIONS = [
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
];

const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");
const moveCountElement = document.getElementById("moveCount");
const hintElement = document.getElementById("hint");
const restartButton = document.getElementById("restartBtn");
const toggleButton = document.getElementById("toggleBtn");

let board = [];
let gameOver = false;
let robotThinking = false;
let moveCount = 0;
let showHint = true;
let lastMove = null;

function createBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", `第 ${row + 1} 行，第 ${col + 1} 列`);
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      cell.addEventListener("click", handlePlayerMove);
      boardElement.appendChild(cell);
    }
  }
}

function resetGame() {
  board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
  gameOver = false;
  robotThinking = false;
  moveCount = 0;
  lastMove = null;
  updateStatus("輪到你落子");
  moveCountElement.textContent = "0";
  hintElement.textContent = showHint ? "提示已開啟：會標示 robot 上一步。" : "提示已關閉。";
  renderBoard();
}

function renderBoard() {
  const cells = boardElement.children;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const index = row * BOARD_SIZE + col;
      const cell = cells[index];
      cell.classList.remove("black", "white", "last-move");

      if (board[row][col] === PLAYER) {
        cell.classList.add("black");
      } else if (board[row][col] === ROBOT) {
        cell.classList.add("white");
      }

      if (showHint && lastMove && lastMove.row === row && lastMove.col === col) {
        cell.classList.add("last-move");
      }
    }
  }
}

function handlePlayerMove(event) {
  if (gameOver || robotThinking) {
    return;
  }

  const row = Number(event.currentTarget.dataset.row);
  const col = Number(event.currentTarget.dataset.col);

  if (board[row][col] !== EMPTY) {
    return;
  }

  placeStone(row, col, PLAYER);

  if (checkWin(row, col, PLAYER)) {
    finishGame("你贏咗，恭喜！");
    return;
  }

  if (moveCount === BOARD_SIZE * BOARD_SIZE) {
    finishGame("和局，再嚟一盤？");
    return;
  }

  robotThinking = true;
  updateStatus("Robot 思考中...");

  window.setTimeout(() => {
    const robotMove = chooseRobotMove();

    if (!robotMove) {
      finishGame("和局，再嚟一盤？");
      return;
    }

    placeStone(robotMove.row, robotMove.col, ROBOT);
    lastMove = robotMove;
    renderBoard();

    if (checkWin(robotMove.row, robotMove.col, ROBOT)) {
      finishGame("Robot 贏咗，再挑戰一次！");
      return;
    }

    if (moveCount === BOARD_SIZE * BOARD_SIZE) {
      finishGame("和局，再嚟一盤？");
      return;
    }

    robotThinking = false;
    updateStatus("輪到你落子");
  }, 280);
}

function placeStone(row, col, player) {
  board[row][col] = player;
  moveCount += 1;
  moveCountElement.textContent = String(moveCount);

  if (player === PLAYER) {
    lastMove = null;
  }

  renderBoard();
}

function finishGame(message) {
  gameOver = true;
  robotThinking = false;
  updateStatus(message);
}

function updateStatus(message) {
  statusElement.textContent = message;
}

function checkWin(row, col, player) {
  return DIRECTIONS.some(([dr, dc]) => {
    const total = 1 + countDirection(row, col, dr, dc, player) + countDirection(row, col, -dr, -dc, player);
    return total >= WIN_LENGTH;
  });
}

function countDirection(row, col, dr, dc, player) {
  let total = 0;
  let nextRow = row + dr;
  let nextCol = col + dc;

  while (isInside(nextRow, nextCol) && board[nextRow][nextCol] === player) {
    total += 1;
    nextRow += dr;
    nextCol += dc;
  }

  return total;
}

function chooseRobotMove() {
  const candidates = getCandidateMoves();
  let bestScore = -Infinity;
  let bestMoves = [];

  for (const move of candidates) {
    const score = evaluateMove(move.row, move.col);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  if (bestMoves.length === 0) {
    return null;
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function getCandidateMoves() {
  const candidates = [];

  if (moveCount === 1) {
    const center = Math.floor(BOARD_SIZE / 2);

    if (board[center][center] === EMPTY) {
      return [{ row: center, col: center }];
    }
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      if (board[row][col] !== EMPTY || !hasNearbyStone(row, col)) {
        continue;
      }

      candidates.push({ row, col });
    }
  }

  return candidates.length > 0 ? candidates : [{ row: 7, col: 7 }];
}

function hasNearbyStone(row, col) {
  for (let r = row - 2; r <= row + 2; r += 1) {
    for (let c = col - 2; c <= col + 2; c += 1) {
      if (!isInside(r, c) || (r === row && c === col)) {
        continue;
      }

      if (board[r][c] !== EMPTY) {
        return true;
      }
    }
  }

  return false;
}

function evaluateMove(row, col) {
  let totalScore = 0;

  board[row][col] = ROBOT;
  if (checkWin(row, col, ROBOT)) {
    board[row][col] = EMPTY;
    return 1_000_000;
  }
  totalScore += evaluatePatterns(row, col, ROBOT) * 1.15;
  totalScore += evaluatePositionalScore(row, col);
  board[row][col] = EMPTY;

  board[row][col] = PLAYER;
  if (checkWin(row, col, PLAYER)) {
    board[row][col] = EMPTY;
    return 900_000;
  }
  totalScore += evaluatePatterns(row, col, PLAYER);
  board[row][col] = EMPTY;

  return totalScore;
}

function evaluatePatterns(row, col, player) {
  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    const forward = scanLine(row, col, dr, dc, player);
    const backward = scanLine(row, col, -dr, -dc, player);
    const chain = 1 + forward.count + backward.count;
    const openEnds = Number(forward.open) + Number(backward.open);

    if (chain >= 5) {
      score += 100000;
    } else if (chain === 4 && openEnds === 2) {
      score += 20000;
    } else if (chain === 4 && openEnds === 1) {
      score += 7000;
    } else if (chain === 3 && openEnds === 2) {
      score += 2500;
    } else if (chain === 3 && openEnds === 1) {
      score += 500;
    } else if (chain === 2 && openEnds === 2) {
      score += 180;
    } else {
      score += chain * 12;
    }
  }

  return score;
}

function scanLine(row, col, dr, dc, player) {
  let count = 0;
  let nextRow = row + dr;
  let nextCol = col + dc;

  while (isInside(nextRow, nextCol) && board[nextRow][nextCol] === player) {
    count += 1;
    nextRow += dr;
    nextCol += dc;
  }

  return {
    count,
    open: isInside(nextRow, nextCol) && board[nextRow][nextCol] === EMPTY,
  };
}

function evaluatePositionalScore(row, col) {
  const center = (BOARD_SIZE - 1) / 2;
  const distance = Math.abs(row - center) + Math.abs(col - center);
  return Math.max(0, 16 - distance) * 3;
}

function isInside(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

restartButton.addEventListener("click", resetGame);

toggleButton.addEventListener("click", () => {
  showHint = !showHint;
  toggleButton.textContent = showHint ? "關閉提示" : "開啟提示";
  hintElement.textContent = showHint ? "提示已開啟：會標示 robot 上一步。" : "提示已關閉。";
  renderBoard();
});

createBoard();
resetGame();
