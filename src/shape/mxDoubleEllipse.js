import { mxShape } from '@mxgraph/shape/mxShape';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxDoubleEllipse extends mxShape {
  vmlScale = 10;

  constructor(bounds, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  paintBackground(c, x, y, w, h) {
    c.ellipse(x, y, w, h);
    c.fillAndStroke();
  }

  paintForeground(c, x, y, w, h) {
    if (!this.outline) {
      var margin = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_MARGIN,
        Math.min(3 + this.strokewidth, Math.min(w / 5, h / 5))
      );
      x += margin;
      y += margin;
      w -= 2 * margin;
      h -= 2 * margin;

      if (w > 0 && h > 0) {
        c.ellipse(x, y, w, h);
      }

      c.stroke();
    }
  }

  getLabelBounds(rect) {
    var margin =
      mxUtils.getValue(
        this.style,
        mxConstants.STYLE_MARGIN,
        Math.min(3 + this.strokewidth, Math.min(rect.width / 5 / this.scale, rect.height / 5 / this.scale))
      ) * this.scale;
    return new mxRectangle(rect.x + margin, rect.y + margin, rect.width - 2 * margin, rect.height - 2 * margin);
  }
}
