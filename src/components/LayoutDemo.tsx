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
      const posX = i;
      const posY = j;


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

export const getEasyLayoutCoords = (areas: string[][] = [], paddingPercentage: number = 0, gapPercentage: number = 0): Record<string, {
  position: 'absolute';
  top: string;
  left: string;
  width: string;
  height: string;
}> => {
  const layout = makeEasyLayout(areas);
  const rows = areas.length;
  const cols = areas.reduce((acc, row) => Math.max(acc, row.length), 0);
  const output: Record<string, {
    position: 'absolute';
    top: string;
    left: string;
    width: string;
    height: string;
  }> = {};
  const totalHGutterPercentage = (paddingPercentage * 2) + (gapPercentage * (cols - 1));
  const totalVGutterPercentage = (paddingPercentage * 2) + (gapPercentage * (rows - 1));
  const remainingHPercentage = 100 - totalHGutterPercentage;
  const remainingVPercentage = 100 - totalVGutterPercentage;
  const hPortionSize = remainingHPercentage / cols;
  const vPortionSize = remainingVPercentage / rows;

  for (const [key, area] of Object.entries(layout)) {
    const {startX, startY, endX, endY} = area;
    const top = `${paddingPercentage + (startY * vPortionSize) + (startY * gapPercentage)}%`;
    const left = `${paddingPercentage + (startX * hPortionSize) + (startX * gapPercentage)}%`;
    const width = `${(endX - startX + 1) * hPortionSize}%`;
    const height = `${(endY - startY + 1) * vPortionSize}%`;

    output[key] = {
      position: 'absolute',
      top,
      left,
      width,
      height,
    };
  }

  return output;
};

const testLayoutAreas = [
  ['a', 'a', 'b'],
  ['c', 'c', 'b'],
];
const testLayoutCoords = getEasyLayoutCoords(testLayoutAreas);

export function LayoutDemo() {
  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'darkgray',
        width: '50vw',
        height: '40vh',
      }}
    >
      <div style={testLayoutCoords.a}>a</div>
      <div style={testLayoutCoords.b}>b</div>
      <div style={testLayoutCoords.c}>c</div>
    </div>
  );
}
