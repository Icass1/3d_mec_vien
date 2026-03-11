# 3D Mechanical Linkage Visualizer

A TypeScript Three.js application for visualizing 3D mechanical linkages with real-time coordinate transformations, animations, and data plotting.

## Features

- **3D Visualization**: Render points, lines, and coordinate axes in 3D space
- **Coordinate Systems**: Support for hierarchical base transformations (rotations around X, Y, Z axes)
- **Vector Math**: Custom Vector and Matrix classes for 3D calculations
- **Mechanical Animation**: Animate multi-linkage mechanisms with chained coordinate transformations
- **Real-time Charts**: Live velocity and acceleration plotting
- **Interactive Controls**: Stop/resume time and camera rotation
- **Vector Panel**: Display coordinates of all points in the scene

## Setup

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000` in your browser.

## Project Structure

| File | Description |
|------|-------------|
| `Base.ts` | Coordinate base with rotation transformations |
| `Vector.ts` | 3D vector math operations |
| `Matrix.ts` | 3x3 matrix operations |
| `Point.ts` | 3D point as a sphere with label |
| `Line.ts` | Line connecting two points |
| `Axis.ts` | Axis enumeration (X, Y, Z) |
| `SpeedChart.ts` | Real-time velocity/acceleration chart |
| `VectorPanel.ts` | UI panel showing point coordinates |
| `geometry-viewer.ts` | Main Three.js scene manager |

## Usage Example

```typescript
const viewer = new GeometryViewer(app);

// Add points
const origin = viewer.addPoint(0, 0, 0, "O");
const pointA = viewer.addPoint(1, 0, 0, "A");

// Connect with a line
viewer.addLine(new Line(origin.index, pointA.index));

// Create rotating base
const base = new Base({ base: globalBase, axis: Axis.Z, angle: time });
const rotatedVector = base.convertVector(new Vector(1, 0, 0));
```

## Demo

The default demo shows a 6-segment mechanical linkage where each segment rotates at different speeds around different axes, demonstrating chained coordinate transformations.
