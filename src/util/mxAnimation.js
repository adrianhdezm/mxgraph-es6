import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxAnimation extends mxEventSource {
  thread = null;

  constructor(delay) {
    super();
    this.delay = delay != null ? delay : 20;
  }

  isRunning() {
    return this.thread != null;
  }

  startAnimation() {
    if (this.thread == null) {
      this.thread = window.setInterval(mxUtils.bind(this, this.updateAnimation), this.delay);
    }
  }

  updateAnimation() {
    this.fireEvent(new mxEventObject(mxEvent.EXECUTE));
  }

  stopAnimation() {
    if (this.thread != null) {
      window.clearInterval(this.thread);
      this.thread = null;
      this.fireEvent(new mxEventObject(mxEvent.DONE));
    }
  }
}
