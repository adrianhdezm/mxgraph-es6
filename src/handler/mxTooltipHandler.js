import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxTooltipHandler {
  zIndex = 10005;
  graph = null;
  delay = null;
  ignoreTouchEvents = true;
  hideOnHover = false;
  destroyed = false;
  enabled = true;

  constructor(graph, delay) {
    if (graph != null) {
      this.graph = graph;
      this.delay = delay || 500;
      this.graph.addMouseListener(this);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isHideOnHover() {
    return this.hideOnHover;
  }

  setHideOnHover(value) {
    this.hideOnHover = value;
  }

  init() {
    if (document.body != null) {
      this.div = document.createElement('div');
      this.div.className = 'mxTooltip';
      this.div.style.visibility = 'hidden';
      document.body.appendChild(this.div);
      mxEvent.addGestureListeners(this.div, (evt) => {
        this.hideTooltip();
      });
    }
  }

  getStateForEvent(me) {
    return me.getState();
  }

  mouseDown(sender, me) {
    this.reset(me, false);
    this.hideTooltip();
  }

  mouseMove(sender, me) {
    if (me.getX() != this.lastX || me.getY() != this.lastY) {
      this.reset(me, true);
      var state = this.getStateForEvent(me);

      if (
        this.isHideOnHover() ||
        state != this.state ||
        (me.getSource() != this.node &&
          (!this.stateSource ||
            (state != null && this.stateSource == (me.isSource(state.shape) || !me.isSource(state.text)))))
      ) {
        this.hideTooltip();
      }
    }

    this.lastX = me.getX();
    this.lastY = me.getY();
  }

  mouseUp(sender, me) {
    this.reset(me, true);
    this.hideTooltip();
  }

  resetTimer() {
    if (this.thread != null) {
      window.clearTimeout(this.thread);
      this.thread = null;
    }
  }

  reset(me, restart, state) {
    if (!this.ignoreTouchEvents || mxEvent.isMouseEvent(me.getEvent())) {
      this.resetTimer();
      state = state != null ? state : this.getStateForEvent(me);

      if (restart && this.isEnabled() && state != null && (this.div == null || this.div.style.visibility == 'hidden')) {
        var node = me.getSource();
        var x = me.getX();
        var y = me.getY();
        var stateSource = me.isSource(state.shape) || me.isSource(state.text);
        this.thread = window.setTimeout(() => {
          if (!this.graph.isEditing() && !this.graph.popupMenuHandler.isMenuShowing() && !this.graph.isMouseDown) {
            var tip = this.graph.getTooltip(state, node, x, y);
            this.show(tip, x, y);
            this.state = state;
            this.node = node;
            this.stateSource = stateSource;
          }
        }, this.delay);
      }
    }
  }

  hide() {
    this.resetTimer();
    this.hideTooltip();
  }

  hideTooltip() {
    if (this.div != null) {
      this.div.style.visibility = 'hidden';
      this.div.innerHTML = '';
    }
  }

  show(tip, x, y) {
    if (!this.destroyed && tip != null && tip.length > 0) {
      if (this.div == null) {
        this.init();
      }

      var origin = mxUtils.getScrollOrigin();
      this.div.style.zIndex = this.zIndex;
      this.div.style.left = x + origin.x + 'px';
      this.div.style.top = y + mxConstants.TOOLTIP_VERTICAL_OFFSET + origin.y + 'px';

      if (!mxUtils.isNode(tip)) {
        this.div.innerHTML = tip.replace(/\n/g, '<br>');
      } else {
        this.div.innerHTML = '';
        this.div.appendChild(tip);
      }

      this.div.style.visibility = '';
      mxUtils.fit(this.div);
    }
  }

  destroy() {
    if (!this.destroyed) {
      this.graph.removeMouseListener(this);
      mxEvent.release(this.div);

      if (this.div != null && this.div.parentNode != null) {
        this.div.parentNode.removeChild(this.div);
      }

      this.destroyed = true;
      this.div = null;
    }
  }
}
