import { GeometryViewer } from "./geometry-viewer.js";
import { Base } from "./Base.js";
import { Line } from "./Line.js";
import { SpeedChart } from "./SpeedChart.js";
import { Variable } from "./math/variable.js";
import { Cos } from "./math/cos.js";
import { Mul } from "./math/mul.js";
import { Axis } from "./Axis.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);
const vectorPanel = viewer.getVectorPanel();

const O = viewer.addPoint("O");
const B = viewer.addPoint("B");
const B1 = viewer.addPoint("B1");
const A = viewer.addPoint("A");
const A1 = viewer.addPoint("A1");
const A2 = viewer.addPoint("A2");
const A3 = viewer.addPoint("A3");
const A4 = viewer.addPoint("A4");

viewer.addLine(new Line(O, B1));
viewer.addLine(new Line(B1, B));
viewer.addLine(new Line(B, A));
viewer.addLine(new Line(A, A1));
viewer.addLine(new Line(A, A2));
viewer.addLine(new Line(A, A3));
viewer.addLine(new Line(A, A4));

// Resize
window.addEventListener("resize", () => viewer.resize());

let stopTime = false;
let stopCamera = false;
let lastTime = 0;

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

const L1 = new Variable("L1");
const cos = new Cos(L1);
const theta = new Variable("theta");

const cosSquared = new Mul(cos, cos);

const context = { L1: 1 };

console.log(cos.compute(context));
console.log(cosSquared.compute(context));

const sue = new Base();
const xyz = new Base({ base: sue, axis: Axis.Z, angle: theta });

function animate() {
    viewer.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
