import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxEdgeLabelLayout extends mxGraphLayout {
  constructor(graph, radius) {
    super(graph);
  }

  execute(parent) {
    var view = this.graph.view;
    var model = this.graph.getModel();
    var edges = [];
    var vertices = [];
    var childCount = model.getChildCount(parent);

    for (var i = 0; i < childCount; i++) {
      var cell = model.getChildAt(parent, i);
      var state = view.getState(cell);

      if (state != null) {
        if (!this.isVertexIgnored(cell)) {
          vertices.push(state);
        } else if (!this.isEdgeIgnored(cell)) {
          edges.push(state);
        }
      }
    }

    this.placeLabels(vertices, edges);
  }

  placeLabels(v, e) {
    var model = this.graph.getModel();
    model.beginUpdate();

    try {
      for (var i = 0; i < e.length; i++) {
        var edge = e[i];

        if (edge != null && edge.text != null && edge.text.boundingBox != null) {
          for (var j = 0; j < v.length; j++) {
            var vertex = v[j];

            if (vertex != null) {
              this.avoid(edge, vertex);
            }
          }
        }
      }
    } finally {
      model.endUpdate();
    }
  }

  avoid(edge, vertex) {
    var model = this.graph.getModel();
    var labRect = edge.text.boundingBox;

    if (mxUtils.intersects(labRect, vertex)) {
      var dy1 = -labRect.y - labRect.height + vertex.y;
      var dy2 = -labRect.y + vertex.y + vertex.height;
      var dy = Math.abs(dy1) < Math.abs(dy2) ? dy1 : dy2;
      var dx1 = -labRect.x - labRect.width + vertex.x;
      var dx2 = -labRect.x + vertex.x + vertex.width;
      var dx = Math.abs(dx1) < Math.abs(dx2) ? dx1 : dx2;

      if (Math.abs(dx) < Math.abs(dy)) {
        dy = 0;
      } else {
        dx = 0;
      }

      var g = model.getGeometry(edge.cell);

      if (g != null) {
        g = g.clone();

        if (g.offset != null) {
          g.offset.x += dx;
          g.offset.y += dy;
        } else {
          g.offset = new mxPoint(dx, dy);
        }

        model.setGeometry(edge.cell, g);
      }
    }
  }
}
