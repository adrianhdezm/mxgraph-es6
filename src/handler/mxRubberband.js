import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxClient } from '@mxgraph/mxClient';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxRubberband {
  defaultOpacity = 20;
  enabled = true;
  div = null;
  sharedDiv = null;
  currentX = 0;
  currentY = 0;
  fadeOut = false;

  constructor(graph) {
    if (graph != null) {
      this.graph = graph;
      this.graph.addMouseListener(this);

      this.forceRubberbandHandler = (sender, evt) => {
        var evtName = evt.getProperty('eventName');
        var me = evt.getProperty('event');

        if (evtName == mxEvent.MOUSE_DOWN && this.isForceRubberbandEvent(me)) {
          var offset = mxUtils.getOffset(this.graph.container);
          var origin = mxUtils.getScrollOrigin(this.graph.container);
          origin.x -= offset.x;
          origin.y -= offset.y;
          this.start(me.getX() + origin.x, me.getY() + origin.y);
          me.consume(false);
        }
      };

      this.graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.forceRubberbandHandler);

      this.panHandler = () => {
        this.repaint();
      };

      this.graph.addListener(mxEvent.PAN, this.panHandler);

      this.gestureHandler = (sender, eo) => {
        if (this.first != null) {
          this.reset();
        }
      };

      this.graph.addListener(mxEvent.GESTURE, this.gestureHandler);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isForceRubberbandEvent(me) {
    return mxEvent.isAltDown(me.getEvent());
  }

  mouseDown(sender, me) {
    if (
      !me.isConsumed() &&
      this.isEnabled() &&
      this.graph.isEnabled() &&
      me.getState() == null &&
      !mxEvent.isMultiTouchEvent(me.getEvent())
    ) {
      var offset = mxUtils.getOffset(this.graph.container);
      var origin = mxUtils.getScrollOrigin(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      this.start(me.getX() + origin.x, me.getY() + origin.y);
      me.consume(false);
    }
  }

  start(x, y) {
    this.first = new mxPoint(x, y);
    var container = this.graph.container;

    function createMouseEvent(evt) {
      var me = new mxMouseEvent(evt);
      var pt = mxUtils.convertPoint(container, me.getX(), me.getY());
      me.graphX = pt.x;
      me.graphY = pt.y;
      return me;
    }

    this.dragHandler = (evt) => {
      this.mouseMove(this.graph, createMouseEvent(evt));
    };

    this.dropHandler = (evt) => {
      this.mouseUp(this.graph, createMouseEvent(evt));
    };

    if (mxClient.IS_FF) {
      mxEvent.addGestureListeners(document, null, this.dragHandler, this.dropHandler);
    }
  }

  mouseMove(sender, me) {
    if (!me.isConsumed() && this.first != null) {
      var origin = mxUtils.getScrollOrigin(this.graph.container);
      var offset = mxUtils.getOffset(this.graph.container);
      origin.x -= offset.x;
      origin.y -= offset.y;
      var x = me.getX() + origin.x;
      var y = me.getY() + origin.y;
      var dx = this.first.x - x;
      var dy = this.first.y - y;
      var tol = this.graph.tolerance;

      if (this.div != null || Math.abs(dx) > tol || Math.abs(dy) > tol) {
        if (this.div == null) {
          this.div = this.createShape();
        }

        mxUtils.clearSelection();
        this.update(x, y);
        me.consume();
      }
    }
  }

  createShape() {
    if (this.sharedDiv == null) {
      this.sharedDiv = document.createElement('div');
      this.sharedDiv.className = 'mxRubberband';
      mxUtils.setOpacity(this.sharedDiv, this.defaultOpacity);
    }

    this.graph.container.appendChild(this.sharedDiv);
    var result = this.sharedDiv;

    if (mxClient.IS_SVG && document.documentMode >= 10 && this.fadeOut) {
      this.sharedDiv = null;
    }

    return result;
  }

  isActive(sender, me) {
    return this.div != null && this.div.style.display != 'none';
  }

  mouseUp(sender, me) {
    var active = this.isActive();
    this.reset();

    if (active) {
      this.execute(me.getEvent());
      me.consume();
    }
  }

  execute(evt) {
    var rect = new mxRectangle(this.x, this.y, this.width, this.height);
    this.graph.selectRegion(rect, evt);
  }

  reset() {
    if (this.div != null) {
      if (mxClient.IS_SVG && document.documentMode >= 10 && this.fadeOut) {
        var temp = this.div;
        mxUtils.setPrefixedStyle(temp.style, 'transition', 'all 0.2s linear');
        temp.style.pointerEvents = 'none';
        temp.style.opacity = 0;
        window.setTimeout(function () {
          temp.parentNode.removeChild(temp);
        }, 200);
      } else {
        this.div.parentNode.removeChild(this.div);
      }
    }

    mxEvent.removeGestureListeners(document, null, this.dragHandler, this.dropHandler);
    this.dragHandler = null;
    this.dropHandler = null;
    this.currentX = 0;
    this.currentY = 0;
    this.first = null;
    this.div = null;
  }

  update(x, y) {
    this.currentX = x;
    this.currentY = y;
    this.repaint();
  }

  repaint() {
    if (this.div != null) {
      var x = this.currentX - this.graph.panDx;
      var y = this.currentY - this.graph.panDy;
      this.x = Math.min(this.first.x, x);
      this.y = Math.min(this.first.y, y);
      this.width = Math.max(this.first.x, x) - this.x;
      this.height = Math.max(this.first.y, y) - this.y;
      var dx = 0;
      var dy = 0;
      this.div.style.left = this.x + dx + 'px';
      this.div.style.top = this.y + dy + 'px';
      this.div.style.width = Math.max(1, this.width) + 'px';
      this.div.style.height = Math.max(1, this.height) + 'px';
    }
  }

  destroy() {
    if (!this.destroyed) {
      this.destroyed = true;
      this.graph.removeMouseListener(this);
      this.graph.removeListener(this.forceRubberbandHandler);
      this.graph.removeListener(this.panHandler);
      this.reset();

      if (this.sharedDiv != null) {
        this.sharedDiv = null;
      }
    }
  }
}
