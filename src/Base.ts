import { Axis } from "./Axis";
import { Constant } from "./math/constant";
import { Cos } from "./math/cos";
import type { IMathObject } from "./math/math-object";
import { Sin } from "./math/sin";
import { Matrix } from "./Matrix";
import { Vector } from "./Vector";

type Params = {
    base: Base;
    axis: (typeof Axis)[keyof typeof Axis];
    angle: IMathObject;
};

export class Base {
    public axis?: (typeof Axis)[keyof typeof Axis];
    public angle?: IMathObject;
    public base?: Base;

    constructor(params?: Params) {
        if (!params) return;
        const { base, axis, angle } = params;

        this.axis = axis;
        this.base = base;
        this.angle = angle;
    }

    convertVector(vector: Vector): Vector {
        if (
            this.axis === undefined ||
            this.angle === undefined ||
            this.base === undefined
        )
            return vector;

        let outVector: Vector;

        let matrix: Matrix;

        const cos = new Cos(this.angle);
        const sin = new Sin(this.angle);

        const one = new Constant(1);
        const zero = new Constant(0);
        const minusOne = new Constant(-1);

        switch (this.axis) {
            case Axis.X:
                matrix = new Matrix([
                    [one, zero, zero],
                    [zero, cos, sin.mul(minusOne)],
                    [zero, sin, cos],
                ]);
                break;
            case Axis.Y:
                matrix = new Matrix([
                    [cos, zero, sin],
                    [zero, one, zero],
                    [sin.mul(minusOne), zero, cos],
                ]);
                break;
            case Axis.Z:
                matrix = new Matrix([
                    [cos, sin.mul(minusOne), zero],
                    [sin, cos, zero],
                    [zero, zero, one],
                ]);
                break;
            default:
                return vector;
        }
        outVector = matrix.multipyWithVector(vector);
        return this.base.convertVector(outVector);
    }
}
