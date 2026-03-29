# 3D Mechanical Linkage Visualizer — Project Guide

## Overview

TypeScript web application for visualizing and simulating 3D mechanical linkages. Models a two-wheel differential-drive robot platform with real-time kinematic simulation, coordinate transformations, and live data plotting.

**Tech stack:** TypeScript + Vite, Three.js (3D rendering), Chart.js (live plotting), mathjs (symbolic math utility)

**Run:** `pnpm dev` | **Build:** `pnpm build` (runs `tsc && vite build`)

---

## File Structure

```
src/
├── main.ts                     # Entry point — animation loop
├── geometry-viewer.ts          # Three.js scene management
├── kinematic-coupling.ts       # Main kinematic solver (differential drive)
├── kinematic-bases.ts          # Hierarchical kinematic base classes
├── BarBase.ts                  # Simplified bar representation
├── WheelBase.ts                # Wheel with rotation tracking
├── Base.ts                     # Simple coordinate base with rotation
├── Vector.ts                   # 3D vector with IMathObject components
├── Matrix.ts                   # 3x3 matrix operations
├── Point.ts                    # 3D point (wraps Vector + color + name)
├── Line.ts                     # Line between two Points
├── Axis.ts                     # Enum: X=1, Y=2, Z=3
├── VectorPanel.ts              # HTML UI panel for coordinate display
├── SpeedChart.ts               # Chart.js wrapper for live velocity plotting
├── constants.ts                # Color definitions
└── math/
    ├── math-object.ts          # IMathObject interface
    ├── contextType.ts          # ContextType = { [key: string]: number }
    ├── constant.ts             # Numeric constants
    ├── variable.ts             # Symbolic variables with LaTeX support
    ├── add.ts / mul.ts / substract.ts / divide.ts   # Binary operations
    ├── sin.ts / cos.ts / sqrt.ts                     # Math functions
    ├── derivative.ts           # Symbolic differentiation
    ├── differential-equation.ts # ODE solver (Euler & RK4)
    └── utils.ts                # mathjs wrapper (factor, LaTeX conversion)
```

---

## Core Concepts

### IMathObject (symbolic math tree)

All math is represented as a tree of `IMathObject` nodes. Every node implements:

```typescript
interface IMathObject {
    mul(value: IMathObject): Mul;
    add(value: IMathObject): Add;
    substract(value: IMathObject): Substract;
    divide(value: IMathObject): Divide;
    expression(latex: boolean, visited?: Set<IMathObject>): string;
    compute(context: ContextType, visited?: Set<IMathObject>): number;
}
```

- **`expression(latex)`** — returns string representation (plain or LaTeX)
- **`compute(context)`** — evaluates to a number given variable values
- **`ContextType`** — `{ [key: string]: number }` — maps variable names to values

Leaf nodes: `Constant`, `Variable`. Composite nodes: `Add`, `Mul`, `Substract`, `Divide`, `Sin`, `Cos`, `Sqrt`, `Derivative`.

### Vector

Components are `IMathObject` — not plain numbers. Call `vector.computeToVector3(context)` to get a `THREE.Vector3` for rendering.

### Base / KinematicBase

Coordinate bases form a chain. `convertVector(v)` applies this base's rotation then recurses to the parent. Rotation matrix is built from `axis` + `angle` (an `IMathObject`).

---

## Key Classes

### `KinematicCouplingSolver` (`kinematic-coupling.ts`)

Models a differential-drive robot. Core config:

```typescript
interface KinematicCouplingConfig {
    wheel1AngularVelocity: number;  // rad/s
    wheel2AngularVelocity: number;  // rad/s
    wheelRadius: number;            // m
    wheelBase: number;              // m
    // optional initial conditions...
}
```

State at time `t`:
```
v1 = wheel1AngularVelocity * wheelRadius
v2 = wheel2AngularVelocity * wheelRadius
v  = (v1 + v2) / 2          // linear velocity
ω  = (v2 - v1) / wheelBase  // angular velocity

barX(t)    = x0 + v * cos(θ0) * t
barY(t)    = y0 + v * sin(θ0) * t
barAngle(t) = θ0 + ω * t
```

Main method: `getStateAtTime(t): KinematicState`

### `GeometryViewer` (`geometry-viewer.ts`)

Manages the Three.js scene. Key methods:
- `addPoints(points)` / `addLines(lines)` — register geometry
- `update(context)` — recompute positions, rebuild line meshes, render frame
- `setCameraTarget(target, context)` — move orbit camera
- `clearArrows()` / `addArrow(origin, dir, color)` — arrow helpers

Scene setup: ambient light + directional (main/fill/rim) lights, `GridHelper`, `AxesHelper`.

### `SpeedChart` (`SpeedChart.ts`)

Wraps Chart.js for live plotting. `addValue(dataset, timestamp, value)` computes the delta (velocity) automatically by comparing to the previous value.

### `WheelBase` (`WheelBase.ts`)

Represents a wheel attached to a bar. `rotationAngle` is computed symbolically. `convertVector(v)` applies the wheel's local frame transformation.

### `KinematicBase` / `BarBase` / `WheelBase2` (`kinematic-bases.ts`)

Hierarchical kinematic chain. `getGlobalRotationMatrix()` and `getGlobalPosition()` walk the parent chain. `FloorBase` is the identity/world base.

### `Derivative` (`math/derivative.ts`)

Symbolic differentiation. `differentiate(expr, varName)` applies standard rules (constant, variable, sum, product, quotient, chain rule for trig/sqrt). Returns an `IMathObject`.

### `DifferentialEquation` (`math/differential-equation.ts`)

ODE solver supporting Euler and RK4 methods:

```typescript
interface ODEConfig {
    stepSize: number;
    startTime: number;
    endTime: number;
    initialValues: ContextType;
    method: "euler" | "rk4";
}
```

Returns `SolutionPoint[]` where each point is `{ t: number; values: ContextType }`.

---

## Animation Loop (`main.ts`)

```
initialize GeometryViewer + KinematicCouplingSolver + SpeedChart
↓
requestAnimationFrame loop:
  1. getStateAtTime(currentTime)
  2. update point positions (bar endpoints, wheel centers, wheel circumference points)
  3. addValue to SpeedChart
  4. setCameraTarget to bar center
  5. viewer.update(context)
```

Simulation parameters (defaults):
- `wheelRadius = 0.3` m
- `wheelBase = 1.0` m
- `wheel1AngularVelocity = 2` rad/s
- `wheel2AngularVelocity = 1` rad/s

---

## HTML Elements

| ID | Purpose |
|----|---------|
| `#app` | Three.js renderer mount point |
| `#btn-stop-time` | Pause/resume animation |
| `#speed-chart` | Chart.js canvas |

---

## LaTeX Support

`Variable` auto-converts subscript notation: `a23` → `a_{23}`. All `IMathObject` nodes support `expression(true)` for LaTeX output. `MathUtils` (wraps mathjs) provides `factorAndLatex(expr)` and `derivativeLatex(expr, variable)`.

---

## Type Aliases

| Type | Definition |
|------|-----------|
| `ContextType` | `{ [key: string]: number }` |
| `AxisType` | `1 \| 2 \| 3` (from Axis enum) |
| `OdeSolverMethod` | `"euler" \| "rk4"` |
| `SolutionPoint` | `{ t: number; values: ContextType }` |
