import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { isMultipleOf } from "./util";

const GRID_SIZE = 17;
// const GRID_SIZE = 9;

const DIRECTIONS = Object.freeze({
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
});

const INCREMENT_VALUES = Object.freeze({
  UP: -GRID_SIZE,
  DOWN: GRID_SIZE,
  LEFT: -1,
  RIGHT: 1,
});

function Snake2() {
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lastMove, setLastMove] = useState(DIRECTIONS.RIGHT);
  const [shouldGrow, setShouldGrow] = useState(false);
  const [tailIndices, setTailIndices] = useState([]);
  const [headIndex, setHeadIndex] = useState((GRID_SIZE * GRID_SIZE - 1) / 2);
  const [pointIndex, setPointIndex] = useState(null);
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);

  const grid = useMemo(
    () =>
      Array(GRID_SIZE * GRID_SIZE)
        .fill(null)
        .map((_, i) => i),
    []
  );

  const resetGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setTailIndices([]);
    timeInterval.current = 500;
    direction.current = DIRECTIONS.RIGHT;
  }, []);

  const increment = () => {
    const outOfBoundConditions = {
      [DIRECTIONS.UP]: headIndex < GRID_SIZE,
      [DIRECTIONS.DOWN]: headIndex >= GRID_SIZE * (GRID_SIZE - 1),
      [DIRECTIONS.LEFT]: isMultipleOf(headIndex, GRID_SIZE),
      [DIRECTIONS.RIGHT]: isMultipleOf(headIndex + 1, GRID_SIZE),
    };
    let newHeadIndex;
    newHeadIndex = headIndex + INCREMENT_VALUES[direction.current];
    if (
      outOfBoundConditions[direction.current] ||
      tailIndices.slice(0, tailIndices.length - 1).includes(newHeadIndex)
    ) {
      endGame();
    } else {
      incrementBoardUpdate({
        newHeadIndex,
        scorePoint: newHeadIndex === pointIndex,
      });
    }
    if (lastMove !== direction.current) setLastMove(direction.current);
  };

  const incrementBoardUpdate = ({ newHeadIndex, scorePoint = false }) => {
    if (scorePoint && shouldGrow) {
      setScore((prev) => prev + 1);
      timeInterval.current -= 10;
      setTailIndices((currentTailIndices) =>
        incrementTailIndices({ currentTailIndices, keepTailEnd: true })
      );
      setPointIndex(null);
    } else if (shouldGrow) {
      setShouldGrow(false);
      setTailIndices((prev) => [headIndex, ...prev]);
    } else if (scorePoint) {
      setShouldGrow(true);
      setPointIndex(null);
      setScore((prev) => prev + 1);
      timeInterval.current -= 10;
      if (tailIndices.length > 0)
        setTailIndices((currentTailIndices) =>
          incrementTailIndices({ currentTailIndices })
        );
    } else {
      if (tailIndices.length > 0)
        setTailIndices((currentTailIndices) =>
          incrementTailIndices({ currentTailIndices })
        );
    }
    setHeadIndex(newHeadIndex);
    if (scorePoint) createPointIndex();
  };

  const incrementTailIndices = ({ currentTailIndices, keepTailEnd }) => [
    headIndex,
    ...(keepTailEnd
      ? currentTailIndices
      : currentTailIndices.slice(0, currentTailIndices.length - 1)),
  ];

  const endGame = () => {
    setGameOver(true);
    setRunning(false);
  };

  const createPointIndex = useCallback(() => {
    const emptyIndices = grid.filter(
      (i) => ![...tailIndices, headIndex].includes(i)
    );
    setPointIndex(
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    );
  }, [grid, headIndex, tailIndices]);

  const togglePlay = useCallback(() => {
    if (pointIndex === null) {
      createPointIndex();
    }
    setRunning((prev) => !prev);
  }, [pointIndex, createPointIndex]);

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

  const getCellClass = (index) => {
    let className = "cell";
    if (tailIndices.length && index === tailIndices[tailIndices.length - 1]) {
      className += " cell--tail-end";
    } else if (tailIndices.includes(index)) {
      className += " cell--tail";
    } else if (index === headIndex) {
      className += " cell--head";
    } else if (index === pointIndex) {
      className += " cell--point";
    }

    return className;
  };

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
      {/* <p>
        <span>Score: {score}</span> |{" "}
        <span>TAILS: {tailIndices.map((x) => `${x}`).join(" ")}</span>
      </p> */}
      <div className="grid">
        {grid.map((i) => (
          <div key={i} className={getCellClass(i)} />
        ))}
        {/* {grid.map((i) => (
          <div key={i} className={getCellClass(i)}>
            {i}
          </div>
        ))} */}
      </div>
    </div>
  );
}

export default Snake2;
