import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxDictionary } from '@mxgraph/util/mxDictionary';

export class mxGraphLayout {
  useBoundingBox = true;
  parent = null;

  constructor(graph) {
    this.graph = graph;
  }

  moveCell(cell, x, y) {}

  resizeCell(cell, bounds) {}

  execute(parent) {}

  getGraph() {
    return this.graph;
  }

  getConstraint(key, cell, edge, source) {
    return this.graph.getCurrentCellStyle(cell)[key];
  }

  static traverse(vertex, directed, func, edge, visited) {
    if (func != null && vertex != null) {
      directed = directed != null ? directed : true;
      visited = visited || new mxDictionary();

      if (!visited.get(vertex)) {
        visited.put(vertex, true);
        var result = func(vertex, edge);

        if (result == null || result) {
          var edgeCount = this.graph.model.getEdgeCount(vertex);

          if (edgeCount > 0) {
            for (var i = 0; i < edgeCount; i++) {
              var e = this.graph.model.getEdgeAt(vertex, i);
              var isSource = this.graph.model.getTerminal(e, true) == vertex;

              if (!directed || isSource) {
                var next = this.graph.view.getVisibleTerminal(e, !isSource);
                this.traverse(next, directed, func, e, visited);
              }
            }
          }
        }
      }
    }
  }

  isAncestor(parent, child, traverseAncestors) {
    if (!traverseAncestors) {
      return this.graph.model.getParent(child) == parent;
    }

    if (child == parent) {
      return false;
    }

    while (child != null && child != parent) {
      child = this.graph.model.getParent(child);
    }

    return child == parent;
  }

  isVertexMovable(cell) {
    return this.graph.isCellMovable(cell);
  }

  isVertexIgnored(vertex) {
    return !this.graph.getModel().isVertex(vertex) || !this.graph.isCellVisible(vertex);
  }

  isEdgeIgnored(edge) {
    var model = this.graph.getModel();
    return (
      !model.isEdge(edge) ||
      !this.graph.isCellVisible(edge) ||
      model.getTerminal(edge, true) == null ||
      model.getTerminal(edge, false) == null
    );
  }

  setEdgeStyleEnabled(edge, value) {
    this.graph.setCellStyles(mxConstants.STYLE_NOEDGESTYLE, value ? '0' : '1', [edge]);
  }

  setOrthogonalEdge(edge, value) {
    this.graph.setCellStyles(mxConstants.STYLE_ORTHOGONAL, value ? '1' : '0', [edge]);
  }

  getParentOffset(parent) {
    var result = new mxPoint();

    if (parent != null && parent != this.parent) {
      var model = this.graph.getModel();

      if (model.isAncestor(this.parent, parent)) {
        var parentGeo = model.getGeometry(parent);

        while (parent != this.parent) {
          result.x = result.x + parentGeo.x;
          result.y = result.y + parentGeo.y;
          parent = model.getParent(parent);
          parentGeo = model.getGeometry(parent);
        }
      }
    }

    return result;
  }

  setEdgePoints(edge, points) {
    if (edge != null) {
      var model = this.graph.model;
      var geometry = model.getGeometry(edge);

      if (geometry == null) {
        geometry = new mxGeometry();
        geometry.setRelative(true);
      } else {
        geometry = geometry.clone();
      }

      if (this.parent != null && points != null) {
        var parent = model.getParent(edge);
        var parentOffset = this.getParentOffset(parent);

        for (var i = 0; i < points.length; i++) {
          points[i].x = points[i].x - parentOffset.x;
          points[i].y = points[i].y - parentOffset.y;
        }
      }

      geometry.points = points;
      model.setGeometry(edge, geometry);
    }
  }

  setVertexLocation(cell, x, y) {
    var model = this.graph.getModel();
    var geometry = model.getGeometry(cell);
    var result = null;

    if (geometry != null) {
      result = new mxRectangle(x, y, geometry.width, geometry.height);

      if (this.useBoundingBox) {
        var state = this.graph.getView().getState(cell);

        if (state != null && state.text != null && state.text.boundingBox != null) {
          var scale = this.graph.getView().scale;
          var box = state.text.boundingBox;

          if (state.text.boundingBox.x < state.x) {
            x += (state.x - box.x) / scale;
            result.width = box.width;
          }

          if (state.text.boundingBox.y < state.y) {
            y += (state.y - box.y) / scale;
            result.height = box.height;
          }
        }
      }

      if (this.parent != null) {
        var parent = model.getParent(cell);

        if (parent != null && parent != this.parent) {
          var parentOffset = this.getParentOffset(parent);
          x = x - parentOffset.x;
          y = y - parentOffset.y;
        }
      }

      if (geometry.x != x || geometry.y != y) {
        geometry = geometry.clone();
        geometry.x = x;
        geometry.y = y;
        model.setGeometry(cell, geometry);
      }
    }

    return result;
  }

  getVertexBounds(cell) {
    var geo = this.graph.getModel().getGeometry(cell);

    if (this.useBoundingBox) {
      var state = this.graph.getView().getState(cell);

      if (state != null && state.text != null && state.text.boundingBox != null) {
        var scale = this.graph.getView().scale;
        var tmp = state.text.boundingBox;
        var dx0 = Math.max(state.x - tmp.x, 0) / scale;
        var dy0 = Math.max(state.y - tmp.y, 0) / scale;
        var dx1 = Math.max(tmp.x + tmp.width - (state.x + state.width), 0) / scale;
        var dy1 = Math.max(tmp.y + tmp.height - (state.y + state.height), 0) / scale;
        geo = new mxRectangle(geo.x - dx0, geo.y - dy0, geo.width + dx0 + dx1, geo.height + dy0 + dy1);
      }
    }

    if (this.parent != null) {
      var parent = this.graph.getModel().getParent(cell);
      geo = geo.clone();

      if (parent != null && parent != this.parent) {
        var parentOffset = this.getParentOffset(parent);
        geo.x = geo.x + parentOffset.x;
        geo.y = geo.y + parentOffset.y;
      }
    }

    return new mxRectangle(geo.x, geo.y, geo.width, geo.height);
  }

  arrangeGroups(cells, border, topBorder, rightBorder, bottomBorder, leftBorder) {
    return this.graph.updateGroupBounds(cells, border, true, topBorder, rightBorder, bottomBorder, leftBorder);
  }
}
