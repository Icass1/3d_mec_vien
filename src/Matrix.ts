import { Add } from "./math/add";
import type { IMathObject } from "./math/math-object";
import { Vector } from "./Vector";

export class Matrix {
    matrix: IMathObject[][];

    constructor(matrix: IMathObject[][]) {
        if (matrix.length != 3) throw "Matrix should be 3x3";

        matrix.forEach((row) => {
            if (row.length != 3) throw "Matrix should be 3x3";
        });

        this.matrix = matrix;
    }

    multipyWithVector(vector: Vector): Vector {
        return new Vector(
            new Add(
                this.matrix[0][0].mul(vector.x),
                this.matrix[0][1].mul(vector.y),
                this.matrix[0][2].mul(vector.z)
            ),
            new Add(
                this.matrix[1][0].mul(vector.x),
                this.matrix[1][1].mul(vector.y),
                this.matrix[1][2].mul(vector.z)
            ),
            new Add(
                this.matrix[2][0].mul(vector.x),
                this.matrix[2][1].mul(vector.y),
                this.matrix[2][2].mul(vector.z)
            )
        );
    }

    multiply(other: Matrix): Matrix {
        const result: IMathObject[][] = [];
        for (let i = 0; i < 3; i++) {
            result[i] = [];
            for (let j = 0; j < 3; j++) {
                const term1 = this.matrix[i][0].mul(other.matrix[0][j]);
                const term2 = this.matrix[i][1].mul(other.matrix[1][j]);
                const term3 = this.matrix[i][2].mul(other.matrix[2][j]);
                const sum = term1.add(term2).add(term3);
                result[i][j] = sum;
            }
        }
        return new Matrix(result);
    }
}
