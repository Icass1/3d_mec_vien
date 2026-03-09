import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Point } from "./Point";
import { Vector } from "./Vector";
import { VectorPanel } from "./VectorPanel";
import type { Line } from "./Line";

const COLORS = ["blue", "red", "green", "yellow", "orange", "white"];

export class GeometryViewer {
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly renderer: THREE.WebGLRenderer;
    private readonly controls: OrbitControls;
    private readonly points: Point[] = [];
    private readonly lines: Line[] = [];
    private readonly vectorPanel: VectorPanel;

    private readonly pointMeshes: THREE.Mesh[] = [];
    private readonly lineMeshes: THREE.Mesh[] = [];
    private readonly guideLineMeshes: THREE.Mesh[] = [];
    private readonly arrowHelpers: THREE.ArrowHelper[] = [];

    private readonly pointPositions: THREE.Vector3[] = [];

    private readonly LINE_DIAMETER = 0.04;
    private readonly POINT_DIAMETER = 0.12;

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        this.camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(6, 6, 6);
        this.camera.up.set(0, 0, 1);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        this.vectorPanel = new VectorPanel(container);

        this.setupLights();
        this.setupHelpers();

        this.resize();
        this.update();
    }

    private setupLights(): void {
        const ambient = new THREE.AmbientLight(0x404060, 0.6);
        this.scene.add(ambient);

        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(8, 8, 12);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);

        const fillLight = new THREE.DirectionalLight(0x6080ff, 0.4);
        fillLight.position.set(-5, -5, 5);
        this.scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xff8060, 0.3);
        rimLight.position.set(0, -8, 3);
        this.scene.add(rimLight);
    }

    private setupHelpers(): void {
        const gridHelper = new THREE.GridHelper(10, 20, 0x444466, 0x333355);
        (gridHelper as THREE.GridHelper).rotation.x = Math.PI / 2;
        gridHelper.position.z = -0.01;
        this.scene.add(gridHelper);

        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    private createCylinderBetweenPoints(
        start: THREE.Vector3,
        end: THREE.Vector3,
        diameter: number,
        color: number
    ): THREE.Mesh {
        const direction = new THREE.Vector3().subVectors(end, start);
        const length = direction.length();

        if (length < 0.0001) {
            const geometry = new THREE.SphereGeometry(diameter / 2, 16, 16);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.6,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.copy(start);
            return mesh;
        }

        const geometry = new THREE.CylinderGeometry(
            diameter / 2,
            diameter / 2,
            length,
            12
        );
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.6,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);

        const midpoint = new THREE.Vector3()
            .addVectors(start, end)
            .multiplyScalar(0.5);
        mesh.position.copy(midpoint);

        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            axis,
            direction.normalize()
        );
        mesh.quaternion.copy(quaternion);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    private createPointMesh(
        position: THREE.Vector3,
        color: THREE.Color
    ): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(
            this.POINT_DIAMETER / 2,
            24,
            24
        );
        const material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.2,
            metalness: 0.8,
            emissive: color,
            emissiveIntensity: 0.2,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    addPoint(x: number, y: number, z: number, name: string): Point {
        const position = new THREE.Vector3(x, y, z);
        const index = this.points.length;
        const point = new Point(position, COLORS[index], name, index);
        this.points.push(point);
        this.pointPositions.push(position);

        const pointMesh = this.createPointMesh(
            position,
            new THREE.Color(point.color)
        );
        this.pointMeshes.push(pointMesh);
        this.scene.add(pointMesh);

        this.updateLinesGeometry();
        return point;
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

    addArrow(
        origin: THREE.Vector3,
        direction: THREE.Vector3,
        color: string
    ): THREE.ArrowHelper {
        const dir = direction.clone().normalize();
        const length = direction.length();
        const hex = new THREE.Color(color).getHex();

        const arrowHelper = new THREE.ArrowHelper(
            dir,
            origin,
            length,
            hex,
            length * 0.15,
            length * 0.1
        );
        this.arrowHelpers.push(arrowHelper);
        this.scene.add(arrowHelper);

        return arrowHelper;
    }

    updateArrow(
        arrowHelper: THREE.ArrowHelper,
        origin: THREE.Vector3,
        direction: THREE.Vector3
    ): void {
        const dir = direction.clone().normalize();
        const length = direction.length();

        arrowHelper.setDirection(dir);
        arrowHelper.setLength(length, length * 0.15, length * 0.1);
        arrowHelper.position.copy(origin);
    }

    clearArrows(): void {
        for (const arrow of this.arrowHelpers) {
            this.scene.remove(arrow);
        }
        this.arrowHelpers.length = 0;
    }

    private updatePointsGeometry(): void {
        for (let i = 0; i < this.points.length; i++) {
            this.pointMeshes[i].position.copy(this.points[i].position);
        }
    }

    private updateLinesGeometry(): void {
        for (const mesh of this.guideLineMeshes) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        }
        this.guideLineMeshes.length = 0;

        for (const mesh of this.lineMeshes) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            (mesh.material as THREE.Material).dispose();
        }
        this.lineMeshes.length = 0;

        for (const point of this.points) {
            const x = point.position.x;
            const y = point.position.y;

            const base = new THREE.Vector3(x, y, 0);
            const xAxis = new THREE.Vector3(x, 0, 0);
            const yAxis = new THREE.Vector3(0, y, 0);

            const guideLine = this.createCylinderBetweenPoints(
                point.position,
                base,
                this.LINE_DIAMETER * 0.5,
                0x555577
            );
            this.guideLineMeshes.push(guideLine);
            this.scene.add(guideLine);

            const guideLine2 = this.createCylinderBetweenPoints(
                base,
                xAxis,
                this.LINE_DIAMETER * 0.5,
                0x555577
            );
            this.guideLineMeshes.push(guideLine2);
            this.scene.add(guideLine2);

            const guideLine3 = this.createCylinderBetweenPoints(
                base,
                yAxis,
                this.LINE_DIAMETER * 0.5,
                0x555577
            );
            this.guideLineMeshes.push(guideLine3);
            this.scene.add(guideLine3);
        }

        for (const line of this.lines) {
            const start = this.pointPositions[line.startIndex];
            const end = this.pointPositions[line.endIndex];

            const lineMesh = this.createCylinderBetweenPoints(
                start,
                end,
                this.LINE_DIAMETER,
                0x66ccff
            );
            this.lineMeshes.push(lineMesh);
            this.scene.add(lineMesh);
        }
    }

    resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    public setCameraLookAt(
        target: Vector | THREE.Vector3,
        direction: Vector | THREE.Vector3,
        distance: number
    ): void {
        const _direction = new Vector(direction.x, direction.y, direction.z);
        const _target = new Vector(target.x, target.y, target.z);

        const normalizedDirection = _direction.normalize();
        const cameraPosition = _target.add(normalizedDirection.scale(distance));
        this.camera.position.set(
            cameraPosition.x,
            cameraPosition.y,
            cameraPosition.z
        );
        this.camera.lookAt(_target.x, _target.y, _target.z);
        this.controls.target.set(_target.x, _target.y, _target.z);
    }

    public getVectorPanel(): VectorPanel {
        return this.vectorPanel;
    }

    public update(): void {
        this.updatePointsGeometry();
        this.updateLinesGeometry();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
