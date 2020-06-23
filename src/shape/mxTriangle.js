import { mxActor } from '@mxgraph/shape/mxActor';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxTriangle extends mxActor {
  constructor() {
    super();
  }

  isRoundable() {
    return true;
  }

  redrawPath(c, x, y, w, h) {
    var arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
    this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0.5 * h), new mxPoint(0, h)], this.isRounded, arcSize, true);
  }
}
