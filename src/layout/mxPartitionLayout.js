import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxRectangle } from '@mxgraph/util/mxRectangle';

export class mxPartitionLayout extends mxGraphLayout {
  resizeVertices = true;

  constructor(graph, horizontal, spacing, border) {
    super(graph);
    this.horizontal = horizontal != null ? horizontal : true;
    this.spacing = spacing || 0;
    this.border = border || 0;
  }

  isHorizontal() {
    return this.horizontal;
  }

  moveCell(cell, x, y) {
    var model = this.graph.getModel();
    var parent = model.getParent(cell);

    if (cell != null && parent != null) {
      var i = 0;
      var last = 0;
      var childCount = model.getChildCount(parent);

      for (i = 0; i < childCount; i++) {
        var child = model.getChildAt(parent, i);
        var bounds = this.getVertexBounds(child);

        if (bounds != null) {
          var tmp = bounds.x + bounds.width / 2;

          if (last < x && tmp > x) {
            break;
          }

          last = tmp;
        }
      }

      var idx = parent.getIndex(cell);
      idx = Math.max(0, i - (i > idx ? 1 : 0));
      model.add(parent, cell, idx);
    }
  }

  execute(parent) {
    var horizontal = this.isHorizontal();
    var model = this.graph.getModel();
    var pgeo = model.getGeometry(parent);

    if (
      this.graph.container != null &&
      ((pgeo == null && model.isLayer(parent)) || parent == this.graph.getView().currentRoot)
    ) {
      var width = this.graph.container.offsetWidth - 1;
      var height = this.graph.container.offsetHeight - 1;
      pgeo = new mxRectangle(0, 0, width, height);
    }

    if (pgeo != null) {
      var children = [];
      var childCount = model.getChildCount(parent);

      for (var i = 0; i < childCount; i++) {
        var child = model.getChildAt(parent, i);

        if (!this.isVertexIgnored(child) && this.isVertexMovable(child)) {
          children.push(child);
        }
      }

      var n = children.length;

      if (n > 0) {
        var x0 = this.border;
        var y0 = this.border;
        var other = horizontal ? pgeo.height : pgeo.width;
        other -= 2 * this.border;
        var size = this.graph.isSwimlane(parent) ? this.graph.getStartSize(parent) : new mxRectangle();
        other -= horizontal ? size.height : size.width;
        x0 = x0 + size.width;
        y0 = y0 + size.height;
        var tmp = this.border + (n - 1) * this.spacing;
        var value = horizontal ? (pgeo.width - x0 - tmp) / n : (pgeo.height - y0 - tmp) / n;

        if (value > 0) {
          model.beginUpdate();

          try {
            for (var i = 0; i < n; i++) {
              var child = children[i];
              var geo = model.getGeometry(child);

              if (geo != null) {
                geo = geo.clone();
                geo.x = x0;
                geo.y = y0;

                if (horizontal) {
                  if (this.resizeVertices) {
                    geo.width = value;
                    geo.height = other;
                  }

                  x0 += value + this.spacing;
                } else {
                  if (this.resizeVertices) {
                    geo.height = value;
                    geo.width = other;
                  }

                  y0 += value + this.spacing;
                }

                model.setGeometry(child, geo);
              }
            }
          } finally {
            model.endUpdate();
          }
        }
      }
    }
  }
}
