import { useState, useEffect, useRef } from "react";
import "./App.css";

const MAZE_SIZE = 10;

function generateMaze() {
  const maze = Array.from({ length: MAZE_SIZE }, () =>
    Array.from({ length: MAZE_SIZE }, () => 1)
  );

  const visited = Array.from({ length: MAZE_SIZE }, () =>
    Array.from({ length: MAZE_SIZE }, () => false)
  );

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function inBounds(r, c) {
    return r >= 0 && r < MAZE_SIZE && c >= 0 && c < MAZE_SIZE;
  }

  function dfs(r, c) {
    visited[r][c] = true;
    maze[r][c] = 0;

    const directions = shuffle([
      [0, 2],
      [0, -2],
      [2, 0],
      [-2, 0]
    ]);

    for (let [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;
      if (inBounds(nr, nc) && !visited[nr][nc]) {
        maze[r + dr / 2][c + dc / 2] = 0; // remove wall between
        dfs(nr, nc);
      }
    }
  }

  dfs(0, 0);

  // Ensure goal is open
  maze[MAZE_SIZE - 1][MAZE_SIZE - 1] = 0;

  // Guarantee a path to goal along bottom row and rightmost column
  let r = 0;
  let c = 0;
  while (r < MAZE_SIZE - 1 || c < MAZE_SIZE - 1) {
    if (r < MAZE_SIZE - 1 && Math.random() < 0.5) r++;
    else if (c < MAZE_SIZE - 1) c++;
    maze[r][c] = 0;
  }

  return maze;
}

function App() {
  const [maze, setMaze] = useState(generateMaze());
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
      setPlayerPos(([row, col]) => {
        let newRow = row, newCol = col;
        if (e.key === "ArrowUp") newRow--;
        if (e.key === "ArrowDown") newRow++;
        if (e.key === "ArrowLeft") newCol--;
        if (e.key === "ArrowRight") newCol++;

        if (newRow < 0 || newRow >= MAZE_SIZE || newCol < 0 || newCol >= MAZE_SIZE) return [row, col];
        if (maze[newRow][newCol] === 1) return [row, col];

        if (newRow === MAZE_SIZE - 1 && newCol === MAZE_SIZE - 1) {
          alert(`🎉 You win! Time: ${time}s`);
          setTimerActive(false);
          return [newRow, newCol];
        }

        return [newRow, newCol];
      });
    };

    const container = containerRef.current;
    container.addEventListener("keydown", handleKey);
    return () => container.removeEventListener("keydown", handleKey);
  }, [maze, time]);

  useEffect(() => {
    if (!timerActive && (playerPos[0] !== 0 || playerPos[1] !== 0)) setTimerActive(true);
  }, [playerPos, timerActive]);

  const handleRestart = () => {
    setMaze(generateMaze());
    setPlayerPos([0, 0]);
    setTime(0);
    setTimerActive(false);
    containerRef.current.focus();
  };

  // Flatten cells for CSS Grid
  const cells = [];
  for (let r = 0; r < MAZE_SIZE; r++) {
    for (let c = 0; c < MAZE_SIZE; c++) {
      const isPlayer = playerPos[0] === r && playerPos[1] === c;
      const isGoal = r === MAZE_SIZE - 1 && c === MAZE_SIZE - 1;
      cells.push(
        <div
          key={`${r}-${c}`}
          className={`cell ${maze[r][c] === 1 ? "wall" : ""} ${isPlayer ? "player" : ""} ${isGoal ? "goal" : ""}`}
        >
          {isPlayer ? "🐶" : isGoal ? "🏁" : ""}
        </div>
      );
    }
  }

  return (
    <div className="app">
      <div className="game-container" ref={containerRef} tabIndex={0}>
        <h1>Corgi Maze Sprint</h1>
        <p className="timer">Time: {time}s</p>
        <div className="maze" style={{gridTemplateColumns:`repeat(${MAZE_SIZE},1fr)`}}>
          {cells}
        </div>
        <button className="restart-btn" onClick={handleRestart}>Restart Game</button>
        <p className="instructions">Use arrow keys to move the corgi to the goal!</p>
      </div>
    </div>
  );
}

export default App;