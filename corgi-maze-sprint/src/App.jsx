import { useState, useEffect, useRef } from "react";
import "./App.css";

const MAZE_SIZE = 10;
const WALL_PROBABILITY = 0.3; // 30% chance for a wall

// Generate a random maze
function generateMaze() {
  const maze = [];
  for (let r = 0; r < MAZE_SIZE; r++) {
    const row = [];
    for (let c = 0; c < MAZE_SIZE; c++) {
      // start and goal must be empty
      if ((r === 0 && c === 0) || (r === MAZE_SIZE - 1 && c === MAZE_SIZE - 1)) {
        row.push(0);
      } else if (r === c) {
        // make diagonal guaranteed path
        row.push(0);
      } else {
        row.push(Math.random() < WALL_PROBABILITY ? 1 : 0);
      }
    }
    maze.push(row);
  }
  return maze;
}

function App() {
  const [maze, setMaze] = useState(generateMaze());
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const containerRef = useRef(null);

  // Focus game container
  useEffect(() => {
    containerRef.current.focus();
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (timerActive) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  // Keyboard controls
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

  // Start timer on first move
  useEffect(() => {
    if (!timerActive && (playerPos[0] !== 0 || playerPos[1] !== 0)) setTimerActive(true);
  }, [playerPos, timerActive]);

  // Restart
  const handleRestart = () => {
    setMaze(generateMaze());
    setPlayerPos([0,0]);
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
        <div key={`${r}-${c}`} className={`cell ${maze[r][c] === 1 ? "wall" : ""} ${isPlayer ? "player" : ""} ${isGoal ? "goal" : ""}`}>
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
