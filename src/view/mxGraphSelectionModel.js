import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUndoableEdit } from '@mxgraph/util/mxUndoableEdit';
import { mxSelectionChange } from '@mxgraph/view/mxSelectionChange';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxClient } from '@mxgraph/mxClient';

export class mxGraphSelectionModel extends mxEventSource {
  doneResource = mxClient.language != 'none' ? 'done' : '';
  updatingSelectionResource = mxClient.language != 'none' ? 'updatingSelection' : '';
  singleSelection = false;

  constructor(graph) {
    super();
    this.graph = graph;
    this.cells = [];
  }

  isSingleSelection() {
    return this.singleSelection;
  }

  setSingleSelection(singleSelection) {
    this.singleSelection = singleSelection;
  }

  isSelected(cell) {
    if (cell != null) {
      return mxUtils.indexOf(this.cells, cell) >= 0;
    }

    return false;
  }

  isEmpty() {
    return this.cells.length == 0;
  }

  clear() {
    this.changeSelection(null, this.cells);
  }

  setCell(cell) {
    if (cell != null) {
      this.setCells([cell]);
    }
  }

  setCells(cells) {
    if (cells != null) {
      if (this.singleSelection) {
        cells = [this.getFirstSelectableCell(cells)];
      }

      var tmp = [];

      for (var i = 0; i < cells.length; i++) {
        if (this.graph.isCellSelectable(cells[i])) {
          tmp.push(cells[i]);
        }
      }

      this.changeSelection(tmp, this.cells);
    }
  }

  getFirstSelectableCell(cells) {
    if (cells != null) {
      for (var i = 0; i < cells.length; i++) {
        if (this.graph.isCellSelectable(cells[i])) {
          return cells[i];
        }
      }
    }

    return null;
  }

  addCell(cell) {
    if (cell != null) {
      this.addCells([cell]);
    }
  }

  addCells(cells) {
    if (cells != null) {
      var remove = null;

      if (this.singleSelection) {
        remove = this.cells;
        cells = [this.getFirstSelectableCell(cells)];
      }

      var tmp = [];

      for (var i = 0; i < cells.length; i++) {
        if (!this.isSelected(cells[i]) && this.graph.isCellSelectable(cells[i])) {
          tmp.push(cells[i]);
        }
      }

      this.changeSelection(tmp, remove);
    }
  }

  removeCell(cell) {
    if (cell != null) {
      this.removeCells([cell]);
    }
  }

  removeCells(cells) {
    if (cells != null) {
      var tmp = [];

      for (var i = 0; i < cells.length; i++) {
        if (this.isSelected(cells[i])) {
          tmp.push(cells[i]);
        }
      }

      this.changeSelection(null, tmp);
    }
  }

  changeSelection(added, removed) {
    if (
      (added != null && added.length > 0 && added[0] != null) ||
      (removed != null && removed.length > 0 && removed[0] != null)
    ) {
      var change = new mxSelectionChange(this, added, removed);
      change.execute();
      var edit = new mxUndoableEdit(this, false);
      edit.add(change);
      this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
    }
  }

  cellAdded(cell) {
    if (cell != null && !this.isSelected(cell)) {
      this.cells.push(cell);
    }
  }

  cellRemoved(cell) {
    if (cell != null) {
      var index = mxUtils.indexOf(this.cells, cell);

      if (index >= 0) {
        this.cells.splice(index, 1);
      }
    }
  }
}
