import type { IMathObject } from "./math-object";
import type { ContextType } from "./contextType";
import { Mul } from "./mul";
import { Add } from "./add";
import { Divide } from "./divide";
import { Substract } from "./substract";
import { Variable } from "./variable";
import { Constant } from "./constant";
import { Sin } from "./sin";
import { Cos } from "./cos";
import { Sqrt } from "./sqrt";

export class Derivative implements IMathObject {
    private _expr: IMathObject;
    private _variable: Variable;

    constructor(expr: IMathObject, variable: Variable) {
        this._expr = expr;
        this._variable = variable;
    }

    mul(value: IMathObject): Mul {
        return new Mul(this, value);
    }

    add(value: IMathObject): Add {
        return new Add(this, value);
    }

    divide(value: IMathObject): Divide {
        return new Divide(this, value);
    }

    substract(value: IMathObject): Substract {
        return new Substract(this, value);
    }

    private differentiate(expr: IMathObject, varName: string): IMathObject {
        if (expr instanceof Variable) {
            if (expr["_name"] === varName) {
                return new Constant(1);
            }
            return new Constant(0);
        }

        if (expr instanceof Constant) {
            return new Constant(0);
        }

        if (expr instanceof Add) {
            const values = (expr as any)._values as IMathObject[];
            const derivatives = values.map(v => this.differentiate(v, varName));
            return new Add(...derivatives);
        }

        if (expr instanceof Substract) {
            const left = (expr as any)._left as IMathObject;
            const right = (expr as any)._right as IMathObject;
            return new Substract(
                this.differentiate(left, varName),
                this.differentiate(right, varName)
            );
        }

        if (expr instanceof Mul) {
            const left = (expr as any)._left as IMathObject;
            const right = (expr as any)._right as IMathObject;
            return new Add(
                new Mul(this.differentiate(left, varName), right),
                new Mul(left, this.differentiate(right, varName))
            );
        }

        if (expr instanceof Divide) {
            const left = (expr as any)._left as IMathObject;
            const right = (expr as any)._right as IMathObject;
            const numerator = new Substract(
                new Mul(this.differentiate(left, varName), right),
                new Mul(left, this.differentiate(right, varName))
            );
            const denominator = new Mul(right, right);
            return new Divide(numerator, denominator);
        }

        if (expr instanceof Sin) {
            const inner = (expr as any)._value as IMathObject;
            return new Mul(
                new Cos(inner),
                this.differentiate(inner, varName)
            );
        }

        if (expr instanceof Cos) {
            const inner = (expr as any)._value as IMathObject;
            return new Mul(
                new Mul(new Constant(-1), new Sin(inner)),
                this.differentiate(inner, varName)
            );
        }

        if (expr instanceof Sqrt) {
            const inner = (expr as any)._value as IMathObject;
            return new Divide(
                this.differentiate(inner, varName),
                new Mul(new Constant(2), new Sqrt(inner))
            );
        }

        throw `Cannot differentiate ${expr.constructor.name}`;
    }

    expression(latex: boolean, visited: Set<IMathObject> = new Set()): string {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const diffExpr = this.differentiate(this._expr, (this._variable as any)._name);
        return diffExpr.expression(latex, visited);
    }

    compute(context: ContextType, visited: Set<IMathObject> = new Set()): number {
        if (visited.has(this)) throw `<${this.constructor.name} cycle>`;
        visited.add(this);

        const diffExpr = this.differentiate(this._expr, (this._variable as any)._name);
        return diffExpr.compute(context, visited);
    }

    getDerivativeExpression(): IMathObject {
        return this.differentiate(this._expr, (this._variable as any)._name);
    }
}
