import { Vector } from "./Vector";

export class Matrix {
  matrix: number[][];

  constructor(matrix: number[][]) {
    if (matrix.length != 3) throw "Matrix should be 3x3";

    matrix.forEach((row) => {
      if (row.length != 3) throw "Matrix should be 3x3";
    });

    this.matrix = matrix;
  }

  multipyWithVector(vector: Vector): Vector {
    return new Vector(
      this.matrix[0][0] * vector.x +
        this.matrix[0][1] * vector.y +
        this.matrix[0][2] * vector.z,
      this.matrix[1][0] * vector.x +
        this.matrix[1][1] * vector.y +
        this.matrix[1][2] * vector.z,
      this.matrix[2][0] * vector.x +
        this.matrix[2][1] * vector.y +
        this.matrix[2][2] * vector.z,
    );
  }
}
