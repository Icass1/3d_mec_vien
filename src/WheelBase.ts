import { Constant } from "./math/constant";
import { Cos } from "./math/cos";
import type { IMathObject } from "./math/math-object";
import { Sin } from "./math/sin";
import { Variable } from "./math/variable";
import { Matrix } from "./Matrix";
import { Vector } from "./Vector";

export class WheelBase {
    public readonly position: Vector;
    public readonly barDirection: Vector;
    public readonly radius: IMathObject;
    public readonly t: Variable;

    private _barAngle: IMathObject;
    private _rotationAngle: IMathObject;

    constructor(
        barAngle: IMathObject,
        radius: IMathObject,
        t: Variable
    ) {
        this._barAngle = barAngle;
        this.radius = radius;
        this.t = t;

        this._rotationAngle = this.computeRotationAngle();
        
        this.position = new Vector(
            new Cos(barAngle).mul(radius.mul(new Constant(-1))),
            new Sin(barAngle).mul(radius.mul(new Constant(-1))),
            new Constant(0)
        );

        this.barDirection = new Vector(
            new Cos(barAngle),
            new Sin(barAngle),
            new Constant(0)
        );
    }

    private computeRotationAngle(): IMathObject {
        const arcLength = this.t;
        const rotationAngle = arcLength.divide(this.radius);
        return rotationAngle;
    }

    get rotationAngle(): IMathObject {
        return this._rotationAngle;
    }

    getPerpendicularAxis(): Vector {
        const cosBar = new Cos(this._barAngle);
        const sinBar = new Sin(this._barAngle);
        return new Vector(
            sinBar.mul(new Constant(-1)),
            cosBar,
            new Constant(0)
        );
    }

    convertVector(vector: Vector): Vector {
        const cosBar = new Cos(this._barAngle);
        const sinBar = new Sin(this._barAngle);

        const matrix = new Matrix([
            [cosBar, sinBar.mul(new Constant(-1)), new Constant(0)],
            [sinBar, cosBar, new Constant(0)],
            [new Constant(0), new Constant(0), new Constant(1)],
        ]);

        return matrix.multipyWithVector(vector);
    }

    getContactPoint(): Vector {
        return this.position;
    }

    getCenter(barPosition: Vector): Vector {
        return new Vector(
            barPosition.x.add(this.position.x),
            barPosition.y.add(this.position.y),
            barPosition.z.add(this.position.z)
        );
    }
}
