import { mxHierarchicalLayoutStage } from '@mxgraph/layout/hierarchical/stage/mxHierarchicalLayoutStage';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxHierarchicalEdgeStyle } from '@mxgraph/layout/hierarchical/mxHierarchicalEdgeStyle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { WeightedCellSorter } from '@mxgraph/layout/WeightedCellSorter';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxLog } from '@mxgraph/util/mxLog';
export class mxCoordinateAssignment extends mxHierarchicalLayoutStage {
  maxIterations = 8;
  prefHozEdgeSep = 5;
  prefVertEdgeOff = 2;
  minEdgeJetty = 12;
  channelBuffer = 4;
  jettyPositions = null;
  limitX = null;
  currentXDelta = null;
  widestRank = null;
  rankTopY = null;
  rankBottomY = null;
  widestRankValue = null;
  rankWidths = null;
  rankY = null;
  fineTuning = true;
  nextLayerConnectedCache = null;
  previousLayerConnectedCache = null;
  groupPadding = 10;

  constructor(layout, intraCellSpacing, interRankCellSpacing, orientation, initialX, parallelEdgeSpacing) {
    super();
    this.layout = layout;
    this.intraCellSpacing = intraCellSpacing;
    this.interRankCellSpacing = interRankCellSpacing;
    this.orientation = orientation;
    this.initialX = initialX;
    this.parallelEdgeSpacing = parallelEdgeSpacing;
  }

  printStatus() {
    var model = this.layout.getModel();
    mxLog.show();
    mxLog.writeln('======Coord assignment debug=======');

    for (var j = 0; j < model.ranks.length; j++) {
      mxLog.write('Rank ', j, ' : ');
      var rank = model.ranks[j];

      for (var k = 0; k < rank.length; k++) {
        var cell = rank[k];
        mxLog.write(cell.getGeneralPurposeVariable(j), '  ');
      }

      mxLog.writeln();
    }

    mxLog.writeln('====================================');
  }

  execute(parent) {
    this.jettyPositions = Object();
    var model = this.layout.getModel();
    this.currentXDelta = 0.0;
    this.initialCoords(this.layout.getGraph(), model);

    if (this.fineTuning) {
      this.minNode(model);
    }

    var bestXDelta = 100000000.0;

    if (this.fineTuning) {
      for (var i = 0; i < this.maxIterations; i++) {
        if (i != 0) {
          this.medianPos(i, model);
          this.minNode(model);
        }

        if (this.currentXDelta < bestXDelta) {
          for (var j = 0; j < model.ranks.length; j++) {
            var rank = model.ranks[j];

            for (var k = 0; k < rank.length; k++) {
              var cell = rank[k];
              cell.setX(j, cell.getGeneralPurposeVariable(j));
            }
          }

          bestXDelta = this.currentXDelta;
        } else {
          for (var j = 0; j < model.ranks.length; j++) {
            var rank = model.ranks[j];

            for (var k = 0; k < rank.length; k++) {
              var cell = rank[k];
              cell.setGeneralPurposeVariable(j, cell.getX(j));
            }
          }
        }

        this.minPath(this.layout.getGraph(), model);
        this.currentXDelta = 0;
      }
    }

    this.setCellLocations(this.layout.getGraph(), model);
  }

  minNode(model) {
    var nodeList = [];
    var map = new mxDictionary();
    var rank = [];

    for (var i = 0; i <= model.maxRank; i++) {
      rank[i] = model.ranks[i];

      for (var j = 0; j < rank[i].length; j++) {
        var node = rank[i][j];
        var nodeWrapper = new WeightedCellSorter(node, i);
        nodeWrapper.rankIndex = j;
        nodeWrapper.visited = true;
        nodeList.push(nodeWrapper);
        map.put(node, nodeWrapper);
      }
    }

    var maxTries = nodeList.length * 10;
    var count = 0;
    var tolerance = 1;

    while (nodeList.length > 0 && count <= maxTries) {
      var cellWrapper = nodeList.shift();
      var cell = cellWrapper.cell;
      var rankValue = cellWrapper.weightedValue;
      var rankIndex = parseInt(cellWrapper.rankIndex);
      var nextLayerConnectedCells = cell.getNextLayerConnectedCells(rankValue);
      var previousLayerConnectedCells = cell.getPreviousLayerConnectedCells(rankValue);
      var numNextLayerConnected = nextLayerConnectedCells.length;
      var numPreviousLayerConnected = previousLayerConnectedCells.length;
      var medianNextLevel = this.medianXValue(nextLayerConnectedCells, rankValue + 1);
      var medianPreviousLevel = this.medianXValue(previousLayerConnectedCells, rankValue - 1);
      var numConnectedNeighbours = numNextLayerConnected + numPreviousLayerConnected;
      var currentPosition = cell.getGeneralPurposeVariable(rankValue);
      var cellMedian = currentPosition;

      if (numConnectedNeighbours > 0) {
        cellMedian =
          (medianNextLevel * numNextLayerConnected + medianPreviousLevel * numPreviousLayerConnected) /
          numConnectedNeighbours;
      }

      var positionChanged = false;

      if (cellMedian < currentPosition - tolerance) {
        if (rankIndex == 0) {
          cell.setGeneralPurposeVariable(rankValue, cellMedian);
          positionChanged = true;
        } else {
          var leftCell = rank[rankValue][rankIndex - 1];
          var leftLimit = leftCell.getGeneralPurposeVariable(rankValue);
          leftLimit = leftLimit + leftCell.width / 2 + this.intraCellSpacing + cell.width / 2;

          if (leftLimit < cellMedian) {
            cell.setGeneralPurposeVariable(rankValue, cellMedian);
            positionChanged = true;
          } else if (leftLimit < cell.getGeneralPurposeVariable(rankValue) - tolerance) {
            cell.setGeneralPurposeVariable(rankValue, leftLimit);
            positionChanged = true;
          }
        }
      } else if (cellMedian > currentPosition + tolerance) {
        var rankSize = rank[rankValue].length;

        if (rankIndex == rankSize - 1) {
          cell.setGeneralPurposeVariable(rankValue, cellMedian);
          positionChanged = true;
        } else {
          var rightCell = rank[rankValue][rankIndex + 1];
          var rightLimit = rightCell.getGeneralPurposeVariable(rankValue);
          rightLimit = rightLimit - rightCell.width / 2 - this.intraCellSpacing - cell.width / 2;

          if (rightLimit > cellMedian) {
            cell.setGeneralPurposeVariable(rankValue, cellMedian);
            positionChanged = true;
          } else if (rightLimit > cell.getGeneralPurposeVariable(rankValue) + tolerance) {
            cell.setGeneralPurposeVariable(rankValue, rightLimit);
            positionChanged = true;
          }
        }
      }

      if (positionChanged) {
        for (var i = 0; i < nextLayerConnectedCells.length; i++) {
          var connectedCell = nextLayerConnectedCells[i];
          var connectedCellWrapper = map.get(connectedCell);

          if (connectedCellWrapper != null) {
            if (connectedCellWrapper.visited == false) {
              connectedCellWrapper.visited = true;
              nodeList.push(connectedCellWrapper);
            }
          }
        }

        for (var i = 0; i < previousLayerConnectedCells.length; i++) {
          var connectedCell = previousLayerConnectedCells[i];
          var connectedCellWrapper = map.get(connectedCell);

          if (connectedCellWrapper != null) {
            if (connectedCellWrapper.visited == false) {
              connectedCellWrapper.visited = true;
              nodeList.push(connectedCellWrapper);
            }
          }
        }
      }

      cellWrapper.visited = false;
      count++;
    }
  }

  medianPos(i, model) {
    var downwardSweep = i % 2 == 0;

    if (downwardSweep) {
      for (var j = model.maxRank; j > 0; j--) {
        this.rankMedianPosition(j - 1, model, j);
      }
    } else {
      for (var j = 0; j < model.maxRank - 1; j++) {
        this.rankMedianPosition(j + 1, model, j);
      }
    }
  }

  rankMedianPosition(rankValue, model, nextRankValue) {
    var rank = model.ranks[rankValue];
    var weightedValues = [];
    var cellMap = new Object();

    for (var i = 0; i < rank.length; i++) {
      var currentCell = rank[i];
      weightedValues[i] = new WeightedCellSorter();
      weightedValues[i].cell = currentCell;
      weightedValues[i].rankIndex = i;
      cellMap[currentCell.id] = weightedValues[i];
      var nextLayerConnectedCells = null;

      if (nextRankValue < rankValue) {
        nextLayerConnectedCells = currentCell.getPreviousLayerConnectedCells(rankValue);
      } else {
        nextLayerConnectedCells = currentCell.getNextLayerConnectedCells(rankValue);
      }

      weightedValues[i].weightedValue = this.calculatedWeightedValue(currentCell, nextLayerConnectedCells);
    }

    weightedValues.sort(WeightedCellSorter.compare);

    for (var i = 0; i < weightedValues.length; i++) {
      var numConnectionsNextLevel = 0;
      var cell = weightedValues[i].cell;
      var nextLayerConnectedCells = null;
      var medianNextLevel = 0;

      if (nextRankValue < rankValue) {
        nextLayerConnectedCells = cell.getPreviousLayerConnectedCells(rankValue).slice();
      } else {
        nextLayerConnectedCells = cell.getNextLayerConnectedCells(rankValue).slice();
      }

      if (nextLayerConnectedCells != null) {
        numConnectionsNextLevel = nextLayerConnectedCells.length;

        if (numConnectionsNextLevel > 0) {
          medianNextLevel = this.medianXValue(nextLayerConnectedCells, nextRankValue);
        } else {
          medianNextLevel = cell.getGeneralPurposeVariable(rankValue);
        }
      }

      var leftBuffer = 0.0;
      var leftLimit = -100000000.0;

      for (var j = weightedValues[i].rankIndex - 1; j >= 0; ) {
        var weightedValue = cellMap[rank[j].id];

        if (weightedValue != null) {
          var leftCell = weightedValue.cell;

          if (weightedValue.visited) {
            leftLimit =
              leftCell.getGeneralPurposeVariable(rankValue) +
              leftCell.width / 2.0 +
              this.intraCellSpacing +
              leftBuffer +
              cell.width / 2.0;
            j = -1;
          } else {
            leftBuffer += leftCell.width + this.intraCellSpacing;
            j--;
          }
        }
      }

      var rightBuffer = 0.0;
      var rightLimit = 100000000.0;

      for (var j = weightedValues[i].rankIndex + 1; j < weightedValues.length; ) {
        var weightedValue = cellMap[rank[j].id];

        if (weightedValue != null) {
          var rightCell = weightedValue.cell;

          if (weightedValue.visited) {
            rightLimit =
              rightCell.getGeneralPurposeVariable(rankValue) -
              rightCell.width / 2.0 -
              this.intraCellSpacing -
              rightBuffer -
              cell.width / 2.0;
            j = weightedValues.length;
          } else {
            rightBuffer += rightCell.width + this.intraCellSpacing;
            j++;
          }
        }
      }

      if (medianNextLevel >= leftLimit && medianNextLevel <= rightLimit) {
        cell.setGeneralPurposeVariable(rankValue, medianNextLevel);
      } else if (medianNextLevel < leftLimit) {
        cell.setGeneralPurposeVariable(rankValue, leftLimit);
        this.currentXDelta += leftLimit - medianNextLevel;
      } else if (medianNextLevel > rightLimit) {
        cell.setGeneralPurposeVariable(rankValue, rightLimit);
        this.currentXDelta += medianNextLevel - rightLimit;
      }

      weightedValues[i].visited = true;
    }
  }

  calculatedWeightedValue(currentCell, collection) {
    var totalWeight = 0;

    for (var i = 0; i < collection.length; i++) {
      var cell = collection[i];

      if (currentCell.isVertex() && cell.isVertex()) {
        totalWeight++;
      } else if (currentCell.isEdge() && cell.isEdge()) {
        totalWeight += 8;
      } else {
        totalWeight += 2;
      }
    }

    return totalWeight;
  }

  medianXValue(connectedCells, rankValue) {
    if (connectedCells.length == 0) {
      return 0;
    }

    var medianValues = [];

    for (var i = 0; i < connectedCells.length; i++) {
      medianValues[i] = connectedCells[i].getGeneralPurposeVariable(rankValue);
    }

    medianValues.sort(function (a, b) {
      return a - b;
    });

    if (connectedCells.length % 2 == 1) {
      return medianValues[Math.floor(connectedCells.length / 2)];
    } else {
      var medianPoint = connectedCells.length / 2;
      var leftMedian = medianValues[medianPoint - 1];
      var rightMedian = medianValues[medianPoint];
      return (leftMedian + rightMedian) / 2;
    }
  }

  initialCoords(facade, model) {
    this.calculateWidestRank(facade, model);

    for (var i = this.widestRank; i >= 0; i--) {
      if (i < model.maxRank) {
        this.rankCoordinates(i, facade, model);
      }
    }

    for (var i = this.widestRank + 1; i <= model.maxRank; i++) {
      if (i > 0) {
        this.rankCoordinates(i, facade, model);
      }
    }
  }

  rankCoordinates(rankValue, graph, model) {
    var rank = model.ranks[rankValue];
    var maxY = 0.0;
    var localX = this.initialX + (this.widestRankValue - this.rankWidths[rankValue]) / 2;
    var boundsWarning = false;

    for (var i = 0; i < rank.length; i++) {
      var node = rank[i];

      if (node.isVertex()) {
        var bounds = this.layout.getVertexBounds(node.cell);

        if (bounds != null) {
          if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
            node.width = bounds.width;
            node.height = bounds.height;
          } else {
            node.width = bounds.height;
            node.height = bounds.width;
          }
        } else {
          boundsWarning = true;
        }

        maxY = Math.max(maxY, node.height);
      } else if (node.isEdge()) {
        var numEdges = 1;

        if (node.edges != null) {
          numEdges = node.edges.length;
        } else {
          mxLog.warn('edge.edges is null');
        }

        node.width = (numEdges - 1) * this.parallelEdgeSpacing;
      }

      localX += node.width / 2.0;
      node.setX(rankValue, localX);
      node.setGeneralPurposeVariable(rankValue, localX);
      localX += node.width / 2.0;
      localX += this.intraCellSpacing;
    }

    if (boundsWarning == true) {
      mxLog.warn('At least one cell has no bounds');
    }
  }

  calculateWidestRank(graph, model) {
    var y = -this.interRankCellSpacing;
    var lastRankMaxCellHeight = 0.0;
    this.rankWidths = [];
    this.rankY = [];

    for (var rankValue = model.maxRank; rankValue >= 0; rankValue--) {
      var maxCellHeight = 0.0;
      var rank = model.ranks[rankValue];
      var localX = this.initialX;
      var boundsWarning = false;

      for (var i = 0; i < rank.length; i++) {
        var node = rank[i];

        if (node.isVertex()) {
          var bounds = this.layout.getVertexBounds(node.cell);

          if (bounds != null) {
            if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
              node.width = bounds.width;
              node.height = bounds.height;
            } else {
              node.width = bounds.height;
              node.height = bounds.width;
            }
          } else {
            boundsWarning = true;
          }

          maxCellHeight = Math.max(maxCellHeight, node.height);
        } else if (node.isEdge()) {
          var numEdges = 1;

          if (node.edges != null) {
            numEdges = node.edges.length;
          } else {
            mxLog.warn('edge.edges is null');
          }

          node.width = (numEdges - 1) * this.parallelEdgeSpacing;
        }

        localX += node.width / 2.0;
        node.setX(rankValue, localX);
        node.setGeneralPurposeVariable(rankValue, localX);
        localX += node.width / 2.0;
        localX += this.intraCellSpacing;

        if (localX > this.widestRankValue) {
          this.widestRankValue = localX;
          this.widestRank = rankValue;
        }

        this.rankWidths[rankValue] = localX;
      }

      if (boundsWarning == true) {
        mxLog.warn('At least one cell has no bounds');
      }

      this.rankY[rankValue] = y;
      var distanceToNextRank = maxCellHeight / 2.0 + lastRankMaxCellHeight / 2.0 + this.interRankCellSpacing;
      lastRankMaxCellHeight = maxCellHeight;

      if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_WEST) {
        y += distanceToNextRank;
      } else {
        y -= distanceToNextRank;
      }

      for (var i = 0; i < rank.length; i++) {
        var cell = rank[i];
        cell.setY(rankValue, y);
      }
    }
  }

  minPath(graph, model) {
    var edges = model.edgeMapper.getValues();

    for (var j = 0; j < edges.length; j++) {
      var cell = edges[j];

      if (cell.maxRank - cell.minRank - 1 < 1) {
        continue;
      }

      var referenceX = cell.getGeneralPurposeVariable(cell.minRank + 1);
      var edgeStraight = true;
      var refSegCount = 0;

      for (var i = cell.minRank + 2; i < cell.maxRank; i++) {
        var x = cell.getGeneralPurposeVariable(i);

        if (referenceX != x) {
          edgeStraight = false;
          referenceX = x;
        } else {
          refSegCount++;
        }
      }

      if (!edgeStraight) {
        var upSegCount = 0;
        var downSegCount = 0;
        var upXPositions = [];
        var downXPositions = [];
        var currentX = cell.getGeneralPurposeVariable(cell.minRank + 1);

        for (var i = cell.minRank + 1; i < cell.maxRank - 1; i++) {
          var nextX = cell.getX(i + 1);

          if (currentX == nextX) {
            upXPositions[i - cell.minRank - 1] = currentX;
            upSegCount++;
          } else if (this.repositionValid(model, cell, i + 1, currentX)) {
            upXPositions[i - cell.minRank - 1] = currentX;
            upSegCount++;
          } else {
            upXPositions[i - cell.minRank - 1] = nextX;
            currentX = nextX;
          }
        }

        currentX = cell.getX(i);

        for (var i = cell.maxRank - 1; i > cell.minRank + 1; i--) {
          var nextX = cell.getX(i - 1);

          if (currentX == nextX) {
            downXPositions[i - cell.minRank - 2] = currentX;
            downSegCount++;
          } else if (this.repositionValid(model, cell, i - 1, currentX)) {
            downXPositions[i - cell.minRank - 2] = currentX;
            downSegCount++;
          } else {
            downXPositions[i - cell.minRank - 2] = cell.getX(i - 1);
            currentX = nextX;
          }
        }

        if (downSegCount > refSegCount || upSegCount > refSegCount) {
          if (downSegCount >= upSegCount) {
            for (var i = cell.maxRank - 2; i > cell.minRank; i--) {
              cell.setX(i, downXPositions[i - cell.minRank - 1]);
            }
          } else if (upSegCount > downSegCount) {
            for (var i = cell.minRank + 2; i < cell.maxRank; i++) {
              cell.setX(i, upXPositions[i - cell.minRank - 2]);
            }
          } else {
            /* ignore */
          }
        }
      }
    }
  }

  repositionValid(model, cell, rank, position) {
    var rankArray = model.ranks[rank];
    var rankIndex = -1;

    for (var i = 0; i < rankArray.length; i++) {
      if (cell == rankArray[i]) {
        rankIndex = i;
        break;
      }
    }

    if (rankIndex < 0) {
      return false;
    }

    var currentX = cell.getGeneralPurposeVariable(rank);

    if (position < currentX) {
      if (rankIndex == 0) {
        return true;
      }

      var leftCell = rankArray[rankIndex - 1];
      var leftLimit = leftCell.getGeneralPurposeVariable(rank);
      leftLimit = leftLimit + leftCell.width / 2 + this.intraCellSpacing + cell.width / 2;

      if (leftLimit <= position) {
        return true;
      } else {
        return false;
      }
    } else if (position > currentX) {
      if (rankIndex == rankArray.length - 1) {
        return true;
      }

      var rightCell = rankArray[rankIndex + 1];
      var rightLimit = rightCell.getGeneralPurposeVariable(rank);
      rightLimit = rightLimit - rightCell.width / 2 - this.intraCellSpacing - cell.width / 2;

      if (rightLimit >= position) {
        return true;
      } else {
        return false;
      }
    }

    return true;
  }

  setCellLocations(graph, model) {
    this.rankTopY = [];
    this.rankBottomY = [];

    for (var i = 0; i < model.ranks.length; i++) {
      this.rankTopY[i] = Number.MAX_VALUE;
      this.rankBottomY[i] = -Number.MAX_VALUE;
    }

    var vertices = model.vertexMapper.getValues();

    for (var i = 0; i < vertices.length; i++) {
      this.setVertexLocation(vertices[i]);
    }

    if (
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.ORTHOGONAL ||
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.POLYLINE ||
      this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE
    ) {
      this.localEdgeProcessing(model);
    }

    var edges = model.edgeMapper.getValues();

    for (var i = 0; i < edges.length; i++) {
      this.setEdgePosition(edges[i]);
    }
  }

  localEdgeProcessing(model) {
    for (var rankIndex = 0; rankIndex < model.ranks.length; rankIndex++) {
      var rank = model.ranks[rankIndex];

      for (var cellIndex = 0; cellIndex < rank.length; cellIndex++) {
        var cell = rank[cellIndex];

        if (cell.isVertex()) {
          var currentCells = cell.getPreviousLayerConnectedCells(rankIndex);
          var currentRank = rankIndex - 1;

          for (var k = 0; k < 2; k++) {
            if (
              currentRank > -1 &&
              currentRank < model.ranks.length &&
              currentCells != null &&
              currentCells.length > 0
            ) {
              var sortedCells = [];

              for (var j = 0; j < currentCells.length; j++) {
                var sorter = new WeightedCellSorter(currentCells[j], currentCells[j].getX(currentRank));
                sortedCells.push(sorter);
              }

              sortedCells.sort(WeightedCellSorter.compare);
              var leftLimit = cell.x[0] - cell.width / 2;
              var rightLimit = leftLimit + cell.width;
              var connectedEdgeCount = 0;
              var connectedEdgeGroupCount = 0;
              var connectedEdges = [];

              for (var j = 0; j < sortedCells.length; j++) {
                var innerCell = sortedCells[j].cell;
                var connections;

                if (innerCell.isVertex()) {
                  if (k == 0) {
                    connections = cell.connectsAsSource;
                  } else {
                    connections = cell.connectsAsTarget;
                  }

                  for (var connIndex = 0; connIndex < connections.length; connIndex++) {
                    if (connections[connIndex].source == innerCell || connections[connIndex].target == innerCell) {
                      connectedEdgeCount += connections[connIndex].edges.length;
                      connectedEdgeGroupCount++;
                      connectedEdges.push(connections[connIndex]);
                    }
                  }
                } else {
                  connectedEdgeCount += innerCell.edges.length;
                  connectedEdgeGroupCount++;
                  connectedEdges.push(innerCell);
                }
              }

              var requiredWidth = (connectedEdgeCount + 1) * this.prefHozEdgeSep;

              if (cell.width > requiredWidth + 2 * this.prefHozEdgeSep) {
                leftLimit += this.prefHozEdgeSep;
                rightLimit -= this.prefHozEdgeSep;
              }

              var availableWidth = rightLimit - leftLimit;
              var edgeSpacing = availableWidth / connectedEdgeCount;
              var currentX = leftLimit + edgeSpacing / 2.0;
              var currentYOffset = this.minEdgeJetty - this.prefVertEdgeOff;
              var maxYOffset = 0;

              for (var j = 0; j < connectedEdges.length; j++) {
                var numActualEdges = connectedEdges[j].edges.length;
                var pos = this.jettyPositions[connectedEdges[j].ids[0]];

                if (pos == null) {
                  pos = [];
                  this.jettyPositions[connectedEdges[j].ids[0]] = pos;
                }

                if (j < connectedEdgeCount / 2) {
                  currentYOffset += this.prefVertEdgeOff;
                } else if (j > connectedEdgeCount / 2) {
                  currentYOffset -= this.prefVertEdgeOff;
                }

                for (var m = 0; m < numActualEdges; m++) {
                  pos[m * 4 + k * 2] = currentX;
                  currentX += edgeSpacing;
                  pos[m * 4 + k * 2 + 1] = currentYOffset;
                }

                maxYOffset = Math.max(maxYOffset, currentYOffset);
              }
            }

            currentCells = cell.getNextLayerConnectedCells(rankIndex);
            currentRank = rankIndex + 1;
          }
        }
      }
    }
  }

  setEdgePosition(cell) {
    var offsetX = 0;

    if (cell.temp[0] != 101207) {
      var maxRank = cell.maxRank;
      var minRank = cell.minRank;

      if (maxRank == minRank) {
        maxRank = cell.source.maxRank;
        minRank = cell.target.minRank;
      }

      var parallelEdgeCount = 0;
      var jettys = this.jettyPositions[cell.ids[0]];
      var source = cell.isReversed ? cell.target.cell : cell.source.cell;
      var graph = this.layout.graph;
      var layoutReversed =
        this.orientation == mxConstants.DIRECTION_EAST || this.orientation == mxConstants.DIRECTION_SOUTH;

      for (var i = 0; i < cell.edges.length; i++) {
        var realEdge = cell.edges[i];
        var realSource = this.layout.getVisibleTerminal(realEdge, true);
        var newPoints = [];
        var reversed = cell.isReversed;

        if (realSource != source) {
          reversed = !reversed;
        }

        if (jettys != null) {
          var arrayOffset = reversed ? 2 : 0;
          var y = reversed
            ? layoutReversed
              ? this.rankBottomY[minRank]
              : this.rankTopY[minRank]
            : layoutReversed
            ? this.rankTopY[maxRank]
            : this.rankBottomY[maxRank];
          var jetty = jettys[parallelEdgeCount * 4 + 1 + arrayOffset];

          if (reversed != layoutReversed) {
            jetty = -jetty;
          }

          y += jetty;
          var x = jettys[parallelEdgeCount * 4 + arrayOffset];
          var modelSource = graph.model.getTerminal(realEdge, true);

          if (this.layout.isPort(modelSource) && graph.model.getParent(modelSource) == realSource) {
            var state = graph.view.getState(modelSource);

            if (state != null) {
              x = state.x;
            } else {
              x = realSource.geometry.x + cell.source.width * modelSource.geometry.x;
            }
          }

          if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
            newPoints.push(new mxPoint(x, y));

            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(x, y + jetty));
            }
          } else {
            newPoints.push(new mxPoint(y, x));

            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(y + jetty, x));
            }
          }
        }

        var loopStart = cell.x.length - 1;
        var loopLimit = -1;
        var loopDelta = -1;
        var currentRank = cell.maxRank - 1;

        if (reversed) {
          loopStart = 0;
          loopLimit = cell.x.length;
          loopDelta = 1;
          currentRank = cell.minRank + 1;
        }

        for (var j = loopStart; cell.maxRank != cell.minRank && j != loopLimit; j += loopDelta) {
          var positionX = cell.x[j] + offsetX;
          var topChannelY = (this.rankTopY[currentRank] + this.rankBottomY[currentRank + 1]) / 2.0;
          var bottomChannelY = (this.rankTopY[currentRank - 1] + this.rankBottomY[currentRank]) / 2.0;

          if (reversed) {
            var tmp = topChannelY;
            topChannelY = bottomChannelY;
            bottomChannelY = tmp;
          }

          if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
            newPoints.push(new mxPoint(positionX, topChannelY));
            newPoints.push(new mxPoint(positionX, bottomChannelY));
          } else {
            newPoints.push(new mxPoint(topChannelY, positionX));
            newPoints.push(new mxPoint(bottomChannelY, positionX));
          }

          this.limitX = Math.max(this.limitX, positionX);
          currentRank += loopDelta;
        }

        if (jettys != null) {
          var arrayOffset = reversed ? 2 : 0;
          var rankY = reversed
            ? layoutReversed
              ? this.rankTopY[maxRank]
              : this.rankBottomY[maxRank]
            : layoutReversed
            ? this.rankBottomY[minRank]
            : this.rankTopY[minRank];
          var jetty = jettys[parallelEdgeCount * 4 + 3 - arrayOffset];

          if (reversed != layoutReversed) {
            jetty = -jetty;
          }

          var y = rankY - jetty;
          var x = jettys[parallelEdgeCount * 4 + 2 - arrayOffset];
          var modelTarget = graph.model.getTerminal(realEdge, false);
          var realTarget = this.layout.getVisibleTerminal(realEdge, false);

          if (this.layout.isPort(modelTarget) && graph.model.getParent(modelTarget) == realTarget) {
            var state = graph.view.getState(modelTarget);

            if (state != null) {
              x = state.x;
            } else {
              x = realTarget.geometry.x + cell.target.width * modelTarget.geometry.x;
            }
          }

          if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(x, y - jetty));
            }

            newPoints.push(new mxPoint(x, y));
          } else {
            if (this.layout.edgeStyle == mxHierarchicalEdgeStyle.CURVE) {
              newPoints.push(new mxPoint(y - jetty, x));
            }

            newPoints.push(new mxPoint(y, x));
          }
        }

        if (cell.isReversed) {
          this.processReversedEdge(cell, realEdge);
        }

        this.layout.setEdgePoints(realEdge, newPoints);

        if (offsetX == 0.0) {
          offsetX = this.parallelEdgeSpacing;
        } else if (offsetX > 0) {
          offsetX = -offsetX;
        } else {
          offsetX = -offsetX + this.parallelEdgeSpacing;
        }

        parallelEdgeCount++;
      }

      cell.temp[0] = 101207;
    }
  }

  setVertexLocation(cell) {
    var realCell = cell.cell;
    var positionX = cell.x[0] - cell.width / 2;
    var positionY = cell.y[0] - cell.height / 2;
    this.rankTopY[cell.minRank] = Math.min(this.rankTopY[cell.minRank], positionY);
    this.rankBottomY[cell.minRank] = Math.max(this.rankBottomY[cell.minRank], positionY + cell.height);

    if (this.orientation == mxConstants.DIRECTION_NORTH || this.orientation == mxConstants.DIRECTION_SOUTH) {
      this.layout.setVertexLocation(realCell, positionX, positionY);
    } else {
      this.layout.setVertexLocation(realCell, positionY, positionX);
    }

    this.limitX = Math.max(this.limitX, positionX + cell.width);
  }

  processReversedEdge(graph, model) {}
}
