import { Constant } from "./math/constant";
import type { IMathObject } from "./math/math-object";
import type { ContextType } from "./math/contextType";
import { Vector } from "./Vector";
import { Point } from "./Point";
import { COLORS } from "./constants";
import * as THREE from "three";

// Apply a single-axis rotation to a vector (matches Base.ts convention)
function applyRotation(axis: number, angle: number, v: THREE.Vector3): THREE.Vector3 {
    const c = Math.cos(angle), s = Math.sin(angle);
    switch (axis) {
        case 1: return new THREE.Vector3(v.x, c * v.y - s * v.z, s * v.y + c * v.z);
        case 2: return new THREE.Vector3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z);
        case 3: return new THREE.Vector3(c * v.x - s * v.y, s * v.x + c * v.y, v.z);
        default: return v.clone();
    }
}

/**
 * A coordinate frame in the kinematic chain.
 *
 * Each frame stores:
 *  - `parent`      : parent frame (null = world)
 *  - `localOrigin` : position of this frame's origin, expressed in the PARENT frame
 *  - `rotAxis`     : axis of rotation (1=X, 2=Y, 3=Z, null=no rotation)
 *  - `rotAngle`    : rotation angle as a symbolic IMathObject (evaluated from context)
 *
 * `pointToWorld(p, ctx)` transforms a point expressed in this frame's local
 * coordinates all the way to world coordinates by recursively walking up the chain.
 */
export class ReferenceFrame {
    readonly parent: ReferenceFrame | null;
    readonly localOrigin: Vector;
    readonly rotAxis: number | null;
    readonly rotAngle: IMathObject | null;

    constructor(
        parent: ReferenceFrame | null,
        localOrigin: Vector,
        rotAxis: number | null = null,
        rotAngle: IMathObject | null = null
    ) {
        this.parent = parent;
        this.localOrigin = localOrigin;
        this.rotAxis = rotAxis;
        this.rotAngle = rotAngle;
    }

    /**
     * Transform local point `p` (in this frame) to world coordinates.
     *
     * Algorithm (applied at each level of the chain):
     *   1. Rotate `p` using this frame's rotation → `rotated`
     *   2. Add `localOrigin` (in parent coords) → `inParent`
     *   3. Recurse into parent with `inParent`
     */
    pointToWorld(p: THREE.Vector3, ctx: ContextType): THREE.Vector3 {
        let rotated = p.clone();
        if (this.rotAxis !== null && this.rotAngle !== null) {
            rotated = applyRotation(this.rotAxis, this.rotAngle.compute(ctx), p);
        }
        const origin = this.localOrigin.computeToVector3(ctx);
        const inParent = rotated.clone().add(origin);
        if (this.parent === null) return inParent;
        return this.parent.pointToWorld(inParent, ctx);
    }
}

interface PointDef {
    frame: ReferenceFrame;
    localPos: THREE.Vector3;
}

/**
 * Generic mechanical system simulator.
 *
 * Usage:
 *   1. addCoordinate(name, initial)   — register a generalized coordinate
 *   2. setODE(name, expr)             — dq/dt = expr (evaluated from context)
 *   3. addFrame(parent, axis, angle, origin) — build a kinematic chain
 *   4. createPoint(frame, [x,y,z])    — point fixed in a given frame
 *   5. step(dt)                       — integrate one timestep (RK4)
 *   6. updatePoints()                 — recompute world positions of all points
 */
export class MechanicalSystem {
    private readonly _state: ContextType = {};
    private readonly _odes: Map<string, IMathObject> = new Map();
    private readonly _pointDefs: PointDef[] = [];
    private readonly _points: Point[] = [];
    private _colorIndex = 0;

    /** Identity/world frame — use as root parent for top-level frames. */
    readonly worldFrame: ReferenceFrame;

    constructor() {
        const z = new Constant(0);
        this.worldFrame = new ReferenceFrame(null, new Vector(z, z, z));
    }

    /**
     * Register a generalized coordinate with an optional initial value.
     * The name will be the key used in the context and in ODE expressions.
     */
    addCoordinate(name: string, initialValue = 0): void {
        this._state[name] = initialValue;
    }

    /**
     * Set the time-derivative expression for a coordinate.
     * `derivative` is an IMathObject that may reference other coordinates by name.
     */
    setODE(name: string, derivative: IMathObject): void {
        this._odes.set(name, derivative);
    }

    /**
     * Create a child reference frame.
     *
     * @param parent      - parent frame
     * @param rotAxis     - axis of rotation in the parent frame (1=X, 2=Y, 3=Z)
     * @param rotAngle    - angle of rotation (IMathObject, evaluated from context)
     * @param localOrigin - origin of this frame expressed in the parent frame
     */
    addFrame(
        parent: ReferenceFrame,
        rotAxis: number,
        rotAngle: IMathObject,
        localOrigin: Vector
    ): ReferenceFrame {
        return new ReferenceFrame(parent, localOrigin, rotAxis, rotAngle);
    }

    /**
     * Create a point fixed at `localPos` in the given frame.
     * Returns the underlying Point object so it can be registered with GeometryViewer.
     * Call updatePoints() each frame to recompute its world position.
     */
    createPoint(
        frame: ReferenceFrame,
        localPos: [number, number, number],
        color?: string
    ): Point {
        const point = new Point(
            new Vector(new Constant(0), new Constant(0), new Constant(0)),
            color ?? COLORS[this._colorIndex++ % COLORS.length]
        );
        this._pointDefs.push({ frame, localPos: new THREE.Vector3(...localPos) });
        this._points.push(point);
        return point;
    }

    /** Return a copy of the current state (generalized coordinate values). */
    getContext(): ContextType {
        return { ...this._state };
    }

    /**
     * Integrate all ODEs forward by `dt` seconds using classical RK4.
     * Only coordinates registered with setODE() are updated.
     */
    step(dt: number): void {
        const ctx = this.getContext();

        const evalDerivs = (c: ContextType): ContextType => {
            const d: ContextType = {};
            for (const [name, expr] of this._odes) {
                d[name] = expr.compute(c);
            }
            return d;
        };

        const k1 = evalDerivs(ctx);

        const ctx2 = { ...ctx };
        for (const [name] of this._odes) ctx2[name] = ctx[name] + k1[name] * dt / 2;
        const k2 = evalDerivs(ctx2);

        const ctx3 = { ...ctx };
        for (const [name] of this._odes) ctx3[name] = ctx[name] + k2[name] * dt / 2;
        const k3 = evalDerivs(ctx3);

        const ctx4 = { ...ctx };
        for (const [name] of this._odes) ctx4[name] = ctx[name] + k3[name] * dt;
        const k4 = evalDerivs(ctx4);

        for (const [name] of this._odes) {
            this._state[name] +=
                (k1[name] + 2 * k2[name] + 2 * k3[name] + k4[name]) * dt / 6;
        }
    }

    /**
     * Recompute world positions of all registered points from the current state.
     * Must be called after step() (or whenever the state changes) before rendering.
     */
    updatePoints(): void {
        const ctx = this.getContext();
        for (let i = 0; i < this._pointDefs.length; i++) {
            const { frame, localPos } = this._pointDefs[i];
            const wp = frame.pointToWorld(localPos, ctx);
            this._points[i].position.x = new Constant(wp.x);
            this._points[i].position.y = new Constant(wp.y);
            this._points[i].position.z = new Constant(wp.z);
        }
    }
}
