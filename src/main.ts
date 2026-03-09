import { GeometryViewer } from "./geometry-viewer.js";
import { Base } from "./Base.js";
import { Axis } from "./Axis.js";
import { Vector } from "./Vector.js";
import { Line } from "./Line.js";

const app = document.getElementById("app") as HTMLElement;
if (!app) throw new Error("No #app element");

const viewer = new GeometryViewer(app);

const O = viewer.addPoint(0, 0, 0);
const A = viewer.addPoint(0, 0, 0);
const B = viewer.addPoint(0, 0, 0);
const C = viewer.addPoint(0, 0, 0);
const D = viewer.addPoint(0, 0, 0);
const E = viewer.addPoint(0, 0, 0);

viewer.addLine(new Line(O.index, A.index));
viewer.addLine(new Line(C.index, D.index));
viewer.addLine(new Line(B.index, C.index));
viewer.addLine(new Line(B.index, E.index));

// Resize
window.addEventListener("resize", () => viewer.resize());

const xyz = new Base();

function animate() {
    const t = Date.now() * 0.001;
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

    const vectorB = vectorC.add(base2.convertVector(new Vector(1, 0, 0)));
    B.position.set(...vectorB.array());

    const base3 = new Base({
        base: base2,
        axis: Axis.X,
        angle: t,
    });

    const vectorE = vectorB.add(base3.convertVector(new Vector(0, 1, 0)));
    E.position.set(...vectorE.array());

    viewer.update();

    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
