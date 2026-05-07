export class Point {
  posX: number;
  posY: number;
  height: number;

  constructor(x: number, y: number, h = 0) {
    this.posX = x;
    this.posY = y;
    this.height = h;
  }
}

export type DiamondSquareConfig = {
  size?: number; // grid = 2 ** size + 1
  rangeHeight?: [number, number];
  rangeRandom?: [number, number];
  shrinkCoeffRandom?: number;
  fixHeightAlonePoint?: number;
};

const DEFAULT_CONFIG: Required<DiamondSquareConfig> = {
  size: 3,
  rangeHeight: [1, 16],
  rangeRandom: [-4, 4],
  shrinkCoeffRandom: 0.5,
  fixHeightAlonePoint: 8,
};

export function generateDiamondSquareGrid(
  config: DiamondSquareConfig = {},
): Point[][] {
  const {
    size,
    rangeHeight,
    rangeRandom,
    shrinkCoeffRandom,
    fixHeightAlonePoint,
  } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const gridSize = 2 ** size + 1;
  const grid = initGrid(gridSize, rangeHeight);

  let step = gridSize - 1;
  let currentRangeRandom: [number, number] = [...rangeRandom];

  while (step > 1) {
    const halfStep = step / 2;

    // Square step
    for (let x = 0; x < gridSize - 1; x += step) {
      for (let y = 0; y < gridSize - 1; y += step) {
        const centerX = x + halfStep;
        const centerY = y + halfStep;

        grid[centerX][centerY].height =
          average([
            grid[x][y].height,
            grid[x + step][y].height,
            grid[x + step][y + step].height,
            grid[x][y + step].height,
          ]) + getRandomInRange(currentRangeRandom);
      }
    }

    // Diamond step
    for (let x = 0; x < gridSize; x += halfStep) {
      for (let y = (x + halfStep) % step; y < gridSize; y += step) {
        const neighbours: number[] = [];

        if (x - halfStep >= 0) neighbours.push(grid[x - halfStep][y].height);
        if (x + halfStep < gridSize)
          neighbours.push(grid[x + halfStep][y].height);
        if (y - halfStep >= 0) neighbours.push(grid[x][y - halfStep].height);
        if (y + halfStep < gridSize)
          neighbours.push(grid[x][y + halfStep].height);

        grid[x][y].height =
          average(neighbours) + getRandomInRange(currentRangeRandom);
      }
    }

    step = halfStep;
    currentRangeRandom = [
      currentRangeRandom[0] * shrinkCoeffRandom,
      currentRangeRandom[1] * shrinkCoeffRandom,
    ];
  }

  clampAndRoundGrid(grid, rangeHeight);
  fixHeightAlonePoints(grid, fixHeightAlonePoint, rangeHeight);

  return grid;
}

function initGrid(gridSize: number, rangeHeight: [number, number]): Point[][] {
  const grid: Point[][] = [];

  for (let x = 0; x < gridSize; x++) {
    grid[x] = [];

    for (let y = 0; y < gridSize; y++) {
      grid[x][y] = new Point(x, y);
    }
  }

  grid[0][0].height = getRandomInteger(rangeHeight[0], rangeHeight[1]);
  grid[gridSize - 1][0].height = getRandomInteger(
    rangeHeight[0],
    rangeHeight[1],
  );
  grid[gridSize - 1][gridSize - 1].height = getRandomInteger(
    rangeHeight[0],
    rangeHeight[1],
  );
  grid[0][gridSize - 1].height = getRandomInteger(
    rangeHeight[0],
    rangeHeight[1],
  );

  return grid;
}

function fixHeightAlonePoints(
  grid: Point[][],
  maxDifferentNeighbours: number,
  rangeHeight: [number, number],
): void {
  const gridSize = grid.length;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const currentHeight = roundHeight(grid[x][y].height, rangeHeight);
      const neighbours = getNeighbours(grid, x, y);

      let differentCount = 0;
      let newHeight = currentHeight;

      for (const neighbour of neighbours) {
        const neighbourHeight = roundHeight(neighbour.height, rangeHeight);

        if (neighbourHeight !== currentHeight) {
          differentCount++;
          newHeight = neighbourHeight;
        }
      }

      if (differentCount >= maxDifferentNeighbours) {
        grid[x][y].height = newHeight;
      }
    }
  }
}

function getNeighbours(grid: Point[][], cx: number, cy: number): Point[] {
  const result: Point[] = [];
  const gridSize = grid.length;

  for (let x = cx - 1; x <= cx + 1; x++) {
    for (let y = cy - 1; y <= cy + 1; y++) {
      const isCurrentCell = x === cx && y === cy;
      const isOutsideGrid = x < 0 || y < 0 || x >= gridSize || y >= gridSize;

      if (!isCurrentCell && !isOutsideGrid) {
        result.push(grid[x][y]);
      }
    }
  }

  return result;
}

function clampAndRoundGrid(
  grid: Point[][],
  rangeHeight: [number, number],
): void {
  for (const column of grid) {
    for (const point of column) {
      point.height = roundHeight(point.height, rangeHeight);
    }
  }
}

function roundHeight(height: number, rangeHeight: [number, number]): number {
  const rounded = Math.round(height);

  if (rounded < rangeHeight[0]) return rangeHeight[0];
  if (rounded > rangeHeight[1]) return rangeHeight[1];

  return rounded;
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getRandomInRange([min, max]: [number, number]): number {
  return Math.random() * (max - min) + min;
}

function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
