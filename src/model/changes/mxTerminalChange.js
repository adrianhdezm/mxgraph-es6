export class mxTerminalChange {
  constructor(model, cell, terminal, source) {
    this.model = model;
    this.cell = cell;
    this.terminal = terminal;
    this.previous = terminal;
    this.source = source;
  }

  execute() {
    if (this.cell != null) {
      this.terminal = this.previous;
      this.previous = this.model.terminalForCellChanged(this.cell, this.previous, this.source);
    }
  }
}
