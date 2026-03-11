import type { Mul } from "./mul";

export interface IMathObject {
    mul: (value: IMathObject) => Mul;

    compute: (context: { [key: string]: number }) => number;
}
