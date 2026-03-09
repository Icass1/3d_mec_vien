import * as THREE from "three";

export class Point {
    public readonly position: THREE.Vector3;
    public readonly index: number;

    constructor(position: THREE.Vector3, index: number) {
        this.position = position;
        this.index = index;
    }
}
