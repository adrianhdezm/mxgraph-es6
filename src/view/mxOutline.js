import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxClient } from '@mxgraph/mxClient';
import { mxGraph } from '@mxgraph/view/mxGraph';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxOutline {
  outline = null;
  graphRenderHint = mxConstants.RENDERING_HINT_FASTER;
  enabled = true;
  showViewport = true;
  border = 10;
  sizerSize = 8;
  labelsVisible = false;
  updateOnPan = false;
  sizerImage = null;
  minScale = 0.0001;
  suspended = false;
  forceVmlHandles = document.documentMode == 8;

  constructor(source, container) {
    this.source = source;

    if (container != null) {
      this.init(container);
    }
  }

  createGraph(container) {
    var graph = new mxGraph(container, this.source.getModel(), this.graphRenderHint, this.source.getStylesheet());
    graph.foldingEnabled = false;
    graph.autoScroll = false;
    return graph;
  }

  init(container) {
    this.outline = this.createGraph(container);
    var outlineGraphModelChanged = this.outline.graphModelChanged;

    this.outline.graphModelChanged = (changes) => {
      if (!this.suspended && this.outline != null) {
        outlineGraphModelChanged.apply(this.outline, arguments);
      }
    };

    if (mxClient.IS_SVG) {
      var node = this.outline.getView().getCanvas().parentNode;
      node.setAttribute('shape-rendering', 'optimizeSpeed');
      node.setAttribute('image-rendering', 'optimizeSpeed');
    }

    this.outline.labelsVisible = this.labelsVisible;
    this.outline.setEnabled(false);

    this.updateHandler = (sender, evt) => {
      if (!this.suspended && !this.active) {
        this.update();
      }
    };

    this.source.getModel().addListener(mxEvent.CHANGE, this.updateHandler);
    this.outline.addMouseListener(this);
    var view = this.source.getView();
    view.addListener(mxEvent.SCALE, this.updateHandler);
    view.addListener(mxEvent.TRANSLATE, this.updateHandler);
    view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.updateHandler);
    view.addListener(mxEvent.DOWN, this.updateHandler);
    view.addListener(mxEvent.UP, this.updateHandler);
    mxEvent.addListener(this.source.container, 'scroll', this.updateHandler);

    this.panHandler = (sender) => {
      if (this.updateOnPan) {
        this.updateHandler.apply(this, arguments);
      }
    };

    this.source.addListener(mxEvent.PAN, this.panHandler);

    this.refreshHandler = (sender) => {
      this.outline.setStylesheet(this.source.getStylesheet());
      this.outline.refresh();
    };

    this.source.addListener(mxEvent.REFRESH, this.refreshHandler);
    this.bounds = new mxRectangle(0, 0, 0, 0);
    this.selectionBorder = new mxRectangleShape(
      this.bounds,
      null,
      mxConstants.OUTLINE_COLOR,
      mxConstants.OUTLINE_STROKEWIDTH
    );
    this.selectionBorder.dialect = this.outline.dialect;

    if (this.forceVmlHandles) {
      this.selectionBorder.isHtmlAllowed = function () {
        return false;
      };
    }

    this.selectionBorder.init(this.outline.getView().getOverlayPane());

    var handler = (evt) => {
      var t = mxEvent.getSource(evt);

      var redirect = (evt) => {
        this.outline.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
      };

      var redirect2 = (evt) => {
        mxEvent.removeGestureListeners(t, null, redirect, redirect2);
        this.outline.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
      };

      mxEvent.addGestureListeners(t, null, redirect, redirect2);
      this.outline.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
    };

    mxEvent.addGestureListeners(this.selectionBorder.node, handler);
    this.sizer = this.createSizer();

    if (this.forceVmlHandles) {
      this.sizer.isHtmlAllowed = function () {
        return false;
      };
    }

    this.sizer.init(this.outline.getView().getOverlayPane());

    if (this.enabled) {
      this.sizer.node.style.cursor = 'nwse-resize';
    }

    mxEvent.addGestureListeners(this.sizer.node, handler);
    this.selectionBorder.node.style.display = this.showViewport ? '' : 'none';
    this.sizer.node.style.display = this.selectionBorder.node.style.display;
    this.selectionBorder.node.style.cursor = 'move';
    this.update(false);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  setZoomEnabled(value) {
    this.sizer.node.style.visibility = value ? 'visible' : 'hidden';
  }

  refresh() {
    this.update(true);
  }

  createSizer() {
    if (this.sizerImage != null) {
      var sizer = new mxImageShape(
        new mxRectangle(0, 0, this.sizerImage.width, this.sizerImage.height),
        this.sizerImage.src
      );
      sizer.dialect = this.outline.dialect;
      return sizer;
    } else {
      var sizer = new mxRectangleShape(
        new mxRectangle(0, 0, this.sizerSize, this.sizerSize),
        mxConstants.OUTLINE_HANDLE_FILLCOLOR,
        mxConstants.OUTLINE_HANDLE_STROKECOLOR
      );
      sizer.dialect = this.outline.dialect;
      return sizer;
    }
  }

  getSourceContainerSize() {
    return new mxRectangle(0, 0, this.source.container.scrollWidth, this.source.container.scrollHeight);
  }

  getOutlineOffset(scale) {
    return null;
  }

  getSourceGraphBounds() {
    return this.source.getGraphBounds();
  }

  update(revalidate) {
    if (
      this.source != null &&
      this.source.container != null &&
      this.outline != null &&
      this.outline.container != null
    ) {
      var sourceScale = this.source.view.scale;
      var scaledGraphBounds = this.getSourceGraphBounds();
      var unscaledGraphBounds = new mxRectangle(
        scaledGraphBounds.x / sourceScale + this.source.panDx,
        scaledGraphBounds.y / sourceScale + this.source.panDy,
        scaledGraphBounds.width / sourceScale,
        scaledGraphBounds.height / sourceScale
      );
      var unscaledFinderBounds = new mxRectangle(
        0,
        0,
        this.source.container.clientWidth / sourceScale,
        this.source.container.clientHeight / sourceScale
      );
      var union = unscaledGraphBounds.clone();
      union.add(unscaledFinderBounds);
      var size = this.getSourceContainerSize();
      var completeWidth = Math.max(size.width / sourceScale, union.width);
      var completeHeight = Math.max(size.height / sourceScale, union.height);
      var availableWidth = Math.max(0, this.outline.container.clientWidth - this.border);
      var availableHeight = Math.max(0, this.outline.container.clientHeight - this.border);
      var outlineScale = Math.min(availableWidth / completeWidth, availableHeight / completeHeight);
      var scale = isNaN(outlineScale) ? this.minScale : Math.max(this.minScale, outlineScale);

      if (scale > 0) {
        if (this.outline.getView().scale != scale) {
          this.outline.getView().scale = scale;
          revalidate = true;
        }

        var navView = this.outline.getView();

        if (navView.currentRoot != this.source.getView().currentRoot) {
          navView.setCurrentRoot(this.source.getView().currentRoot);
        }

        var t = this.source.view.translate;
        var tx = t.x + this.source.panDx;
        var ty = t.y + this.source.panDy;
        var off = this.getOutlineOffset(scale);

        if (off != null) {
          tx += off.x;
          ty += off.y;
        }

        if (unscaledGraphBounds.x < 0) {
          tx = tx - unscaledGraphBounds.x;
        }

        if (unscaledGraphBounds.y < 0) {
          ty = ty - unscaledGraphBounds.y;
        }

        if (navView.translate.x != tx || navView.translate.y != ty) {
          navView.translate.x = tx;
          navView.translate.y = ty;
          revalidate = true;
        }

        var t2 = navView.translate;
        scale = this.source.getView().scale;
        var scale2 = scale / navView.scale;
        var scale3 = 1.0 / navView.scale;
        var container = this.source.container;
        this.bounds = new mxRectangle(
          (t2.x - t.x - this.source.panDx) / scale3,
          (t2.y - t.y - this.source.panDy) / scale3,
          container.clientWidth / scale2,
          container.clientHeight / scale2
        );
        this.bounds.x += (this.source.container.scrollLeft * navView.scale) / scale;
        this.bounds.y += (this.source.container.scrollTop * navView.scale) / scale;
        var b = this.selectionBorder.bounds;

        if (
          b.x != this.bounds.x ||
          b.y != this.bounds.y ||
          b.width != this.bounds.width ||
          b.height != this.bounds.height
        ) {
          this.selectionBorder.bounds = this.bounds;
          this.selectionBorder.redraw();
        }

        var b = this.sizer.bounds;
        var b2 = new mxRectangle(
          this.bounds.x + this.bounds.width - b.width / 2,
          this.bounds.y + this.bounds.height - b.height / 2,
          b.width,
          b.height
        );

        if (b.x != b2.x || b.y != b2.y || b.width != b2.width || b.height != b2.height) {
          this.sizer.bounds = b2;

          if (this.sizer.node.style.visibility != 'hidden') {
            this.sizer.redraw();
          }
        }

        if (revalidate) {
          this.outline.view.revalidate();
        }
      }
    }
  }

  mouseDown(sender, me) {
    if (this.enabled && this.showViewport) {
      var tol = !mxEvent.isMouseEvent(me.getEvent()) ? this.source.tolerance : 0;
      var hit =
        this.source.allowHandleBoundsCheck && tol > 0
          ? new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol)
          : null;
      // eslint-disable-next-line no-undef
      this.zoom = me.isSource(this.sizer) || (hit != null && mxUtils.intersects(shape.bounds, hit));
      this.startX = me.getX();
      this.startY = me.getY();
      this.active = true;

      if (this.source.useScrollbarsForPanning && mxUtils.hasScrollbars(this.source.container)) {
        this.dx0 = this.source.container.scrollLeft;
        this.dy0 = this.source.container.scrollTop;
      } else {
        this.dx0 = 0;
        this.dy0 = 0;
      }
    }

    me.consume();
  }

  mouseMove(sender, me) {
    if (this.active) {
      this.selectionBorder.node.style.display = this.showViewport ? '' : 'none';
      this.sizer.node.style.display = this.selectionBorder.node.style.display;
      var delta = this.getTranslateForEvent(me);
      var dx = delta.x;
      var dy = delta.y;
      var bounds = null;

      if (!this.zoom) {
        var scale = this.outline.getView().scale;
        bounds = new mxRectangle(this.bounds.x + dx, this.bounds.y + dy, this.bounds.width, this.bounds.height);
        this.selectionBorder.bounds = bounds;
        this.selectionBorder.redraw();
        dx /= scale;
        dx *= this.source.getView().scale;
        dy /= scale;
        dy *= this.source.getView().scale;
        this.source.panGraph(-dx - this.dx0, -dy - this.dy0);
      } else {
        var container = this.source.container;
        var viewRatio = container.clientWidth / container.clientHeight;
        dy = dx / viewRatio;
        bounds = new mxRectangle(
          this.bounds.x,
          this.bounds.y,
          Math.max(1, this.bounds.width + dx),
          Math.max(1, this.bounds.height + dy)
        );
        this.selectionBorder.bounds = bounds;
        this.selectionBorder.redraw();
      }

      var b = this.sizer.bounds;
      this.sizer.bounds = new mxRectangle(
        bounds.x + bounds.width - b.width / 2,
        bounds.y + bounds.height - b.height / 2,
        b.width,
        b.height
      );

      if (this.sizer.node.style.visibility != 'hidden') {
        this.sizer.redraw();
      }

      me.consume();
    }
  }

  getTranslateForEvent(me) {
    return new mxPoint(me.getX() - this.startX, me.getY() - this.startY);
  }

  mouseUp(sender, me) {
    if (this.active) {
      var delta = this.getTranslateForEvent(me);
      var dx = delta.x;
      var dy = delta.y;

      if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
        if (!this.zoom) {
          if (!this.source.useScrollbarsForPanning || !mxUtils.hasScrollbars(this.source.container)) {
            this.source.panGraph(0, 0);
            dx /= this.outline.getView().scale;
            dy /= this.outline.getView().scale;
            var t = this.source.getView().translate;
            this.source.getView().setTranslate(t.x - dx, t.y - dy);
          }
        } else {
          var w = this.selectionBorder.bounds.width;
          var scale = this.source.getView().scale;
          this.source.zoomTo(Math.max(this.minScale, scale - (dx * scale) / w), false);
        }

        this.update();
        me.consume();
      }

      this.index = null;
      this.active = false;
    }
  }

  destroy() {
    if (this.source != null) {
      this.source.removeListener(this.panHandler);
      this.source.removeListener(this.refreshHandler);
      this.source.getModel().removeListener(this.updateHandler);
      this.source.getView().removeListener(this.updateHandler);
      mxEvent.removeListener(this.source.container, 'scroll', this.updateHandler);
      this.source = null;
    }

    if (this.outline != null) {
      this.outline.removeMouseListener(this);
      this.outline.destroy();
      this.outline = null;
    }

    if (this.selectionBorder != null) {
      this.selectionBorder.destroy();
      this.selectionBorder = null;
    }

    if (this.sizer != null) {
      this.sizer.destroy();
      this.sizer = null;
    }
  }
}
