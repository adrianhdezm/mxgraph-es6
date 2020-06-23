import { mxShape } from '@mxgraph/shape/mxShape';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxRectangleShape extends mxShape {
  constructor(bounds, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  isHtmlAllowed() {
    var events = true;

    if (this.style != null) {
      events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
    }

    return (
      !this.isRounded &&
      !this.glass &&
      this.rotation == 0 &&
      (events || (this.fill != null && this.fill != mxConstants.NONE))
    );
  }

  paintBackground(c, x, y, w, h) {
    var events = true;

    if (this.style != null) {
      events = mxUtils.getValue(this.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1';
    }

    if (
      events ||
      (this.fill != null && this.fill != mxConstants.NONE) ||
      (this.stroke != null && this.stroke != mxConstants.NONE)
    ) {
      if (!events && (this.fill == null || this.fill == mxConstants.NONE)) {
        c.pointerEvents = false;
      }

      if (this.isRounded) {
        var r = 0;

        if (mxUtils.getValue(this.style, mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) == '1') {
          r = Math.min(
            w / 2,
            Math.min(h / 2, mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2)
          );
        } else {
          var f =
            mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.RECTANGLE_ROUNDING_FACTOR * 100) / 100;
          r = Math.min(w * f, h * f);
        }

        c.roundrect(x, y, w, h, r, r);
      } else {
        c.rect(x, y, w, h);
      }

      c.fillAndStroke();
    }
  }

  isRoundable(c, x, y, w, h) {
    return true;
  }

  paintForeground(c, x, y, w, h) {
    if (this.glass && !this.outline && this.fill != null && this.fill != mxConstants.NONE) {
      this.paintGlassEffect(c, x, y, w, h, this.getArcSize(w + this.strokewidth, h + this.strokewidth));
    }
  }
}
