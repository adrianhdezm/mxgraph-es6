export class mxChildChange {
  constructor(model, parent, child, index) {
    this.model = model;
    this.parent = parent;
    this.previous = parent;
    this.child = child;
    this.index = index;
    this.previousIndex = index;
  }

  execute() {
    if (this.child != null) {
      var tmp = this.model.getParent(this.child);
      var tmp2 = tmp != null ? tmp.getIndex(this.child) : 0;

      if (this.previous == null) {
        this.connect(this.child, false);
      }

      tmp = this.model.parentForCellChanged(this.child, this.previous, this.previousIndex);

      if (this.previous != null) {
        this.connect(this.child, true);
      }

      this.parent = this.previous;
      this.previous = tmp;
      this.index = this.previousIndex;
      this.previousIndex = tmp2;
    }
  }

  connect(cell, isConnect) {
    isConnect = isConnect != null ? isConnect : true;
    var source = cell.getTerminal(true);
    var target = cell.getTerminal(false);

    if (source != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, source, true);
      } else {
        this.model.terminalForCellChanged(cell, null, true);
      }
    }

    if (target != null) {
      if (isConnect) {
        this.model.terminalForCellChanged(cell, target, false);
      } else {
        this.model.terminalForCellChanged(cell, null, false);
      }
    }

    cell.setTerminal(source, true);
    cell.setTerminal(target, false);
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      this.connect(this.model.getChildAt(cell, i), isConnect);
    }
  }
}
