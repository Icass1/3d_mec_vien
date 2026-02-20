# Three.js TypeScript Template

A fully typed Three.js template with custom axes, points, and lines.

## Features

- **Strict TypeScript**: All code is fully typed with strict mode enabled.
- **Custom Axis Helper**: Pretty colored X, Y, Z axes with labels.
- **Points**: Create 3D points in space as spheres.
- **Lines**: Draw lines between points in 3D space.
- **Modular Design**: Separate classes for AxisHelper, Point, and Line.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Start a local server:
   ```bash
   npm start
   ```

4. Open your browser to `http://localhost:3000`

## Usage

The template includes a `SceneManager` class that handles the Three.js scene setup. You can add points and lines like this:

```typescript
const sceneManager = new SceneManager();

// Add a point
const point = sceneManager.addPoint({ x: 1, y: 1, z: 1 }, new THREE.Color(0xff0000));

// Add a line between two points
const line = sceneManager.addLine(
  { x: 0, y: 0, z: 0 },
  { x: 1, y: 1, z: 1 },
  new THREE.Color(0x0000ff)
);
```

## Classes

- `AxisHelper`: Creates colored axes with labels
- `Point`: Represents a 3D point as a sphere
- `Line`: Represents a line between two points
- `SceneManager`: Manages the entire 3D scene

## Customization

You can customize the axis appearance by modifying the `AxisConfig` in `main.ts`:

```typescript
const axisConfig: AxisConfig = {
  size: 5,
  colors: {
    x: new THREE.Color(0xff0000), // Red
    y: new THREE.Color(0x00ff00), // Green
    z: new THREE.Color(0x0000ff)  // Blue
  },
  labels: {
    x: 'X',
    y: 'Y',
    z: 'Z'
  }
};
```