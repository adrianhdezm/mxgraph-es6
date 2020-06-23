import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxPoint {
  constructor(x, y) {
    this.x = x != null ? x : 0;
    this.y = y != null ? y : 0;
  }

  equals(obj) {
    return obj != null && obj.x == this.x && obj.y == this.y;
  }

  clone() {
    return mxUtils.clone(this);
  }
}
