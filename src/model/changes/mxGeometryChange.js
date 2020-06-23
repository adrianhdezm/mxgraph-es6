export class mxGeometryChange {
  constructor(model, cell, geometry) {
    this.model = model;
    this.cell = cell;
    this.geometry = geometry;
    this.previous = geometry;
  }

  execute() {
    if (this.cell != null) {
      this.geometry = this.previous;
      this.previous = this.model.geometryForCellChanged(this.cell, this.previous);
    }
  }
}
