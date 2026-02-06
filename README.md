# Easy Layout Demo

A tiny TypeScript utility for turning a simple 2D "area map" into absolute-positioned layout coordinates, plus a small React demo component.

## What It Does

You describe a layout as a grid of area names (strings). The helpers compute:

- A bounding box for each area (start/end row + column)
- Absolute positioning values (`top`, `left`, `width`, `height`) as percentages

That makes it easy to render a layout with `position: relative` on the container and `position: absolute` on each area.

## API

### `makeEasyLayout(areas: string[][]): EasyLayoutOutput`

Builds the bounding boxes for each area.

Return shape:

- `rows`: number of rows
- `columns`: max columns across all rows
- `layout`: map of area name -> `{ startX, startY, endX, endY }`

### `getEasyLayoutCoords(
  areas: string[][],
  paddingAmount: number | string = 0,
  gapAmount: number | string = 0,
  width?: number,
  height?: number,
): Record<string, { position: 'absolute'; top: string; left: string; width: string; height: string }>`

Computes absolute positioning percentages for each area.

- `paddingAmount` and `gapAmount` can be numbers (pixels) or percentage strings (e.g. `"5%"`).
- If you pass pixel values, also pass `width` and `height` so the function can convert to percentages.

## Example

```ts
import { getEasyLayoutCoords } from './components/LayoutDemo';

const areas = [
  ['a', 'a', 'b'],
  ['c', 'c', 'b'],
];

const coords = getEasyLayoutCoords(
  areas,
  20,  // padding in px
  20,  // gap in px
  800, // container width in px
  200, // container height in px
);

// coords.a / coords.b / coords.c => absolute positioning styles
```

```tsx
<div
  style={{
    position: 'relative',
    width: '800px',
    height: '200px',
  }}
>
  <div style={coords.a}>a</div>
  <div style={coords.b}>b</div>
  <div style={coords.c}>c</div>
</div>
```

## Notes

- Area names are free-form strings; repeated names merge into a single rectangular region.
- The container must be `position: relative` for the absolute positioning to work.
