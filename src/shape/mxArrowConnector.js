import { mxShape } from '@mxgraph/shape/mxShape';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxArrowConnector extends mxShape {
  useSvgBoundingBox = true;

  constructor(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize) {
    super();
    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
    this.arrowWidth = arrowWidth != null ? arrowWidth : mxConstants.ARROW_WIDTH;
    this.arrowSpacing = spacing != null ? spacing : mxConstants.ARROW_SPACING;
    this.startSize = mxConstants.ARROW_SIZE / 5;
    this.endSize = mxConstants.ARROW_SIZE / 5;
  }

  resetStyles() {
    super.resetStyles();
    this.arrowSpacing = mxConstants.ARROW_SPACING;
  }

  apply(state) {
    super.apply(state);

    if (this.style != null) {
      this.startSize = mxUtils.getNumber(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.ARROW_SIZE / 5) * 3;
      this.endSize = mxUtils.getNumber(this.style, mxConstants.STYLE_ENDSIZE, mxConstants.ARROW_SIZE / 5) * 3;
    }
  }

  augmentBoundingBox(bbox) {
    super.augmentBoundingBox(bbox);
    var w = this.getEdgeWidth();

    if (this.isMarkerStart()) {
      w = Math.max(w, this.getStartArrowWidth());
    }

    if (this.isMarkerEnd()) {
      w = Math.max(w, this.getEndArrowWidth());
    }

    bbox.grow((w / 2 + this.strokewidth) * this.scale);
  }

  paintEdgeShape(c, pts) {
    var strokeWidth = this.strokewidth;

    if (this.outline) {
      strokeWidth = Math.max(1, mxUtils.getNumber(this.style, mxConstants.STYLE_STROKEWIDTH, this.strokewidth));
    }

    var startWidth = this.getStartArrowWidth() + strokeWidth;
    var endWidth = this.getEndArrowWidth() + strokeWidth;
    var edgeWidth = this.outline ? this.getEdgeWidth() + strokeWidth : this.getEdgeWidth();
    var openEnded = this.isOpenEnded();
    var markerStart = this.isMarkerStart();
    var markerEnd = this.isMarkerEnd();
    var spacing = openEnded ? 0 : this.arrowSpacing + strokeWidth / 2;
    var startSize = this.startSize + strokeWidth;
    var endSize = this.endSize + strokeWidth;
    var isRounded = this.isArrowRounded();
    var pe = pts[pts.length - 1];
    var i0 = 1;

    while (i0 < pts.length - 1 && pts[i0].x == pts[0].x && pts[i0].y == pts[0].y) {
      i0++;
    }

    var dx = pts[i0].x - pts[0].x;
    var dy = pts[i0].y - pts[0].y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (dist == 0) {
      return;
    }

    var nx = dx / dist;
    var nx2,
      nx1 = nx;
    var ny = dy / dist;
    var ny2,
      ny1 = ny;
    var orthx = edgeWidth * ny;
    var orthy = -edgeWidth * nx;
    var fns = [];

    if (isRounded) {
      c.setLineJoin('round');
    } else if (pts.length > 2) {
      c.setMiterLimit(1.42);
    }

    c.begin();
    var startNx = nx;
    var startNy = ny;

    if (markerStart && !openEnded) {
      this.paintMarker(c, pts[0].x, pts[0].y, nx, ny, startSize, startWidth, edgeWidth, spacing, true);
    } else {
      var outStartX = pts[0].x + orthx / 2 + spacing * nx;
      var outStartY = pts[0].y + orthy / 2 + spacing * ny;
      var inEndX = pts[0].x - orthx / 2 + spacing * nx;
      var inEndY = pts[0].y - orthy / 2 + spacing * ny;

      if (openEnded) {
        c.moveTo(outStartX, outStartY);
        fns.push(function () {
          c.lineTo(inEndX, inEndY);
        });
      } else {
        c.moveTo(inEndX, inEndY);
        c.lineTo(outStartX, outStartY);
      }
    }

    var dx1 = 0;
    var dy1 = 0;
    var dist1 = 0;

    for (var i = 0; i < pts.length - 2; i++) {
      var pos = mxUtils.relativeCcw(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, pts[i + 2].x, pts[i + 2].y);
      dx1 = pts[i + 2].x - pts[i + 1].x;
      dy1 = pts[i + 2].y - pts[i + 1].y;
      dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);

      if (dist1 != 0) {
        nx1 = dx1 / dist1;
        ny1 = dy1 / dist1;
        var tmp1 = nx * nx1 + ny * ny1;
        var tmp = Math.max(Math.sqrt((tmp1 + 1) / 2), 0.04);
        nx2 = nx + nx1;
        ny2 = ny + ny1;
        var dist2 = Math.sqrt(nx2 * nx2 + ny2 * ny2);

        if (dist2 != 0) {
          nx2 = nx2 / dist2;
          ny2 = ny2 / dist2;
          var strokeWidthFactor = Math.max(tmp, Math.min(this.strokewidth / 200 + 0.04, 0.35));
          var angleFactor = pos != 0 && isRounded ? Math.max(0.1, strokeWidthFactor) : Math.max(tmp, 0.06);
          var outX = pts[i + 1].x + (ny2 * edgeWidth) / 2 / angleFactor;
          var outY = pts[i + 1].y - (nx2 * edgeWidth) / 2 / angleFactor;
          var inX = pts[i + 1].x - (ny2 * edgeWidth) / 2 / angleFactor;
          var inY = pts[i + 1].y + (nx2 * edgeWidth) / 2 / angleFactor;

          if (pos == 0 || !isRounded) {
            c.lineTo(outX, outY);

            (function (x, y) {
              fns.push(function () {
                c.lineTo(x, y);
              });
            })(inX, inY);
          } else if (pos == -1) {
            var c1x = inX + ny * edgeWidth;
            var c1y = inY - nx * edgeWidth;
            var c2x = inX + ny1 * edgeWidth;
            var c2y = inY - nx1 * edgeWidth;
            c.lineTo(c1x, c1y);
            c.quadTo(outX, outY, c2x, c2y);

            (function (x, y) {
              fns.push(function () {
                c.lineTo(x, y);
              });
            })(inX, inY);
          } else {
            c.lineTo(outX, outY);

            (function (x, y) {
              var c1x = outX - ny * edgeWidth;
              var c1y = outY + nx * edgeWidth;
              var c2x = outX - ny1 * edgeWidth;
              var c2y = outY + nx1 * edgeWidth;
              fns.push(function () {
                c.quadTo(x, y, c1x, c1y);
              });
              fns.push(function () {
                c.lineTo(c2x, c2y);
              });
            })(inX, inY);
          }

          nx = nx1;
          ny = ny1;
        }
      }
    }

    orthx = edgeWidth * ny1;
    orthy = -edgeWidth * nx1;

    if (markerEnd && !openEnded) {
      this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, false);
    } else {
      c.lineTo(pe.x - spacing * nx1 + orthx / 2, pe.y - spacing * ny1 + orthy / 2);
      var inStartX = pe.x - spacing * nx1 - orthx / 2;
      var inStartY = pe.y - spacing * ny1 - orthy / 2;

      if (!openEnded) {
        c.lineTo(inStartX, inStartY);
      } else {
        c.moveTo(inStartX, inStartY);
        fns.splice(0, 0, function () {
          c.moveTo(inStartX, inStartY);
        });
      }
    }

    for (var i = fns.length - 1; i >= 0; i--) {
      fns[i]();
    }

    if (openEnded) {
      c.end();
      c.stroke();
    } else {
      c.close();
      c.fillAndStroke();
    }

    c.setShadow(false);
    c.setMiterLimit(4);

    if (isRounded) {
      c.setLineJoin('flat');
    }

    if (pts.length > 2) {
      c.setMiterLimit(4);

      if (markerStart && !openEnded) {
        c.begin();
        this.paintMarker(c, pts[0].x, pts[0].y, startNx, startNy, startSize, startWidth, edgeWidth, spacing, true);
        c.stroke();
        c.end();
      }

      if (markerEnd && !openEnded) {
        c.begin();
        this.paintMarker(c, pe.x, pe.y, -nx, -ny, endSize, endWidth, edgeWidth, spacing, true);
        c.stroke();
        c.end();
      }
    }
  }

  paintMarker(c, ptX, ptY, nx, ny, size, arrowWidth, edgeWidth, spacing, initialMove) {
    var widthArrowRatio = edgeWidth / arrowWidth;
    var orthx = (edgeWidth * ny) / 2;
    var orthy = (-edgeWidth * nx) / 2;
    var spaceX = (spacing + size) * nx;
    var spaceY = (spacing + size) * ny;

    if (initialMove) {
      c.moveTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
    } else {
      c.lineTo(ptX - orthx + spaceX, ptY - orthy + spaceY);
    }

    c.lineTo(ptX - orthx / widthArrowRatio + spaceX, ptY - orthy / widthArrowRatio + spaceY);
    c.lineTo(ptX + spacing * nx, ptY + spacing * ny);
    c.lineTo(ptX + orthx / widthArrowRatio + spaceX, ptY + orthy / widthArrowRatio + spaceY);
    c.lineTo(ptX + orthx + spaceX, ptY + orthy + spaceY);
  }

  isArrowRounded() {
    return this.isRounded;
  }

  getStartArrowWidth() {
    return mxConstants.ARROW_WIDTH;
  }

  getEndArrowWidth() {
    return mxConstants.ARROW_WIDTH;
  }

  getEdgeWidth() {
    return mxConstants.ARROW_WIDTH / 3;
  }

  isOpenEnded() {
    return false;
  }

  isMarkerStart() {
    return mxUtils.getValue(this.style, mxConstants.STYLE_STARTARROW, mxConstants.NONE) != mxConstants.NONE;
  }

  isMarkerEnd() {
    return mxUtils.getValue(this.style, mxConstants.STYLE_ENDARROW, mxConstants.NONE) != mxConstants.NONE;
  }
}
