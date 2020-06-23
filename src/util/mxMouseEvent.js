import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxMouseEvent {
  consumed = false;
  graphX = null;
  graphY = null;

  constructor(evt, state) {
    this.evt = evt;
    this.state = state;
    this.sourceState = state;
  }

  getEvent() {
    return this.evt;
  }

  getSource() {
    return mxEvent.getSource(this.evt);
  }

  isSource(shape) {
    if (shape != null) {
      return mxUtils.isAncestorNode(shape.node, this.getSource());
    }

    return false;
  }

  getX() {
    return mxEvent.getClientX(this.getEvent());
  }

  getY() {
    return mxEvent.getClientY(this.getEvent());
  }

  getGraphX() {
    return this.graphX;
  }

  getGraphY() {
    return this.graphY;
  }

  getState() {
    return this.state;
  }

  getCell() {
    var state = this.getState();

    if (state != null) {
      return state.cell;
    }

    return null;
  }

  isPopupTrigger() {
    return mxEvent.isPopupTrigger(this.getEvent());
  }

  isConsumed() {
    return this.consumed;
  }

  consume(preventDefault) {
    preventDefault =
      preventDefault != null ? preventDefault : this.evt.touches != null || mxEvent.isMouseEvent(this.evt);

    if (preventDefault && this.evt.preventDefault) {
      this.evt.preventDefault();
    }

    this.consumed = true;
  }
}
