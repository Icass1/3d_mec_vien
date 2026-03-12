import type { ContextType } from "./contextType";
import { Divide } from "./divide";
import type { IMathObject } from "./math-object";
import { Mul } from "./mul";
import { Substract } from "./substract";

export class Add implements IMathObject {
    private _values: IMathObject[];
    constructor(...values: IMathObject[]) {
        this._values = values;
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

        return (
            this._values
                .filter((value) => {
                    const v = new Set(visited);
                    const expr = value.expression(latex, v);
                    return expr !== "0" && expr !== "(0)";
                })
                .map((value) => {
                    const v = new Set(visited);
                    return value.expression(latex, v);
                })
                .join("+") || "0"
        );
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        let sum = 0;
        this._values.forEach((value) => {
            const v = new Set(visited);
            sum += value.compute(context, v);
        });
        return sum;
    }
}
