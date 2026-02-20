export class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  scale(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  dot(other: Vector): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vector): Vector {
    return new Vector(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x,
    );
  }

  length(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize(): Vector {
    const len = this.length();
    if (len === 0) return new Vector(0, 0, 0);
    return this.scale(1 / len);
  }

  dict(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }
  array(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}
