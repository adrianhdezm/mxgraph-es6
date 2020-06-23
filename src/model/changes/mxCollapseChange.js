export class mxCollapseChange {
  constructor(model, cell, collapsed) {
    this.model = model;
    this.cell = cell;
    this.collapsed = collapsed;
    this.previous = collapsed;
  }

  execute() {
    if (this.cell != null) {
      this.collapsed = this.previous;
      this.previous = this.model.collapsedStateForCellChanged(this.cell, this.previous);
    }
  }
}
