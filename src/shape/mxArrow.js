import { mxShape } from '@mxgraph/shape/mxShape';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxArrow extends mxShape {
  constructor(points, fill, stroke, strokewidth, arrowWidth, spacing, endSize) {
    super();
    this.points = points;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
    this.arrowWidth = arrowWidth != null ? arrowWidth : mxConstants.ARROW_WIDTH;
    this.spacing = spacing != null ? spacing : mxConstants.ARROW_SPACING;
    this.endSize = endSize != null ? endSize : mxConstants.ARROW_SIZE;
  }

  augmentBoundingBox(bbox) {
    super.augmentBoundingBox(bbox);
    var w = Math.max(this.arrowWidth, this.endSize);
    bbox.grow((w / 2 + this.strokewidth) * this.scale);
  }

  paintEdgeShape(c, pts) {
    var spacing = mxConstants.ARROW_SPACING;
    var width = mxConstants.ARROW_WIDTH;
    var arrow = mxConstants.ARROW_SIZE;
    var p0 = pts[0];
    var pe = pts[pts.length - 1];
    var dx = pe.x - p0.x;
    var dy = pe.y - p0.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var length = dist - 2 * spacing - arrow;
    var nx = dx / dist;
    var ny = dy / dist;
    var basex = length * nx;
    var basey = length * ny;
    var floorx = (width * ny) / 3;
    var floory = (-width * nx) / 3;
    var p0x = p0.x - floorx / 2 + spacing * nx;
    var p0y = p0.y - floory / 2 + spacing * ny;
    var p1x = p0x + floorx;
    var p1y = p0y + floory;
    var p2x = p1x + basex;
    var p2y = p1y + basey;
    var p3x = p2x + floorx;
    var p3y = p2y + floory;
    var p5x = p3x - 3 * floorx;
    var p5y = p3y - 3 * floory;
    c.begin();
    c.moveTo(p0x, p0y);
    c.lineTo(p1x, p1y);
    c.lineTo(p2x, p2y);
    c.lineTo(p3x, p3y);
    c.lineTo(pe.x - spacing * nx, pe.y - spacing * ny);
    c.lineTo(p5x, p5y);
    c.lineTo(p5x + floorx, p5y + floory);
    c.close();
    c.fillAndStroke();
  }
}
