import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';

export class mxCompositeLayout extends mxGraphLayout {
  constructor(graph, layouts, master) {
    super(graph);
    this.layouts = layouts;
    this.master = master;
  }

  moveCell(cell, x, y) {
    if (this.master != null) {
      this.master.moveCell.apply(this.master, arguments);
    } else {
      this.layouts[0].moveCell.apply(this.layouts[0], arguments);
    }
  }

  execute(parent) {
    var model = this.graph.getModel();
    model.beginUpdate();

    try {
      for (var i = 0; i < this.layouts.length; i++) {
        this.layouts[i].execute.apply(this.layouts[i], arguments);
      }
    } finally {
      model.endUpdate();
    }
  }
}
