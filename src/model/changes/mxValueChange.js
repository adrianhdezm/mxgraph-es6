export class mxValueChange {
  constructor(model, cell, value) {
    this.model = model;
    this.cell = cell;
    this.value = value;
    this.previous = value;
  }

  execute() {
    if (this.cell != null) {
      this.value = this.previous;
      this.previous = this.model.valueForCellChanged(this.cell, this.previous);
    }
  }
}
