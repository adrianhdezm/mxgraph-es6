import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';
import { mxUndoableEdit } from '@mxgraph/util/mxUndoableEdit';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxVisibleChange } from '@mxgraph/model/changes/mxVisibleChange';
import { mxCollapseChange } from '@mxgraph/model/changes/mxCollapseChange';
import { mxStyleChange } from '@mxgraph/model/changes/mxStyleChange';
import { mxGeometryChange } from '@mxgraph/model/changes/mxGeometryChange';
import { mxValueChange } from '@mxgraph/model/changes/mxValueChange';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxTerminalChange } from '@mxgraph/model/changes/mxTerminalChange';
import { mxCellPath } from '@mxgraph/model/mxCellPath';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxChildChange } from '@mxgraph/model/changes/mxChildChange';
import { mxRootChange } from '@mxgraph/model/changes/mxRootChange';
import { mxCell } from '@mxgraph/model/mxCell';

export class mxGraphModel extends mxEventSource {
  root = null;
  cells = null;
  maintainEdgeParent = true;
  ignoreRelativeEdgeParent = true;
  createIds = true;
  prefix = '';
  postfix = '';
  nextId = 0;
  updateLevel = 0;
  endingUpdate = false;

  constructor(root) {
    super();
    this.currentEdit = this.createUndoableEdit();

    if (root != null) {
      this.setRoot(root);
    } else {
      this.clear();
    }
  }

  clear() {
    this.setRoot(this.createRoot());
  }

  isCreateIds() {
    return this.createIds;
  }

  setCreateIds(value) {
    this.createIds = value;
  }

  createRoot() {
    var cell = new mxCell();
    cell.insert(new mxCell());
    return cell;
  }

  getCell(id) {
    return this.cells != null ? this.cells[id] : null;
  }

  filterCells(cells, filter) {
    var result = null;

    if (cells != null) {
      result = [];

      for (var i = 0; i < cells.length; i++) {
        if (filter(cells[i])) {
          result.push(cells[i]);
        }
      }
    }

    return result;
  }

  getDescendants(parent) {
    return this.filterDescendants(null, parent);
  }

  filterDescendants(filter, parent) {
    var result = [];
    parent = parent || this.getRoot();

    if (filter == null || filter(parent)) {
      result.push(parent);
    }

    var childCount = this.getChildCount(parent);

    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(parent, i);
      result = result.concat(this.filterDescendants(filter, child));
    }

    return result;
  }

  getRoot(cell) {
    var root = cell || this.root;

    if (cell != null) {
      while (cell != null) {
        root = cell;
        cell = this.getParent(cell);
      }
    }

    return root;
  }

  setRoot(root) {
    this.execute(new mxRootChange(this, root));
    return root;
  }

  rootChanged(root) {
    var oldRoot = this.root;
    this.root = root;
    this.nextId = 0;
    this.cells = null;
    this.cellAdded(root);
    return oldRoot;
  }

  isRoot(cell) {
    return cell != null && this.root == cell;
  }

  isLayer(cell) {
    return this.isRoot(this.getParent(cell));
  }

  isAncestor(parent, child) {
    while (child != null && child != parent) {
      child = this.getParent(child);
    }

    return child == parent;
  }

  contains(cell) {
    return this.isAncestor(this.root, cell);
  }

  getParent(cell) {
    return cell != null ? cell.getParent() : null;
  }

  add(parent, child, index) {
    if (child != parent && parent != null && child != null) {
      if (index == null) {
        index = this.getChildCount(parent);
      }

      var parentChanged = parent != this.getParent(child);
      this.execute(new mxChildChange(this, parent, child, index));

      if (this.maintainEdgeParent && parentChanged) {
        this.updateEdgeParents(child);
      }
    }

    return child;
  }

  cellAdded(cell) {
    if (cell != null) {
      if (cell.getId() == null && this.createIds) {
        cell.setId(this.createId(cell));
      }

      if (cell.getId() != null) {
        var collision = this.getCell(cell.getId());

        if (collision != cell) {
          while (collision != null) {
            cell.setId(this.createId(cell));
            collision = this.getCell(cell.getId());
          }

          if (this.cells == null) {
            this.cells = new Object();
          }

          this.cells[cell.getId()] = cell;
        }
      }

      if (mxUtils.isNumeric(cell.getId())) {
        this.nextId = Math.max(this.nextId, cell.getId());
      }

      var childCount = this.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        this.cellAdded(this.getChildAt(cell, i));
      }
    }
  }

  createId(cell) {
    var id = this.nextId;
    this.nextId++;
    return this.prefix + id + this.postfix;
  }

  updateEdgeParents(cell, root) {
    root = root || this.getRoot(cell);
    var childCount = this.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(cell, i);
      this.updateEdgeParents(child, root);
    }

    var edgeCount = this.getEdgeCount(cell);
    var edges = [];

    for (var i = 0; i < edgeCount; i++) {
      edges.push(this.getEdgeAt(cell, i));
    }

    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];

      if (this.isAncestor(root, edge)) {
        this.updateEdgeParent(edge, root);
      }
    }
  }

  updateEdgeParent(edge, root) {
    var source = this.getTerminal(edge, true);
    var target = this.getTerminal(edge, false);
    var cell = null;

    while (source != null && !this.isEdge(source) && source.geometry != null && source.geometry.relative) {
      source = this.getParent(source);
    }

    while (
      target != null &&
      this.ignoreRelativeEdgeParent &&
      !this.isEdge(target) &&
      target.geometry != null &&
      target.geometry.relative
    ) {
      target = this.getParent(target);
    }

    if (this.isAncestor(root, source) && this.isAncestor(root, target)) {
      if (source == target) {
        cell = this.getParent(source);
      } else {
        cell = this.getNearestCommonAncestor(source, target);
      }

      if (
        cell != null &&
        (this.getParent(cell) != this.root || this.isAncestor(cell, edge)) &&
        this.getParent(edge) != cell
      ) {
        var geo = this.getGeometry(edge);

        if (geo != null) {
          var origin1 = this.getOrigin(this.getParent(edge));
          var origin2 = this.getOrigin(cell);
          var dx = origin2.x - origin1.x;
          var dy = origin2.y - origin1.y;
          geo = geo.clone();
          geo.translate(-dx, -dy);
          this.setGeometry(edge, geo);
        }

        this.add(cell, edge, this.getChildCount(cell));
      }
    }
  }

  getOrigin(cell) {
    var result = null;

    if (cell != null) {
      result = this.getOrigin(this.getParent(cell));

      if (!this.isEdge(cell)) {
        var geo = this.getGeometry(cell);

        if (geo != null) {
          result.x += geo.x;
          result.y += geo.y;
        }
      }
    } else {
      result = new mxPoint();
    }

    return result;
  }

  getNearestCommonAncestor(cell1, cell2) {
    if (cell1 != null && cell2 != null) {
      var path = mxCellPath.create(cell2);

      if (path != null && path.length > 0) {
        var cell = cell1;
        var current = mxCellPath.create(cell);

        if (path.length < current.length) {
          cell = cell2;
          var tmp = current;
          current = path;
          path = tmp;
        }

        while (cell != null) {
          var parent = this.getParent(cell);

          if (path.indexOf(current + mxCellPath.PATH_SEPARATOR) == 0 && parent != null) {
            return cell;
          }

          current = mxCellPath.getParentPath(current);
          cell = parent;
        }
      }
    }

    return null;
  }

  remove(cell) {
    if (cell == this.root) {
      this.setRoot(null);
    } else if (this.getParent(cell) != null) {
      this.execute(new mxChildChange(this, null, cell));
    }

    return cell;
  }

  cellRemoved(cell) {
    if (cell != null && this.cells != null) {
      var childCount = this.getChildCount(cell);

      for (var i = childCount - 1; i >= 0; i--) {
        this.cellRemoved(this.getChildAt(cell, i));
      }

      if (this.cells != null && cell.getId() != null) {
        delete this.cells[cell.getId()];
      }
    }
  }

  parentForCellChanged(cell, parent, index) {
    var previous = this.getParent(cell);

    if (parent != null) {
      if (parent != previous || previous.getIndex(cell) != index) {
        parent.insert(cell, index);
      }
    } else if (previous != null) {
      var oldIndex = previous.getIndex(cell);
      previous.remove(oldIndex);
    }

    var par = this.contains(parent);
    var pre = this.contains(previous);

    if (par && !pre) {
      this.cellAdded(cell);
    } else if (pre && !par) {
      this.cellRemoved(cell);
    }

    return previous;
  }

  getChildCount(cell) {
    return cell != null ? cell.getChildCount() : 0;
  }

  getChildAt(cell, index) {
    return cell != null ? cell.getChildAt(index) : null;
  }

  getChildren(cell) {
    return cell != null ? cell.children : null;
  }

  getChildVertices(parent) {
    return this.getChildCells(parent, true, false);
  }

  getChildEdges(parent) {
    return this.getChildCells(parent, false, true);
  }

  getChildCells(parent, vertices, edges) {
    vertices = vertices != null ? vertices : false;
    edges = edges != null ? edges : false;
    var childCount = this.getChildCount(parent);
    var result = [];

    for (var i = 0; i < childCount; i++) {
      var child = this.getChildAt(parent, i);

      if ((!edges && !vertices) || (edges && this.isEdge(child)) || (vertices && this.isVertex(child))) {
        result.push(child);
      }
    }

    return result;
  }

  getTerminal(edge, isSource) {
    return edge != null ? edge.getTerminal(isSource) : null;
  }

  setTerminal(edge, terminal, isSource) {
    var terminalChanged = terminal != this.getTerminal(edge, isSource);
    this.execute(new mxTerminalChange(this, edge, terminal, isSource));

    if (this.maintainEdgeParent && terminalChanged) {
      this.updateEdgeParent(edge, this.getRoot());
    }

    return terminal;
  }

  setTerminals(edge, source, target) {
    this.beginUpdate();

    try {
      this.setTerminal(edge, source, true);
      this.setTerminal(edge, target, false);
    } finally {
      this.endUpdate();
    }
  }

  terminalForCellChanged(edge, terminal, isSource) {
    var previous = this.getTerminal(edge, isSource);

    if (terminal != null) {
      terminal.insertEdge(edge, isSource);
    } else if (previous != null) {
      previous.removeEdge(edge, isSource);
    }

    return previous;
  }

  getEdgeCount(cell) {
    return cell != null ? cell.getEdgeCount() : 0;
  }

  getEdgeAt(cell, index) {
    return cell != null ? cell.getEdgeAt(index) : null;
  }

  getDirectedEdgeCount(cell, outgoing, ignoredEdge) {
    var count = 0;
    var edgeCount = this.getEdgeCount(cell);

    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(cell, i);

      if (edge != ignoredEdge && this.getTerminal(edge, outgoing) == cell) {
        count++;
      }
    }

    return count;
  }

  getConnections(cell) {
    return this.getEdges(cell, true, true, false);
  }

  getIncomingEdges(cell) {
    return this.getEdges(cell, true, false, false);
  }

  getOutgoingEdges(cell) {
    return this.getEdges(cell, false, true, false);
  }

  getEdges(cell, incoming, outgoing, includeLoops) {
    incoming = incoming != null ? incoming : true;
    outgoing = outgoing != null ? outgoing : true;
    includeLoops = includeLoops != null ? includeLoops : true;
    var edgeCount = this.getEdgeCount(cell);
    var result = [];

    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(cell, i);
      var source = this.getTerminal(edge, true);
      var target = this.getTerminal(edge, false);

      if (
        (includeLoops && source == target) ||
        (source != target && ((incoming && target == cell) || (outgoing && source == cell)))
      ) {
        result.push(edge);
      }
    }

    return result;
  }

  getEdgesBetween(source, target, directed) {
    directed = directed != null ? directed : false;
    var tmp1 = this.getEdgeCount(source);
    var tmp2 = this.getEdgeCount(target);
    var terminal = source;
    var edgeCount = tmp1;

    if (tmp2 < tmp1) {
      edgeCount = tmp2;
      terminal = target;
    }

    var result = [];

    for (var i = 0; i < edgeCount; i++) {
      var edge = this.getEdgeAt(terminal, i);
      var src = this.getTerminal(edge, true);
      var trg = this.getTerminal(edge, false);
      var directedMatch = src == source && trg == target;
      var oppositeMatch = trg == source && src == target;

      if (directedMatch || (!directed && oppositeMatch)) {
        result.push(edge);
      }
    }

    return result;
  }

  getOpposites(edges, terminal, sources, targets) {
    sources = sources != null ? sources : true;
    targets = targets != null ? targets : true;
    var terminals = [];

    if (edges != null) {
      for (var i = 0; i < edges.length; i++) {
        var source = this.getTerminal(edges[i], true);
        var target = this.getTerminal(edges[i], false);

        if (source == terminal && target != null && target != terminal && targets) {
          terminals.push(target);
        } else if (target == terminal && source != null && source != terminal && sources) {
          terminals.push(source);
        }
      }
    }

    return terminals;
  }

  getTopmostCells(cells) {
    var dict = new mxDictionary();
    var tmp = [];

    for (var i = 0; i < cells.length; i++) {
      dict.put(cells[i], true);
    }

    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var topmost = true;
      var parent = this.getParent(cell);

      while (parent != null) {
        if (dict.get(parent)) {
          topmost = false;
          break;
        }

        parent = this.getParent(parent);
      }

      if (topmost) {
        tmp.push(cell);
      }
    }

    return tmp;
  }

  isVertex(cell) {
    return cell != null ? cell.isVertex() : false;
  }

  isEdge(cell) {
    return cell != null ? cell.isEdge() : false;
  }

  isConnectable(cell) {
    return cell != null ? cell.isConnectable() : false;
  }

  getValue(cell) {
    return cell != null ? cell.getValue() : null;
  }

  setValue(cell, value) {
    this.execute(new mxValueChange(this, cell, value));
    return value;
  }

  valueForCellChanged(cell, value) {
    return cell.valueChanged(value);
  }

  getGeometry(cell) {
    return cell != null ? cell.getGeometry() : null;
  }

  setGeometry(cell, geometry) {
    if (geometry != this.getGeometry(cell)) {
      this.execute(new mxGeometryChange(this, cell, geometry));
    }

    return geometry;
  }

  geometryForCellChanged(cell, geometry) {
    var previous = this.getGeometry(cell);
    cell.setGeometry(geometry);
    return previous;
  }

  getStyle(cell) {
    return cell != null ? cell.getStyle() : null;
  }

  setStyle(cell, style) {
    if (style != this.getStyle(cell)) {
      this.execute(new mxStyleChange(this, cell, style));
    }

    return style;
  }

  styleForCellChanged(cell, style) {
    var previous = this.getStyle(cell);
    cell.setStyle(style);
    return previous;
  }

  isCollapsed(cell) {
    return cell != null ? cell.isCollapsed() : false;
  }

  setCollapsed(cell, collapsed) {
    if (collapsed != this.isCollapsed(cell)) {
      this.execute(new mxCollapseChange(this, cell, collapsed));
    }

    return collapsed;
  }

  collapsedStateForCellChanged(cell, collapsed) {
    var previous = this.isCollapsed(cell);
    cell.setCollapsed(collapsed);
    return previous;
  }

  isVisible(cell) {
    return cell != null ? cell.isVisible() : false;
  }

  setVisible(cell, visible) {
    if (visible != this.isVisible(cell)) {
      this.execute(new mxVisibleChange(this, cell, visible));
    }

    return visible;
  }

  visibleStateForCellChanged(cell, visible) {
    var previous = this.isVisible(cell);
    cell.setVisible(visible);
    return previous;
  }

  execute(change) {
    change.execute();
    this.beginUpdate();
    this.currentEdit.add(change);
    this.fireEvent(new mxEventObject(mxEvent.EXECUTE, 'change', change));
    this.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
    this.endUpdate();
  }

  beginUpdate() {
    this.updateLevel++;
    this.fireEvent(new mxEventObject(mxEvent.BEGIN_UPDATE));

    if (this.updateLevel == 1) {
      this.fireEvent(new mxEventObject(mxEvent.START_EDIT));
    }
  }

  endUpdate() {
    this.updateLevel--;

    if (this.updateLevel == 0) {
      this.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }

    if (!this.endingUpdate) {
      this.endingUpdate = this.updateLevel == 0;
      this.fireEvent(new mxEventObject(mxEvent.END_UPDATE, 'edit', this.currentEdit));

      try {
        if (this.endingUpdate && !this.currentEdit.isEmpty()) {
          this.fireEvent(new mxEventObject(mxEvent.BEFORE_UNDO, 'edit', this.currentEdit));
          var tmp = this.currentEdit;
          this.currentEdit = this.createUndoableEdit();
          tmp.notify();
          this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', tmp));
        }
      } finally {
        this.endingUpdate = false;
      }
    }
  }

  createUndoableEdit(significant) {
    var edit = new mxUndoableEdit(this, significant != null ? significant : true);

    edit.notify = function () {
      edit.source.fireEvent(new mxEventObject(mxEvent.CHANGE, 'edit', edit, 'changes', edit.changes));
      edit.source.fireEvent(new mxEventObject(mxEvent.NOTIFY, 'edit', edit, 'changes', edit.changes));
    };

    return edit;
  }

  mergeChildren(from, to, cloneAllEdges) {
    cloneAllEdges = cloneAllEdges != null ? cloneAllEdges : true;
    this.beginUpdate();

    try {
      var mapping = new Object();
      this.mergeChildrenImpl(from, to, cloneAllEdges, mapping);

      for (var key in mapping) {
        var cell = mapping[key];
        var terminal = this.getTerminal(cell, true);

        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, true);
        }

        terminal = this.getTerminal(cell, false);

        if (terminal != null) {
          terminal = mapping[mxCellPath.create(terminal)];
          this.setTerminal(cell, terminal, false);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  mergeChildrenImpl(from, to, cloneAllEdges, mapping) {
    this.beginUpdate();

    try {
      var childCount = from.getChildCount();

      for (var i = 0; i < childCount; i++) {
        var cell = from.getChildAt(i);

        if (typeof cell.getId == 'function') {
          var id = cell.getId();
          var target = id != null && (!this.isEdge(cell) || !cloneAllEdges) ? this.getCell(id) : null;

          if (target == null) {
            var clone = cell.clone();
            clone.setId(id);
            clone.setTerminal(cell.getTerminal(true), true);
            clone.setTerminal(cell.getTerminal(false), false);
            target = to.insert(clone);
            this.cellAdded(target);
          }

          mapping[mxCellPath.create(cell)] = target;
          this.mergeChildrenImpl(cell, target, cloneAllEdges, mapping);
        }
      }
    } finally {
      this.endUpdate();
    }
  }

  getParents(cells) {
    var parents = [];

    if (cells != null) {
      var dict = new mxDictionary();

      for (var i = 0; i < cells.length; i++) {
        var parent = this.getParent(cells[i]);

        if (parent != null && !dict.get(parent)) {
          dict.put(parent, true);
          parents.push(parent);
        }
      }
    }

    return parents;
  }

  cloneCell(cell, includeChildren) {
    if (cell != null) {
      return this.cloneCells([cell], includeChildren)[0];
    }

    return null;
  }

  cloneCells(cells, includeChildren, mapping) {
    includeChildren = includeChildren != null ? includeChildren : true;
    mapping = mapping != null ? mapping : new Object();
    var clones = [];

    for (var i = 0; i < cells.length; i++) {
      if (cells[i] != null) {
        clones.push(this.cloneCellImpl(cells[i], mapping, includeChildren));
      } else {
        clones.push(null);
      }
    }

    for (var i = 0; i < clones.length; i++) {
      if (clones[i] != null) {
        this.restoreClone(clones[i], cells[i], mapping);
      }
    }

    return clones;
  }

  cloneCellImpl(cell, mapping, includeChildren) {
    var ident = mxObjectIdentity.get(cell);
    var clone = mapping[ident];

    if (clone == null) {
      clone = this.cellCloned(cell);
      mapping[ident] = clone;

      if (includeChildren) {
        var childCount = this.getChildCount(cell);

        for (var i = 0; i < childCount; i++) {
          var cloneChild = this.cloneCellImpl(this.getChildAt(cell, i), mapping, true);
          clone.insert(cloneChild);
        }
      }
    }

    return clone;
  }

  cellCloned(cell) {
    return cell.clone();
  }

  restoreClone(clone, cell, mapping) {
    var source = this.getTerminal(cell, true);

    if (source != null) {
      var tmp = mapping[mxObjectIdentity.get(source)];

      if (tmp != null) {
        tmp.insertEdge(clone, true);
      }
    }

    var target = this.getTerminal(cell, false);

    if (target != null) {
      var tmp = mapping[mxObjectIdentity.get(target)];

      if (tmp != null) {
        tmp.insertEdge(clone, false);
      }
    }

    var childCount = this.getChildCount(clone);

    for (var i = 0; i < childCount; i++) {
      this.restoreClone(this.getChildAt(clone, i), this.getChildAt(cell, i), mapping);
    }
  }
}
