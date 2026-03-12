import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";
import { Add } from "./add";
import { Divide } from "./divide";
import { Substract } from "./substract";

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

    add(value: IMathObject) {
        return new Add(this, value);
    }

    divide(value: IMathObject) {
        return new Divide(this, value);
    }

    substract(value: IMathObject) {
        return new Substract(this, value);
    }

    expression(latex: boolean, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const visited1 = new Set(visited);
        const visited2 = new Set(visited);
        const expressionValue1 = this._value1.expression(latex, visited1);
        const expressionValue2 = this._value2.expression(latex, visited2);

        if (
            expressionValue1 === "0" ||
            expressionValue2 === "0" ||
            expressionValue1 === "(0)" ||
            expressionValue2 === "(0)"
        )
            return "0";
        if (latex) return `${expressionValue1}\\cdot(${expressionValue2})`;
        else return `${expressionValue1}*${expressionValue2}`;
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const visited1 = new Set(visited);
        const visited2 = new Set(visited);
        return (
            this._value1.compute(context, visited1) *
            this._value2.compute(context, visited2)
        );
    }
}
