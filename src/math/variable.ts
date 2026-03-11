import type { IMathObject } from "./math-object";
import { Mul } from "./mul";

export class Variable implements IMathObject {
    private _name: string;
    constructor(name: string) {
        this._name = name;
    }

    mul(value: IMathObject) {
        return new Mul(this, value);
    }

    compute(context: { [key: string]: number }) {
        return context[this._name];
    }
}
