import { useState, useEffect, useRef } from "react";
import "./App.css";

// 10x10 maze (0 = path, 1 = wall)
const MAZE = [
  [0,1,0,0,0,1,0,0,0,0],
  [0,1,0,1,0,1,0,1,1,0],
  [0,0,0,1,0,0,0,0,1,0],
  [1,1,0,1,1,1,1,0,1,0],
  [0,0,0,0,0,0,1,0,0,0],
  [0,1,1,1,1,0,1,1,1,0],
  [0,0,0,0,1,0,0,0,1,0],
  [1,1,0,1,1,1,0,1,1,0],
  [0,0,0,0,0,0,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,0]
];

function App() {
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const containerRef = useRef(null);

  // Focus the container so arrow keys work
  useEffect(() => {
    containerRef.current.focus();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      setPlayerPos(([x, y]) => {
        let newX = x;
        let newY = y;

        if (e.key === "ArrowUp") newX -= 1;
        if (e.key === "ArrowDown") newX += 1;
        if (e.key === "ArrowLeft") newY -= 1;
        if (e.key === "ArrowRight") newY += 1;

        if (newX < 0 || newX >= MAZE.length || newY < 0 || newY >= MAZE[0].length) return [x, y];
        if (MAZE[newX][newY] === 1) return [x, y];

        if (newX === MAZE.length-1 && newY === MAZE[0].length-1) {
          alert(`🎉 You win! Time: ${time}s`);
          setTimerActive(false);
          return [newX, newY];
        }

        return [newX, newY];
      });
    };

    const container = containerRef.current;
    container.addEventListener("keydown", handleKey);
    return () => container.removeEventListener("keydown", handleKey);
  }, [time]);

  // Start timer on first move
  useEffect(() => {
    if (!timerActive && (playerPos[0] !== 0 || playerPos[1] !== 0)) {
      setTimerActive(true);
    }
  }, [playerPos, timerActive]);

  // Restart function
  const handleRestart = () => {
    setPlayerPos([0, 0]);
    setTime(0);
    setTimerActive(false);
    containerRef.current.focus();
  };

  return (
    <div className="app">
      <div
        className="game-container"
        ref={containerRef}
        tabIndex={0}  // make div focusable
      >
        <h1>Corgi Maze Sprint</h1>
        <p className="timer">Time: {time}s</p>
        <div className="maze">
          {MAZE.map((row, i) => (
            <div key={i} className="row">
              {row.map((cell, j) => {
                const isPlayer = playerPos[0] === i && playerPos[1] === j;
                const isGoal = i === MAZE.length-1 && j === MAZE[0].length-1;
                return (
                  <div
                    key={j}
                    className={`cell ${cell === 1 ? "wall" : ""} ${
                      isPlayer ? "player" : ""
                    } ${isGoal ? "goal" : ""}`}
                  >
                    {isPlayer ? "🐶" : isGoal ? "🏁" : ""}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <button className="restart-btn" onClick={handleRestart}>
          Restart Game
        </button>
        <p className="instructions">Use arrow keys to move the corgi to the goal!</p>
      </div>
    </div>
  );
}

export default App;
