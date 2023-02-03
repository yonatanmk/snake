import { useState, useEffect, useRef, useCallback } from "react";
import "./App.scss";
import { indexOfAll, isMultipleOf } from "./util";

const GRID_SIZE = 17;

const CELL_TYPES = Object.freeze({
  HEAD: "HEAD",
  TAIL: "TAIL",
  TAIL_END: "TAIL_END",
  EMPTY: "EMPTY",
  POINT: "POINT",
});

const DIRECTIONS = Object.freeze({
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
});

const INCREMENT_VALUES = Object.freeze({
  UP: -17,
  DOWN: 17,
  LEFT: -1,
  RIGHT: 1,
});

const startState = Array(GRID_SIZE * GRID_SIZE)
  .fill(CELL_TYPES.EMPTY)
  .fill(
    CELL_TYPES.HEAD,
    (GRID_SIZE * GRID_SIZE - 1) / 2,
    (GRID_SIZE * GRID_SIZE - 1) / 2 + 1
  )
  .map((x, i) =>
    [180, 176, 108, 109, 112].includes(i) ? CELL_TYPES.POINT : x
  ); // TODO REMOVE

function App() {
  const [cells, setCells] = useState(startState);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);
  const [lastMove, setLastMove] = useState(DIRECTIONS.RIGHT);
  const [shouldGrow, setShouldGrow] = useState(false);
  const [tailIndices, setTailIndices] = useState([]);

  const pointExists = cells.includes(CELL_TYPES.POINT);

  const resetGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setCells(startState);
    setTailIndices([]);
    timeInterval.current = 500;
    direction.current = DIRECTIONS.RIGHT;
  }, []);

  const increment = () => {
    const currentHeadIndex = cells.findIndex(
      (cell) => cell === CELL_TYPES.HEAD
    );
    const newCells = [...cells];
    let newHeadIndex;
    switch (direction.current) {
      case DIRECTIONS.UP:
        newHeadIndex = currentHeadIndex + INCREMENT_VALUES.UP;
        if (currentHeadIndex < 17 || cells[newHeadIndex] === CELL_TYPES.TAIL) {
          endGame();
        } else if (cells[newHeadIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
            scorePoint: true,
          });
        } else {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
          });
        }
        if (lastMove !== DIRECTIONS.UP) setLastMove(DIRECTIONS.UP);
        break;
      case DIRECTIONS.DOWN:
        newHeadIndex = currentHeadIndex + INCREMENT_VALUES.DOWN;
        if (
          currentHeadIndex >= 17 * 16 ||
          cells[newHeadIndex] === CELL_TYPES.TAIL
        ) {
          endGame();
        } else if (cells[newHeadIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
            scorePoint: true,
          });
        } else {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
          });
        }
        if (lastMove !== DIRECTIONS.DOWN) setLastMove(DIRECTIONS.DOWN);
        break;
      case DIRECTIONS.LEFT:
        newHeadIndex = currentHeadIndex + INCREMENT_VALUES.LEFT;
        if (
          isMultipleOf(currentHeadIndex, 17) ||
          cells[newHeadIndex] === CELL_TYPES.TAIL
        ) {
          endGame();
        } else if (cells[newHeadIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
            scorePoint: true,
          });
        } else {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
          });
        }
        if (lastMove !== DIRECTIONS.LEFT) setLastMove(DIRECTIONS.LEFT);
        break;
      case DIRECTIONS.RIGHT:
        newHeadIndex = currentHeadIndex + INCREMENT_VALUES.RIGHT;
        if (
          isMultipleOf(currentHeadIndex + 1, 17) ||
          cells[newHeadIndex] === CELL_TYPES.TAIL
        ) {
          endGame();
        } else if (cells[newHeadIndex] === CELL_TYPES.POINT) {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
            scorePoint: true,
          });
        } else {
          incrementBoardUpdate({
            newCells,
            currentHeadIndex,
            newHeadIndex,
          });
        }
        if (lastMove !== DIRECTIONS.RIGHT) setLastMove(DIRECTIONS.RIGHT);
        break;
      default:
        break;
    }
  };

  const incrementBoardUpdate = ({
    newCells,
    currentHeadIndex,
    newHeadIndex,
    scorePoint = false,
  }) => {
    const currentTailEndIndex = tailIndices[tailIndices.length - 1];
    if (shouldGrow && !currentTailEndIndex) {
      newCells[currentHeadIndex] = CELL_TYPES.TAIL_END;
      setShouldGrow(false);
      setTailIndices([currentHeadIndex]);
    } else if (scorePoint && shouldGrow) {
      console.log("CASE ASDF");
      setScore((prev) => prev + 1);
      timeInterval.current -= 25; // TODO REFACTOR TO 10
      newCells[currentHeadIndex] =
        tailIndices.length + 1 === 1 ? CELL_TYPES.TAIL_END : CELL_TYPES.TAIL;
      if (currentHeadIndex !== tailIndices[0])
        setTailIndices((prev) => [currentHeadIndex, ...prev]);
    } else if (shouldGrow) {
      console.log("CASE 2");
      setShouldGrow(false);
      newCells[currentHeadIndex] =
        tailIndices.length + 1 === 1 ? CELL_TYPES.TAIL_END : CELL_TYPES.TAIL;
      if (currentHeadIndex !== tailIndices[0])
        setTailIndices((prev) => [currentHeadIndex, ...prev]);
    } else if (scorePoint) {
      setShouldGrow(true);
      setScore((prev) => prev + 1);
      timeInterval.current -= 25; // TODO REFACTOR TO 10
      newCells[currentHeadIndex] =
        tailIndices.length === 0
          ? CELL_TYPES.EMPTY
          : tailIndices.length === 1
          ? CELL_TYPES.TAIL_END
          : CELL_TYPES.TAIL;
      newCells[currentTailEndIndex] = CELL_TYPES.EMPTY;
      if (tailIndices.length > 0)
        setTailIndices((prev) => incrementTailIndices(prev, currentHeadIndex));
    } else if (tailIndices.length === 0) {
      newCells[currentHeadIndex] = CELL_TYPES.EMPTY;
    } else if (tailIndices.length === 1) {
      newCells[currentHeadIndex] = CELL_TYPES.TAIL_END;
      newCells[currentTailEndIndex] = CELL_TYPES.EMPTY;
      setTailIndices((prev) => incrementTailIndices(prev, currentHeadIndex));
    } else {
      newCells[currentHeadIndex] = CELL_TYPES.TAIL;
      const newTailEndIndex = tailIndices[tailIndices.length - 2];
      newCells[newTailEndIndex] = CELL_TYPES.TAIL_END;
      newCells[currentTailEndIndex] = CELL_TYPES.EMPTY;
      setTailIndices((prev) => incrementTailIndices(prev, currentHeadIndex));
    }

    newCells[newHeadIndex] = CELL_TYPES.HEAD;
    setCells(scorePoint ? addPointCell(newCells) : newCells);
  };

  const incrementTailIndices = (oldTailIndices, currentHeadIndex) => {
    return [
      currentHeadIndex,
      ...oldTailIndices.slice(0, oldTailIndices.length - 1),
    ];
  };

  const endGame = () => {
    setGameOver(true);
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
      case CELL_TYPES.TAIL_END:
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
  }, [lastMove, onButtonClick]);

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
      {/* <p>TAILS: {tailIndices}</p> */}
      {/* <label>Time Interval</label> */}
      {/* <p>Direction: {direction.current}</p> */}
      <div className="grid">
        {cells.map((cell, i) => (
          <div key={i} className={getCellClass(cell)} />
        ))}
        {/* {cells.map((cell, i) => (
          <div key={i} className={getCellClass(cell)}>
            {i}
          </div>
        ))} */}
      </div>
    </div>
  );
}

export default App;
