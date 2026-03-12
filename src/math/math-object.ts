import type { Add } from "./add";
import type { Divide } from "./divide";
import type { Mul } from "./mul";
import type { Substract } from "./substract";
import type { ContextType } from "./contextType";

export interface IMathObject {
    mul: (value: IMathObject) => Mul;
    add: (value: IMathObject) => Add;
    substract: (value: IMathObject) => Substract;
    divide: (value: IMathObject) => Divide;
    expression: (visited?: Set<IMathObject>) => string;
    compute: (context: ContextType, visited?: Set<IMathObject>) => number;
}
