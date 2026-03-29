import { Constant } from "./math/constant";
import { Cos } from "./math/cos";
import { Sin } from "./math/sin";
import type { IMathObject } from "./math/math-object";

export class BarBase {
    public readonly x: IMathObject;
    public readonly y: IMathObject;
    public readonly angle: IMathObject;
    public readonly length: number;

    constructor(
        x: IMathObject,
        y: IMathObject,
        angle: IMathObject,
        length: number = 1
    ) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
    }

    getWheel1Position(): { x: IMathObject; y: IMathObject; z: IMathObject } {
        const cosAngle = new Cos(this.angle);
        const sinAngle = new Sin(this.angle);
        const halfLength = new Constant(this.length / 2);
        
        return {
            x: this.x.add(cosAngle.mul(halfLength)),
            y: this.y.add(sinAngle.mul(halfLength)),
            z: new Constant(0),
        };
    }

    getWheel2Position(): { x: IMathObject; y: IMathObject; z: IMathObject } {
        const cosAngle = new Cos(this.angle);
        const sinAngle = new Sin(this.angle);
        const halfLength = new Constant(this.length / 2);
        
        return {
            x: this.x.substract(cosAngle.mul(halfLength)),
            y: this.y.substract(sinAngle.mul(halfLength)),
            z: new Constant(0),
        };
    }
}
