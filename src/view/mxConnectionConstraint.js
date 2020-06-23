export class mxConnectionConstraint {
  constructor(point, perimeter, name, dx, dy) {
    this.point = point;
    this.perimeter = perimeter != null ? perimeter : true;
    this.name = name;
    this.dx = dx ? dx : 0;
    this.dy = dy ? dy : 0;
  }
}
