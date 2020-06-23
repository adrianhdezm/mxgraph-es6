import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { WeightedCellSorter } from '@mxgraph/layout/WeightedCellSorter';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxCellPath } from '@mxgraph/model/mxCellPath';
import { mxDictionary } from '@mxgraph/util/mxDictionary';

export class mxCompactTreeLayout extends mxGraphLayout {
  resizeParent = true;
  maintainParentLocation = false;
  groupPadding = 10;
  groupPaddingTop = 0;
  groupPaddingRight = 0;
  groupPaddingBottom = 0;
  groupPaddingLeft = 0;
  parentsChanged = null;
  moveTree = false;
  visited = null;
  levelDistance = 10;
  nodeDistance = 20;
  resetEdges = true;
  prefHozEdgeSep = 5;
  prefVertEdgeOff = 4;
  minEdgeJetty = 8;
  channelBuffer = 4;
  edgeRouting = true;
  sortEdges = false;
  alignRanks = false;
  maxRankHeight = null;
  root = null;
  node = null;

  constructor(graph, horizontal, invert) {
    super(graph);
    this.horizontal = horizontal != null ? horizontal : true;
    this.invert = invert != null ? invert : false;
  }

  isVertexIgnored(vertex) {
    return super.isVertexIgnored(vertex) || this.graph.getConnections(vertex).length == 0;
  }

  isHorizontal() {
    return this.horizontal;
  }

  execute(parent, root) {
    this.parent = parent;
    var model = this.graph.getModel();

    if (root == null) {
      if (this.graph.getEdges(parent, model.getParent(parent), this.invert, !this.invert, false).length > 0) {
        this.root = parent;
      } else {
        var roots = this.graph.findTreeRoots(parent, true, this.invert);

        if (roots.length > 0) {
          for (var i = 0; i < roots.length; i++) {
            if (
              !this.isVertexIgnored(roots[i]) &&
              this.graph.getEdges(roots[i], null, this.invert, !this.invert, false).length > 0
            ) {
              this.root = roots[i];
              break;
            }
          }
        }
      }
    } else {
      this.root = root;
    }

    if (this.root != null) {
      if (this.resizeParent) {
        this.parentsChanged = new Object();
      } else {
        this.parentsChanged = null;
      }

      this.parentX = null;
      this.parentY = null;

      if (parent != this.root && model.isVertex(parent) != null && this.maintainParentLocation) {
        var geo = this.graph.getCellGeometry(parent);

        if (geo != null) {
          this.parentX = geo.x;
          this.parentY = geo.y;
        }
      }

      model.beginUpdate();

      try {
        this.visited = new Object();
        this.node = this.dfs(this.root, parent);

        if (this.alignRanks) {
          this.maxRankHeight = [];
          this.findRankHeights(this.node, 0);
          this.setCellHeights(this.node, 0);
        }

        if (this.node != null) {
          this.layout(this.node);
          var x0 = this.graph.gridSize;
          var y0 = x0;

          if (!this.moveTree) {
            var g = this.getVertexBounds(this.root);

            if (g != null) {
              x0 = g.x;
              y0 = g.y;
            }
          }

          var bounds = null;

          if (this.isHorizontal()) {
            bounds = this.horizontalLayout(this.node, x0, y0);
          } else {
            bounds = this.verticalLayout(this.node, null, x0, y0);
          }

          if (bounds != null) {
            var dx = 0;
            var dy = 0;

            if (bounds.x < 0) {
              dx = Math.abs(x0 - bounds.x);
            }

            if (bounds.y < 0) {
              dy = Math.abs(y0 - bounds.y);
            }

            if (dx != 0 || dy != 0) {
              this.moveNode(this.node, dx, dy);
            }

            if (this.resizeParent) {
              this.adjustParents();
            }

            if (this.edgeRouting) {
              this.localEdgeProcessing(this.node);
            }
          }

          if (this.parentX != null && this.parentY != null) {
            var geo = this.graph.getCellGeometry(parent);

            if (geo != null) {
              geo = geo.clone();
              geo.x = this.parentX;
              geo.y = this.parentY;
              model.setGeometry(parent, geo);
            }
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  moveNode(node, dx, dy) {
    node.x += dx;
    node.y += dy;
    this.apply(node);
    var child = node.child;

    while (child != null) {
      this.moveNode(child, dx, dy);
      child = child.next;
    }
  }

  sortOutgoingEdges(source, edges) {
    var lookup = new mxDictionary();
    edges.sort(function (e1, e2) {
      var end1 = e1.getTerminal(e1.getTerminal(false) == source);
      var p1 = lookup.get(end1);

      if (p1 == null) {
        p1 = mxCellPath.create(end1).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(end1, p1);
      }

      var end2 = e2.getTerminal(e2.getTerminal(false) == source);
      var p2 = lookup.get(end2);

      if (p2 == null) {
        p2 = mxCellPath.create(end2).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(end2, p2);
      }

      return mxCellPath.compare(p1, p2);
    });
  }

  findRankHeights(node, rank) {
    if (this.maxRankHeight[rank] == null || this.maxRankHeight[rank] < node.height) {
      this.maxRankHeight[rank] = node.height;
    }

    var child = node.child;

    while (child != null) {
      this.findRankHeights(child, rank + 1);
      child = child.next;
    }
  }

  setCellHeights(node, rank) {
    if (this.maxRankHeight[rank] != null && this.maxRankHeight[rank] > node.height) {
      node.height = this.maxRankHeight[rank];
    }

    var child = node.child;

    while (child != null) {
      this.setCellHeights(child, rank + 1);
      child = child.next;
    }
  }

  dfs(cell, parent) {
    var id = mxCellPath.create(cell);
    var node = null;

    if (cell != null && this.visited[id] == null && !this.isVertexIgnored(cell)) {
      this.visited[id] = cell;
      node = this.createNode(cell);
      var model = this.graph.getModel();
      var prev = null;
      var out = this.graph.getEdges(cell, parent, this.invert, !this.invert, false, true);
      var view = this.graph.getView();

      if (this.sortEdges) {
        this.sortOutgoingEdges(cell, out);
      }

      for (var i = 0; i < out.length; i++) {
        var edge = out[i];

        if (!this.isEdgeIgnored(edge)) {
          if (this.resetEdges) {
            this.setEdgePoints(edge, null);
          }

          if (this.edgeRouting) {
            this.setEdgeStyleEnabled(edge, false);
            this.setEdgePoints(edge, null);
          }

          var state = view.getState(edge);
          var target =
            state != null ? state.getVisibleTerminal(this.invert) : view.getVisibleTerminal(edge, this.invert);
          var tmp = this.dfs(target, parent);

          if (tmp != null && model.getGeometry(target) != null) {
            if (prev == null) {
              node.child = tmp;
            } else {
              prev.next = tmp;
            }

            prev = tmp;
          }
        }
      }
    }

    return node;
  }

  layout(node) {
    if (node != null) {
      var child = node.child;

      while (child != null) {
        this.layout(child);
        child = child.next;
      }

      if (node.child != null) {
        this.attachParent(node, this.join(node));
      } else {
        this.layoutLeaf(node);
      }
    }
  }

  horizontalLayout(node, x0, y0, bounds) {
    node.x += x0 + node.offsetX;
    node.y += y0 + node.offsetY;
    bounds = this.apply(node, bounds);
    var child = node.child;

    if (child != null) {
      bounds = this.horizontalLayout(child, node.x, node.y, bounds);
      var siblingOffset = node.y + child.offsetY;
      var s = child.next;

      while (s != null) {
        bounds = this.horizontalLayout(s, node.x + child.offsetX, siblingOffset, bounds);
        siblingOffset += s.offsetY;
        s = s.next;
      }
    }

    return bounds;
  }

  verticalLayout(node, parent, x0, y0, bounds) {
    node.x += x0 + node.offsetY;
    node.y += y0 + node.offsetX;
    bounds = this.apply(node, bounds);
    var child = node.child;

    if (child != null) {
      bounds = this.verticalLayout(child, node, node.x, node.y, bounds);
      var siblingOffset = node.x + child.offsetY;
      var s = child.next;

      while (s != null) {
        bounds = this.verticalLayout(s, node, siblingOffset, node.y + child.offsetX, bounds);
        siblingOffset += s.offsetY;
        s = s.next;
      }
    }

    return bounds;
  }

  attachParent(node, height) {
    var x = this.nodeDistance + this.levelDistance;
    var y2 = (height - node.width) / 2 - this.nodeDistance;
    var y1 = y2 + node.width + 2 * this.nodeDistance - height;
    node.child.offsetX = x + node.height;
    node.child.offsetY = y1;
    node.contour.upperHead = this.createLine(node.height, 0, this.createLine(x, y1, node.contour.upperHead));
    node.contour.lowerHead = this.createLine(node.height, 0, this.createLine(x, y2, node.contour.lowerHead));
  }

  layoutLeaf(node) {
    var dist = 2 * this.nodeDistance;
    node.contour.upperTail = this.createLine(node.height + dist, 0);
    node.contour.upperHead = node.contour.upperTail;
    node.contour.lowerTail = this.createLine(0, -node.width - dist);
    node.contour.lowerHead = this.createLine(node.height + dist, 0, node.contour.lowerTail);
  }

  join(node) {
    var dist = 2 * this.nodeDistance;
    var child = node.child;
    node.contour = child.contour;
    var h = child.width + dist;
    var sum = h;
    child = child.next;

    while (child != null) {
      var d = this.merge(node.contour, child.contour);
      child.offsetY = d + h;
      child.offsetX = 0;
      h = child.width + dist;
      sum += d + h;
      child = child.next;
    }

    return sum;
  }

  merge(p1, p2) {
    var x = 0;
    var y = 0;
    var total = 0;
    var upper = p1.lowerHead;
    var lower = p2.upperHead;

    while (lower != null && upper != null) {
      var d = this.offset(x, y, lower.dx, lower.dy, upper.dx, upper.dy);
      y += d;
      total += d;

      if (x + lower.dx <= upper.dx) {
        x += lower.dx;
        y += lower.dy;
        lower = lower.next;
      } else {
        x -= upper.dx;
        y -= upper.dy;
        upper = upper.next;
      }
    }

    if (lower != null) {
      var b = this.bridge(p1.upperTail, 0, 0, lower, x, y);
      p1.upperTail = b.next != null ? p2.upperTail : b;
      p1.lowerTail = p2.lowerTail;
    } else {
      var b = this.bridge(p2.lowerTail, x, y, upper, 0, 0);

      if (b.next == null) {
        p1.lowerTail = b;
      }
    }

    p1.lowerHead = p2.lowerHead;
    return total;
  }

  offset(p1, p2, a1, a2, b1, b2) {
    var d = 0;

    if (b1 <= p1 || p1 + a1 <= 0) {
      return 0;
    }

    var t = b1 * a2 - a1 * b2;

    if (t > 0) {
      if (p1 < 0) {
        var s = p1 * a2;
        d = s / a1 - p2;
      } else if (p1 > 0) {
        var s = p1 * b2;
        d = s / b1 - p2;
      } else {
        d = -p2;
      }
    } else if (b1 < p1 + a1) {
      var s = (b1 - p1) * a2;
      d = b2 - (p2 + s / a1);
    } else if (b1 > p1 + a1) {
      var s = (a1 + p1) * b2;
      d = s / b1 - (p2 + a2);
    } else {
      d = b2 - (p2 + a2);
    }

    if (d > 0) {
      return d;
    } else {
      return 0;
    }
  }

  bridge(line1, x1, y1, line2, x2, y2) {
    var dx = x2 + line2.dx - x1;
    var dy = 0;
    var s = 0;

    if (line2.dx == 0) {
      dy = line2.dy;
    } else {
      s = dx * line2.dy;
      dy = s / line2.dx;
    }

    var r = this.createLine(dx, dy, line2.next);
    line1.next = this.createLine(0, y2 + line2.dy - dy - y1, r);
    return r;
  }

  createNode(cell) {
    var node = new Object();
    node.cell = cell;
    node.x = 0;
    node.y = 0;
    node.width = 0;
    node.height = 0;
    var geo = this.getVertexBounds(cell);

    if (geo != null) {
      if (this.isHorizontal()) {
        node.width = geo.height;
        node.height = geo.width;
      } else {
        node.width = geo.width;
        node.height = geo.height;
      }
    }

    node.offsetX = 0;
    node.offsetY = 0;
    node.contour = new Object();
    return node;
  }

  apply(node, bounds) {
    var model = this.graph.getModel();
    var cell = node.cell;
    var g = model.getGeometry(cell);

    if (cell != null && g != null) {
      if (this.isVertexMovable(cell)) {
        g = this.setVertexLocation(cell, node.x, node.y);

        if (this.resizeParent) {
          var parent = model.getParent(cell);
          var id = mxCellPath.create(parent);

          if (this.parentsChanged[id] == null) {
            this.parentsChanged[id] = parent;
          }
        }
      }

      if (bounds == null) {
        bounds = new mxRectangle(g.x, g.y, g.width, g.height);
      } else {
        bounds = new mxRectangle(
          Math.min(bounds.x, g.x),
          Math.min(bounds.y, g.y),
          Math.max(bounds.x + bounds.width, g.x + g.width),
          Math.max(bounds.y + bounds.height, g.y + g.height)
        );
      }
    }

    return bounds;
  }

  createLine(dx, dy, next) {
    var line = new Object();
    line.dx = dx;
    line.dy = dy;
    line.next = next;
    return line;
  }

  adjustParents() {
    var tmp = [];

    for (var id in this.parentsChanged) {
      tmp.push(this.parentsChanged[id]);
    }

    this.arrangeGroups(
      mxUtils.sortCells(tmp, true),
      this.groupPadding,
      this.groupPaddingTop,
      this.groupPaddingRight,
      this.groupPaddingBottom,
      this.groupPaddingLeft
    );
  }

  localEdgeProcessing(node) {
    this.processNodeOutgoing(node);
    var child = node.child;

    while (child != null) {
      this.localEdgeProcessing(child);
      child = child.next;
    }
  }

  processNodeOutgoing(node) {
    var child = node.child;
    var parentCell = node.cell;
    var childCount = 0;
    var sortedCells = [];

    while (child != null) {
      childCount++;
      var sortingCriterion = child.x;

      if (this.horizontal) {
        sortingCriterion = child.y;
      }

      sortedCells.push(new WeightedCellSorter(child, sortingCriterion));
      child = child.next;
    }

    sortedCells.sort(WeightedCellSorter.compare);
    var availableWidth = node.width;
    var requiredWidth = (childCount + 1) * this.prefHozEdgeSep;

    if (availableWidth > requiredWidth + 2 * this.prefHozEdgeSep) {
      availableWidth -= 2 * this.prefHozEdgeSep;
    }

    var edgeSpacing = availableWidth / childCount;
    var currentXOffset = edgeSpacing / 2.0;

    if (availableWidth > requiredWidth + 2 * this.prefHozEdgeSep) {
      currentXOffset += this.prefHozEdgeSep;
    }

    var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
    var maxYOffset = 0;
    var parentBounds = this.getVertexBounds(parentCell);
    child = node.child;

    for (var j = 0; j < sortedCells.length; j++) {
      var childCell = sortedCells[j].cell.cell;
      var childBounds = this.getVertexBounds(childCell);
      var edges = this.graph.getEdgesBetween(parentCell, childCell, false);
      var newPoints = [];
      var x = 0;
      var y = 0;

      for (var i = 0; i < edges.length; i++) {
        if (this.horizontal) {
          x = parentBounds.x + parentBounds.width;
          y = parentBounds.y + currentXOffset;
          newPoints.push(new mxPoint(x, y));
          x = parentBounds.x + parentBounds.width + currentYOffset;
          newPoints.push(new mxPoint(x, y));
          y = childBounds.y + childBounds.height / 2.0;
          newPoints.push(new mxPoint(x, y));
          this.setEdgePoints(edges[i], newPoints);
        } else {
          x = parentBounds.x + currentXOffset;
          y = parentBounds.y + parentBounds.height;
          newPoints.push(new mxPoint(x, y));
          y = parentBounds.y + parentBounds.height + currentYOffset;
          newPoints.push(new mxPoint(x, y));
          x = childBounds.x + childBounds.width / 2.0;
          newPoints.push(new mxPoint(x, y));
          this.setEdgePoints(edges[i], newPoints);
        }
      }

      if (j < childCount / 2) {
        currentYOffset += this.prefVertEdgeOff;
      } else if (j > childCount / 2) {
        currentYOffset -= this.prefVertEdgeOff;
      }

      currentXOffset += edgeSpacing;
      maxYOffset = Math.max(maxYOffset, currentYOffset);
    }
  }
}
