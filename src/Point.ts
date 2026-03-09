import * as THREE from "three";

export class Point {
    public readonly position: THREE.Vector3;
    public color: string;
    public name: string;
    public readonly index: number;

    constructor(
        position: THREE.Vector3,
        color: string,
        name: string,
        index: number
    ) {
        this.position = position;
        this.color = color;
        this.name = name;
        this.index = index;
    }
}
