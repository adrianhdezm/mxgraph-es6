import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxRectangle extends mxPoint {
  constructor(x, y, width, height) {
    super(x, y);
    this.width = width != null ? width : 0;
    this.height = height != null ? height : 0;
  }

  setRect(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  add(rect) {
    if (rect != null) {
      var minX = Math.min(this.x, rect.x);
      var minY = Math.min(this.y, rect.y);
      var maxX = Math.max(this.x + this.width, rect.x + rect.width);
      var maxY = Math.max(this.y + this.height, rect.y + rect.height);
      this.x = minX;
      this.y = minY;
      this.width = maxX - minX;
      this.height = maxY - minY;
    }
  }

  intersect(rect) {
    if (rect != null) {
      var r1 = this.x + this.width;
      var r2 = rect.x + rect.width;
      var b1 = this.y + this.height;
      var b2 = rect.y + rect.height;
      this.x = Math.max(this.x, rect.x);
      this.y = Math.max(this.y, rect.y);
      this.width = Math.min(r1, r2) - this.x;
      this.height = Math.min(b1, b2) - this.y;
    }
  }

  grow(amount) {
    this.x -= amount;
    this.y -= amount;
    this.width += 2 * amount;
    this.height += 2 * amount;
    return this;
  }

  getPoint() {
    return new mxPoint(this.x, this.y);
  }

  rotate90() {
    var t = (this.width - this.height) / 2;
    this.x += t;
    this.y -= t;
    var tmp = this.width;
    this.width = this.height;
    this.height = tmp;
  }

  equals(obj) {
    return obj != null && obj.x == this.x && obj.y == this.y && obj.width == this.width && obj.height == this.height;
  }

  static fromRectangle(rect) {
    return new mxRectangle(rect.x, rect.y, rect.width, rect.height);
  }
}
