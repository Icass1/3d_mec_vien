import * as THREE from "three";
import { AxisHelper } from "./AxisHelper";
import { Point } from "./Point";
import { Line } from "./Line";
import { Point3D, AxisConfig } from "./types";

class SceneManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private axisHelper!: AxisHelper;
  private points: Point[] = [];
  private lines: Line[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupLighting();
    this.addAxisHelper();
    this.addExamplePointsAndLines();

    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.animate();
  }

  private setupCamera(): void {
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
  }

  private addAxisHelper(): void {
    const axisConfig: AxisConfig = {
      size: 5,
      colors: {
        x: new THREE.Color(0xff0000),
        y: new THREE.Color(0x00ff00),
        z: new THREE.Color(0x0000ff),
      },
      labels: {
        x: "X",
        y: "Y",
        z: "Z",
      },
    };
    this.axisHelper = new AxisHelper(axisConfig);
    this.scene.add(this.axisHelper);
  }

  private addExamplePointsAndLines(): void {
    // Add some example points
    const point1 = new Point({ x: 1, y: 1, z: 1 }, new THREE.Color(0xff0000));
    const point2 = new Point({ x: -1, y: 2, z: 0 }, new THREE.Color(0x00ff00));
    const point3 = new Point({ x: 0, y: -1, z: 2 }, new THREE.Color(0x0000ff));

    this.points.push(point1, point2, point3);
    this.scene.add(point1, point2, point3);

    // Add lines between points
    const line1 = new Line({
      start: point1.getPosition(),
      end: point2.getPosition(),
      color: new THREE.Color(0xffff00),
    });
    const line2 = new Line({
      start: point2.getPosition(),
      end: point3.getPosition(),
      color: new THREE.Color(0xff00ff),
    });
    const line3 = new Line({
      start: point3.getPosition(),
      end: point1.getPosition(),
      color: new THREE.Color(0x00ffff),
    });

    this.lines.push(line1, line2, line3);
    this.scene.add(line1, line2, line3);
  }

  public addPoint(position: Point3D, color?: THREE.Color): Point {
    const point = new Point(position, color);
    this.points.push(point);
    this.scene.add(point);
    return point;
  }

  public addLine(start: Point3D, end: Point3D, color?: THREE.Color): Line {
    const line = new Line({ start, end, color });
    this.lines.push(line);
    this.scene.add(line);
    return line;
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize the scene
const sceneManager = new SceneManager();

// Example usage: Add more points and lines
sceneManager.addPoint({ x: 2, y: 0, z: 1 }, new THREE.Color(0xffa500));
sceneManager.addLine(
  { x: 2, y: 0, z: 1 },
  { x: 0, y: 2, z: 0 },
  new THREE.Color(0x800080),
);
