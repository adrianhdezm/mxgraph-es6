import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxAutoSaveManager extends mxEventSource {
  graph = null;
  autoSaveDelay = 10;
  autoSaveThrottle = 2;
  autoSaveThreshold = 5;
  ignoredChanges = 0;
  lastSnapshot = 0;
  enabled = true;

  constructor(graph) {
    super();

    this.changeHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.graphModelChanged(evt.getProperty('edit').changes);
      }
    };

    this.setGraph(graph);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  setGraph(graph) {
    if (this.graph != null) {
      this.graph.getModel().removeListener(this.changeHandler);
    }

    this.graph = graph;

    if (this.graph != null) {
      this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
    }
  }

  save() {}

  graphModelChanged(changes) {
    var now = new Date().getTime();
    var dt = (now - this.lastSnapshot) / 1000;

    if (dt > this.autoSaveDelay || (this.ignoredChanges >= this.autoSaveThreshold && dt > this.autoSaveThrottle)) {
      this.save();
      this.reset();
    } else {
      this.ignoredChanges++;
    }
  }

  reset() {
    this.lastSnapshot = new Date().getTime();
    this.ignoredChanges = 0;
  }

  destroy() {
    this.setGraph(null);
  }
}
