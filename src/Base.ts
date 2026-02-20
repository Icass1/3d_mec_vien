import { Axis } from "./Axis";
import { Matrix } from "./Matrix";
import { Vector } from "./Vector";

type Params = {
  base: Base;
  axis: Axis;
  angle: number;
};

export class Base {
  public axis?: Axis;
  public angle?: number;
  public base?: Base;

  constructor(params?: Params) {
    if (!params) return;
    const { base, axis, angle } = params;

    this.axis = axis;
    this.base = base;
    this.angle = angle;
  }

  convertVector(vector: Vector): Vector {
    if (
      this.axis === undefined ||
      this.angle === undefined ||
      this.base === undefined
    )
      return vector;

    let outVector: Vector;

    let matrix: Matrix;

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    switch (this.axis) {
      case Axis.X:
        matrix = new Matrix([
          [1, 0, 0],
          [0, cos, -sin],
          [0, sin, cos],
        ]);
        break;
      case Axis.Y:
        matrix = new Matrix([
          [cos, 0, sin],
          [0, 1, 0],
          [-sin, 0, cos],
        ]);
        break;
      case Axis.Z:
        matrix = new Matrix([
          [cos, -sin, 0],
          [sin, cos, 0],
          [0, 0, 1],
        ]);
        break;
    }
    outVector = matrix.multipyWithVector(vector);
    return this.base.convertVector(outVector);
  }
}
