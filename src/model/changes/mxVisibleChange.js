export class mxVisibleChange {
  constructor(model, cell, visible) {
    this.model = model;
    this.cell = cell;
    this.visible = visible;
    this.previous = visible;
  }

  execute() {
    if (this.cell != null) {
      this.visible = this.previous;
      this.previous = this.model.visibleStateForCellChanged(this.cell, this.previous);
    }
  }
}
