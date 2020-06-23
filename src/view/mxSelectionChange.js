import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxLog } from '@mxgraph/util/mxLog';

export class mxSelectionChange {
  constructor(selectionModel, added, removed) {
    this.selectionModel = selectionModel;
    this.added = added != null ? added.slice() : null;
    this.removed = removed != null ? removed.slice() : null;
  }

  execute() {
    var t0 = mxLog.enter('mxSelectionChange.execute');
    window.status =
      mxResources.get(this.selectionModel.updatingSelectionResource) || this.selectionModel.updatingSelectionResource;

    if (this.removed != null) {
      for (var i = 0; i < this.removed.length; i++) {
        this.selectionModel.cellRemoved(this.removed[i]);
      }
    }

    if (this.added != null) {
      for (var i = 0; i < this.added.length; i++) {
        this.selectionModel.cellAdded(this.added[i]);
      }
    }

    var tmp = this.added;
    this.added = this.removed;
    this.removed = tmp;
    window.status = mxResources.get(this.selectionModel.doneResource) || this.selectionModel.doneResource;
    mxLog.leave('mxSelectionChange.execute', t0);
    this.selectionModel.fireEvent(new mxEventObject(mxEvent.CHANGE, 'added', this.added, 'removed', this.removed));
  }
}
