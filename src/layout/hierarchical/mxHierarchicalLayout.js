import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxCoordinateAssignment } from '@mxgraph/layout/hierarchical/stage/mxCoordinateAssignment';
import { mxMedianHybridCrossingReduction } from '@mxgraph/layout/hierarchical/stage/mxMedianHybridCrossingReduction';
import { mxMinimumCycleRemover } from '@mxgraph/layout/hierarchical/stage/mxMinimumCycleRemover';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';
import { mxGraphHierarchyModel } from '@mxgraph/layout/hierarchical/model/mxGraphHierarchyModel';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxHierarchicalEdgeStyle } from '@mxgraph/layout/hierarchical/mxHierarchicalEdgeStyle';

export class mxHierarchicalLayout extends mxGraphLayout {
  roots = null;
  resizeParent = false;
  maintainParentLocation = false;
  moveParent = false;
  parentBorder = 0;
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

  execute(parent, roots) {
    this.parent = parent;
    var model = this.graph.model;
    this.edgesCache = new mxDictionary();
    this.edgeSourceTermCache = new mxDictionary();
    this.edgesTargetTermCache = new mxDictionary();

    if (roots != null && !(roots instanceof Array)) {
      roots = [roots];
    }

    if (roots == null && parent == null) {
      return;
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

    if (roots != null) {
      var rootsCopy = [];

      for (var i = 0; i < roots.length; i++) {
        var ancestor = parent != null ? model.isAncestor(parent, roots[i]) : true;

        if (ancestor && model.isVertex(roots[i])) {
          rootsCopy.push(roots[i]);
        }
      }

      this.roots = rootsCopy;
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
    } finally {
      model.endUpdate();
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

        if (model.isVertex(cell) && this.graph.isCellVisible(cell)) {
          var conns = this.getEdges(cell);
          var fanOut = 0;
          var fanIn = 0;

          for (var k = 0; k < conns.length; k++) {
            var src = this.getVisibleTerminal(conns[k], true);

            if (src == cell) {
              fanOut++;
            } else {
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
          ((target == cell && (this.parent == null || this.isAncestor(this.parent, source, this.traverseAncestors))) ||
            (source == cell && (this.parent == null || this.isAncestor(this.parent, target, this.traverseAncestors)))))
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
    var allVertexSet = [];

    if (this.roots == null && parent != null) {
      var filledVertexSet = Object();
      this.filterDescendants(parent, filledVertexSet);
      this.roots = [];
      var filledVertexSetEmpty = true;

      for (var key in filledVertexSet) {
        if (filledVertexSet[key] != null) {
          filledVertexSetEmpty = false;
          break;
        }
      }

      while (!filledVertexSetEmpty) {
        var candidateRoots = this.findRoots(parent, filledVertexSet);

        for (var i = 0; i < candidateRoots.length; i++) {
          var vertexSet = Object();
          hierarchyVertices.push(vertexSet);
          this.traverse(candidateRoots[i], true, null, allVertexSet, vertexSet, hierarchyVertices, filledVertexSet);
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

    var initialX = 0;

    for (var i = 0; i < hierarchyVertices.length; i++) {
      var vertexSet = hierarchyVertices[i];
      var tmp = [];

      for (var key in vertexSet) {
        tmp.push(vertexSet[key]);
      }

      this.model = new mxGraphHierarchyModel(this, tmp, this.roots, parent, this.tightenToSource);
      this.cycleStage(parent);
      this.layeringStage();
      this.crossingStage(parent);
      initialX = this.placementStage(initialX, parent);
    }
  }

  filterDescendants(cell, result) {
    var model = this.graph.model;

    if (model.isVertex(cell) && cell != this.parent && this.graph.isCellVisible(cell)) {
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
    if (cell != null && cell.geometry != null) {
      return cell.geometry.relative;
    } else {
      return false;
    }
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

  traverse(vertex, directed, edge, allVertices, currentComp, hierarchyVertices, filledVertexSet) {
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
        var edgeIsSource = [];

        for (var i = 0; i < edges.length; i++) {
          edgeIsSource[i] = this.getVisibleTerminal(edges[i], true) == vertex;
        }

        for (var i = 0; i < edges.length; i++) {
          if (!directed || edgeIsSource[i]) {
            var next = this.getVisibleTerminal(edges[i], !edgeIsSource[i]);
            var netCount = 1;

            for (var j = 0; j < edges.length; j++) {
              if (j == i) {
                continue;
              } else {
                var isSource2 = edgeIsSource[j];
                var otherTerm = this.getVisibleTerminal(edges[j], !isSource2);

                if (otherTerm == next) {
                  if (isSource2) {
                    netCount++;
                  } else {
                    netCount--;
                  }
                }
              }
            }

            if (netCount >= 0) {
              currentComp = this.traverse(
                next,
                directed,
                edges[i],
                allVertices,
                currentComp,
                hierarchyVertices,
                filledVertexSet
              );
            }
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
    var cycleStage = new mxMinimumCycleRemover(this);
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
