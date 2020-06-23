import { mxPopupMenu } from '@mxgraph/util/mxPopupMenu';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxPopupMenuHandler extends mxPopupMenu {
  graph = null;
  selectOnPopup = true;
  clearSelectionOnBackground = true;
  triggerX = null;
  triggerY = null;
  screenX = null;
  screenY = null;

  constructor(graph, factoryMethod) {
    super();

    if (graph != null) {
      this.graph = graph;
      this.factoryMethod = factoryMethod;
      this.graph.addMouseListener(this);

      this.gestureHandler = (sender, eo) => {
        this.inTolerance = false;
      };

      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
      this.init();
    }
  }

  init() {
    super.init();
    mxEvent.addGestureListeners(this.div, (evt) => {
      this.graph.tooltipHandler.hide();
    });
  }

  isSelectOnPopup(me) {
    return this.selectOnPopup;
  }

  mouseDown(sender, me) {
    if (this.isEnabled() && !mxEvent.isMultiTouchEvent(me.getEvent())) {
      this.hideMenu();
      this.triggerX = me.getGraphX();
      this.triggerY = me.getGraphY();
      this.screenX = mxEvent.getMainEvent(me.getEvent()).screenX;
      this.screenY = mxEvent.getMainEvent(me.getEvent()).screenY;
      this.popupTrigger = this.isPopupTrigger(me);
      this.inTolerance = true;
    }
  }

  mouseMove(sender, me) {
    if (this.inTolerance && this.screenX != null && this.screenY != null) {
      if (
        Math.abs(mxEvent.getMainEvent(me.getEvent()).screenX - this.screenX) > this.graph.tolerance ||
        Math.abs(mxEvent.getMainEvent(me.getEvent()).screenY - this.screenY) > this.graph.tolerance
      ) {
        this.inTolerance = false;
      }
    }
  }

  mouseUp(sender, me) {
    if (this.popupTrigger && this.inTolerance && this.triggerX != null && this.triggerY != null) {
      var cell = this.getCellForPopupEvent(me);

      if (this.graph.isEnabled() && this.isSelectOnPopup(me) && cell != null && !this.graph.isCellSelected(cell)) {
        this.graph.setSelectionCell(cell);
      } else if (this.clearSelectionOnBackground && cell == null) {
        this.graph.clearSelection();
      }

      this.graph.tooltipHandler.hide();
      var origin = mxUtils.getScrollOrigin();
      this.popup(me.getX() + origin.x + 1, me.getY() + origin.y + 1, cell, me.getEvent());
      me.consume();
    }

    this.popupTrigger = false;
    this.inTolerance = false;
  }

  getCellForPopupEvent(me) {
    return me.getCell();
  }

  destroy() {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.gestureHandler);
    super.destroy();
  }
}
