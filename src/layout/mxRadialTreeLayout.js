import { mxCompactTreeLayout } from '@mxgraph/layout/mxCompactTreeLayout';

export class mxRadialTreeLayout extends mxCompactTreeLayout {
  angleOffset = 0.5;
  rootx = 0;
  rooty = 0;
  levelDistance = 120;
  nodeDistance = 10;
  autoRadius = false;
  sortEdges = false;
  rowMinX = [];
  rowMaxX = [];
  rowMinCenX = [];
  rowMaxCenX = [];
  rowRadi = [];
  row = [];

  constructor(graph) {
    super(graph, false);
  }

  isVertexIgnored(vertex) {
    return super.isVertexIgnored(vertex) || this.graph.getConnections(vertex).length == 0;
  }

  execute(parent, root) {
    this.parent = parent;
    this.useBoundingBox = false;
    this.edgeRouting = false;
    super.execute(parent, root);
    var bounds = null;
    var rootBounds = this.getVertexBounds(this.root);
    this.centerX = rootBounds.x + rootBounds.width / 2;
    this.centerY = rootBounds.y + rootBounds.height / 2;

    for (var vertex in this.visited) {
      var vertexBounds = this.getVertexBounds(this.visited[vertex]);
      bounds = bounds != null ? bounds : vertexBounds.clone();
      bounds.add(vertexBounds);
    }

    this.calcRowDims([this.node], 0);
    var maxLeftGrad = 0;
    var maxRightGrad = 0;

    for (var i = 0; i < this.row.length; i++) {
      var leftGrad = (this.centerX - this.rowMinX[i] - this.nodeDistance) / this.rowRadi[i];
      var rightGrad = (this.rowMaxX[i] - this.centerX - this.nodeDistance) / this.rowRadi[i];
      maxLeftGrad = Math.max(maxLeftGrad, leftGrad);
      maxRightGrad = Math.max(maxRightGrad, rightGrad);
    }

    for (var i = 0; i < this.row.length; i++) {
      var xLeftLimit = this.centerX - this.nodeDistance - maxLeftGrad * this.rowRadi[i];
      var xRightLimit = this.centerX + this.nodeDistance + maxRightGrad * this.rowRadi[i];
      var fullWidth = xRightLimit - xLeftLimit;

      for (var j = 0; j < this.row[i].length; j++) {
        var row = this.row[i];
        var node = row[j];
        var vertexBounds = this.getVertexBounds(node.cell);
        var xProportion = (vertexBounds.x + vertexBounds.width / 2 - xLeftLimit) / fullWidth;
        var theta = 2 * Math.PI * xProportion;
        node.theta = theta;
      }
    }

    for (var i = this.row.length - 2; i >= 0; i--) {
      var row = this.row[i];

      for (var j = 0; j < row.length; j++) {
        var node = row[j];
        var child = node.child;
        var counter = 0;
        var totalTheta = 0;

        while (child != null) {
          totalTheta += child.theta;
          counter++;
          child = child.next;
        }

        if (counter > 0) {
          var averTheta = totalTheta / counter;

          if (averTheta > node.theta && j < row.length - 1) {
            var nextTheta = row[j + 1].theta;
            node.theta = Math.min(averTheta, nextTheta - Math.PI / 10);
          } else if (averTheta < node.theta && j > 0) {
            var lastTheta = row[j - 1].theta;
            node.theta = Math.max(averTheta, lastTheta + Math.PI / 10);
          }
        }
      }
    }

    for (var i = 0; i < this.row.length; i++) {
      for (var j = 0; j < this.row[i].length; j++) {
        var row = this.row[i];
        var node = row[j];
        var vertexBounds = this.getVertexBounds(node.cell);
        this.setVertexLocation(
          node.cell,
          this.centerX - vertexBounds.width / 2 + this.rowRadi[i] * Math.cos(node.theta),
          this.centerY - vertexBounds.height / 2 + this.rowRadi[i] * Math.sin(node.theta)
        );
      }
    }
  }

  calcRowDims(row, rowNum) {
    if (row == null || row.length == 0) {
      return;
    }

    this.rowMinX[rowNum] = this.centerX;
    this.rowMaxX[rowNum] = this.centerX;
    this.rowMinCenX[rowNum] = this.centerX;
    this.rowMaxCenX[rowNum] = this.centerX;
    this.row[rowNum] = [];
    var rowHasChildren = false;

    for (var i = 0; i < row.length; i++) {
      var child = row[i] != null ? row[i].child : null;

      while (child != null) {
        var cell = child.cell;
        var vertexBounds = this.getVertexBounds(cell);
        this.rowMinX[rowNum] = Math.min(vertexBounds.x, this.rowMinX[rowNum]);
        this.rowMaxX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width, this.rowMaxX[rowNum]);
        this.rowMinCenX[rowNum] = Math.min(vertexBounds.x + vertexBounds.width / 2, this.rowMinCenX[rowNum]);
        this.rowMaxCenX[rowNum] = Math.max(vertexBounds.x + vertexBounds.width / 2, this.rowMaxCenX[rowNum]);
        this.rowRadi[rowNum] = vertexBounds.y - this.getVertexBounds(this.root).y;

        if (child.child != null) {
          rowHasChildren = true;
        }

        this.row[rowNum].push(child);
        child = child.next;
      }
    }

    if (rowHasChildren) {
      this.calcRowDims(this.row[rowNum], rowNum + 1);
    }
  }
}
