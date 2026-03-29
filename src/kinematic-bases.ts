import { Axis } from "./Axis";
import { Constant } from "./math/constant";
import { Cos } from "./math/cos";
import type { IMathObject } from "./math/math-object";
import { Sin } from "./math/sin";
import { Matrix } from "./Matrix";
import { Vector } from "./Vector";

export type AxisType = typeof Axis.X | typeof Axis.Y | typeof Axis.Z;

export class KinematicBase {
    public readonly position: Vector;
    public readonly rotationMatrix: Matrix;
    public readonly axis: AxisType;
    public readonly angle: IMathObject;
    public readonly parent: KinematicBase | null;

    constructor(
        axis: AxisType,
        angle: IMathObject,
        parent: KinematicBase | null = null,
        position: Vector = new Vector(new Constant(0), new Constant(0), new Constant(0))
    ) {
        this.axis = axis;
        this.angle = angle;
        this.parent = parent;
        this.position = position;
        this.rotationMatrix = this.computeRotationMatrix();
    }

    private computeRotationMatrix(): Matrix {
        const cos = new Cos(this.angle);
        const sin = new Sin(this.angle);
        const one = new Constant(1);
        const zero = new Constant(0);
        const minusOne = new Constant(-1);

        switch (this.axis) {
            case Axis.X:
                return new Matrix([
                    [one, zero, zero],
                    [zero, cos, sin.mul(minusOne)],
                    [zero, sin, cos],
                ]);
            case Axis.Y:
                return new Matrix([
                    [cos, zero, sin],
                    [zero, one, zero],
                    [sin.mul(minusOne), zero, cos],
                ]);
            case Axis.Z:
                return new Matrix([
                    [cos, sin.mul(minusOne), zero],
                    [sin, cos, zero],
                    [zero, zero, one],
                ]);
            default:
                return new Matrix([
                    [one, zero, zero],
                    [zero, one, zero],
                    [zero, zero, one],
                ]);
        }
    }

    convertVector(vector: Vector): Vector {
        const rotated = this.rotationMatrix.multipyWithVector(vector);
        
        if (this.parent) {
            const parentRotated = this.parent.convertVector(rotated);
            return new Vector(
                parentRotated.x.add(this.position.x),
                parentRotated.y.add(this.position.y),
                parentRotated.z.add(this.position.z)
            );
        }
        
        return new Vector(
            rotated.x.add(this.position.x),
            rotated.y.add(this.position.y),
            rotated.z.add(this.position.z)
        );
    }

    getGlobalRotationMatrix(): Matrix {
        if (this.parent) {
            return this.parent.getGlobalRotationMatrix().multiply(this.rotationMatrix);
        }
        return this.rotationMatrix;
    }

    getGlobalPosition(): Vector {
        if (this.parent) {
            const parentPos = this.parent.getGlobalPosition();
            const rotated = this.getGlobalRotationMatrix().multipyWithVector(this.position);
            return new Vector(
                parentPos.x.add(rotated.x),
                parentPos.y.add(rotated.y),
                parentPos.z.add(rotated.z)
            );
        }
        return this.position;
    }
}

export class FloorBase extends KinematicBase {
    constructor() {
        super(Axis.Z, new Constant(0), null, new Vector(new Constant(0), new Constant(0), new Constant(0)));
    }
}

export class BarBase extends KinematicBase {
    public readonly barAngle: IMathObject;
    public readonly barDirection: Vector;

    constructor(parent: KinematicBase, barAngle: IMathObject) {
        super(Axis.Z, barAngle, parent);
        this.barAngle = barAngle;
        this.barDirection = new Vector(
            new Cos(barAngle),
            new Sin(barAngle),
            new Constant(0)
        );
    }

    getBarEnd(radius: IMathObject): Vector {
        return this.convertVector(new Vector(radius, new Constant(0), new Constant(0)));
    }
}

export class WheelBase2 extends KinematicBase {
    public readonly wheelAngle: IMathObject;
    public readonly radius: IMathObject;
    public readonly rotationAxis: AxisType;

    constructor(
        parent: KinematicBase,
        wheelAngle: IMathObject,
        radius: IMathObject,
        rotationAxis: AxisType = Axis.Y as AxisType
    ) {
        super(rotationAxis, wheelAngle, parent, new Vector(radius.mul(new Constant(-1)), new Constant(0), new Constant(0)));
        this.wheelAngle = wheelAngle;
        this.radius = radius;
        this.rotationAxis = rotationAxis;
    }

    getContactPoint(): Vector {
        return this.getGlobalPosition();
    }

    getWheelPoints(wheelRadius: IMathObject): { center: Vector; points: Vector[] } {
        const center = this.getGlobalPosition();
        
        const localX = new Vector(wheelRadius, new Constant(0), new Constant(0));
        const localY = new Vector(new Constant(0), wheelRadius, new Constant(0));
        const localZ = new Vector(new Constant(0), new Constant(0), wheelRadius);
        const localNegX = new Vector(wheelRadius.mul(new Constant(-1)), new Constant(0), new Constant(0));
        const localNegY = new Vector(new Constant(0), wheelRadius.mul(new Constant(-1)), new Constant(0));
        const localNegZ = new Vector(new Constant(0), new Constant(0), wheelRadius.mul(new Constant(-1)));

        return {
            center,
            points: [
                this.convertVector(localX),
                this.convertVector(localNegX),
                this.convertVector(localY),
                this.convertVector(localNegY),
                this.convertVector(localZ),
                this.convertVector(localNegZ),
            ]
        };
    }
}
