import type { IMathObject } from "./math-object";

export class Mul implements IMathObject {
    private _value1: IMathObject;
    private _value2: IMathObject;

    constructor(value1: IMathObject, value2: IMathObject) {
        this._value1 = value1;
        this._value2 = value2;
    }

    mul(value: IMathObject) {
        return new Mul(this, value);
    }

    compute(context: { [key: string]: number }) {
        return this._value1.compute(context) * this._value2.compute(context);
    }
}
