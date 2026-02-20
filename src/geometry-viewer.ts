import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Point } from "./Point";
import type { Line } from "./Line";

export class GeometryViewer {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private readonly points: Point[] = [];
  private readonly lines: Line[] = [];

  private pointGeometry!: THREE.BufferGeometry;
  private lineGeometry!: THREE.BufferGeometry;
  private readonly pointPositions: THREE.Vector3[] = [];
  private readonly linePositions: THREE.Vector3[] = [];

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b1020);

    this.camera = new THREE.PerspectiveCamera(
      10,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(5, 5, 5);
    this.camera.up.set(0, 0, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.setupLights();
    this.setupHelpers();
    this.setupGeometries();

    this.resize();
    this.update();
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 7);
    this.scene.add(dir);
  }

  private setupHelpers(): void {
    const axes = new THREE.AxesHelper(5);
    this.scene.add(axes);
  }

  private setupGeometries(): void {
    const pointMaterial = new THREE.PointsMaterial({
      color: 0xffcc00,
      size: 0.08,
      sizeAttenuation: true,
    });
    this.pointGeometry = new THREE.BufferGeometry();
    const points = new THREE.Points(this.pointGeometry, pointMaterial);
    this.scene.add(points);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x66ccff,
      linewidth: 2,
    });
    this.lineGeometry = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(this.lineGeometry, lineMaterial);
    this.scene.add(lines);
  }

  addPoint(x: number, y: number, z: number): Point {
    const position = new THREE.Vector3(x, y, z);
    const index = this.points.length;
    this.points.push(new Point(position, index));
    this.pointPositions.push(position);
    this.updatePointsGeometry();
    this.updateLinesGeometry();
    return this.points[index];
  }

  addLine(line: Line): void {
    if (
      line.startIndex >= this.points.length ||
      line.endIndex >= this.points.length
    ) {
      throw new Error("Invalid point indices");
    }
    this.lines.push(line);
    this.updateLinesGeometry();
  }

  private updatePointsGeometry(): void {
    if (this.pointPositions.length === 0) return;
    const array = new Float32Array(this.pointPositions.length * 3);
    this.pointPositions.forEach((p, i) => {
      array[i * 3 + 0] = p.x;
      array[i * 3 + 1] = p.y;
      array[i * 3 + 2] = p.z;
    });
    this.pointGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(array, 3),
    );
    this.pointGeometry.attributes.position.needsUpdate = true;
    this.pointGeometry.computeBoundingSphere();
  }

  private updateLinesGeometry(): void {
    // Rebuild all line positions
    this.linePositions.length = 0;

    // Add guide lines for each point
    for (const point of this.points) {
      const x = point.position.x;
      const y = point.position.y;
      const z = point.position.z;

      const base = new THREE.Vector3(x, y, 0);
      const xAxis = new THREE.Vector3(x, 0, 0);
      const yAxis = new THREE.Vector3(0, y, 0);

      // Vertical line from (x,y,z) to (x,y,0)
      this.linePositions.push(point.position.clone(), base.clone());

      // Line from (x,y,0) to (x,0,0)
      this.linePositions.push(base.clone(), xAxis.clone());

      // Line from (x,y,0) to (0,y,0)
      this.linePositions.push(base.clone(), yAxis.clone());
    }

    // Add user-defined lines
    for (const line of this.lines) {
      const start = this.pointPositions[line.startIndex];
      const end = this.pointPositions[line.endIndex];
      this.linePositions.push(start.clone(), end.clone());
    }

    if (this.linePositions.length === 0) {
      this.lineGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(0), 3),
      );
      return;
    }
    const array = new Float32Array(this.linePositions.length * 3);
    this.linePositions.forEach((p, i) => {
      array[i * 3 + 0] = p.x;
      array[i * 3 + 1] = p.y;
      array[i * 3 + 2] = p.z;
    });
    this.lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(array, 3),
    );
    this.lineGeometry.attributes.position.needsUpdate = true;
    this.lineGeometry.computeBoundingSphere();
  }

  resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public update(): void {
    this.updatePointsGeometry();
    this.updateLinesGeometry();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
