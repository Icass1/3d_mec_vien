import { GeometryViewer } from "./geometry-viewer.js";
import { Base } from "./Base.js";
import { SpeedChart } from "./SpeedChart.js";
import { Variable } from "./math/variable.js";
import { Point } from "./Point.js";
import { Constant } from "./math/constant.js";
import { Axis } from "./Axis.js";
import { Vector } from "./Vector.js";
import { Line } from "./Line.js";
import { Cos } from "./math/cos.js";
import { MathUtils } from "./math/utils.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);

// Resize.
window.addEventListener("resize", () => viewer.resize());

let stopTime = false;
let stopCamera = false;

const btnStopTime = document.getElementById(
    "btn-stop-time"
) as HTMLButtonElement;
const btnStopCamera = document.getElementById(
    "btn-stop-camera"
) as HTMLButtonElement;

btnStopTime.addEventListener("click", () => {
    stopTime = !stopTime;
    btnStopTime.textContent = stopTime ? "Resume Time" : "Stop Time";
});

btnStopCamera.addEventListener("click", () => {
    stopCamera = !stopCamera;
    btnStopCamera.textContent = stopCamera ? "Resume Camera" : "Stop Camera";
});

const speedChartCanvas = document.getElementById(
    "speed-chart"
) as HTMLCanvasElement;
const speedChart = new SpeedChart(speedChartCanvas);

speedChart.addDataset("Velocity");
speedChart.addDataset("Acceleration");

const O = Point.newPoint();
const B1 = Point.newPoint();
const B = Point.newPoint();
const A = Point.newPoint();

const Dis1 = Point.newPoint();
const Dis2 = Point.newPoint();
const Dis3 = Point.newPoint();
const Dis4 = Point.newPoint();

viewer.addPoints({ O, B1, B, A, Dis1, Dis2, Dis3, Dis4 });
viewer.addLines({
    OB1: new Line(O, B1),
    B1B: new Line(B1, B),
    BA: new Line(B, A),
    ADis1: new Line(A, Dis1),
    ADis2: new Line(A, Dis2),
    ADis3: new Line(A, Dis3),
    ADis4: new Line(A, Dis4),
});

const T = new Variable("t");
const L1 = new Variable("l1");
const L2 = new Variable("l2");
const H = new Variable("h");
const R = new Variable("r");
const phi = T.divide(new Constant(10));
const psi = new Cos(T.divide(new Constant(4))).mul(new Constant(0.4));
const theta = T.divide(new Constant(2));

const sue = new Base();
const xyz = new Base({ base: sue, axis: Axis.Z, angle: phi });
const abc = new Base({ base: xyz, axis: Axis.X, angle: psi });
const dis = new Base({ base: abc, axis: Axis.Y, angle: theta });

O.position.set(new Constant(0), new Constant(0), new Constant(0));

const vectorOB1 = xyz.convertVector(
    new Vector(new Constant(0), L1, new Constant(0))
);
B1.position.addModify(O.position.add(vectorOB1));

const vectorB1B = xyz.convertVector(
    new Vector(new Constant(0), new Constant(0), H)
);
B.position.addModify(B1.position.add(vectorB1B));

const vectorBA = abc.convertVector(
    new Vector(new Constant(0), L2, new Constant(0))
);
A.position.addModify(B.position.add(vectorBA));

const vectorADis1 = dis.convertVector(
    new Vector(R, new Constant(0), new Constant(0))
);
Dis1.position.addModify(A.position.add(vectorADis1));

const vectorADis2 = dis.convertVector(
    new Vector(R.mul(new Constant(-1)), new Constant(0), new Constant(0))
);
Dis2.position.addModify(A.position.add(vectorADis2));

const vectorADis3 = dis.convertVector(
    new Vector(new Constant(0), new Constant(0), R)
);
Dis3.position.addModify(A.position.add(vectorADis3));

const vectorADis4 = dis.convertVector(
    new Vector(new Constant(0), new Constant(0), R.mul(new Constant(-1)))
);
Dis4.position.addModify(A.position.add(vectorADis4));

const mathUtils = new MathUtils(Variable.variables);

const simplified = mathUtils.factorAndLatex(Dis1.position.x.expression(false));
console.log(simplified.factored.toString());
console.log(simplified.latex);
// console.log(B.position.y.expression());
// console.log(B.position.z.expression());

// console.log(A.position.x.expression());
// console.log(A.position.y.expression());
// console.log(A.position.z.expression());

let lastTime = Date.now() - 1000;
let t: number = 0;

function animate() {
    const now = Date.now();
    if (!stopTime) t = t + (now - lastTime) * 0.02;
    lastTime = now;

    const context = {
        t: t,
        l1: 1,
        l2: 2,
        h: 10,
        r: 1,
    };

    speedChart.addValue("Velocity", t, Dis1.position.x.compute(context));

    speedChart.update(t);

    viewer.setCameraLookAt(
        B.position,

        abc.convertVector(
            new Vector(
                new Constant(-0.1),
                new Constant(-0.3),
                new Constant(0.1)
            )
        ),

        new Constant(3),
        context
    );

    viewer.update(context);

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
