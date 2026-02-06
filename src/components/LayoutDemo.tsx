import {useEffect, useMemo, useState} from 'react';

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
        existingArea.endX = posX;
        hasStartXMap[a] = true;
      } else {
        existingArea.endX = posX;
      }

      if (!hasStartY) {
        existingArea.startY = posY;
        existingArea.endY = posY;
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

const defaultLayoutInput = 'a a b\nc c b';

const parseLayoutAreas = (rawInput: string): {areas: string[][]; error?: string} => {
  try {
    const rows = rawInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.split(/\s+/).filter(Boolean));

    if (rows.length === 0) {
      return {areas: [], error: 'Layout is empty.'};
    }

    if (rows.some((row) => row.length === 0)) {
      return {areas: [], error: 'Layout rows must contain area names.'};
    }

    return {areas: rows};
  } catch (error) {
    return {areas: [], error: 'Layout could not be parsed.'};
  }
};

export function LayoutDemo() {
  const [demoWidth, setDemoWidth] = useState(1000);
  const [demoHeight, setDemoHeight] = useState(400);
  const [demoPadding, setDemoPadding] = useState(20);
  const [demoGap, setDemoGap] = useState(20);
  const [layoutInput, setLayoutInput] = useState(defaultLayoutInput);
  const [lastValidAreas, setLastValidAreas] = useState<string[][]>([
    ['a', 'a', 'b'],
    ['c', 'c', 'b'],
  ]);
  const {areas: parsedAreas, error: layoutError} = useMemo(
    () => parseLayoutAreas(layoutInput),
    [layoutInput],
  );
  const testLayoutAreas = useMemo(
    () => (layoutError ? lastValidAreas : parsedAreas),
    [layoutError, lastValidAreas, parsedAreas],
  );

  useEffect(() => {
    if (!layoutError && parsedAreas.length > 0) {
      setLastValidAreas(parsedAreas);
    }
  }, [layoutError, parsedAreas]);
  const testLayoutCoords = useMemo(() => getEasyLayoutCoords(
    testLayoutAreas,
    demoPadding,
    demoGap,
    demoWidth,
    demoHeight,
  ), [testLayoutAreas, demoPadding, demoGap, demoWidth, demoHeight]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
        }}
      >
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#1e1e1e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Width
          <input
            type="number"
            min={200}
            max={1600}
            value={demoWidth}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isNaN(nextValue)) {
                setDemoWidth(nextValue);
              }
            }}
            style={{
              appearance: 'none',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #c7c7c7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#1e1e1e',
              fontSize: 16,
              fontWeight: 600,
              width: 140,
              boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
              outlineColor: '#ff7849',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#1e1e1e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Height
          <input
            type="number"
            min={200}
            max={900}
            value={demoHeight}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isNaN(nextValue)) {
                setDemoHeight(nextValue);
              }
            }}
            style={{
              appearance: 'none',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #c7c7c7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#1e1e1e',
              fontSize: 16,
              fontWeight: 600,
              width: 140,
              boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
              outlineColor: '#ff7849',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#1e1e1e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Padding
          <input
            type="number"
            min={0}
            max={200}
            value={demoPadding}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isNaN(nextValue)) {
                setDemoPadding(nextValue);
              }
            }}
            style={{
              appearance: 'none',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #c7c7c7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#1e1e1e',
              fontSize: 16,
              fontWeight: 600,
              width: 140,
              boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
              outlineColor: '#ff7849',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#1e1e1e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Gap
          <input
            type="number"
            min={0}
            max={200}
            value={demoGap}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              if (!Number.isNaN(nextValue)) {
                setDemoGap(nextValue);
              }
            }}
            style={{
              appearance: 'none',
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid #c7c7c7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#1e1e1e',
              fontSize: 16,
              fontWeight: 600,
              width: 140,
              boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
              outlineColor: '#ff7849',
            }}
          />
        </label>
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            color: '#1e1e1e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            minWidth: 260,
            flex: '1 1 260px',
          }}
        >
          Layout Areas
          <textarea
            value={layoutInput}
            onChange={(event) => {
              setLayoutInput(event.target.value);
            }}
            rows={3}
            style={{
              resize: 'vertical',
              minHeight: 80,
              padding: '12px 14px',
              borderRadius: 16,
              border: layoutError ? '1px solid #f17c7c' : '1px solid #c7c7c7',
              background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
              color: '#1e1e1e',
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.5,
              boxShadow: '0 8px 20px rgba(16, 24, 40, 0.08)',
              outlineColor: '#ff7849',
              fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
            }}
          />
          <span style={{textTransform: 'none', letterSpacing: 'normal', color: layoutError ? '#b42318' : '#5f6368'}}>
            {layoutError ? `${layoutError} Showing last valid layout.` : 'Use spaces for columns and new lines for rows.'}
          </span>
        </label>
      </div>
      <div
        className="LayoutDemo"
        style={{
          position: 'relative',
          backgroundColor: 'darkgray',
          width: demoWidth,
          height: demoHeight,
        }}
      >
        {Object.entries(testLayoutCoords).map(([areaName, areaStyle]) => (
          <div key={areaName} style={areaStyle}>
            {areaName}
          </div>
        ))}
      </div>
    </div>
  );
}
