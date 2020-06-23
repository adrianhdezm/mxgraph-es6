import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';

export class mxFastOrganicLayout extends mxGraphLayout {
  useInputOrigin = true;
  resetEdges = true;
  disableEdgeStyle = true;
  forceConstant = 50;
  forceConstantSquared = 0;
  minDistanceLimit = 2;
  maxDistanceLimit = 500;
  minDistanceLimitSquared = 4;
  initialTemp = 200;
  temperature = 0;
  maxIterations = 0;
  iteration = 0;
  vertexArray;
  dispX;
  dispY;
  cellLocation;
  radius;
  radiusSquared;
  isMoveable;
  neighbours;
  indices;
  allowedToRun = true;

  constructor(graph) {
    super(graph);
  }

  isVertexIgnored(vertex) {
    return super.isVertexIgnored(vertex) || this.graph.getConnections(vertex).length == 0;
  }

  execute(parent) {
    var model = this.graph.getModel();
    this.vertexArray = [];
    var cells = this.graph.getChildVertices(parent);

    for (var i = 0; i < cells.length; i++) {
      if (!this.isVertexIgnored(cells[i])) {
        this.vertexArray.push(cells[i]);
      }
    }

    var initialBounds = this.useInputOrigin ? this.graph.getBoundingBoxFromGeometry(this.vertexArray) : null;
    var n = this.vertexArray.length;
    this.indices = [];
    this.dispX = [];
    this.dispY = [];
    this.cellLocation = [];
    this.isMoveable = [];
    this.neighbours = [];
    this.radius = [];
    this.radiusSquared = [];

    if (this.forceConstant < 0.001) {
      this.forceConstant = 0.001;
    }

    this.forceConstantSquared = this.forceConstant * this.forceConstant;

    for (var i = 0; i < this.vertexArray.length; i++) {
      var vertex = this.vertexArray[i];
      this.cellLocation[i] = [];
      var id = mxObjectIdentity.get(vertex);
      this.indices[id] = i;
      var bounds = this.getVertexBounds(vertex);
      var width = bounds.width;
      var height = bounds.height;
      var x = bounds.x;
      var y = bounds.y;
      this.cellLocation[i][0] = x + width / 2.0;
      this.cellLocation[i][1] = y + height / 2.0;
      this.radius[i] = Math.min(width, height);
      this.radiusSquared[i] = this.radius[i] * this.radius[i];
    }

    model.beginUpdate();

    try {
      for (var i = 0; i < n; i++) {
        this.dispX[i] = 0;
        this.dispY[i] = 0;
        this.isMoveable[i] = this.isVertexMovable(this.vertexArray[i]);
        var edges = this.graph.getConnections(this.vertexArray[i], parent);
        var cells = this.graph.getOpposites(edges, this.vertexArray[i]);
        this.neighbours[i] = [];

        for (var j = 0; j < cells.length; j++) {
          if (this.resetEdges) {
            this.graph.resetEdge(edges[j]);
          }

          if (this.disableEdgeStyle) {
            this.setEdgeStyleEnabled(edges[j], false);
          }

          var id = mxObjectIdentity.get(cells[j]);
          var index = this.indices[id];

          if (index != null) {
            this.neighbours[i][j] = index;
          } else {
            this.neighbours[i][j] = i;
          }
        }
      }

      this.temperature = this.initialTemp;

      if (this.maxIterations == 0) {
        this.maxIterations = 20 * Math.sqrt(n);
      }

      for (this.iteration = 0; this.iteration < this.maxIterations; this.iteration++) {
        if (!this.allowedToRun) {
          return;
        }

        this.calcRepulsion();
        this.calcAttraction();
        this.calcPositions();
        this.reduceTemperature();
      }

      var minx = null;
      var miny = null;

      for (var i = 0; i < this.vertexArray.length; i++) {
        var vertex = this.vertexArray[i];

        if (this.isVertexMovable(vertex)) {
          var bounds = this.getVertexBounds(vertex);

          if (bounds != null) {
            this.cellLocation[i][0] -= bounds.width / 2.0;
            this.cellLocation[i][1] -= bounds.height / 2.0;
            var x = this.graph.snap(Math.round(this.cellLocation[i][0]));
            var y = this.graph.snap(Math.round(this.cellLocation[i][1]));
            this.setVertexLocation(vertex, x, y);

            if (minx == null) {
              minx = x;
            } else {
              minx = Math.min(minx, x);
            }

            if (miny == null) {
              miny = y;
            } else {
              miny = Math.min(miny, y);
            }
          }
        }
      }

      var dx = -(minx || 0) + 1;
      var dy = -(miny || 0) + 1;

      if (initialBounds != null) {
        dx += initialBounds.x;
        dy += initialBounds.y;
      }

      this.graph.moveCells(this.vertexArray, dx, dy);
    } finally {
      model.endUpdate();
    }
  }

  calcPositions() {
    for (var index = 0; index < this.vertexArray.length; index++) {
      if (this.isMoveable[index]) {
        var deltaLength = Math.sqrt(this.dispX[index] * this.dispX[index] + this.dispY[index] * this.dispY[index]);

        if (deltaLength < 0.001) {
          deltaLength = 0.001;
        }

        var newXDisp = (this.dispX[index] / deltaLength) * Math.min(deltaLength, this.temperature);
        var newYDisp = (this.dispY[index] / deltaLength) * Math.min(deltaLength, this.temperature);
        this.dispX[index] = 0;
        this.dispY[index] = 0;
        this.cellLocation[index][0] += newXDisp;
        this.cellLocation[index][1] += newYDisp;
      }
    }
  }

  calcAttraction() {
    for (var i = 0; i < this.vertexArray.length; i++) {
      for (var k = 0; k < this.neighbours[i].length; k++) {
        var j = this.neighbours[i][k];

        if (i != j && this.isMoveable[i] && this.isMoveable[j]) {
          var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
          var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];
          var deltaLengthSquared = xDelta * xDelta + yDelta * yDelta - this.radiusSquared[i] - this.radiusSquared[j];

          if (deltaLengthSquared < this.minDistanceLimitSquared) {
            deltaLengthSquared = this.minDistanceLimitSquared;
          }

          var deltaLength = Math.sqrt(deltaLengthSquared);
          var force = deltaLengthSquared / this.forceConstant;
          var displacementX = (xDelta / deltaLength) * force;
          var displacementY = (yDelta / deltaLength) * force;
          this.dispX[i] -= displacementX;
          this.dispY[i] -= displacementY;
          this.dispX[j] += displacementX;
          this.dispY[j] += displacementY;
        }
      }
    }
  }

  calcRepulsion() {
    var vertexCount = this.vertexArray.length;

    for (var i = 0; i < vertexCount; i++) {
      for (var j = i; j < vertexCount; j++) {
        if (!this.allowedToRun) {
          return;
        }

        if (j != i && this.isMoveable[i] && this.isMoveable[j]) {
          var xDelta = this.cellLocation[i][0] - this.cellLocation[j][0];
          var yDelta = this.cellLocation[i][1] - this.cellLocation[j][1];

          if (xDelta == 0) {
            xDelta = 0.01 + Math.random();
          }

          if (yDelta == 0) {
            yDelta = 0.01 + Math.random();
          }

          var deltaLength = Math.sqrt(xDelta * xDelta + yDelta * yDelta);
          var deltaLengthWithRadius = deltaLength - this.radius[i] - this.radius[j];

          if (deltaLengthWithRadius > this.maxDistanceLimit) {
            continue;
          }

          if (deltaLengthWithRadius < this.minDistanceLimit) {
            deltaLengthWithRadius = this.minDistanceLimit;
          }

          var force = this.forceConstantSquared / deltaLengthWithRadius;
          var displacementX = (xDelta / deltaLength) * force;
          var displacementY = (yDelta / deltaLength) * force;
          this.dispX[i] += displacementX;
          this.dispY[i] += displacementY;
          this.dispX[j] -= displacementX;
          this.dispY[j] -= displacementY;
        }
      }
    }
  }

  reduceTemperature() {
    this.temperature = this.initialTemp * (1.0 - this.iteration / this.maxIterations);
  }
}
