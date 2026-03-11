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

const O = viewer.addPoint(0, 0, 0, "O");
const B = viewer.addPoint(0, 0, 0, "B");
const B1 = viewer.addPoint(0, 0, 0, "B1");
const A = viewer.addPoint(0, 0, 0, "A");
const A1 = viewer.addPoint(0, 0, 0, "A1");
const A2 = viewer.addPoint(0, 0, 0, "A2");
const A3 = viewer.addPoint(0, 0, 0, "A3");
const A4 = viewer.addPoint(0, 0, 0, "A4");

viewer.addLine(new Line(O.index, B1.index));
viewer.addLine(new Line(B1.index, B.index));
viewer.addLine(new Line(B.index, A.index));
viewer.addLine(new Line(A.index, A1.index));
viewer.addLine(new Line(A.index, A2.index));
viewer.addLine(new Line(A.index, A3.index));
viewer.addLine(new Line(A.index, A4.index));

// Resize
window.addEventListener("resize", () => viewer.resize());

const sue = new Base();

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
    const L1 = 2;
    const L2 = 1;
    const H = 0.2;
    const R = 0.5;

    const t = stopTime ? lastTime : Date.now() * 0.001;
    if (!stopTime) lastTime = t;

    const xyz = new Base({ base: sue, axis: Axis.Z, angle: t });

    const vectorOB1 = xyz.convertVector(new Vector(0, L1, 0));
    B1.position.set(...O.position.add(vectorOB1).array());

    const vectorB1B = xyz.convertVector(new Vector(0, 0, H));
    B.position.set(...B1.position.add(vectorB1B).array());

    const abc = new Base({ base: xyz, axis: Axis.X, angle: Math.cos(t) / 2 });

    const vectorBC = abc.convertVector(new Vector(0, L2, 0));
    A.position.set(...B.position.add(vectorBC).array());

    const dis = new Base({ base: abc, axis: Axis.Y, angle: t });

    const vectorAA1 = dis.convertVector(new Vector(0, 0, -R));
    A1.position.set(...A.position.add(vectorAA1).array());

    const vectorAA2 = dis.convertVector(new Vector(0, 0, R));
    A2.position.set(...A.position.add(vectorAA2).array());

    const vectorAA3 = dis.convertVector(new Vector(R, 0, 0));
    A3.position.set(...A.position.add(vectorAA3).array());

    const vectorAA4 = dis.convertVector(new Vector(-R, 0, 0));
    A4.position.set(...A.position.add(vectorAA4).array());

    // speedChart.addValue("Velocity", F.position.x);
    // speedChart.addValue(
    //     "Acceleration",
    //     (speedChart.getDatasetLatestValue("Velocity") ?? 0) * 100
    // );
    // speedChart.update();

    if (!stopCamera) {
        viewer.setCameraLookAt(
            B.position,
            xyz.convertVector(new Vector(1, -1, 1)),
            4
        );
    }

    vectorPanel.updatePoint(O);
    vectorPanel.updatePoint(A);
    vectorPanel.updatePoint(B);
    vectorPanel.updatePoint(B1);
    vectorPanel.updatePoint(A1);
    vectorPanel.updatePoint(A2);
    vectorPanel.updatePoint(A3);
    vectorPanel.updatePoint(A4);

    viewer.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
