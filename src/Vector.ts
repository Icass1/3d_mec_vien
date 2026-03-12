import type { IMathObject } from "./math/math-object";
import { Constant } from "./math/constant";
import { Add } from "./math/add";
import { Sqrt } from "./math/sqrt";
import type { ContextType } from "./math/contextType";
import * as THREE from "three";

export class Vector {
    x: IMathObject;
    y: IMathObject;
    z: IMathObject;

    constructor(x: IMathObject, y: IMathObject, z: IMathObject) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(other: Vector): Vector {
        return new Vector(
            this.x.add(other.x),
            this.y.add(other.y),
            this.z.add(other.z)
        );
    }

    addModify(other: Vector): void {
        this.x = this.x.add(other.x);
        this.y = this.y.add(other.y);
        this.z = this.z.add(other.z);
    }

    subtract(other: Vector): Vector {
        return new Vector(
            this.x.substract(other.x),
            this.y.substract(other.y),
            this.z.substract(other.z)
        );
    }

    scale(scalar: IMathObject): Vector {
        return new Vector(
            this.x.mul(scalar),
            this.y.mul(scalar),
            this.z.mul(scalar)
        );
    }

    dot(other: Vector): IMathObject {
        return new Add(
            this.x.mul(other.x),
            this.y.mul(other.y),
            this.z.mul(other.z)
        );
    }

    set(x: IMathObject, y: IMathObject, z: IMathObject) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    cross(other: Vector): Vector {
        return new Vector(
            this.y.mul(other.z).substract(this.z.mul(other.y)),
            this.z.mul(other.x).substract(this.x.mul(other.z)),
            this.x.mul(other.y).substract(this.y.mul(other.x))
        );
    }

    length(): IMathObject {
        return new Sqrt(
            new Add(this.x.mul(this.x), this.y.mul(this.y), this.z.mul(this.z))
        );
    }

    normalize(): Vector {
        const len = this.length();
        return this.scale(new Constant(1).divide(len));
    }

    computeToVector3(context: ContextType, visited: Set<IMathObject> = new Set()) {
        return new THREE.Vector3(
            this.x.compute(context, new Set(visited)),
            this.y.compute(context, new Set(visited)),
            this.z.compute(context, new Set(visited))
        );
    }
}
