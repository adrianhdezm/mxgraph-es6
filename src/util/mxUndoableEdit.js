import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';

export class mxUndoableEdit {
  undone = false;
  redone = false;

  constructor(source, significant) {
    this.source = source;
    this.changes = [];
    this.significant = significant != null ? significant : true;
  }

  isEmpty() {
    return this.changes.length == 0;
  }

  isSignificant() {
    return this.significant;
  }

  add(change) {
    this.changes.push(change);
  }

  notify() {}

  die() {}

  undo() {
    if (!this.undone) {
      this.source.fireEvent(new mxEventObject(mxEvent.START_EDIT));
      var count = this.changes.length;

      for (var i = count - 1; i >= 0; i--) {
        var change = this.changes[i];

        if (change.execute != null) {
          change.execute();
        } else if (change.undo != null) {
          change.undo();
        }

        this.source.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
      }

      this.undone = true;
      this.redone = false;
      this.source.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }

    this.notify();
  }

  redo() {
    if (!this.redone) {
      this.source.fireEvent(new mxEventObject(mxEvent.START_EDIT));
      var count = this.changes.length;

      for (var i = 0; i < count; i++) {
        var change = this.changes[i];

        if (change.execute != null) {
          change.execute();
        } else if (change.redo != null) {
          change.redo();
        }

        this.source.fireEvent(new mxEventObject(mxEvent.EXECUTED, 'change', change));
      }

      this.undone = false;
      this.redone = true;
      this.source.fireEvent(new mxEventObject(mxEvent.END_EDIT));
    }

    this.notify();
  }
}
