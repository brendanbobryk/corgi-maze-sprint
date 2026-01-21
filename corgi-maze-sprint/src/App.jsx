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

const THEMES = {
  dark: {
    "--bg": "#020617",
    "--cell": "#0f172a",
    "--wall": "#020617",
    "--player": "#1d4ed8",
    "--goal": "#065f46",
    "--text": "#cbd5e1",
    "--btn-bg": "#1f2933",
    "--btn-text": "#cbd5e1",
    "--btn-border": "#374151",
    "--btn-active": "#3b82f6",
    "--btn-active-border": "#60a5fa"
  },
  forest: {
    "--bg": "#0b3d0b",
    "--cell": "#145214",
    "--wall": "#0b3d0b",
    "--player": "#34d399",
    "--goal": "#059669",
    "--text": "#d9f99d",
    "--btn-bg": "#145214",
    "--btn-text": "#d9f99d",
    "--btn-border": "#064e3b",
    "--btn-active": "#10b981",
    "--btn-active-border": "#059669"
  },
  desert: {
    "--bg": "#3d2b1f",
    "--cell": "#7c5a3d",
    "--wall": "#3d2b1f",
    "--player": "#fcd34d",
    "--goal": "#f97316",
    "--text": "#fde68a",
    "--btn-bg": "#7c5a3d",
    "--btn-text": "#fde68a",
    "--btn-border": "#58331a",
    "--btn-active": "#fbbf24",
    "--btn-active-border": "#f97316"
  }
};

function App() {
  const [mazeSize, setMazeSize] = useState(10);
  const [maze, setMaze] = useState(() => generateMaze(10));
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [theme, setTheme] = useState("dark");

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
    const themeVars = THEMES[theme];
    for (const [key, value] of Object.entries(themeVars)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, [theme]);

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
    backgroundColor: mazeSize === size ? "var(--btn-active)" : "var(--btn-bg)",
    color: mazeSize === size ? "#ffffff" : "var(--btn-text)",
    border: mazeSize === size ? `1px solid var(--btn-active-border)` : `1px solid var(--btn-border)`,
    boxShadow: mazeSize === size ? `0 0 10px ${mazeSize === size ? 'rgba(59,130,246,0.6)' : 'none'}` : "none",
    transform: mazeSize === size ? "scale(1.05)" : "scale(1)"
  });

  const themeButtonStyle = (t) => ({
    backgroundColor: theme === t ? "var(--btn-active)" : "var(--btn-bg)",
    color: theme === t ? "#ffffff" : "var(--btn-text)",
    border: theme === t ? `1px solid var(--btn-active-border)` : `1px solid var(--btn-border)`,
    borderRadius: "8px",
    padding: "6px 12px",
    cursor: "pointer"
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

        <div className="controls" style={{marginTop: "6px"}}>
          <button style={themeButtonStyle("dark")} onClick={() => setTheme("dark")}>Dark</button>
          <button style={themeButtonStyle("forest")} onClick={() => setTheme("forest")}>Forest</button>
          <button style={themeButtonStyle("desert")} onClick={() => setTheme("desert")}>Desert</button>
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
