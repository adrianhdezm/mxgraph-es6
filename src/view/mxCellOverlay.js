import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxCellOverlay extends mxEventSource {
  defaultOverlap = 0.5;

  constructor(image, tooltip, align, verticalAlign, offset, cursor) {
    super();
    this.image = image;
    this.tooltip = tooltip;
    this.align = align != null ? align : this.align;
    this.verticalAlign = verticalAlign != null ? verticalAlign : this.verticalAlign;
    this.offset = offset != null ? offset : new mxPoint();
    this.cursor = cursor != null ? cursor : 'help';
  }

  getBounds(state) {
    var isEdge = state.view.graph.getModel().isEdge(state.cell);
    var s = state.view.scale;
    var pt = null;
    var w = this.image.width;
    var h = this.image.height;

    if (isEdge) {
      var pts = state.absolutePoints;

      if (pts.length % 2 == 1) {
        pt = pts[Math.floor(pts.length / 2)];
      } else {
        var idx = pts.length / 2;
        var p0 = pts[idx - 1];
        var p1 = pts[idx];
        pt = new mxPoint(p0.x + (p1.x - p0.x) / 2, p0.y + (p1.y - p0.y) / 2);
      }
    } else {
      pt = new mxPoint();

      if (this.align == mxConstants.ALIGN_LEFT) {
        pt.x = state.x;
      } else if (this.align == mxConstants.ALIGN_CENTER) {
        pt.x = state.x + state.width / 2;
      } else {
        pt.x = state.x + state.width;
      }

      if (this.verticalAlign == mxConstants.ALIGN_TOP) {
        pt.y = state.y;
      } else if (this.verticalAlign == mxConstants.ALIGN_MIDDLE) {
        pt.y = state.y + state.height / 2;
      } else {
        pt.y = state.y + state.height;
      }
    }

    return new mxRectangle(
      Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
      Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s),
      w * s,
      h * s
    );
  }

  toString() {
    return this.tooltip;
  }
}
