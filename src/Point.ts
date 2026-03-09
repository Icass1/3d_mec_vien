import type { Vector } from "./Vector";

export class Point {
    public readonly position: Vector;
    public color: string;
    public name: string;
    public readonly index: number;

    constructor(position: Vector, color: string, name: string, index: number) {
        this.position = position;
        this.color = color;
        this.name = name;
        this.index = index;
    }
}
