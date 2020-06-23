import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxCoordinateAssignment } from '@mxgraph/layout/hierarchical/stage/mxCoordinateAssignment';
import { mxMedianHybridCrossingReduction } from '@mxgraph/layout/hierarchical/stage/mxMedianHybridCrossingReduction';
import { mxSwimlaneOrdering } from '@mxgraph/layout/hierarchical/stage/mxSwimlaneOrdering';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';
import { mxSwimlaneModel } from '@mxgraph/layout/hierarchical/model/mxSwimlaneModel';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxHierarchicalEdgeStyle } from '@mxgraph/layout/hierarchical/mxHierarchicalEdgeStyle';

export class mxSwimlaneLayout extends mxGraphLayout {
  roots = null;
  swimlanes = null;
  dummyVertexWidth = 50;
  resizeParent = false;
  maintainParentLocation = false;
  moveParent = false;
  parentBorder = 30;
  intraCellSpacing = 30;
  interRankCellSpacing = 100;
  interHierarchySpacing = 60;
  parallelEdgeSpacing = 10;
  fineTuning = true;
  tightenToSource = true;
  disableEdgeStyle = true;
  traverseAncestors = true;
  model = null;
  edgesCache = null;
  edgeSourceTermCache = null;
  edgesTargetTermCache = null;
  edgeStyle = mxHierarchicalEdgeStyle.POLYLINE;

  constructor(graph, orientation, deterministic) {
    super(graph);
    this.orientation = orientation != null ? orientation : mxConstants.DIRECTION_NORTH;
    this.deterministic = deterministic != null ? deterministic : true;
  }

  getModel() {
    return this.model;
  }

  execute(parent, swimlanes) {
    this.parent = parent;
    var model = this.graph.model;
    this.edgesCache = new mxDictionary();
    this.edgeSourceTermCache = new mxDictionary();
    this.edgesTargetTermCache = new mxDictionary();

    if (swimlanes == null || swimlanes.length < 1) {
      return;
    }

    if (parent == null) {
      parent = model.getParent(swimlanes[0]);
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

    this.swimlanes = swimlanes;
    var dummyVertices = [];

    for (var i = 0; i < swimlanes.length; i++) {
      var children = this.graph.getChildCells(swimlanes[i]);

      if (children == null || children.length == 0) {
        var vertex = this.graph.insertVertex(swimlanes[i], null, null, 0, 0, this.dummyVertexWidth, 0);
        dummyVertices.push(vertex);
      }
    }

    model.beginUpdate();

    try {
      this.run(parent);

      if (this.resizeParent && !this.graph.isCellCollapsed(parent)) {
        this.graph.updateGroupBounds([parent], this.parentBorder, this.moveParent);
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

      this.graph.removeCells(dummyVertices);
    } finally {
      model.endUpdate();
    }
  }

  updateGroupBounds() {
    var cells = [];
    var model = this.model;

    for (var key in model.edgeMapper) {
      var edge = model.edgeMapper[key];

      for (var i = 0; i < edge.edges.length; i++) {
        cells.push(edge.edges[i]);
      }
    }

    var layoutBounds = this.graph.getBoundingBoxFromGeometry(cells, true);
    var childBounds = [];

    for (var i = 0; i < this.swimlanes.length; i++) {
      var lane = this.swimlanes[i];
      var geo = this.graph.getCellGeometry(lane);

      if (geo != null) {
        var children = this.graph.getChildCells(lane);
        var size = this.graph.isSwimlane(lane) ? this.graph.getStartSize(lane) : new mxRectangle();
        var bounds = this.graph.getBoundingBoxFromGeometry(children);
        childBounds[i] = bounds;
        var childrenY = bounds.y + geo.y - size.height - this.parentBorder;
        var maxChildrenY = bounds.y + geo.y + bounds.height;

        if (layoutBounds == null) {
          layoutBounds = new mxRectangle(0, childrenY, 0, maxChildrenY - childrenY);
        } else {
          layoutBounds.y = Math.min(layoutBounds.y, childrenY);
          var maxY = Math.max(layoutBounds.y + layoutBounds.height, maxChildrenY);
          layoutBounds.height = maxY - layoutBounds.y;
        }
      }
    }

    for (var i = 0; i < this.swimlanes.length; i++) {
      var lane = this.swimlanes[i];
      var geo = this.graph.getCellGeometry(lane);

      if (geo != null) {
        var children = this.graph.getChildCells(lane);
        var size = this.graph.isSwimlane(lane) ? this.graph.getStartSize(lane) : new mxRectangle();
        var newGeo = geo.clone();
        var leftGroupBorder = i == 0 ? this.parentBorder : this.interRankCellSpacing / 2;
        var w = size.width + leftGroupBorder;
        var x = childBounds[i].x - w;
        var y = layoutBounds.y - this.parentBorder;
        newGeo.x += x;
        newGeo.y = y;
        newGeo.width = childBounds[i].width + w + this.interRankCellSpacing / 2;
        newGeo.height = layoutBounds.height + size.height + 2 * this.parentBorder;
        this.graph.model.setGeometry(lane, newGeo);
        this.graph.moveCells(children, -x, geo.y - y);
      }
    }
  }

  findRoots(parent, vertices) {
    var roots = [];

    if (parent != null && vertices != null) {
      var model = this.graph.model;
      var best = null;
      var maxDiff = -100000;

      for (var i in vertices) {
        var cell = vertices[i];

        if (cell != null && model.isVertex(cell) && this.graph.isCellVisible(cell) && model.isAncestor(parent, cell)) {
          var conns = this.getEdges(cell);
          var fanOut = 0;
          var fanIn = 0;

          for (var k = 0; k < conns.length; k++) {
            var src = this.getVisibleTerminal(conns[k], true);

            if (src == cell) {
              var other = this.getVisibleTerminal(conns[k], false);

              if (model.isAncestor(parent, other)) {
                fanOut++;
              }
            } else if (model.isAncestor(parent, src)) {
              fanIn++;
            }
          }

          if (fanIn == 0 && fanOut > 0) {
            roots.push(cell);
          }

          var diff = fanOut - fanIn;

          if (diff > maxDiff) {
            maxDiff = diff;
            best = cell;
          }
        }
      }

      if (roots.length == 0 && best != null) {
        roots.push(best);
      }
    }

    return roots;
  }

  getEdges(cell) {
    var cachedEdges = this.edgesCache.get(cell);

    if (cachedEdges != null) {
      return cachedEdges;
    }

    var model = this.graph.model;
    var edges = [];
    var isCollapsed = this.graph.isCellCollapsed(cell);
    var childCount = model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(cell, i);

      if (this.isPort(child)) {
        edges = edges.concat(model.getEdges(child, true, true));
      } else if (isCollapsed || !this.graph.isCellVisible(child)) {
        edges = edges.concat(model.getEdges(child, true, true));
      }
    }

    edges = edges.concat(model.getEdges(cell, true, true));
    var result = [];

    for (var i = 0; i < edges.length; i++) {
      var source = this.getVisibleTerminal(edges[i], true);
      var target = this.getVisibleTerminal(edges[i], false);

      if (
        source == target ||
        (source != target &&
          ((target == cell &&
            (this.parent == null || this.graph.isValidAncestor(source, this.parent, this.traverseAncestors))) ||
            (source == cell &&
              (this.parent == null || this.graph.isValidAncestor(target, this.parent, this.traverseAncestors)))))
      ) {
        result.push(edges[i]);
      }
    }

    this.edgesCache.put(cell, result);
    return result;
  }

  getVisibleTerminal(edge, source) {
    var terminalCache = this.edgesTargetTermCache;

    if (source) {
      terminalCache = this.edgeSourceTermCache;
    }

    var term = terminalCache.get(edge);

    if (term != null) {
      return term;
    }

    var state = this.graph.view.getState(edge);
    var terminal = state != null ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);

    if (terminal == null) {
      terminal = state != null ? state.getVisibleTerminal(source) : this.graph.view.getVisibleTerminal(edge, source);
    }

    if (terminal != null) {
      if (this.isPort(terminal)) {
        terminal = this.graph.model.getParent(terminal);
      }

      terminalCache.put(edge, terminal);
    }

    return terminal;
  }

  run(parent) {
    var hierarchyVertices = [];
    var allVertexSet = Object();

    if (this.swimlanes != null && this.swimlanes.length > 0 && parent != null) {
      var filledVertexSet = Object();

      for (var i = 0; i < this.swimlanes.length; i++) {
        this.filterDescendants(this.swimlanes[i], filledVertexSet);
      }

      this.roots = [];
      var filledVertexSetEmpty = true;

      for (var key in filledVertexSet) {
        if (filledVertexSet[key] != null) {
          filledVertexSetEmpty = false;
          break;
        }
      }

      var laneCounter = 0;

      while (!filledVertexSetEmpty && laneCounter < this.swimlanes.length) {
        var candidateRoots = this.findRoots(this.swimlanes[laneCounter], filledVertexSet);

        if (candidateRoots.length == 0) {
          laneCounter++;
          continue;
        }

        for (var i = 0; i < candidateRoots.length; i++) {
          var vertexSet = Object();
          hierarchyVertices.push(vertexSet);
          this.traverse(
            candidateRoots[i],
            true,
            null,
            allVertexSet,
            vertexSet,
            hierarchyVertices,
            filledVertexSet,
            laneCounter
          );
        }

        for (var i = 0; i < candidateRoots.length; i++) {
          this.roots.push(candidateRoots[i]);
        }

        filledVertexSetEmpty = true;

        for (var key in filledVertexSet) {
          if (filledVertexSet[key] != null) {
            filledVertexSetEmpty = false;
            break;
          }
        }
      }
    } else {
      for (var i = 0; i < this.roots.length; i++) {
        var vertexSet = Object();
        hierarchyVertices.push(vertexSet);
        this.traverse(this.roots[i], true, null, allVertexSet, vertexSet, hierarchyVertices, null);
      }
    }

    var tmp = [];

    for (var key in allVertexSet) {
      tmp.push(allVertexSet[key]);
    }

    this.model = new mxSwimlaneModel(this, tmp, this.roots, parent, this.tightenToSource);
    this.cycleStage(parent);
    this.layeringStage();
    this.crossingStage(parent);
    this.placementStage(0, parent);
  }

  filterDescendants(cell, result) {
    var model = this.graph.model;

    if (
      model.isVertex(cell) &&
      cell != this.parent &&
      model.getParent(cell) != this.parent &&
      this.graph.isCellVisible(cell)
    ) {
      result[mxObjectIdentity.get(cell)] = cell;
    }

    if (this.traverseAncestors || (cell == this.parent && this.graph.isCellVisible(cell))) {
      var childCount = model.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        var child = model.getChildAt(cell, i);

        if (!this.isPort(child)) {
          this.filterDescendants(child, result);
        }
      }
    }
  }

  isPort(cell) {
    if (cell.geometry.relative) {
      return true;
    }

    return false;
  }

  getEdgesBetween(source, target, directed) {
    directed = directed != null ? directed : false;
    var edges = this.getEdges(source);
    var result = [];

    for (var i = 0; i < edges.length; i++) {
      var src = this.getVisibleTerminal(edges[i], true);
      var trg = this.getVisibleTerminal(edges[i], false);

      if ((src == source && trg == target) || (!directed && src == target && trg == source)) {
        result.push(edges[i]);
      }
    }

    return result;
  }

  traverse(vertex, directed, edge, allVertices, currentComp, hierarchyVertices, filledVertexSet, swimlaneIndex) {
    if (vertex != null && allVertices != null) {
      var vertexID = mxObjectIdentity.get(vertex);

      if (allVertices[vertexID] == null && (filledVertexSet == null ? true : filledVertexSet[vertexID] != null)) {
        if (currentComp[vertexID] == null) {
          currentComp[vertexID] = vertex;
        }

        if (allVertices[vertexID] == null) {
          allVertices[vertexID] = vertex;
        }

        if (filledVertexSet !== null) {
          delete filledVertexSet[vertexID];
        }

        var edges = this.getEdges(vertex);
        var model = this.graph.model;

        for (var i = 0; i < edges.length; i++) {
          var otherVertex = this.getVisibleTerminal(edges[i], true);
          var isSource = otherVertex == vertex;

          if (isSource) {
            otherVertex = this.getVisibleTerminal(edges[i], false);
          }

          var otherIndex = 0;

          for (otherIndex = 0; otherIndex < this.swimlanes.length; otherIndex++) {
            if (model.isAncestor(this.swimlanes[otherIndex], otherVertex)) {
              break;
            }
          }

          if (otherIndex >= this.swimlanes.length) {
            continue;
          }

          if (otherIndex > swimlaneIndex || ((!directed || isSource) && otherIndex == swimlaneIndex)) {
            currentComp = this.traverse(
              otherVertex,
              directed,
              edges[i],
              allVertices,
              currentComp,
              hierarchyVertices,
              filledVertexSet,
              otherIndex
            );
          }
        }
      } else {
        if (currentComp[vertexID] == null) {
          for (var i = 0; i < hierarchyVertices.length; i++) {
            var comp = hierarchyVertices[i];

            if (comp[vertexID] != null) {
              for (var key in comp) {
                currentComp[key] = comp[key];
              }

              hierarchyVertices.splice(i, 1);
              return currentComp;
            }
          }
        }
      }
    }

    return currentComp;
  }

  cycleStage(parent) {
    var cycleStage = new mxSwimlaneOrdering(this);
    cycleStage.execute(parent);
  }

  layeringStage() {
    this.model.initialRank();
    this.model.fixRanks();
  }

  crossingStage(parent) {
    var crossingStage = new mxMedianHybridCrossingReduction(this);
    crossingStage.execute(parent);
  }

  placementStage(initialX, parent) {
    var placementStage = new mxCoordinateAssignment(
      this,
      this.intraCellSpacing,
      this.interRankCellSpacing,
      this.orientation,
      initialX,
      this.parallelEdgeSpacing
    );
    placementStage.fineTuning = this.fineTuning;
    placementStage.execute(parent);
    return placementStage.limitX + this.interHierarchySpacing;
  }
}
