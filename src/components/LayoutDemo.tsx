import {useState} from 'react';

type CounterProps = {
  initial?: number;
};

export type EasyLayoutArea = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type EasyLayoutOutput = Record<string, EasyLayoutArea>;

export const makeEasyLayout = (areas: string[][] = []): EasyLayoutOutput => {
  const output: EasyLayoutOutput = {};
  const hasStartXMap: Record<string, boolean> = {};
  const hasStartYMap: Record<string, boolean> = {};

  for (let i: number = 0; i < areas.length; i++) {
    const row: string[] = areas[i];

    for (let j: number = 0; j < row.length; j++) {
      const a: string = row[j];
      const existingArea: EasyLayoutArea = output[a] || {x: 0, y: 0, width: 0, height: 0};
      const hasStartX = hasStartXMap[a] || false;
      const hasStartY = hasStartYMap[a] || false;
      const posX = i + 1;
      const posY = j + 1;


      if (!hasStartX) {
        existingArea.startX = posX;
        hasStartXMap[a] = true;
      } else {
        existingArea.endX = posX;
      }

      if (!hasStartY) {
        existingArea.startY = posY;
        hasStartYMap[a] = true;
      } else {
        existingArea.endY = posY;
      }

      output[a] = existingArea;
    }
  }

  return output;
};

export function LayoutDemo({initial = 0}: CounterProps) {
  const [count, setCount] = useState(initial);

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Increment
      </button>
    </div>
  );
}
