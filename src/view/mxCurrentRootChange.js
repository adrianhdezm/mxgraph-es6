import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxCurrentRootChange {
  constructor(view, root) {
    this.view = view;
    this.root = root;
    this.previous = root;
    this.isUp = root == null;

    if (!this.isUp) {
      var tmp = this.view.currentRoot;
      var model = this.view.graph.getModel();

      while (tmp != null) {
        if (tmp == root) {
          this.isUp = true;
          break;
        }

        tmp = model.getParent(tmp);
      }
    }
  }

  execute() {
    var tmp = this.view.currentRoot;
    this.view.currentRoot = this.previous;
    this.previous = tmp;
    var translate = this.view.graph.getTranslateForRoot(this.view.currentRoot);

    if (translate != null) {
      this.view.translate = new mxPoint(-translate.x, -translate.y);
    }

    if (this.isUp) {
      this.view.clear(this.view.currentRoot, true);
      this.view.validate();
    } else {
      this.view.refresh();
    }

    var name = this.isUp ? mxEvent.UP : mxEvent.DOWN;
    this.view.fireEvent(new mxEventObject(name, 'root', this.view.currentRoot, 'previous', this.previous));
    this.isUp = !this.isUp;
  }
}
