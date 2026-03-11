import type { Point } from "./Point";

export class Line {
    public readonly startIndex: number;
    public readonly endIndex: number;

    constructor(startPoint: Point, endPoint: Point) {
        this.startIndex = startPoint.index;
        this.endIndex = endPoint.index;
    }
}
