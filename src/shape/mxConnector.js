import { mxPolyline } from '@mxgraph/shape/mxPolyline';
import { mxMarker } from '@mxgraph/shape/mxMarker';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxConnector extends mxPolyline {
  constructor(points, stroke, strokewidth) {
    super(points, stroke, strokewidth);
  }

  updateBoundingBox() {
    this.useSvgBoundingBox = this.style != null && this.style[mxConstants.STYLE_CURVED] == 1;
    super.updateBoundingBox();
  }

  paintEdgeShape(c, pts) {
    var sourceMarker = this.createMarker(c, pts, true);
    var targetMarker = this.createMarker(c, pts, false);
    super.paintEdgeShape(c, pts);
    c.setFillColor(this.stroke);
    c.setShadow(false);
    c.setDashed(false);

    if (sourceMarker != null) {
      sourceMarker();
    }

    if (targetMarker != null) {
      targetMarker();
    }
  }

  createMarker(c, pts, source) {
    var result = null;
    var n = pts.length;
    var type = mxUtils.getValue(this.style, source ? mxConstants.STYLE_STARTARROW : mxConstants.STYLE_ENDARROW);
    var p0 = source ? pts[1] : pts[n - 2];
    var pe = source ? pts[0] : pts[n - 1];

    if (type != null && p0 != null && pe != null) {
      var count = 1;

      while (count < n - 1 && Math.round(p0.x - pe.x) == 0 && Math.round(p0.y - pe.y) == 0) {
        p0 = source ? pts[1 + count] : pts[n - 2 - count];
        count++;
      }

      var dx = pe.x - p0.x;
      var dy = pe.y - p0.y;
      var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
      var unitX = dx / dist;
      var unitY = dy / dist;
      var size = mxUtils.getNumber(
        this.style,
        source ? mxConstants.STYLE_STARTSIZE : mxConstants.STYLE_ENDSIZE,
        mxConstants.DEFAULT_MARKERSIZE
      );
      var filled = this.style[source ? mxConstants.STYLE_STARTFILL : mxConstants.STYLE_ENDFILL] != 0;
      result = mxMarker.createMarker(c, this, type, pe, unitX, unitY, size, source, this.strokewidth, filled);
    }

    return result;
  }

  augmentBoundingBox(bbox) {
    super.augmentBoundingBox(bbox);
    var size = 0;

    if (mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, mxConstants.NONE) != mxConstants.NONE) {
      size = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_MARKERSIZE) + 1;
    }

    if (mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, mxConstants.NONE) != mxConstants.NONE) {
      size =
        Math.max(size, mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, mxConstants.DEFAULT_MARKERSIZE)) + 1;
    }

    bbox.grow(size * this.scale);
  }
}
