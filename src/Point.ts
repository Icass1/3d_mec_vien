import { COLORS } from "./constants";
import { Constant } from "./math/constant";
import { Vector } from "./Vector";

export class Point {
    public readonly position: Vector;
    public color: string;
    public name: string;

    constructor(position: Vector, color: string) {
        this.position = position;
        this.color = color;
        this.name = "";
    }

    static newPoint(): Point {
        return new Point(
            new Vector(new Constant(0), new Constant(0), new Constant(0)),
            COLORS[0]
        );
    }
}
