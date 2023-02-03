import { useState, useEffect, useRef, useCallback } from "react";
import "./App.scss";
import { indexOfAll, isMultipleOf } from "./util";

const GRID_SIZE = 17;
// const GRID_ROW_INDICES = [...Array(17).keys()];

const CELL_TYPES = Object.freeze({
  HEAD: "head",
  TAIL: "tail",
  EMPTY: "empty",
  POINT: "point",
});

const DIRECTIONS = Object.freeze({
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
});

const startState = Array(GRID_SIZE * GRID_SIZE)
  .fill(CELL_TYPES.EMPTY)
  .fill(
    CELL_TYPES.HEAD,
    (GRID_SIZE * GRID_SIZE - 1) / 2,
    (GRID_SIZE * GRID_SIZE - 1) / 2 + 1
  );

function App() {
  const [cells, setCells] = useState(startState);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);
  const [lastMove, setLastMove] = useState(DIRECTIONS.RIGHT);

  const pointExists = cells.includes(CELL_TYPES.POINT);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setCells(startState);
  }, []);

  const increment = () => {
    const currentIndex = cells.findIndex((cell) => cell === CELL_TYPES.HEAD);
    const newCells = [...cells];
    let newIndex;
    switch (direction.current) {
      case DIRECTIONS.UP:
        newIndex = currentIndex - 17;
        if (currentIndex < 17) {
          endGame();
        } else if (cells[newIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate(newCells, currentIndex, newIndex, true);
        } else {
          incrementBoardUpdate(newCells, currentIndex, newIndex);
        }
        if (lastMove !== DIRECTIONS.UP) setLastMove(DIRECTIONS.UP);
        break;
      case DIRECTIONS.DOWN:
        newIndex = currentIndex + 17;
        if (currentIndex >= 17 * 16) {
          endGame();
        } else if (cells[newIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate(newCells, currentIndex, newIndex, true);
        } else {
          incrementBoardUpdate(newCells, currentIndex, newIndex);
        }
        if (lastMove !== DIRECTIONS.DOWN) setLastMove(DIRECTIONS.DOWN);
        break;
      case DIRECTIONS.LEFT:
        newIndex = currentIndex - 1;
        if (isMultipleOf(currentIndex, 17)) {
          endGame();
        } else if (cells[newIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate(newCells, currentIndex, newIndex, true);
        } else {
          incrementBoardUpdate(newCells, currentIndex, newIndex);
        }
        if (lastMove !== DIRECTIONS.LEFT) setLastMove(DIRECTIONS.LEFT);
        break;
      case DIRECTIONS.RIGHT:
        newIndex = currentIndex + 1;
        if (isMultipleOf(currentIndex + 1, 17)) {
          endGame();
        } else if (cells[newIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate(newCells, currentIndex, newIndex, true);
        } else {
          incrementBoardUpdate(newCells, currentIndex, newIndex);
        }
        if (lastMove !== DIRECTIONS.RIGHT) setLastMove(DIRECTIONS.RIGHT);
        break;
      default:
        break;
    }
  };

  const incrementBoardUpdate = (
    newCells,
    currentIndex,
    newIndex,
    scorePoint = false
  ) => {
    if (scorePoint) {
      setScore((prev) => prev + 1);
      timeInterval.current -= 25; // TODO REFACTOR TO 10
    }
    newCells[newIndex] = CELL_TYPES.HEAD;
    newCells[currentIndex] = CELL_TYPES.EMPTY;
    setCells(scorePoint ? addPointCell(newCells) : newCells);
  };

  const endGame = () => {
    setGameOver(true);
    direction.current = DIRECTIONS.RIGHT;
    setRunning(false);
  };

  const addPointCell = useCallback((oldCells) => {
    if (oldCells.includes(CELL_TYPES.POINT)) return oldCells;

    const emptyIndices = indexOfAll(oldCells, CELL_TYPES.EMPTY);
    const newPointIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    const newCells = oldCells.map((cell, i) =>
      i === newPointIndex ? CELL_TYPES.POINT : cell
    );
    return newCells;
  }, []);

  const togglePlay = useCallback(() => {
    if (!pointExists) {
      setCells(addPointCell(cells));
    }
    setRunning((prev) => !prev);
  }, [cells, pointExists, addPointCell]);

  const getCellClass = (cell) => {
    switch (cell) {
      case CELL_TYPES.HEAD:
        return "cell cell--head";
      case CELL_TYPES.TAIL:
        return "cell cell--tail";
      case CELL_TYPES.POINT:
        return "cell cell--point";
      default:
        return "cell";
    }
  };

  const onButtonClick = useCallback(() => {
    if (gameOver) resetGame();
    else togglePlay();
  }, [gameOver, togglePlay, resetGame]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (running) increment();
    }, timeInterval.current);
    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    window.addEventListener(
      "keydown",
      (e) => {
        if (
          ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
            e.code
          ) > -1
        ) {
          e.preventDefault();
        }
      },
      false
    );
  });

  useEffect(() => {
    const onGridKeyDown = (e) => {
      console.log(e);
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          if (lastMove !== DIRECTIONS.DOWN) direction.current = DIRECTIONS.UP;
          break;
        case "ArrowDown":
        case "KeyS":
          if (lastMove !== DIRECTIONS.UP) direction.current = DIRECTIONS.DOWN;
          break;
        case "ArrowLeft":
        case "KeyA":
          if (lastMove !== DIRECTIONS.RIGHT)
            direction.current = DIRECTIONS.LEFT;
          break;
        case "ArrowRight":
        case "KeyD":
          if (lastMove !== DIRECTIONS.LEFT)
            direction.current = DIRECTIONS.RIGHT;
          break;
        case "Space":
          onButtonClick();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", onGridKeyDown);
    return function cleanup() {
      document.removeEventListener("keydown", onGridKeyDown);
    };
  }, [onButtonClick]);

  return (
    <div className="App">
      {!gameOver && <h3>SNAKE</h3>}
      {gameOver && <h3 className="gameover">GAME OVER</h3>}
      <input
        type="number"
        value={timeInterval.current}
        max="500"
        onChange={(e) => {
          timeInterval.current = e.target.value > 500 ? 500 : e.target.value;
        }}
      />
      <button onClick={onButtonClick}>
        {gameOver ? "New Game" : running ? "STOP" : "START"}
      </button>
      <p>Score: {score}</p>
      {/* <label>Time Interval</label> */}
      {/* <p>Direction: {direction.current}</p> */}
      <div className="grid">
        {cells.map((cell, i) => (
          <div key={i} className={getCellClass(cell)} />
        ))}
      </div>
      {/* <div className="grid">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={["cell", cell === CELL_TYPES.HEAD && "cell--head"]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div> */}
    </div>
  );
}

export default App;
