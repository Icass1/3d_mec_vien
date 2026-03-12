import type { Point } from "./Point";

export class Line {
    public readonly startPoint: Point;
    public readonly endPoint: Point;

    public name: string;

    constructor(startPoint: Point, endPoint: Point) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.name = "";
    }
}
