import * as THREE from 'three';

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface LineData {
  start: Point3D;
  end: Point3D;
  color?: THREE.Color;
}

export interface AxisConfig {
  size: number;
  colors: {
    x: THREE.Color;
    y: THREE.Color;
    z: THREE.Color;
  };
  labels: {
    x: string;
    y: string;
    z: string;
  };
}