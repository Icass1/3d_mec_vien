import * as THREE from 'three';
import { LineData, Point3D } from './types';

export class Line extends THREE.Line {
  private startPoint: Point3D;
  private endPoint: Point3D;

  constructor(data: LineData) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(data.start.x, data.start.y, data.start.z),
      new THREE.Vector3(data.end.x, data.end.y, data.end.z)
    ]);
    const material = new THREE.LineBasicMaterial({ color: data.color || new THREE.Color(0x0000ff) });
    super(geometry, material);
    this.startPoint = data.start;
    this.endPoint = data.end;
  }

  updatePoints(start: Point3D, end: Point3D): void {
    this.startPoint = start;
    this.endPoint = end;
    const positions = new Float32Array([
      start.x, start.y, start.z,
      end.x, end.y, end.z
    ]);
    (this.geometry as THREE.BufferGeometry).setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.attributes.position.needsUpdate = true;
  }

  getStartPoint(): Point3D {
    return this.startPoint;
  }

  getEndPoint(): Point3D {
    return this.endPoint;
  }
}