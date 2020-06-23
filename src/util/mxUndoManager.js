import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';

export class mxUndoManager extends mxEventSource {
  history = null;
  indexOfNextAdd = 0;

  constructor(size) {
    super();
    this.size = size != null ? size : 100;
    this.clear();
  }

  isEmpty() {
    return this.history.length == 0;
  }

  clear() {
    this.history = [];
    this.indexOfNextAdd = 0;
    this.fireEvent(new mxEventObject(mxEvent.CLEAR));
  }

  canUndo() {
    return this.indexOfNextAdd > 0;
  }

  undo() {
    while (this.indexOfNextAdd > 0) {
      var edit = this.history[--this.indexOfNextAdd];
      edit.undo();

      if (edit.isSignificant()) {
        this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
        break;
      }
    }
  }

  canRedo() {
    return this.indexOfNextAdd < this.history.length;
  }

  redo() {
    var n = this.history.length;

    while (this.indexOfNextAdd < n) {
      var edit = this.history[this.indexOfNextAdd++];
      edit.redo();

      if (edit.isSignificant()) {
        this.fireEvent(new mxEventObject(mxEvent.REDO, 'edit', edit));
        break;
      }
    }
  }

  undoableEditHappened(undoableEdit) {
    this.trim();

    if (this.size > 0 && this.size == this.history.length) {
      this.history.shift();
    }

    this.history.push(undoableEdit);
    this.indexOfNextAdd = this.history.length;
    this.fireEvent(new mxEventObject(mxEvent.ADD, 'edit', undoableEdit));
  }

  trim() {
    if (this.history.length > this.indexOfNextAdd) {
      var edits = this.history.splice(this.indexOfNextAdd, this.history.length - this.indexOfNextAdd);

      for (var i = 0; i < edits.length; i++) {
        edits[i].die();
      }
    }
  }
}
