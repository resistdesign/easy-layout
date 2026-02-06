export type EasyLayoutArea = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
};

export type EasyLayoutOutput = {
  rows: number;
  columns: number;
  layout: Record<string, EasyLayoutArea>;
};

export const makeEasyLayout = (areas: string[][] = []): EasyLayoutOutput => {
  const output: EasyLayoutOutput = {
    rows: areas.length,
    columns: areas.reduce((acc, row) => Math.max(acc, row.length), 0),
    layout: {},
  };
  const hasStartXMap: Record<string, boolean> = {};
  const hasStartYMap: Record<string, boolean> = {};

  for (let i: number = 0; i < areas.length; i++) {
    const row: string[] = areas[i];

    for (let j: number = 0; j < row.length; j++) {
      const a: string = row[j];
      const existingArea: EasyLayoutArea = output.layout[a] || {startX: 0, startY: 0, endX: 0, endY: 0};
      const hasStartX = hasStartXMap[a] || false;
      const hasStartY = hasStartYMap[a] || false;
      const posX = j + 1;
      const posY = i + 1;


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

      output.layout[a] = existingArea;
    }
  }

  return output;
};

export const getEasyLayoutCoords = (
  areas: string[][] = [],
  paddingAmount: number | string = 0,
  gapAmount: number | string = 0,
  width?: number,
  height?: number,
): Record<string, {
  position: 'absolute';
  top: string;
  left: string;
  width: string;
  height: string;
}> => {
  const {
    rows,
    columns,
    layout,
  } = makeEasyLayout(areas);
  const output: Record<string, {
    position: 'absolute';
    top: string;
    left: string;
    width: string;
    height: string;
  }> = {};
  const paddingIsPercentage = typeof paddingAmount === 'string' && paddingAmount.endsWith('%');
  const gapIsPercentage = typeof gapAmount === 'string' && gapAmount.endsWith('%');
  const basePadding = paddingIsPercentage ?
    parseInt(paddingAmount.slice(0, -1), 10) :
    parseFloat(paddingAmount.toString());
  const baseGap = gapIsPercentage ?
    parseInt(gapAmount.slice(0, -1), 10) :
    parseFloat(gapAmount.toString());
  const paddingHPercentage = !paddingIsPercentage && typeof width === 'number' ? (basePadding / width) * 100 : basePadding;
  const paddingVPercentage = !paddingIsPercentage && typeof height === 'number' ? (basePadding / height) * 100 : basePadding;
  const gapHPercentage = !gapIsPercentage && typeof width === 'number' ? (baseGap / width) * 100 : baseGap;
  const gapVPercentage = !gapIsPercentage && typeof height === 'number' ? (baseGap / height) * 100 : baseGap;
  const totalHGutterPercentage = (paddingHPercentage * 2) + (gapHPercentage * (columns - 1));
  const totalVGutterPercentage = (paddingVPercentage * 2) + (gapVPercentage * (rows - 1));
  const remainingHPercentage = 100 - totalHGutterPercentage;
  const remainingVPercentage = 100 - totalVGutterPercentage;
  const hPortionSize = remainingHPercentage / columns;
  const vPortionSize = remainingVPercentage / rows;

  for (const [key, area] of Object.entries(layout)) {
    const {
      startX,
      startY,
      endX,
      endY
    } = area;
    const hStartGapTotal = gapHPercentage * (startX - 1);
    const vStartGapTotal = gapVPercentage * (startY - 1);
    const hCoveredPortions = endX - (startX - 1);
    const vCoveredPortions = endY - (startY - 1);
    const hCoveredGap = (hCoveredPortions - 1) * gapHPercentage;
    const vCoveredGap = (vCoveredPortions - 1) * gapVPercentage;
    const hCoveredTotal = (hCoveredPortions * hPortionSize) + hCoveredGap;
    const vCoveredTotal = (vCoveredPortions * vPortionSize) + vCoveredGap;
    const hStartPortionsSize = (startX - 1) * hPortionSize;
    const vStartPortionsSize = (startY - 1) * vPortionSize;

    output[key] = {
      position: 'absolute',
      top: `${vStartGapTotal + vStartPortionsSize + paddingVPercentage}%`,
      left: `${hStartGapTotal + hStartPortionsSize + paddingHPercentage}%`,
      width: `${hCoveredTotal}%`,
      height: `${vCoveredTotal}%`,
    };
  }

  return output;
};

const testLayoutAreas = [
  ['a', 'a', 'b'],
  ['c', 'c', 'b'],
];
const testLayoutCoords = getEasyLayoutCoords(
  testLayoutAreas,
  10,
  10,
  200,
  100,
);

export function LayoutDemo() {
  return (
    <div
      className="LayoutDemo"
      style={{
        position: 'relative',
        backgroundColor: 'darkgray',
        width: '200px',
        height: '100px',
      }}
    >
      <div style={testLayoutCoords.a}>a</div>
      <div style={testLayoutCoords.b}>b</div>
      <div style={testLayoutCoords.c}>c</div>
    </div>
  );
}
