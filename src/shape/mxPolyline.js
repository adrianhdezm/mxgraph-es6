import { mxShape } from '@mxgraph/shape/mxShape';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxPolyline extends mxShape {
  constructor(points, stroke, strokewidth) {
    super();
    this.points = points;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  getRotation() {
    return 0;
  }

  getShapeRotation() {
    return 0;
  }

  isPaintBoundsInverted() {
    return false;
  }

  paintEdgeShape(c, pts) {
    var prev = c.pointerEventsValue;
    c.pointerEventsValue = 'stroke';

    if (this.style == null || this.style[mxConstants.STYLE_CURVED] != 1) {
      this.paintLine(c, pts, this.isRounded);
    } else {
      this.paintCurvedLine(c, pts);
    }

    c.pointerEventsValue = prev;
  }

  paintLine(c, pts, rounded) {
    var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(c, pts, rounded, arcSize, false);
    c.stroke();
  }

  paintCurvedLine(c, pts) {
    c.begin();
    var pt = pts[0];
    var n = pts.length;
    c.moveTo(pt.x, pt.y);

    for (var i = 1; i < n - 2; i++) {
      var p0 = pts[i];
      var p1 = pts[i + 1];
      var ix = (p0.x + p1.x) / 2;
      var iy = (p0.y + p1.y) / 2;
      c.quadTo(p0.x, p0.y, ix, iy);
    }

    var p0 = pts[n - 2];
    var p1 = pts[n - 1];
    c.quadTo(p0.x, p0.y, p1.x, p1.y);
    c.stroke();
  }
}
