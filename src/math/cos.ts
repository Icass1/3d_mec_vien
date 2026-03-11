import type { IMathObject } from "./math-object";
import { Mul } from "./mul";

export class Cos implements IMathObject {
    private _value: IMathObject;
    constructor(value: IMathObject) {
        this._value = value;
    }

    mul(value: IMathObject) {
        return new Mul(this, value);
    }

    compute(context: { [key: string]: number }) {
        return Math.cos(this._value.compute(context));
    }
}
