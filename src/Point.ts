import * as THREE from 'three';
import { Point3D } from './types';

export class Point extends THREE.Mesh {
  constructor(position: Point3D, color: THREE.Color = new THREE.Color(0xff0000), size: number = 0.1) {
    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    super(geometry, material);
    this.position.set(position.x, position.y, position.z);
  }

  updatePosition(newPosition: Point3D): void {
    this.position.set(newPosition.x, newPosition.y, newPosition.z);
  }

  getPosition(): Point3D {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z
    };
  }
}