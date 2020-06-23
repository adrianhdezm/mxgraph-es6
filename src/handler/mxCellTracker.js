import { mxCellMarker } from '@mxgraph/handler/mxCellMarker';

export class mxCellTracker extends mxCellMarker {
  constructor(graph, color, funct) {
    super(graph, color);
    this.graph.addMouseListener(this);

    if (funct != null) {
      this.getCell = funct;
    }
  }

  mouseDown(sender, me) {}

  mouseMove(sender, me) {
    if (this.isEnabled()) {
      this.process(me);
    }
  }

  mouseUp(sender, me) {}

  destroy() {
    if (!this.destroyed) {
      this.destroyed = true;
      this.graph.removeMouseListener(this);
      super.destroy();
    }
  }
}
