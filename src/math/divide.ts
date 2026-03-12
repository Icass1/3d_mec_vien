import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";
import { Add } from "./add";
import { Mul } from "./mul";
import { Substract } from "./substract";

export class Divide implements IMathObject {
    private _value1: IMathObject;
    private _value2: IMathObject;

    constructor(value1: IMathObject, value2: IMathObject) {
        this._value1 = value1;
        this._value2 = value2;
    }

    mul(value: IMathObject) {
        return new Mul(this, value);
    }

    add(value: IMathObject) {
        return new Add(this, value);
    }

    divide(value: IMathObject) {
        return new Divide(this, value);
    }

    substract(value: IMathObject) {
        return new Substract(this, value);
    }

    expression(visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const visited1 = new Set(visited);
        const visited2 = new Set(visited);
        return `${this._value1.expression(visited1)}/${this._value2.expression(visited2)}`;
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const visited1 = new Set(visited);
        const visited2 = new Set(visited);
        return this._value1.compute(context, visited1) / this._value2.compute(context, visited2);
    }
}
