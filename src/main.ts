import { GeometryViewer } from "./geometry-viewer.js";
import { Base } from "./Base.js";
import { Axis } from "./Axis.js";
import { Vector } from "./Vector.js";
import { Line } from "./Line.js";
import { SpeedChart } from "./SpeedChart.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);
const vectorPanel = viewer.getVectorPanel();

const O = viewer.addPoint(1, 1, 0, "O");
const A = viewer.addPoint(0, 0, 0, "A");
const B = viewer.addPoint(0, 0, 0, "B");
const C = viewer.addPoint(0, 0, 0, "C");
const D = viewer.addPoint(0, 0, 0, "D");
const E = viewer.addPoint(0, 0, 0, "E");
const F = viewer.addPoint(0, 0, 0, "F");

viewer.addLine(new Line(O.index, A.index));
viewer.addLine(new Line(A.index, B.index));
viewer.addLine(new Line(B.index, C.index));
viewer.addLine(new Line(C.index, D.index));
viewer.addLine(new Line(D.index, E.index));
viewer.addLine(new Line(E.index, F.index));

// Resize
window.addEventListener("resize", () => viewer.resize());

const xyz = new Base();

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

// let prevTime = 0;
// let prevX = 0;

// const startDate = Date.now();

speedChart.addDataset("Velocity");
speedChart.addDataset("Acceleration");

function animate() {
    const t = stopTime ? lastTime : Date.now() * 0.001;
    if (!stopTime) lastTime = t;

    const vectorOA = new Vector(0, 0, 1);
    A.position.set(...O.position.add(vectorOA).array());

    const base1 = new Base({ base: xyz, axis: Axis.Z, angle: t });

    const vectorAB = base1.convertVector(new Vector(1, 0, 0));
    B.position.set(...A.position.add(vectorAB).array());

    const vectorBC = base1.convertVector(new Vector(0, 0, 0.4));
    C.position.set(...B.position.add(vectorBC).array());

    const base2 = new Base({ base: base1, axis: Axis.Z, angle: 1 * t });

    const vectorCD = base2.convertVector(new Vector(0, 0.6, 0));
    D.position.set(...C.position.add(vectorCD).array());

    const vectorDE = base2.convertVector(new Vector(0.2, 0, 0));
    E.position.set(...D.position.add(vectorDE).array());

    const base3 = new Base({ base: base2, axis: Axis.X, angle: 6 * t });

    const vectorEF = base3.convertVector(new Vector(0, 0.2, 0));
    F.position.set(...E.position.add(vectorEF).array());

    speedChart.addValue("Velocity", F.position.x);
    speedChart.addValue(
        "Acceleration",
        (speedChart.getDatasetLatestValue("Velocity") ?? 0) * 100
    );
    speedChart.update();

    if (!stopCamera) {
        viewer.setCameraLookAt(
            F.position,
            base3.convertVector(new Vector(1, 0, 0)),
            4
        );
    }

    vectorPanel.updatePoint(O);
    vectorPanel.updatePoint(A);
    vectorPanel.updatePoint(B);
    vectorPanel.updatePoint(C);
    vectorPanel.updatePoint(D);
    vectorPanel.updatePoint(E);
    vectorPanel.updatePoint(F);

    viewer.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
