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
}
