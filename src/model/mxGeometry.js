import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxRectangle } from '@mxgraph/util/mxRectangle';

export class mxGeometry extends mxRectangle {
  TRANSLATE_CONTROL_POINTS = true;
  alternateBounds = null;
  sourcePoint = null;
  targetPoint = null;
  points = null;
  offset = null;
  relative = false;

  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  swap() {
    if (this.alternateBounds != null) {
      var old = new mxRectangle(this.x, this.y, this.width, this.height);
      this.x = this.alternateBounds.x;
      this.y = this.alternateBounds.y;
      this.width = this.alternateBounds.width;
      this.height = this.alternateBounds.height;
      this.alternateBounds = old;
    }
  }

  getTerminalPoint(isSource) {
    return isSource ? this.sourcePoint : this.targetPoint;
  }

  setTerminalPoint(point, isSource) {
    if (isSource) {
      this.sourcePoint = point;
    } else {
      this.targetPoint = point;
    }

    return point;
  }

  rotate(angle, cx) {
    var rad = mxUtils.toRadians(angle);
    var cos = Math.cos(rad);
    var sin = Math.sin(rad);

    if (!this.relative) {
      var ct = new mxPoint(this.getCenterX(), this.getCenterY());
      var pt = mxUtils.getRotatedPoint(ct, cos, sin, cx);
      this.x = Math.round(pt.x - this.width / 2);
      this.y = Math.round(pt.y - this.height / 2);
    }

    if (this.sourcePoint != null) {
      var pt = mxUtils.getRotatedPoint(this.sourcePoint, cos, sin, cx);
      this.sourcePoint.x = Math.round(pt.x);
      this.sourcePoint.y = Math.round(pt.y);
    }

    if (this.targetPoint != null) {
      var pt = mxUtils.getRotatedPoint(this.targetPoint, cos, sin, cx);
      this.targetPoint.x = Math.round(pt.x);
      this.targetPoint.y = Math.round(pt.y);
    }

    if (this.points != null) {
      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i] != null) {
          var pt = mxUtils.getRotatedPoint(this.points[i], cos, sin, cx);
          this.points[i].x = Math.round(pt.x);
          this.points[i].y = Math.round(pt.y);
        }
      }
    }
  }

  translate(dx, dy) {
    dx = parseFloat(dx);
    dy = parseFloat(dy);

    if (!this.relative) {
      this.x = parseFloat(this.x) + dx;
      this.y = parseFloat(this.y) + dy;
    }

    if (this.sourcePoint != null) {
      this.sourcePoint.x = parseFloat(this.sourcePoint.x) + dx;
      this.sourcePoint.y = parseFloat(this.sourcePoint.y) + dy;
    }

    if (this.targetPoint != null) {
      this.targetPoint.x = parseFloat(this.targetPoint.x) + dx;
      this.targetPoint.y = parseFloat(this.targetPoint.y) + dy;
    }

    if (this.TRANSLATE_CONTROL_POINTS && this.points != null) {
      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i] != null) {
          this.points[i].x = parseFloat(this.points[i].x) + dx;
          this.points[i].y = parseFloat(this.points[i].y) + dy;
        }
      }
    }
  }

  scale(sx, sy, fixedAspect) {
    sx = parseFloat(sx);
    sy = parseFloat(sy);

    if (this.sourcePoint != null) {
      this.sourcePoint.x = parseFloat(this.sourcePoint.x) * sx;
      this.sourcePoint.y = parseFloat(this.sourcePoint.y) * sy;
    }

    if (this.targetPoint != null) {
      this.targetPoint.x = parseFloat(this.targetPoint.x) * sx;
      this.targetPoint.y = parseFloat(this.targetPoint.y) * sy;
    }

    if (this.points != null) {
      for (var i = 0; i < this.points.length; i++) {
        if (this.points[i] != null) {
          this.points[i].x = parseFloat(this.points[i].x) * sx;
          this.points[i].y = parseFloat(this.points[i].y) * sy;
        }
      }
    }

    if (!this.relative) {
      this.x = parseFloat(this.x) * sx;
      this.y = parseFloat(this.y) * sy;

      if (fixedAspect) {
        sy = sx = Math.min(sx, sy);
      }

      this.width = parseFloat(this.width) * sx;
      this.height = parseFloat(this.height) * sy;
    }
  }

  equals(obj) {
    return (
      super.equals(obj) &&
      this.relative == obj.relative &&
      ((this.sourcePoint == null && obj.sourcePoint == null) ||
        (this.sourcePoint != null && this.sourcePoint.equals(obj.sourcePoint))) &&
      ((this.targetPoint == null && obj.targetPoint == null) ||
        (this.targetPoint != null && this.targetPoint.equals(obj.targetPoint))) &&
      ((this.points == null && obj.points == null) ||
        (this.points != null && mxUtils.equalPoints(this.points, obj.points))) &&
      ((this.alternateBounds == null && obj.alternateBounds == null) ||
        (this.alternateBounds != null && this.alternateBounds.equals(obj.alternateBounds))) &&
      ((this.offset == null && obj.offset == null) || (this.offset != null && this.offset.equals(obj.offset)))
    );
  }
}
