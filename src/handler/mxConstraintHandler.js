import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxClient } from '@mxgraph/mxClient';
import { mxImage } from '@mxgraph/util/mxImage';

export class mxConstraintHandler {
  pointImage = new mxImage(mxClient.imageBasePath + '/point.gif', 5, 5);
  enabled = true;
  highlightColor = mxConstants.DEFAULT_VALID_COLOR;

  constructor(graph) {
    this.graph = graph;

    this.resetHandler = (sender, evt) => {
      if (this.currentFocus != null && this.graph.view.getState(this.currentFocus.cell) == null) {
        this.reset();
      } else {
        this.redraw();
      }
    };

    this.graph.model.addListener(mxEvent.CHANGE, this.resetHandler);
    this.graph.view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.resetHandler);
    this.graph.view.addListener(mxEvent.TRANSLATE, this.resetHandler);
    this.graph.view.addListener(mxEvent.SCALE, this.resetHandler);
    this.graph.addListener(mxEvent.ROOT, this.resetHandler);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  reset() {
    if (this.focusIcons != null) {
      for (var i = 0; i < this.focusIcons.length; i++) {
        this.focusIcons[i].destroy();
      }

      this.focusIcons = null;
    }

    if (this.focusHighlight != null) {
      this.focusHighlight.destroy();
      this.focusHighlight = null;
    }

    this.currentConstraint = null;
    this.currentFocusArea = null;
    this.currentPoint = null;
    this.currentFocus = null;
    this.focusPoints = null;
  }

  getTolerance(me) {
    return this.graph.getTolerance();
  }

  getImageForConstraint(state, constraint, point) {
    return this.pointImage;
  }

  isEventIgnored(me, source) {
    return false;
  }

  isStateIgnored(state, source) {
    return false;
  }

  destroyIcons() {
    if (this.focusIcons != null) {
      for (var i = 0; i < this.focusIcons.length; i++) {
        this.focusIcons[i].destroy();
      }

      this.focusIcons = null;
      this.focusPoints = null;
    }
  }

  destroyFocusHighlight() {
    if (this.focusHighlight != null) {
      this.focusHighlight.destroy();
      this.focusHighlight = null;
    }
  }

  isKeepFocusEvent(me) {
    return mxEvent.isShiftDown(me.getEvent());
  }

  getCellForEvent(me, point) {
    var cell = me.getCell();

    if (cell == null && point != null && (me.getGraphX() != point.x || me.getGraphY() != point.y)) {
      cell = this.graph.getCellAt(point.x, point.y);
    }

    if (cell != null && !this.graph.isCellConnectable(cell)) {
      var parent = this.graph.getModel().getParent(cell);

      if (this.graph.getModel().isVertex(parent) && this.graph.isCellConnectable(parent)) {
        cell = parent;
      }
    }

    return this.graph.isCellLocked(cell) ? null : cell;
  }

  update(me, source, existingEdge, point) {
    if (this.isEnabled() && !this.isEventIgnored(me)) {
      if (this.mouseleaveHandler == null && this.graph.container != null) {
        this.mouseleaveHandler = () => {
          this.reset();
        };

        mxEvent.addListener(this.graph.container, 'mouseleave', this.resetHandler);
      }

      var tol = this.getTolerance(me);
      var x = point != null ? point.x : me.getGraphX();
      var y = point != null ? point.y : me.getGraphY();
      var grid = new mxRectangle(x - tol, y - tol, 2 * tol, 2 * tol);
      var mouse = new mxRectangle(me.getGraphX() - tol, me.getGraphY() - tol, 2 * tol, 2 * tol);
      var state = this.graph.view.getState(this.getCellForEvent(me, point));

      if (
        !this.isKeepFocusEvent(me) &&
        (this.currentFocusArea == null ||
          this.currentFocus == null ||
          state != null ||
          !this.graph.getModel().isVertex(this.currentFocus.cell) ||
          !mxUtils.intersects(this.currentFocusArea, mouse)) &&
        state != this.currentFocus
      ) {
        this.currentFocusArea = null;
        this.currentFocus = null;
        this.setFocus(me, state, source);
      }

      this.currentConstraint = null;
      this.currentPoint = null;
      var minDistSq = null;

      if (this.focusIcons != null && this.constraints != null && (state == null || this.currentFocus == state)) {
        var cx = mouse.getCenterX();
        var cy = mouse.getCenterY();

        for (var i = 0; i < this.focusIcons.length; i++) {
          var dx = cx - this.focusIcons[i].bounds.getCenterX();
          var dy = cy - this.focusIcons[i].bounds.getCenterY();
          var tmp = dx * dx + dy * dy;

          if (
            (this.intersects(this.focusIcons[i], mouse, source, existingEdge) ||
              (point != null && this.intersects(this.focusIcons[i], grid, source, existingEdge))) &&
            (minDistSq == null || tmp < minDistSq)
          ) {
            this.currentConstraint = this.constraints[i];
            this.currentPoint = this.focusPoints[i];
            minDistSq = tmp;
            var tmp = this.focusIcons[i].bounds.clone();
            tmp.grow(mxConstants.HIGHLIGHT_SIZE + 1);
            tmp.width -= 1;
            tmp.height -= 1;

            if (this.focusHighlight == null) {
              var hl = this.createHighlightShape();
              hl.dialect =
                this.graph.dialect == mxConstants.DIALECT_SVG ? mxConstants.DIALECT_SVG : mxConstants.DIALECT_VML;
              hl.pointerEvents = false;
              hl.init(this.graph.getView().getOverlayPane());
              this.focusHighlight = hl;

              var getState = () => {
                return this.currentFocus != null ? this.currentFocus : state;
              };

              mxEvent.redirectMouseEvents(hl.node, this.graph, getState);
            }

            this.focusHighlight.bounds = tmp;
            this.focusHighlight.redraw();
          }
        }
      }

      if (this.currentConstraint == null) {
        this.destroyFocusHighlight();
      }
    } else {
      this.currentConstraint = null;
      this.currentFocus = null;
      this.currentPoint = null;
    }
  }

  redraw() {
    if (this.currentFocus != null && this.constraints != null && this.focusIcons != null) {
      var state = this.graph.view.getState(this.currentFocus.cell);
      this.currentFocus = state;
      this.currentFocusArea = new mxRectangle(state.x, state.y, state.width, state.height);

      for (var i = 0; i < this.constraints.length; i++) {
        var cp = this.graph.getConnectionPoint(state, this.constraints[i]);
        var img = this.getImageForConstraint(state, this.constraints[i], cp);
        var bounds = new mxRectangle(
          Math.round(cp.x - img.width / 2),
          Math.round(cp.y - img.height / 2),
          img.width,
          img.height
        );
        this.focusIcons[i].bounds = bounds;
        this.focusIcons[i].redraw();
        this.currentFocusArea.add(this.focusIcons[i].bounds);
        this.focusPoints[i] = cp;
      }
    }
  }

  setFocus(me, state, source) {
    this.constraints =
      state != null && !this.isStateIgnored(state, source) && this.graph.isCellConnectable(state.cell)
        ? this.isEnabled()
          ? this.graph.getAllConnectionConstraints(state, source) || []
          : []
        : null;

    if (this.constraints != null) {
      this.currentFocus = state;
      this.currentFocusArea = new mxRectangle(state.x, state.y, state.width, state.height);

      if (this.focusIcons != null) {
        for (var i = 0; i < this.focusIcons.length; i++) {
          this.focusIcons[i].destroy();
        }

        this.focusIcons = null;
        this.focusPoints = null;
      }

      this.focusPoints = [];
      this.focusIcons = [];

      for (var i = 0; i < this.constraints.length; i++) {
        var cp = this.graph.getConnectionPoint(state, this.constraints[i]);
        var img = this.getImageForConstraint(state, this.constraints[i], cp);
        var src = img.src;
        var bounds = new mxRectangle(
          Math.round(cp.x - img.width / 2),
          Math.round(cp.y - img.height / 2),
          img.width,
          img.height
        );
        var icon = new mxImageShape(bounds, src);
        icon.dialect =
          this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
        icon.preserveImageAspect = false;
        icon.init(this.graph.getView().getDecoratorPane());

        if (mxClient.IS_QUIRKS || document.documentMode == 8) {
          mxEvent.addListener(icon.node, 'dragstart', function (evt) {
            mxEvent.consume(evt);
            return false;
          });
        }

        if (icon.node.previousSibling != null) {
          icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
        }

        var getState = () => {
          return this.currentFocus != null ? this.currentFocus : state;
        };

        icon.redraw();
        mxEvent.redirectMouseEvents(icon.node, this.graph, getState);
        this.currentFocusArea.add(icon.bounds);
        this.focusIcons.push(icon);
        this.focusPoints.push(cp);
      }

      this.currentFocusArea.grow(this.getTolerance(me));
    } else {
      this.destroyIcons();
      this.destroyFocusHighlight();
    }
  }

  createHighlightShape() {
    var hl = new mxRectangleShape(null, this.highlightColor, this.highlightColor, mxConstants.HIGHLIGHT_STROKEWIDTH);
    hl.opacity = mxConstants.HIGHLIGHT_OPACITY;
    return hl;
  }

  intersects(icon, mouse, source, existingEdge) {
    return mxUtils.intersects(icon.bounds, mouse);
  }

  destroy() {
    this.reset();

    if (this.resetHandler != null) {
      this.graph.model.removeListener(this.resetHandler);
      this.graph.view.removeListener(this.resetHandler);
      this.graph.removeListener(this.resetHandler);
      this.resetHandler = null;
    }

    if (this.mouseleaveHandler != null && this.graph.container != null) {
      mxEvent.removeListener(this.graph.container, 'mouseleave', this.mouseleaveHandler);
      this.mouseleaveHandler = null;
    }
  }
}
