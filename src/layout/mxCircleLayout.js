import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';

export class mxCircleLayout extends mxGraphLayout {
  moveCircle = false;
  x0 = 0;
  y0 = 0;
  resetEdges = true;
  disableEdgeStyle = true;

  constructor(graph, radius) {
    super(graph);
    this.radius = radius != null ? radius : 100;
  }

  execute(parent) {
    var model = this.graph.getModel();
    model.beginUpdate();

    try {
      var max = 0;
      var top = null;
      var left = null;
      var vertices = [];
      var childCount = model.getChildCount(parent);

      for (var i = 0; i < childCount; i++) {
        var cell = model.getChildAt(parent, i);

        if (!this.isVertexIgnored(cell)) {
          vertices.push(cell);
          var bounds = this.getVertexBounds(cell);

          if (top == null) {
            top = bounds.y;
          } else {
            top = Math.min(top, bounds.y);
          }

          if (left == null) {
            left = bounds.x;
          } else {
            left = Math.min(left, bounds.x);
          }

          max = Math.max(max, Math.max(bounds.width, bounds.height));
        } else if (!this.isEdgeIgnored(cell)) {
          if (this.resetEdges) {
            this.graph.resetEdge(cell);
          }

          if (this.disableEdgeStyle) {
            this.setEdgeStyleEnabled(cell, false);
          }
        }
      }

      var r = this.getRadius(vertices.length, max);

      if (this.moveCircle) {
        left = this.x0;
        top = this.y0;
      }

      this.circle(vertices, r, left, top);
    } finally {
      model.endUpdate();
    }
  }

  getRadius(count, max) {
    return Math.max((count * max) / Math.PI, this.radius);
  }

  circle(vertices, r, left, top) {
    var vertexCount = vertices.length;
    var phi = (2 * Math.PI) / vertexCount;

    for (var i = 0; i < vertexCount; i++) {
      if (this.isVertexMovable(vertices[i])) {
        this.setVertexLocation(
          vertices[i],
          Math.round(left + r + r * Math.sin(i * phi)),
          Math.round(top + r + r * Math.cos(i * phi))
        );
      }
    }
  }
}
