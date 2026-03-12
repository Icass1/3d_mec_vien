import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";
import { Mul } from "./mul";
import { Add } from "./add";
import { Divide } from "./divide";
import { Substract } from "./substract";

export class Sin implements IMathObject {
    private _value: IMathObject;
    constructor(value: IMathObject) {
        this._value = value;
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
        return `sin(${this._value.expression(visited1)})`;
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const visited1 = new Set(visited);
        return Math.sin(this._value.compute(context, visited1));
    }
}
