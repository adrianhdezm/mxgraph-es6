import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxPanningHandler extends mxEventSource {
  graph = null;
  useLeftButtonForPanning = false;
  usePopupTrigger = true;
  ignoreCell = false;
  previewEnabled = true;
  useGrid = false;
  panningEnabled = true;
  pinchEnabled = true;
  maxScale = 8;
  minScale = 0.01;
  dx = null;
  dy = null;
  startX = 0;
  startY = 0;

  constructor(graph) {
    super();

    if (graph != null) {
      this.graph = graph;
      this.graph.addMouseListener(this);

      this.forcePanningHandler = (sender, evt) => {
        var evtName = evt.getProperty('eventName');
        var me = evt.getProperty('event');

        if (evtName == mxEvent.MOUSE_DOWN && this.isForcePanningEvent(me)) {
          this.start(me);
          this.active = true;
          this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
          me.consume();
        }
      };

      this.graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.forcePanningHandler);

      this.gestureHandler = (sender, eo) => {
        if (this.isPinchEnabled()) {
          var evt = eo.getProperty('event');

          if (!mxEvent.isConsumed(evt) && evt.type == 'gesturestart') {
            this.initialScale = this.graph.view.scale;

            if (!this.active && this.mouseDownEvent != null) {
              this.start(this.mouseDownEvent);
              this.mouseDownEvent = null;
            }
          } else if (evt.type == 'gestureend' && this.initialScale != null) {
            this.initialScale = null;
          }

          if (this.initialScale != null) {
            this.zoomGraph(evt);
          }
        }
      };

      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);

      this.mouseUpListener = () => {
        if (this.active) {
          this.reset();
        }
      };

      mxEvent.addListener(document, 'mouseup', this.mouseUpListener);
    }
  }

  isActive() {
    return this.active || this.initialScale != null;
  }

  isPanningEnabled() {
    return this.panningEnabled;
  }

  setPanningEnabled(value) {
    this.panningEnabled = value;
  }

  isPinchEnabled() {
    return this.pinchEnabled;
  }

  setPinchEnabled(value) {
    this.pinchEnabled = value;
  }

  isPanningTrigger(me) {
    var evt = me.getEvent();
    return (
      (this.useLeftButtonForPanning && me.getState() == null && mxEvent.isLeftMouseButton(evt)) ||
      (mxEvent.isControlDown(evt) && mxEvent.isShiftDown(evt)) ||
      (this.usePopupTrigger && mxEvent.isPopupTrigger(evt))
    );
  }

  isForcePanningEvent(me) {
    return this.ignoreCell || mxEvent.isMultiTouchEvent(me.getEvent());
  }

  mouseDown(sender, me) {
    this.mouseDownEvent = me;

    if (!me.isConsumed() && this.isPanningEnabled() && !this.active && this.isPanningTrigger(me)) {
      this.start(me);
      this.consumePanningTrigger(me);
    }
  }

  start(me) {
    this.dx0 = -this.graph.container.scrollLeft;
    this.dy0 = -this.graph.container.scrollTop;
    this.startX = me.getX();
    this.startY = me.getY();
    this.dx = null;
    this.dy = null;
    this.panningTrigger = true;
  }

  consumePanningTrigger(me) {
    me.consume();
  }

  mouseMove(sender, me) {
    this.dx = me.getX() - this.startX;
    this.dy = me.getY() - this.startY;

    if (this.active) {
      if (this.previewEnabled) {
        if (this.useGrid) {
          this.dx = this.graph.snap(this.dx);
          this.dy = this.graph.snap(this.dy);
        }

        this.graph.panGraph(this.dx + this.dx0, this.dy + this.dy0);
      }

      this.fireEvent(new mxEventObject(mxEvent.PAN, 'event', me));
    } else if (this.panningTrigger) {
      var tmp = this.active;
      this.active = Math.abs(this.dx) > this.graph.tolerance || Math.abs(this.dy) > this.graph.tolerance;

      if (!tmp && this.active) {
        this.fireEvent(new mxEventObject(mxEvent.PAN_START, 'event', me));
      }
    }

    if (this.active || this.panningTrigger) {
      me.consume();
    }
  }

  mouseUp(sender, me) {
    if (this.active) {
      if (this.dx != null && this.dy != null) {
        if (!this.graph.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.graph.container)) {
          var scale = this.graph.getView().scale;
          var t = this.graph.getView().translate;
          this.graph.panGraph(0, 0);
          this.panGraph(t.x + this.dx / scale, t.y + this.dy / scale);
        }

        me.consume();
      }

      this.fireEvent(new mxEventObject(mxEvent.PAN_END, 'event', me));
    }

    this.reset();
  }

  zoomGraph(evt) {
    var value = Math.round(this.initialScale * evt.scale * 100) / 100;

    if (this.minScale != null) {
      value = Math.max(this.minScale, value);
    }

    if (this.maxScale != null) {
      value = Math.min(this.maxScale, value);
    }

    if (this.graph.view.scale != value) {
      this.graph.zoomTo(value);
      mxEvent.consume(evt);
    }
  }

  reset() {
    this.panningTrigger = false;
    this.mouseDownEvent = null;
    this.active = false;
    this.dx = null;
    this.dy = null;
  }

  panGraph(dx, dy) {
    this.graph.getView().setTranslate(dx, dy);
  }

  destroy() {
    this.graph.removeMouseListener(this);
    this.graph.removeListener(this.forcePanningHandler);
    this.graph.removeListener(this.gestureHandler);
    mxEvent.removeListener(document, 'mouseup', this.mouseUpListener);
  }
}
