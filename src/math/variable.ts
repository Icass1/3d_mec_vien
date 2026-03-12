import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";
import { Mul } from "./mul";
import { Add } from "./add";
import { Divide } from "./divide";
import { Substract } from "./substract";

export class Variable implements IMathObject {
    private _name: string;
    static variables: string[] = [];

    constructor(name: string) {
        this._name = name;
        Variable.variables.push(name);
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

        if (!latex) {
            return this._name;
        }

        // Convert trailing digits to LaTeX subscript
        // e.g. "a23" -> "a_{23}"
        const match = this._name.match(/^([a-zA-Z]+)(\d+)$/);

        if (match) {
            const [, base, digits] = match;
            return `${base}_{${digits}}`;
        }

        // Otherwise return as-is
        return this._name;
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()) {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);
        if (context[this._name] === undefined)
            throw `'${this._name} is not defined in context.'`;

        return context[this._name];
    }
}
