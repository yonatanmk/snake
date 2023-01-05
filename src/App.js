import { useState, useEffect, useRef } from "react";
import "./App.scss";

const GRID_SIZE = 17;

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
  const [direction, setDirection] = useState(DIRECTIONS.UP);
  const timeInterval = useRef(500);

  const increment = () => {
    const currentIndex = cells.findIndex((cell) => cell === CELL_TYPES.HEAD);
    const newCells = [...cells];
    if (currentIndex === GRID_SIZE * GRID_SIZE - 1) {
      newCells[0] = CELL_TYPES.HEAD;
    } else {
      newCells[currentIndex + 1] = CELL_TYPES.HEAD;
    }
    newCells[currentIndex] = CELL_TYPES.EMPTY;
    setCells(newCells);
  };

  useEffect(() => {
    console.log({
      timeInterval,
    });
    const intervalId = setInterval(() => increment(), timeInterval.current);
    return () => clearInterval(intervalId);
  });

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
