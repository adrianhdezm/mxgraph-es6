import { mxShape } from '@mxgraph/shape/mxShape';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxSwimlane extends mxShape {
  imageSize = 16;

  constructor(bounds, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  isRoundable(c, x, y, w, h) {
    return true;
  }

  getTitleSize() {
    return Math.max(0, mxUtils.getValue(this.style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
  }

  getLabelBounds(rect) {
    var start = this.getTitleSize();
    var bounds = new mxRectangle(rect.x, rect.y, rect.width, rect.height);
    var horizontal = this.isHorizontal();
    var flipH = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPH, 0) == 1;
    var flipV = mxUtils.getValue(this.style, mxConstants.STYLE_FLIPV, 0) == 1;
    var shapeVertical = this.direction == mxConstants.DIRECTION_NORTH || this.direction == mxConstants.DIRECTION_SOUTH;
    var realHorizontal = horizontal == !shapeVertical;
    var realFlipH =
      !realHorizontal &&
      flipH != (this.direction == mxConstants.DIRECTION_SOUTH || this.direction == mxConstants.DIRECTION_WEST);
    var realFlipV =
      realHorizontal &&
      flipV != (this.direction == mxConstants.DIRECTION_SOUTH || this.direction == mxConstants.DIRECTION_WEST);

    if (!shapeVertical) {
      var tmp = Math.min(bounds.height, start * this.scale);

      if (realFlipH || realFlipV) {
        bounds.y += bounds.height - tmp;
      }

      bounds.height = tmp;
    } else {
      var tmp = Math.min(bounds.width, start * this.scale);

      if (realFlipH || realFlipV) {
        bounds.x += bounds.width - tmp;
      }

      bounds.width = tmp;
    }

    return bounds;
  }

  getGradientBounds(c, x, y, w, h) {
    var start = this.getTitleSize();

    if (this.isHorizontal()) {
      start = Math.min(start, h);
      return new mxRectangle(x, y, w, start);
    } else {
      start = Math.min(start, w);
      return new mxRectangle(x, y, start, h);
    }
  }

  getSwimlaneArcSize(w, h, start) {
    if (mxUtils.getValue(this.style, mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1') {
      return Math.min(
        w / 2,
        Math.min(h / 2, mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2)
      );
    } else {
      var f =
        mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
      return start * f * 3;
    }
  }

  isHorizontal() {
    return mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
  }

  paintVertexShape(c, x, y, w, h) {
    var start = this.getTitleSize();
    var fill = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_FILLCOLOR, mxConstants.NONE);
    var swimlaneLine = mxUtils.getValue(this.style, mxConstants.STYLE_SWIMLANE_LINE, 1) == 1;
    var r = 0;

    if (this.isHorizontal()) {
      start = Math.min(start, h);
    } else {
      start = Math.min(start, w);
    }

    c.translate(x, y);

    if (!this.isRounded) {
      this.paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine);
    } else {
      r = this.getSwimlaneArcSize(w, h, start);
      r = Math.min((this.isHorizontal() ? h : w) - start, Math.min(start, r));
      this.paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine);
    }

    var sep = mxUtils.getValue(this.style, mxConstants.STYLE_SEPARATORCOLOR, mxConstants.NONE);
    this.paintSeparator(c, x, y, w, h, start, sep);

    if (this.image != null) {
      var bounds = this.getImageBounds(x, y, w, h);
      c.image(bounds.x - x, bounds.y - y, bounds.width, bounds.height, this.image, false, false, false);
    }

    if (this.glass) {
      c.setShadow(false);
      this.paintGlassEffect(c, 0, 0, w, start, r);
    }
  }

  paintSwimlane(c, x, y, w, h, start, fill, swimlaneLine) {
    c.begin();
    var events = true;

    if (this.style != null) {
      events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
    }

    if (!events && (this.fill == null || this.fill == mxConstants.NONE)) {
      c.pointerEvents = false;
    }

    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(0, 0);
      c.lineTo(w, 0);
      c.lineTo(w, start);
      c.fillAndStroke();

      if (start < h) {
        if (fill == mxConstants.NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill != mxConstants.NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h);
        c.lineTo(w, h);
        c.lineTo(w, start);

        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(0, 0);
      c.lineTo(0, h);
      c.lineTo(start, h);
      c.fillAndStroke();

      if (start < w) {
        if (fill == mxConstants.NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill != mxConstants.NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(start, 0);
        c.lineTo(w, 0);
        c.lineTo(w, h);
        c.lineTo(start, h);

        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }

    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill == mxConstants.NONE);
    }
  }

  paintRoundedSwimlane(c, x, y, w, h, start, r, fill, swimlaneLine) {
    c.begin();
    var events = true;

    if (this.style != null) {
      events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
    }

    if (!events && (this.fill == null || this.fill == mxConstants.NONE)) {
      c.pointerEvents = false;
    }

    if (this.isHorizontal()) {
      c.moveTo(w, start);
      c.lineTo(w, r);
      c.quadTo(w, 0, w - Math.min(w / 2, r), 0);
      c.lineTo(Math.min(w / 2, r), 0);
      c.quadTo(0, 0, 0, r);
      c.lineTo(0, start);
      c.fillAndStroke();

      if (start < h) {
        if (fill == mxConstants.NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill != mxConstants.NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(0, start);
        c.lineTo(0, h - r);
        c.quadTo(0, h, Math.min(w / 2, r), h);
        c.lineTo(w - Math.min(w / 2, r), h);
        c.quadTo(w, h, w, h - r);
        c.lineTo(w, start);

        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    } else {
      c.moveTo(start, 0);
      c.lineTo(r, 0);
      c.quadTo(0, 0, 0, Math.min(h / 2, r));
      c.lineTo(0, h - Math.min(h / 2, r));
      c.quadTo(0, h, r, h);
      c.lineTo(start, h);
      c.fillAndStroke();

      if (start < w) {
        if (fill == mxConstants.NONE || !events) {
          c.pointerEvents = false;
        }

        if (fill != mxConstants.NONE) {
          c.setFillColor(fill);
        }

        c.begin();
        c.moveTo(start, h);
        c.lineTo(w - r, h);
        c.quadTo(w, h, w, h - Math.min(h / 2, r));
        c.lineTo(w, Math.min(h / 2, r));
        c.quadTo(w, 0, w - r, 0);
        c.lineTo(start, 0);

        if (fill == mxConstants.NONE) {
          c.stroke();
        } else {
          c.fillAndStroke();
        }
      }
    }

    if (swimlaneLine) {
      this.paintDivider(c, x, y, w, h, start, fill == mxConstants.NONE);
    }
  }

  paintDivider(c, x, y, w, h, start, shadow) {
    if (!shadow) {
      c.setShadow(false);
    }

    c.begin();

    if (this.isHorizontal()) {
      c.moveTo(0, start);
      c.lineTo(w, start);
    } else {
      c.moveTo(start, 0);
      c.lineTo(start, h);
    }

    c.stroke();
  }

  paintSeparator(c, x, y, w, h, start, color) {
    if (color != mxConstants.NONE) {
      c.setStrokeColor(color);
      c.setDashed(true);
      c.begin();

      if (this.isHorizontal()) {
        c.moveTo(w, start);
        c.lineTo(w, h);
      } else {
        c.moveTo(start, 0);
        c.lineTo(w, 0);
      }

      c.stroke();
      c.setDashed(false);
    }
  }

  getImageBounds(x, y, w, h) {
    if (this.isHorizontal()) {
      return new mxRectangle(x + w - this.imageSize, y, this.imageSize, this.imageSize);
    } else {
      return new mxRectangle(x, y, this.imageSize, this.imageSize);
    }
  }
}
