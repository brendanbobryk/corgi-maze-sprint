import { useState, useEffect, useRef } from "react";
import "./App.css";

function generateMaze(size) {
  const maze = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 1)
  );

  const visited = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  function inBounds(r, c) {
    return r >= 0 && r < size && c >= 0 && c < size;
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
        maze[r + dr / 2][c + dc / 2] = 0;
        dfs(nr, nc);
      }
    }
  }

  dfs(0, 0);

  maze[size - 1][size - 1] = 0;

  let r = 0;
  let c = 0;
  while (r < size - 1 || c < size - 1) {
    if (r < size - 1 && Math.random() < 0.5) r++;
    else if (c < size - 1) c++;
    maze[r][c] = 0;
  }

  return maze;
}

function App() {
  const [mazeSize, setMazeSize] = useState(10);
  const [maze, setMaze] = useState(() => generateMaze(10));
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const containerRef = useRef(null);

  const bestKey = `corgi-maze-best-${mazeSize}`;
  const [bestTime, setBestTime] = useState(
    () => localStorage.getItem(bestKey)
  );

  useEffect(() => {
    containerRef.current.focus();
  }, []);

  useEffect(() => {
    setBestTime(localStorage.getItem(bestKey));
  }, [mazeSize]);

  useEffect(() => {
    let interval;
    if (timerActive) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      setPlayerPos(([row, col]) => {
        let newRow = row;
        let newCol = col;

        if (e.key === "ArrowUp") newRow--;
        if (e.key === "ArrowDown") newRow++;
        if (e.key === "ArrowLeft") newCol--;
        if (e.key === "ArrowRight") newCol++;

        if (
          newRow < 0 ||
          newRow >= mazeSize ||
          newCol < 0 ||
          newCol >= mazeSize
        ) return [row, col];

        if (maze[newRow][newCol] === 1) return [row, col];

        // ✅ Count valid moves only
        setMoves(m => m + 1);

        if (newRow === mazeSize - 1 && newCol === mazeSize - 1) {
          setTimerActive(false);

          const storedBest = localStorage.getItem(bestKey);
          if (!storedBest || time < Number(storedBest)) {
            localStorage.setItem(bestKey, time);
            setBestTime(time);
          }

          alert(`🎉 You win!\nTime: ${time}s\nMoves: ${moves + 1}`);
        }

        return [newRow, newCol];
      });
    };

    const container = containerRef.current;
    container.addEventListener("keydown", handleKey);
    return () => container.removeEventListener("keydown", handleKey);
  }, [maze, mazeSize, time, moves, bestKey]);

  useEffect(() => {
    if (!timerActive && (playerPos[0] !== 0 || playerPos[1] !== 0)) {
      setTimerActive(true);
    }
  }, [playerPos, timerActive]);

  const restartGame = (size = mazeSize) => {
    setMaze(generateMaze(size));
    setMazeSize(size);
    setPlayerPos([0, 0]);
    setTime(0);
    setMoves(0);
    setTimerActive(false);
    containerRef.current.focus();
  };

  const sizeButtonStyle = (size) => ({
    backgroundColor: mazeSize === size ? "#3b82f6" : "#1f2933",
    color: mazeSize === size ? "#ffffff" : "#cbd5e1",
    border: mazeSize === size ? "1px solid #60a5fa" : "1px solid #374151",
    boxShadow: mazeSize === size ? "0 0 10px rgba(59,130,246,0.6)" : "none",
    transform: mazeSize === size ? "scale(1.05)" : "scale(1)"
  });

  const cells = [];
  for (let r = 0; r < mazeSize; r++) {
    for (let c = 0; c < mazeSize; c++) {
      const isPlayer = playerPos[0] === r && playerPos[1] === c;
      const isGoal = r === mazeSize - 1 && c === mazeSize - 1;

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

        <div className="controls">
          <button style={sizeButtonStyle(8)} onClick={() => restartGame(8)}>Small</button>
          <button style={sizeButtonStyle(10)} onClick={() => restartGame(10)}>Medium</button>
          <button style={sizeButtonStyle(14)} onClick={() => restartGame(14)}>Large</button>
        </div>

        <p className="timer">
          Time: {time}s &nbsp;|&nbsp; Moves: {moves}
        </p>

        <p className="best-time">
          Best: {bestTime ? `${bestTime}s` : "—"}
        </p>

        <div
          className="maze"
          style={{ gridTemplateColumns: `repeat(${mazeSize}, 1fr)` }}
        >
          {cells}
        </div>

        <button className="restart-btn" onClick={() => restartGame()}>
          Restart
        </button>

        <p className="instructions">
          Use arrow keys to move the corgi to the goal!
        </p>
      </div>
    </div>
  );
}

export default App;
