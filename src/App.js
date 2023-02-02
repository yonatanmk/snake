import { useState, useEffect, useRef } from "react";
import "./App.scss";
import { indexOfAll } from "./util";

const GRID_SIZE = 17;
const GRID_ROW_INDICES = [...Array(17).keys()];

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

function App() {
  const [cells, setCells] = useState(
    Array(GRID_SIZE * GRID_SIZE)
      .fill(CELL_TYPES.EMPTY)
      .fill(
        CELL_TYPES.HEAD,
        (GRID_SIZE * GRID_SIZE - 1) / 2,
        (GRID_SIZE * GRID_SIZE - 1) / 2 + 1
      )
  );
  const [running, setRunning] = useState(false);
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);

  const pointExists = cells.includes(CELL_TYPES.POINT);

  const increment = () => {
    const currentIndex = cells.findIndex((cell) => cell === CELL_TYPES.HEAD);
    const newCells = [...cells];
    switch (direction.current) {
      case DIRECTIONS.UP:
        if (GRID_ROW_INDICES.includes(currentIndex)) {
          newCells[currentIndex + 17 * 16] = CELL_TYPES.HEAD;
        } else {
          newCells[currentIndex - 17] = CELL_TYPES.HEAD;
        }
        break;
      case DIRECTIONS.DOWN:
        if (GRID_ROW_INDICES.map((x) => x + 17 * 16).includes(currentIndex)) {
          newCells[currentIndex - 17 * 16] = CELL_TYPES.HEAD;
        } else {
          newCells[currentIndex + 17] = CELL_TYPES.HEAD;
        }
        break;
      case DIRECTIONS.LEFT:
        if (currentIndex === 0) {
          newCells[GRID_SIZE * GRID_SIZE - 1] = CELL_TYPES.HEAD;
        } else {
          newCells[currentIndex - 1] = CELL_TYPES.HEAD;
        }
        break;
      case DIRECTIONS.RIGHT:
        if (currentIndex === GRID_SIZE * GRID_SIZE - 1) {
          newCells[0] = CELL_TYPES.HEAD;
        } else {
          newCells[currentIndex + 1] = CELL_TYPES.HEAD;
        }
        break;
      default:
        break;
    }
    newCells[currentIndex] = CELL_TYPES.EMPTY;
    setCells(newCells);
  };

  const onGridKeyDown = (e) => {
    console.log(e);
    switch (e.code) {
      case "ArrowUp":
      case "KeyW":
        direction.current = DIRECTIONS.UP;
        break;
      case "ArrowDown":
      case "KeyS":
        direction.current = DIRECTIONS.DOWN;
        break;
      case "ArrowLeft":
      case "KeyA":
        direction.current = DIRECTIONS.LEFT;
        break;
      case "ArrowRight":
      case "KeyD":
        direction.current = DIRECTIONS.RIGHT;
        break;
      case "Space":
        togglePlay();
        break;
      default:
        break;
    }
  };

  const togglePlay = () => {
    if (!pointExists) {
      createPoint();
    }
    setRunning((prev) => !prev);
  };

  const createPoint = () => {
    if (pointExists) return;

    const emptyIndices = indexOfAll(cells, CELL_TYPES.EMPTY);
    const newPointIndex =
      emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    const newCells = cells.map((cell, i) =>
      i === newPointIndex ? CELL_TYPES.POINT : cell
    );

    setCells(newCells);
  };

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

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (running) increment();
    }, timeInterval.current);
    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    document.addEventListener("keydown", onGridKeyDown);
    return function cleanup() {
      document.removeEventListener("keydown", onGridKeyDown);
    };
  }, []);

  return (
    <div className="App">
      <h3>SNAKE</h3>
      <input
        type="number"
        value={timeInterval.current}
        max="500"
        onChange={(e) => {
          timeInterval.current = e.target.value > 500 ? 500 : e.target.value;
        }}
      />
      <button onClick={togglePlay}>{running ? "STOP" : "START"}</button>
      <p>Score: 0</p>
      <label>Time Interval</label>
      <p>Direction: {direction.current}</p>
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
