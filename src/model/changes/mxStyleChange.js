export class mxStyleChange {
  constructor(model, cell, style) {
    this.model = model;
    this.cell = cell;
    this.style = style;
    this.previous = style;
  }

  execute() {
    if (this.cell != null) {
      this.style = this.previous;
      this.previous = this.model.styleForCellChanged(this.cell, this.previous);
    }
  }
}
