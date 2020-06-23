import { mxShape } from '@mxgraph/shape/mxShape';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxRhombus extends mxShape {
  constructor(bounds, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
  }

  isRoundable() {
    return true;
  }

  paintVertexShape(c, x, y, w, h) {
    var hw = w / 2;
    var hh = h / 2;
    var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    c.begin();
    this.addPoints(
      c,
      [new mxPoint(x + hw, y), new mxPoint(x + w, y + hh), new mxPoint(x + hw, y + h), new mxPoint(x, y + hh)],
      this.isRounded,
      arcSize,
      true
    );
    c.fillAndStroke();
  }
}
