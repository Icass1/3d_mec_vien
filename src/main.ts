import { GeometryViewer } from "./geometry-viewer.js";
import { SpeedChart } from "./SpeedChart.js";
import { MechanicalSystem } from "./mechanical-system.js";
import { Variable } from "./math/variable.js";
import { Constant } from "./math/constant.js";
import { Sin } from "./math/sin.js";
import { Cos } from "./math/cos.js";
import { Vector } from "./Vector.js";
import { Line } from "./Line.js";
import { Axis } from "./Axis.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);
window.addEventListener("resize", () => viewer.resize());

let stopTime = false;
const btnStopTime = document.getElementById(
    "btn-stop-time"
) as HTMLButtonElement;
btnStopTime.addEventListener("click", () => {
    stopTime = !stopTime;
    btnStopTime.textContent = stopTime ? "Resume Time" : "Stop Time";
});

const speedChartCanvas = document.getElementById(
    "speed-chart"
) as HTMLCanvasElement;
const speedChart = new SpeedChart(speedChartCanvas);
speedChart.addDataset("vx");
speedChart.addDataset("vy");
speedChart.addDataset("omega");

// ── Robot parameters (change these to alter behaviour) ─────────────────────
const omega1 = 2; // rad/s — wheel 1 (left)  angular velocity
const omega2 = 0; // rad/s — wheel 2 (right) angular velocity
const wheelRadius = 0.3; // m
const wheelBase = 2.0; // m — lateral distance between wheels
// ───────────────────────────────────────────────────────────────────────────

const sys = new MechanicalSystem();

// Generalized coordinates
sys.addCoordinate("x", 0); // bar centre x  (world frame)
sys.addCoordinate("y", 0); // bar centre y  (world frame)
sys.addCoordinate("theta", 0); // heading angle (rad, CCW from world X)
sys.addCoordinate("phi1", 0); // wheel 1 rotation angle (rad)
sys.addCoordinate("phi2", 0); // wheel 2 rotation angle (rad)

// Symbolic building blocks
const theta = new Variable("theta");
const r = new Constant(wheelRadius);
const L = new Constant(wheelBase);
const w1 = new Constant(omega1);
const w2 = new Constant(omega2);

// Forward speed of bar centre: v = (omega1 + omega2) * r / 2
const v = w1.add(w2).mul(r).divide(new Constant(2));

// ── No-slip differential-drive kinematic coupling ──────────────────────────
//
//   dx/dt    = v · cos θ
//   dy/dt    = v · sin θ
//   dθ/dt    = (ω₂ − ω₁) · r / L        (positive = CCW turn)
//   dφ₁/dt   = ω₁
//   dφ₂/dt   = ω₂
//
sys.setODE("x", v.mul(new Cos(theta)));
sys.setODE("y", v.mul(new Sin(theta)));
sys.setODE("theta", w2.substract(w1).mul(r).divide(L));
sys.setODE("phi1", w1);
sys.setODE("phi2", w2);

// ── Reference-frame hierarchy ─────────────────────────────────────────────
//
//  World (Z-up)
//  └─ barFrame        Z-rotation by θ,    origin = (x, y, r)  in world
//      │               X_bar = heading direction
//      │               Y_bar = axle direction  (perpendicular to heading, horizontal)
//      │               Z_bar = vertical (same as world Z)
//      ├─ wheel1Frame  Y-rotation by φ₁,  origin = (0, +L/2, 0) in barFrame  (left)
//      └─ wheel2Frame  Y-rotation by φ₂,  origin = (0, −L/2, 0) in barFrame  (right)
//
const zero = new Constant(0);
const halfL = wheelBase / 2;

const barFrame = sys.addFrame(
    sys.worldFrame,
    Axis.Z,
    theta,
    new Vector(new Variable("x"), new Variable("y"), new Constant(wheelRadius))
);

const wheel1Frame = sys.addFrame(
    barFrame,
    Axis.Y,
    new Variable("phi1"),
    new Vector(zero, new Constant(+halfL), zero)
);

const wheel2Frame = sys.addFrame(
    barFrame,
    Axis.Y,
    new Variable("phi2"),
    new Vector(zero, new Constant(-halfL), zero)
);

// ── Points ────────────────────────────────────────────────────────────────
const rr = wheelRadius;

// Bar centre (O) and axle endpoints
const O = sys.createPoint(barFrame, [0, 0, 0], "#ffffff");
const axleL = sys.createPoint(barFrame, [0, +halfL, 0], "#aaaaaa");
const axleR = sys.createPoint(barFrame, [0, -halfL, 0], "#aaaaaa");

// Wheel 1 — four spoke tips + hub
const w1hub = sys.createPoint(wheel1Frame, [0, 0, 0], "#ff8800");
const w1s1 = sys.createPoint(wheel1Frame, [0, 0, +rr], "#ff8800"); // top
const w1s2 = sys.createPoint(wheel1Frame, [0, 0, -rr], "#ff8800"); // bottom
const w1s3 = sys.createPoint(wheel1Frame, [+rr, 0, 0], "#ff8800"); // fwd
const w1s4 = sys.createPoint(wheel1Frame, [-rr, 0, 0], "#ff8800"); // bwd

// Wheel 2 — four spoke tips + hub
const w2hub = sys.createPoint(wheel2Frame, [0, 0, 0], "#00aaff");
const w2s1 = sys.createPoint(wheel2Frame, [0, 0, +rr], "#00aaff");
const w2s2 = sys.createPoint(wheel2Frame, [0, 0, -rr], "#00aaff");
const w2s3 = sys.createPoint(wheel2Frame, [+rr, 0, 0], "#00aaff");
const w2s4 = sys.createPoint(wheel2Frame, [-rr, 0, 0], "#00aaff");

// ── Register geometry with viewer ─────────────────────────────────────────
viewer.addPoints({
    O,
    axleL,
    axleR,
    w1hub,
    w1s1,
    w1s2,
    w1s3,
    w1s4,
    w2hub,
    w2s1,
    w2s2,
    w2s3,
    w2s4,
});

viewer.addLines({
    axle: new Line(axleL, axleR),
    w1spoke1: new Line(w1hub, w1s1),
    w1spoke2: new Line(w1hub, w1s2),
    w1spoke3: new Line(w1hub, w1s3),
    w1spoke4: new Line(w1hub, w1s4),
    w2spoke1: new Line(w2hub, w2s1),
    w2spoke2: new Line(w2hub, w2s2),
    w2spoke3: new Line(w2hub, w2s3),
    w2spoke4: new Line(w2hub, w2s4),
});

// ── Animation loop ────────────────────────────────────────────────────────
let lastTime = Date.now();
let simTime = 0;

function animate() {
    const now = Date.now();
    const dt = (now - lastTime) * 0.001;
    lastTime = now;

    if (!stopTime) {
        sys.step(dt);
        simTime += dt;

        const ctx = sys.getContext();
        speedChart.addValue("vx", simTime, ctx.x);
        speedChart.addValue("vy", simTime, ctx.y);
        speedChart.addValue("omega", simTime, ctx.theta);
        speedChart.update(simTime);
    }

    sys.updatePoints();

    const ctx = sys.getContext();
    viewer.setCameraTarget(
        new Vector(
            new Constant(ctx.x),
            new Constant(ctx.y),
            new Constant(wheelRadius)
        ),
        {}
    );

    viewer.update({});
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
