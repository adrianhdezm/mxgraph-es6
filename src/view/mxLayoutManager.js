import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxStyleChange } from '@mxgraph/model/changes/mxStyleChange';
import { mxVisibleChange } from '@mxgraph/model/changes/mxVisibleChange';
import { mxGeometryChange } from '@mxgraph/model/changes/mxGeometryChange';
import { mxTerminalChange } from '@mxgraph/model/changes/mxTerminalChange';
import { mxChildChange } from '@mxgraph/model/changes/mxChildChange';
import { mxRootChange } from '@mxgraph/model/changes/mxRootChange';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxLayoutManager extends mxEventSource {
  graph = null;
  bubbling = true;
  enabled = true;

  constructor(graph) {
    super();

    this.undoHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.beforeUndo(evt.getProperty('edit'));
      }
    };

    this.moveHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.cellsMoved(evt.getProperty('cells'), evt.getProperty('event'));
      }
    };

    this.resizeHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.cellsResized(evt.getProperty('cells'), evt.getProperty('bounds'), evt.getProperty('previous'));
      }
    };

    this.setGraph(graph);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isBubbling() {
    return this.bubbling;
  }

  setBubbling(value) {
    this.bubbling = value;
  }

  getGraph() {
    return this.graph;
  }

  setGraph(graph) {
    if (this.graph != null) {
      var model = this.graph.getModel();
      model.removeListener(this.undoHandler);
      this.graph.removeListener(this.moveHandler);
      this.graph.removeListener(this.resizeHandler);
    }

    this.graph = graph;

    if (this.graph != null) {
      var model = this.graph.getModel();
      model.addListener(mxEvent.BEFORE_UNDO, this.undoHandler);
      this.graph.addListener(mxEvent.MOVE_CELLS, this.moveHandler);
      this.graph.addListener(mxEvent.RESIZE_CELLS, this.resizeHandler);
    }
  }

  hasLayout(cell) {
    return this.getLayout(cell, mxEvent.LAYOUT_CELLS);
  }

  getLayout(cell, eventName) {
    return null;
  }

  beforeUndo(undoableEdit) {
    this.executeLayoutForCells(this.getCellsForChanges(undoableEdit.changes));
  }

  cellsMoved(cells, evt) {
    if (cells != null && evt != null) {
      var point = mxUtils.convertPoint(this.getGraph().container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));

      for (var i = 0; i < cells.length; i++) {
        var layout = this.getAncestorLayout(cells[i], mxEvent.MOVE_CELLS);

        if (layout != null) {
          layout.moveCell(cells[i], point.x, point.y);
        }
      }
    }
  }

  cellsResized(cells, bounds, prev) {
    if (cells != null && bounds != null) {
      for (var i = 0; i < cells.length; i++) {
        var layout = this.getAncestorLayout(cells[i], mxEvent.RESIZE_CELLS);

        if (layout != null) {
          layout.resizeCell(cells[i], bounds[i], prev[i]);
        }
      }
    }
  }

  getAncestorLayout(cell, eventName) {
    var model = this.getGraph().getModel();

    while (cell != null) {
      var layout = this.getLayout(cell, eventName);

      if (layout != null) {
        return layout;
      }

      cell = model.getParent(cell);
    }

    return null;
  }

  getCellsForChanges(changes) {
    var result = [];

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];

      if (change instanceof mxRootChange) {
        return [];
      } else {
        result = result.concat(this.getCellsForChange(change));
      }
    }

    return result;
  }

  getCellsForChange(change) {
    if (change instanceof mxChildChange) {
      return this.addCellsWithLayout(change.child, this.addCellsWithLayout(change.previous));
    } else if (change instanceof mxTerminalChange || change instanceof mxGeometryChange) {
      return this.addCellsWithLayout(change.cell);
    } else if (change instanceof mxVisibleChange || change instanceof mxStyleChange) {
      return this.addCellsWithLayout(change.cell);
    }

    return [];
  }

  addCellsWithLayout(cell, result) {
    return this.addDescendantsWithLayout(cell, this.addAncestorsWithLayout(cell, result));
  }

  addAncestorsWithLayout(cell, result) {
    result = result != null ? result : [];

    if (cell != null) {
      var layout = this.hasLayout(cell);

      if (layout != null) {
        result.push(cell);
      }

      if (this.isBubbling()) {
        var model = this.getGraph().getModel();
        this.addAncestorsWithLayout(model.getParent(cell), result);
      }
    }

    return result;
  }

  addDescendantsWithLayout(cell, result) {
    result = result != null ? result : [];

    if (cell != null && this.hasLayout(cell)) {
      var model = this.getGraph().getModel();

      for (var i = 0; i < model.getChildCount(cell); i++) {
        var child = model.getChildAt(cell, i);

        if (this.hasLayout(child)) {
          result.push(child);
          this.addDescendantsWithLayout(child, result);
        }
      }
    }

    return result;
  }

  executeLayoutForCells(cells) {
    var sorted = mxUtils.sortCells(cells, false);
    this.layoutCells(sorted, true);
    this.layoutCells(sorted.reverse(), false);
  }

  layoutCells(cells, bubble) {
    if (cells.length > 0) {
      var model = this.getGraph().getModel();
      model.beginUpdate();

      try {
        var last = null;

        for (var i = 0; i < cells.length; i++) {
          if (cells[i] != model.getRoot() && cells[i] != last) {
            this.executeLayout(cells[i], bubble);
            last = cells[i];
          }
        }

        this.fireEvent(new mxEventObject(mxEvent.LAYOUT_CELLS, 'cells', cells));
      } finally {
        model.endUpdate();
      }
    }
  }

  executeLayout(cell, bubble) {
    var layout = this.getLayout(cell, bubble ? mxEvent.BEGIN_UPDATE : mxEvent.END_UPDATE);

    if (layout != null) {
      layout.execute(cell);
    }
  }

  destroy() {
    this.setGraph(null);
  }
}
