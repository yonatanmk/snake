import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { indexOfAll, isMultipleOf, range } from "./util";

// const GRID_SIZE = 17;
const GRID_SIZE = 9;

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
  UP: -GRID_SIZE,
  DOWN: GRID_SIZE,
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
    [180, 176, 108, 109, 112, 146].includes(i) ? CELL_TYPES.POINT : x
  ); // TODO REMOVE

function Snake2() {
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);
  const [lastMove, setLastMove] = useState(DIRECTIONS.RIGHT);
  const [shouldGrow, setShouldGrow] = useState(false);
  const [tailIndices, setTailIndices] = useState([]);

  // -----------------------
  const [headIndex, setHeadIndex] = useState((GRID_SIZE * GRID_SIZE - 1) / 2);
  const [pointIndex, setPointIndex] = useState(null);
  // const [pointIndices, setPointIndices] = useState([42, 43, 24, 20, 38, 56]);

  // const pointExists = cells.includes(CELL_TYPES.POINT);

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
    // setCells(startState);
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
        // newCells,
        // currentHeadIndex,
        newHeadIndex,
        scorePoint: newHeadIndex === pointIndex,
        // scorePoint: pointIndices.includes(newHeadIndex),
      });
    }
    if (lastMove !== direction.current) setLastMove(direction.current);
  };

  const incrementBoardUpdate = ({
    // newCells,
    // currentHeadIndex,
    newHeadIndex,
    scorePoint = false,
  }) => {
    if (scorePoint && shouldGrow) {
      console.log(0);
      setScore((prev) => prev + 1);
      timeInterval.current -= 10;
      setTailIndices((currentTailIndices) =>
        incrementTailIndices({ currentTailIndices, keepTailEnd: true })
      );
      // setPointIndices((prev) => prev.filter((x) => x !== newHeadIndex));
      setPointIndex(null);
      // } else if (scorePoint && shouldGrow) {
    } else if (shouldGrow) {
      console.log(1);
      setShouldGrow(false);
      setTailIndices((prev) => [headIndex, ...prev]);
    } else if (scorePoint) {
      console.log(2);
      setShouldGrow(true);
      setPointIndex(null);
      // setPointIndices((prev) => prev.filter((x) => x !== newHeadIndex));
      setScore((prev) => prev + 1);
      timeInterval.current -= 10;
      if (tailIndices.length > 0)
        setTailIndices((currentTailIndices) =>
          incrementTailIndices({ currentTailIndices })
        );
    } else {
      console.log(3);
      // setHeadIndex(newHeadIndex);
      if (tailIndices.length > 0)
        setTailIndices((currentTailIndices) =>
          incrementTailIndices({ currentTailIndices })
        );
    }
    setHeadIndex(newHeadIndex);
    console.log("incrementBoardUpdate ");
    console.log({
      scorePoint,
      shouldGrow,
      headIndex,
      newHeadIndex,
      tailIndices,
      pointIndex,
      // pointIndices,
    });
    if (scorePoint) createPointIndex();
  };

  const incrementTailIndices = ({ currentTailIndices, keepTailEnd }) => {
    console.log("incrementTailIndices");
    console.log({
      old: currentTailIndices,
      new: [
        headIndex,
        ...(keepTailEnd
          ? currentTailIndices
          : currentTailIndices.slice(0, currentTailIndices.length - 1)),
      ],
    });
    return [
      headIndex,
      ...(keepTailEnd
        ? currentTailIndices
        : currentTailIndices.slice(0, currentTailIndices.length - 1)),
    ];
  };

  const endGame = () => {
    setGameOver(true);
    setRunning(false);
  };

  const createPointIndex = useCallback(() => {
    // if (pointIndex) return;
    const emptyIndices = grid.filter(
      (i) => ![...tailIndices, headIndex].includes(i)
    );
    setPointIndex(
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
    );
  }, [grid, headIndex, tailIndices]);

  const togglePlay = useCallback(() => {
    if (pointIndex === null) {
      // if (pointIndices.length === 0) {
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
      // } else if (pointIndices.includes(index)) {
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
      {/* <p>Score: {score}</p> */}
      <p>
        {/* <span>Score: {score}</span> | <span>Point: {pointIndex}</span> |{" "} */}
        <span>Score: {score}</span> |{" "}
        <span>TAILS: {tailIndices.map((x) => `${x}`).join(" ")}</span>
      </p>
      {/* <p>TAILS: {tailIndices.join[" "]}</p> */}
      {/* <label>Time Interval</label> */}
      {/* <p>Direction: {direction.current}</p> */}

      <div className="grid">
        {/* {cells.map((cell, i) => (
          <div key={i} className={getCellClass(cell)} />
        ))} */}
        {grid.map((i) => (
          <div key={i} className={getCellClass(i)}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Snake2;
