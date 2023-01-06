import { useState, useEffect, useRef } from "react";
import "./App.scss";

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
  const timeInterval = useRef(500);
  const direction = useRef(DIRECTIONS.RIGHT);

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
      default:
        break;
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => increment(), timeInterval.current);
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
      <p>Score: 0</p>
      <label>Time Interval</label>
      <input
        type="number"
        value={timeInterval.current}
        max="500"
        onChange={(e) => {
          timeInterval.current = e.target.value > 500 ? 500 : e.target.value;
        }}
      />
      <p>Direction: {direction.current}</p>
      <div className="grid">
        {cells.map((cell, i) => (
          <div
            key={i}
            className={["cell", cell === CELL_TYPES.HEAD && "cell--head"]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
