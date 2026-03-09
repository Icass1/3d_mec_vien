import { GeometryViewer } from "./geometry-viewer.js";
import { Base } from "./Base.js";
import { Axis } from "./Axis.js";
import { Vector } from "./Vector.js";
import { Line } from "./Line.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);
const vectorPanel = viewer.getVectorPanel();

const O = viewer.addPoint(0, 0, 0, "O");
const A = viewer.addPoint(0, 0, 0, "A");
const B = viewer.addPoint(0, 0, 0, "B");
const C = viewer.addPoint(0, 0, 0, "C");
const D = viewer.addPoint(0, 0, 0, "D");
const E = viewer.addPoint(0, 0, 0, "E");

viewer.addLine(new Line(O.index, A.index));
viewer.addLine(new Line(C.index, D.index));
viewer.addLine(new Line(B.index, C.index));
viewer.addLine(new Line(B.index, E.index));

// Resize
window.addEventListener("resize", () => viewer.resize());

const xyz = new Base();

let stopTime = false;
let stopCamera = true;
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

function animate() {
    const t = stopTime ? lastTime : Date.now() * 0.001;
    if (!stopTime) lastTime = t;
    const x = 1 + 0.6 * Math.cos(t);

    const aPos = new Vector(0, 0, 1);
    A.position.set(...aPos.array());

    const base1 = new Base({ base: xyz, axis: Axis.Z, angle: t });

    const vectorC = aPos.add(base1.convertVector(new Vector(x, 0, 0)));
    C.position.set(...vectorC.array());

    const vectorD = aPos.add(base1.convertVector(new Vector(x - 2, 0, 0)));
    D.position.set(...vectorD.array());

    const base2 = new Base({
        base: base1,
        axis: Axis.Y,
        angle: 0.5 * Math.cos(t),
    });

    const vectorCB = base2.convertVector(new Vector(1, 0, 0));
    const vectorB = vectorC.add(vectorCB);
    B.position.set(...vectorB.array());

    const base3 = new Base({
        base: base2,
        axis: Axis.X,
        angle: t,
    });

    const vectorBE = base3.convertVector(new Vector(0, 1, 0));
    const vectorE = vectorB.add(vectorBE);
    E.position.set(...vectorE.array());

    if (!stopCamera) {
        viewer.setCameraLookAt(
            B.position,
            base2.convertVector(new Vector(1, 0, 0)),
            4
        );
    }

    vectorPanel.updatePoint(O);
    vectorPanel.updatePoint(A);
    vectorPanel.updatePoint(B);
    vectorPanel.updatePoint(C);
    vectorPanel.updatePoint(D);
    vectorPanel.updatePoint(E);

    viewer.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
