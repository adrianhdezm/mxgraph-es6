import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxCell } from '@mxgraph/model/mxCell';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { ConnectionCellMarker } from '@mxgraph/handler/ConnectionCellMarker';
import { mxConstraintHandler } from '@mxgraph/handler/mxConstraintHandler';
import { mxPolyline } from '@mxgraph/shape/mxPolyline';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxConnectionHandler extends mxEventSource {
  graph = null;
  factoryMethod = true;
  moveIconFront = false;
  moveIconBack = false;
  connectImage = null;
  targetConnectImage = false;
  enabled = true;
  select = true;
  createTarget = false;
  marker = null;
  constraintHandler = null;
  error = null;
  waypointsEnabled = false;
  ignoreMouseDown = false;
  first = null;
  connectIconOffset = new mxPoint(0, mxConstants.TOOLTIP_VERTICAL_OFFSET);
  edgeState = null;
  changeHandler = null;
  drillHandler = null;
  mouseDownCounter = 0;
  movePreviewAway = false;
  outlineConnect = false;
  livePreview = false;
  cursor = null;
  insertBeforeSource = false;

  constructor(graph, factoryMethod) {
    super();

    if (graph != null) {
      this.graph = graph;
      this.factoryMethod = factoryMethod;
      this.init();

      this.escapeHandler = (sender, evt) => {
        this.reset();
      };

      this.graph.addListener(mxEvent.ESCAPE, this.escapeHandler);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isInsertBefore(edge, source, target, evt, dropTarget) {
    return this.insertBeforeSource && source != target;
  }

  isCreateTarget(evt) {
    return this.createTarget;
  }

  setCreateTarget(value) {
    this.createTarget = value;
  }

  createShape() {
    var shape =
      this.livePreview && this.edgeState != null
        ? this.graph.cellRenderer.createShape(this.edgeState)
        : new mxPolyline([], mxConstants.INVALID_COLOR);
    shape.dialect = this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    shape.scale = this.graph.view.scale;
    shape.pointerEvents = false;
    shape.isDashed = true;
    shape.init(this.graph.getView().getOverlayPane());
    mxEvent.redirectMouseEvents(shape.node, this.graph, null);
    return shape;
  }

  init() {
    this.graph.addMouseListener(this);
    this.marker = this.createMarker();
    this.constraintHandler = new mxConstraintHandler(this.graph);

    this.changeHandler = (sender) => {
      if (this.iconState != null) {
        this.iconState = this.graph.getView().getState(this.iconState.cell);
      }

      if (this.iconState != null) {
        this.redrawIcons(this.icons, this.iconState);
        this.constraintHandler.reset();
      } else if (this.previous != null && this.graph.view.getState(this.previous.cell) == null) {
        this.reset();
      }
    };

    this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.SCALE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.TRANSLATE, this.changeHandler);
    this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.changeHandler);

    this.drillHandler = (sender) => {
      this.reset();
    };

    this.graph.addListener(mxEvent.START_EDITING, this.drillHandler);
    this.graph.getView().addListener(mxEvent.DOWN, this.drillHandler);
    this.graph.getView().addListener(mxEvent.UP, this.drillHandler);
  }

  isConnectableCell(cell) {
    return true;
  }

  createMarker() {
    var marker = new ConnectionCellMarker(this, true, this.graph);
    return marker;
  }

  start(state, x, y, edgeState) {
    this.previous = state;
    this.first = new mxPoint(x, y);
    this.edgeState = edgeState != null ? edgeState : this.createEdgeState(null);
    this.marker.currentColor = this.marker.validColor;
    this.marker.markedState = state;
    this.marker.mark();
    this.fireEvent(new mxEventObject(mxEvent.START, 'state', this.previous));
  }

  isConnecting() {
    return this.first != null && this.shape != null;
  }

  isValidSource(cell, me) {
    return this.graph.isValidSource(cell);
  }

  isValidTarget(cell) {
    return true;
  }

  validateConnection(source, target) {
    if (!this.isValidTarget(target)) {
      return '';
    }

    return this.graph.getEdgeValidationError(null, source, target);
  }

  getConnectImage(state) {
    return this.connectImage;
  }

  isMoveIconToFrontForState(state) {
    if (state.text != null && state.text.node.parentNode == this.graph.container) {
      return true;
    }

    return this.moveIconFront;
  }

  createIcons(state) {
    var image = this.getConnectImage(state);

    if (image != null && state != null) {
      this.iconState = state;
      var icons = [];
      var bounds = new mxRectangle(0, 0, image.width, image.height);
      var icon = new mxImageShape(bounds, image.src, null, null, 0);
      icon.preserveImageAspect = false;

      if (this.isMoveIconToFrontForState(state)) {
        icon.dialect = mxConstants.DIALECT_STRICTHTML;
        icon.init(this.graph.container);
      } else {
        icon.dialect =
          this.graph.dialect == mxConstants.DIALECT_SVG ? mxConstants.DIALECT_SVG : mxConstants.DIALECT_VML;
        icon.init(this.graph.getView().getOverlayPane());

        if (this.moveIconBack && icon.node.previousSibling != null) {
          icon.node.parentNode.insertBefore(icon.node, icon.node.parentNode.firstChild);
        }
      }

      icon.node.style.cursor = mxConstants.CURSOR_CONNECT;

      var getState = () => {
        return this.currentState != null ? this.currentState : state;
      };

      var mouseDown = (evt) => {
        if (!mxEvent.isConsumed(evt)) {
          this.icon = icon;
          this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, getState()));
        }
      };

      mxEvent.redirectMouseEvents(icon.node, this.graph, getState, mouseDown);
      icons.push(icon);
      this.redrawIcons(icons, this.iconState);
      return icons;
    }

    return null;
  }

  redrawIcons(icons, state) {
    if (icons != null && icons[0] != null && state != null) {
      var pos = this.getIconPosition(icons[0], state);
      icons[0].bounds.x = pos.x;
      icons[0].bounds.y = pos.y;
      icons[0].redraw();
    }
  }

  getIconPosition(icon, state) {
    var scale = this.graph.getView().scale;
    var cx = state.getCenterX();
    var cy = state.getCenterY();

    if (this.graph.isSwimlane(state.cell)) {
      var size = this.graph.getStartSize(state.cell);
      cx = size.width != 0 ? state.x + (size.width * scale) / 2 : cx;
      cy = size.height != 0 ? state.y + (size.height * scale) / 2 : cy;
      var alpha = mxUtils.toRadians(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0);

      if (alpha != 0) {
        var cos = Math.cos(alpha);
        var sin = Math.sin(alpha);
        var ct = new mxPoint(state.getCenterX(), state.getCenterY());
        var pt = mxUtils.getRotatedPoint(new mxPoint(cx, cy), cos, sin, ct);
        cx = pt.x;
        cy = pt.y;
      }
    }

    return new mxPoint(cx - icon.bounds.width / 2, cy - icon.bounds.height / 2);
  }

  destroyIcons() {
    if (this.icons != null) {
      for (var i = 0; i < this.icons.length; i++) {
        this.icons[i].destroy();
      }

      this.icons = null;
      this.icon = null;
      this.selectedIcon = null;
      this.iconState = null;
    }
  }

  isStartEvent(me) {
    return (
      (this.constraintHandler.currentFocus != null && this.constraintHandler.currentConstraint != null) ||
      (this.previous != null && this.error == null && (this.icons == null || (this.icons != null && this.icon != null)))
    );
  }

  mouseDown(sender, me) {
    this.mouseDownCounter++;

    if (
      this.isEnabled() &&
      this.graph.isEnabled() &&
      !me.isConsumed() &&
      !this.isConnecting() &&
      this.isStartEvent(me)
    ) {
      if (
        this.constraintHandler.currentConstraint != null &&
        this.constraintHandler.currentFocus != null &&
        this.constraintHandler.currentPoint != null
      ) {
        this.sourceConstraint = this.constraintHandler.currentConstraint;
        this.previous = this.constraintHandler.currentFocus;
        this.first = this.constraintHandler.currentPoint.clone();
      } else {
        this.first = new mxPoint(me.getGraphX(), me.getGraphY());
      }

      this.edgeState = this.createEdgeState(me);
      this.mouseDownCounter = 1;

      if (this.waypointsEnabled && this.shape == null) {
        this.waypoints = null;
        this.shape = this.createShape();

        if (this.edgeState != null) {
          this.shape.apply(this.edgeState);
        }
      }

      if (this.previous == null && this.edgeState != null) {
        var pt = this.graph.getPointForEvent(me.getEvent());
        this.edgeState.cell.geometry.setTerminalPoint(pt, true);
      }

      this.fireEvent(new mxEventObject(mxEvent.START, 'state', this.previous));
      me.consume();
    }

    this.selectedIcon = this.icon;
    this.icon = null;
  }

  isImmediateConnectSource(state) {
    return !this.graph.isCellMovable(state.cell);
  }

  createEdgeState(me) {
    return null;
  }

  isOutlineConnectEvent(me) {
    var offset = mxUtils.getOffset(this.graph.container);
    var evt = me.getEvent();
    var clientX = mxEvent.getClientX(evt);
    var clientY = mxEvent.getClientY(evt);
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    var gridX = this.currentPoint.x - this.graph.container.scrollLeft + offset.x - left;
    var gridY = this.currentPoint.y - this.graph.container.scrollTop + offset.y - top;
    return (
      this.outlineConnect &&
      !mxEvent.isShiftDown(me.getEvent()) &&
      (me.isSource(this.marker.highlight.shape) ||
        (mxEvent.isAltDown(me.getEvent()) && me.getState() != null) ||
        this.marker.highlight.isHighlightAt(clientX, clientY) ||
        ((gridX != clientX || gridY != clientY) &&
          me.getState() == null &&
          this.marker.highlight.isHighlightAt(gridX, gridY)))
    );
  }

  updateCurrentState(me, point) {
    this.constraintHandler.update(
      me,
      this.first == null,
      false,
      this.first == null || me.isSource(this.marker.highlight.shape) ? null : point
    );

    if (this.constraintHandler.currentFocus != null && this.constraintHandler.currentConstraint != null) {
      if (
        this.marker.highlight != null &&
        this.marker.highlight.state != null &&
        this.marker.highlight.state.cell == this.constraintHandler.currentFocus.cell
      ) {
        if (this.marker.highlight.shape.stroke != 'transparent') {
          this.marker.highlight.shape.stroke = 'transparent';
          this.marker.highlight.repaint();
        }
      } else {
        this.marker.markCell(this.constraintHandler.currentFocus.cell, 'transparent');
      }

      if (this.previous != null) {
        this.error = this.validateConnection(this.previous.cell, this.constraintHandler.currentFocus.cell);

        if (this.error == null) {
          this.currentState = this.constraintHandler.currentFocus;
        }

        if (this.error != null || (this.currentState != null && !this.isCellEnabled(this.currentState.cell))) {
          this.constraintHandler.reset();
        }
      }
    } else {
      if (this.graph.isIgnoreTerminalEvent(me.getEvent())) {
        this.marker.reset();
        this.currentState = null;
      } else {
        this.marker.process(me);
        this.currentState = this.marker.getValidState();
      }

      if (this.currentState != null && !this.isCellEnabled(this.currentState.cell)) {
        this.constraintHandler.reset();
        this.marker.reset();
        this.currentState = null;
      }

      var outline = this.isOutlineConnectEvent(me);

      if (this.currentState != null && outline) {
        if (me.isSource(this.marker.highlight.shape)) {
          point = new mxPoint(me.getGraphX(), me.getGraphY());
        }

        var constraint = this.graph.getOutlineConstraint(point, this.currentState, me);
        this.constraintHandler.setFocus(me, this.currentState, false);
        this.constraintHandler.currentConstraint = constraint;
        this.constraintHandler.currentPoint = point;
      }

      if (this.outlineConnect) {
        if (this.marker.highlight != null && this.marker.highlight.shape != null) {
          var s = this.graph.view.scale;

          if (this.constraintHandler.currentConstraint != null && this.constraintHandler.currentFocus != null) {
            this.marker.highlight.shape.stroke = mxConstants.OUTLINE_HIGHLIGHT_COLOR;
            this.marker.highlight.shape.strokewidth = mxConstants.OUTLINE_HIGHLIGHT_STROKEWIDTH / s / s;
            this.marker.highlight.repaint();
          } else if (this.marker.hasValidState()) {
            if (this.graph.isCellConnectable(me.getCell()) && this.marker.getValidState() != me.getState()) {
              this.marker.highlight.shape.stroke = 'transparent';
              this.currentState = null;
            } else {
              this.marker.highlight.shape.stroke = mxConstants.DEFAULT_VALID_COLOR;
            }

            this.marker.highlight.shape.strokewidth = mxConstants.HIGHLIGHT_STROKEWIDTH / s / s;
            this.marker.highlight.repaint();
          }
        }
      }
    }
  }

  isCellEnabled(cell) {
    return true;
  }

  convertWaypoint(point) {
    var scale = this.graph.getView().getScale();
    var tr = this.graph.getView().getTranslate();
    point.x = point.x / scale - tr.x;
    point.y = point.y / scale - tr.y;
  }

  snapToPreview(me, point) {
    if (!mxEvent.isAltDown(me.getEvent()) && this.previous != null) {
      var tol = (this.graph.gridSize * this.graph.view.scale) / 2;
      var tmp =
        this.sourceConstraint != null
          ? this.first
          : new mxPoint(this.previous.getCenterX(), this.previous.getCenterY());

      if (Math.abs(tmp.x - me.getGraphX()) < tol) {
        point.x = tmp.x;
      }

      if (Math.abs(tmp.y - me.getGraphY()) < tol) {
        point.y = tmp.y;
      }
    }
  }

  mouseMove(sender, me) {
    if (!me.isConsumed() && (this.ignoreMouseDown || this.first != null || !this.graph.isMouseDown)) {
      if (!this.isEnabled() && this.currentState != null) {
        this.destroyIcons();
        this.currentState = null;
      }

      var view = this.graph.getView();
      var scale = view.scale;
      var tr = view.translate;
      var point = new mxPoint(me.getGraphX(), me.getGraphY());
      this.error = null;

      if (this.graph.isGridEnabledEvent(me.getEvent())) {
        point = new mxPoint(
          (this.graph.snap(point.x / scale - tr.x) + tr.x) * scale,
          (this.graph.snap(point.y / scale - tr.y) + tr.y) * scale
        );
      }

      this.snapToPreview(me, point);
      this.currentPoint = point;

      if (
        (this.first != null || (this.isEnabled() && this.graph.isEnabled())) &&
        (this.shape != null ||
          this.first == null ||
          Math.abs(me.getGraphX() - this.first.x) > this.graph.tolerance ||
          Math.abs(me.getGraphY() - this.first.y) > this.graph.tolerance)
      ) {
        this.updateCurrentState(me, point);
      }

      if (this.first != null) {
        var constraint = null;
        var current = point;

        if (
          this.constraintHandler.currentConstraint != null &&
          this.constraintHandler.currentFocus != null &&
          this.constraintHandler.currentPoint != null
        ) {
          constraint = this.constraintHandler.currentConstraint;
          current = this.constraintHandler.currentPoint.clone();
        } else if (
          this.previous != null &&
          !this.graph.isIgnoreTerminalEvent(me.getEvent()) &&
          mxEvent.isShiftDown(me.getEvent())
        ) {
          if (Math.abs(this.previous.getCenterX() - point.x) < Math.abs(this.previous.getCenterY() - point.y)) {
            point.x = this.previous.getCenterX();
          } else {
            point.y = this.previous.getCenterY();
          }
        }

        var pt2 = this.first;

        if (this.selectedIcon != null) {
          var w = this.selectedIcon.bounds.width;
          var h = this.selectedIcon.bounds.height;

          if (this.currentState != null && this.targetConnectImage) {
            var pos = this.getIconPosition(this.selectedIcon, this.currentState);
            this.selectedIcon.bounds.x = pos.x;
            this.selectedIcon.bounds.y = pos.y;
          } else {
            var bounds = new mxRectangle(
              me.getGraphX() + this.connectIconOffset.x,
              me.getGraphY() + this.connectIconOffset.y,
              w,
              h
            );
            this.selectedIcon.bounds = bounds;
          }

          this.selectedIcon.redraw();
        }

        if (this.edgeState != null) {
          this.updateEdgeState(current, constraint);
          current = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 1];
          pt2 = this.edgeState.absolutePoints[0];
        } else {
          if (this.currentState != null) {
            if (this.constraintHandler.currentConstraint == null) {
              var tmp = this.getTargetPerimeterPoint(this.currentState, me);

              if (tmp != null) {
                current = tmp;
              }
            }
          }

          if (this.sourceConstraint == null && this.previous != null) {
            var next = this.waypoints != null && this.waypoints.length > 0 ? this.waypoints[0] : current;
            var tmp = this.getSourcePerimeterPoint(this.previous, next, me);

            if (tmp != null) {
              pt2 = tmp;
            }
          }
        }

        if (this.currentState == null && this.movePreviewAway) {
          var tmp = pt2;

          if (this.edgeState != null && this.edgeState.absolutePoints.length >= 2) {
            var tmp2 = this.edgeState.absolutePoints[this.edgeState.absolutePoints.length - 2];

            if (tmp2 != null) {
              tmp = tmp2;
            }
          }

          var dx = current.x - tmp.x;
          var dy = current.y - tmp.y;
          var len = Math.sqrt(dx * dx + dy * dy);

          if (len == 0) {
            return;
          }

          this.originalPoint = current.clone();
          current.x -= (dx * 4) / len;
          current.y -= (dy * 4) / len;
        } else {
          this.originalPoint = null;
        }

        if (this.shape == null) {
          var dx = Math.abs(me.getGraphX() - this.first.x);
          var dy = Math.abs(me.getGraphY() - this.first.y);

          if (dx > this.graph.tolerance || dy > this.graph.tolerance) {
            this.shape = this.createShape();

            if (this.edgeState != null) {
              this.shape.apply(this.edgeState);
            }

            this.updateCurrentState(me, point);
          }
        }

        if (this.shape != null) {
          if (this.edgeState != null) {
            this.shape.points = this.edgeState.absolutePoints;
          } else {
            var pts = [pt2];

            if (this.waypoints != null) {
              pts = pts.concat(this.waypoints);
            }

            pts.push(current);
            this.shape.points = pts;
          }

          this.drawPreview();
        }

        if (this.cursor != null) {
          this.graph.container.style.cursor = this.cursor;
        }

        mxEvent.consume(me.getEvent());
        me.consume();
      } else if (!this.isEnabled() || !this.graph.isEnabled()) {
        this.constraintHandler.reset();
      } else if (this.previous != this.currentState && this.edgeState == null) {
        this.destroyIcons();

        if (this.currentState != null && this.error == null && this.constraintHandler.currentConstraint == null) {
          this.icons = this.createIcons(this.currentState);

          if (this.icons == null) {
            this.currentState.setCursor(mxConstants.CURSOR_CONNECT);
            me.consume();
          }
        }

        this.previous = this.currentState;
      } else if (
        this.previous == this.currentState &&
        this.currentState != null &&
        this.icons == null &&
        !this.graph.isMouseDown
      ) {
        me.consume();
      }

      if (!this.graph.isMouseDown && this.currentState != null && this.icons != null) {
        var hitsIcon = false;
        var target = me.getSource();

        for (var i = 0; i < this.icons.length && !hitsIcon; i++) {
          hitsIcon = target == this.icons[i].node || target.parentNode == this.icons[i].node;
        }

        if (!hitsIcon) {
          this.updateIcons(this.currentState, this.icons, me);
        }
      }
    } else {
      this.constraintHandler.reset();
    }
  }

  updateEdgeState(current, constraint) {
    if (this.sourceConstraint != null && this.sourceConstraint.point != null) {
      this.edgeState.style[mxConstants.STYLE_EXIT_X] = this.sourceConstraint.point.x;
      this.edgeState.style[mxConstants.STYLE_EXIT_Y] = this.sourceConstraint.point.y;
    }

    if (constraint != null && constraint.point != null) {
      this.edgeState.style[mxConstants.STYLE_ENTRY_X] = constraint.point.x;
      this.edgeState.style[mxConstants.STYLE_ENTRY_Y] = constraint.point.y;
    } else {
      delete this.edgeState.style[mxConstants.STYLE_ENTRY_X];
      delete this.edgeState.style[mxConstants.STYLE_ENTRY_Y];
    }

    this.edgeState.absolutePoints = [null, this.currentState != null ? null : current];
    this.graph.view.updateFixedTerminalPoint(this.edgeState, this.previous, true, this.sourceConstraint);

    if (this.currentState != null) {
      if (constraint == null) {
        constraint = this.graph.getConnectionConstraint(this.edgeState, this.previous, false);
      }

      this.edgeState.setAbsoluteTerminalPoint(null, false);
      this.graph.view.updateFixedTerminalPoint(this.edgeState, this.currentState, false, constraint);
    }

    var realPoints = null;

    if (this.waypoints != null) {
      realPoints = [];

      for (var i = 0; i < this.waypoints.length; i++) {
        var pt = this.waypoints[i].clone();
        this.convertWaypoint(pt);
        realPoints[i] = pt;
      }
    }

    this.graph.view.updatePoints(this.edgeState, realPoints, this.previous, this.currentState);
    this.graph.view.updateFloatingTerminalPoints(this.edgeState, this.previous, this.currentState);
  }

  getTargetPerimeterPoint(state, me) {
    var result = null;
    var view = state.view;
    var targetPerimeter = view.getPerimeterFunction(state);

    if (targetPerimeter != null) {
      var next =
        this.waypoints != null && this.waypoints.length > 0
          ? this.waypoints[this.waypoints.length - 1]
          : new mxPoint(this.previous.getCenterX(), this.previous.getCenterY());
      var tmp = targetPerimeter(view.getPerimeterBounds(state), this.edgeState, next, false);

      if (tmp != null) {
        result = tmp;
      }
    } else {
      result = new mxPoint(state.getCenterX(), state.getCenterY());
    }

    return result;
  }

  getSourcePerimeterPoint(state, next, me) {
    var result = null;
    var view = state.view;
    var sourcePerimeter = view.getPerimeterFunction(state);
    var c = new mxPoint(state.getCenterX(), state.getCenterY());

    if (sourcePerimeter != null) {
      var theta = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0);
      var rad = -theta * (Math.PI / 180);

      if (theta != 0) {
        next = mxUtils.getRotatedPoint(new mxPoint(next.x, next.y), Math.cos(rad), Math.sin(rad), c);
      }

      var tmp = sourcePerimeter(view.getPerimeterBounds(state), state, next, false);

      if (tmp != null) {
        if (theta != 0) {
          tmp = mxUtils.getRotatedPoint(new mxPoint(tmp.x, tmp.y), Math.cos(-rad), Math.sin(-rad), c);
        }

        result = tmp;
      }
    } else {
      result = c;
    }

    return result;
  }

  updateIcons(state, icons, me) {}

  isStopEvent(me) {
    return me.getState() != null;
  }

  addWaypointForEvent(me) {
    var point = mxUtils.convertPoint(this.graph.container, me.getX(), me.getY());
    var dx = Math.abs(point.x - this.first.x);
    var dy = Math.abs(point.y - this.first.y);
    var addPoint =
      this.waypoints != null || (this.mouseDownCounter > 1 && (dx > this.graph.tolerance || dy > this.graph.tolerance));

    if (addPoint) {
      if (this.waypoints == null) {
        this.waypoints = [];
      }

      var scale = this.graph.view.scale;
      var point = new mxPoint(
        this.graph.snap(me.getGraphX() / scale) * scale,
        this.graph.snap(me.getGraphY() / scale) * scale
      );
      this.waypoints.push(point);
    }
  }

  checkConstraints(c1, c2) {
    return (
      c1 == null ||
      c2 == null ||
      c1.point == null ||
      c2.point == null ||
      !c1.point.equals(c2.point) ||
      c1.dx != c2.dx ||
      c1.dy != c2.dy ||
      c1.perimeter != c2.perimeter
    );
  }

  mouseUp(sender, me) {
    if (!me.isConsumed() && this.isConnecting()) {
      if (this.waypointsEnabled && !this.isStopEvent(me)) {
        this.addWaypointForEvent(me);
        me.consume();
        return;
      }

      var c1 = this.sourceConstraint;
      var c2 = this.constraintHandler.currentConstraint;
      var source = this.previous != null ? this.previous.cell : null;
      var target = null;

      if (this.constraintHandler.currentConstraint != null && this.constraintHandler.currentFocus != null) {
        target = this.constraintHandler.currentFocus.cell;
      }

      if (target == null && this.currentState != null) {
        target = this.currentState.cell;
      }

      if (
        this.error == null &&
        (source == null || target == null || source != target || this.checkConstraints(c1, c2))
      ) {
        this.connect(source, target, me.getEvent(), me.getCell());
      } else {
        if (
          this.previous != null &&
          this.marker.validState != null &&
          this.previous.cell == this.marker.validState.cell
        ) {
          this.graph.selectCellForEvent(this.marker.source, me.getEvent());
        }

        if (this.error != null && this.error.length > 0) {
          this.graph.validationAlert(this.error);
        }
      }

      this.destroyIcons();
      me.consume();
    }

    if (this.first != null) {
      this.reset();
    }
  }

  reset() {
    if (this.shape != null) {
      this.shape.destroy();
      this.shape = null;
    }

    if (this.cursor != null && this.graph.container != null) {
      this.graph.container.style.cursor = '';
    }

    this.destroyIcons();
    this.marker.reset();
    this.constraintHandler.reset();
    this.originalPoint = null;
    this.currentPoint = null;
    this.edgeState = null;
    this.previous = null;
    this.error = null;
    this.sourceConstraint = null;
    this.mouseDownCounter = 0;
    this.first = null;
    this.fireEvent(new mxEventObject(mxEvent.RESET));
  }

  drawPreview() {
    this.updatePreview(this.error == null);
    this.shape.redraw();
  }

  updatePreview(valid) {
    this.shape.strokewidth = this.getEdgeWidth(valid);
    this.shape.stroke = this.getEdgeColor(valid);
  }

  getEdgeColor(valid) {
    return valid ? mxConstants.VALID_COLOR : mxConstants.INVALID_COLOR;
  }

  getEdgeWidth(valid) {
    return valid ? 3 : 1;
  }

  connect(source, target, evt, dropTarget) {
    if (target != null || this.isCreateTarget(evt) || this.graph.allowDanglingEdges) {
      var model = this.graph.getModel();
      var terminalInserted = false;
      var edge = null;
      model.beginUpdate();

      try {
        if (source != null && target == null && !this.graph.isIgnoreTerminalEvent(evt) && this.isCreateTarget(evt)) {
          target = this.createTargetVertex(evt, source);

          if (target != null) {
            dropTarget = this.graph.getDropTarget([target], evt, dropTarget);
            terminalInserted = true;

            if (dropTarget == null || !this.graph.getModel().isEdge(dropTarget)) {
              var pstate = this.graph.getView().getState(dropTarget);

              if (pstate != null) {
                var tmp = model.getGeometry(target);
                tmp.x -= pstate.origin.x;
                tmp.y -= pstate.origin.y;
              }
            } else {
              dropTarget = this.graph.getDefaultParent();
            }

            this.graph.addCell(target, dropTarget);
          }
        }

        var parent = this.graph.getDefaultParent();

        if (
          source != null &&
          target != null &&
          model.getParent(source) == model.getParent(target) &&
          model.getParent(model.getParent(source)) != model.getRoot()
        ) {
          parent = model.getParent(source);

          if (
            source.geometry != null &&
            source.geometry.relative &&
            target.geometry != null &&
            target.geometry.relative
          ) {
            parent = model.getParent(parent);
          }
        }

        var value = null;
        var style = null;

        if (this.edgeState != null) {
          value = this.edgeState.cell.value;
          style = this.edgeState.cell.style;
        }

        edge = this.insertEdge(parent, null, value, source, target, style);

        if (edge != null) {
          this.graph.setConnectionConstraint(edge, source, true, this.sourceConstraint);
          this.graph.setConnectionConstraint(edge, target, false, this.constraintHandler.currentConstraint);

          if (this.edgeState != null) {
            model.setGeometry(edge, this.edgeState.cell.geometry);
          }

          var parent = model.getParent(source);

          if (this.isInsertBefore(edge, source, target, evt, dropTarget)) {
            var index = null;
            var tmp = source;

            while (tmp.parent != null && tmp.geometry != null && tmp.geometry.relative && tmp.parent != edge.parent) {
              tmp = this.graph.model.getParent(tmp);
            }

            if (tmp != null && tmp.parent != null && tmp.parent == edge.parent) {
              model.add(parent, edge, tmp.parent.getIndex(tmp));
            }
          }

          var geo = model.getGeometry(edge);

          if (geo == null) {
            geo = new mxGeometry();
            geo.relative = true;
            model.setGeometry(edge, geo);
          }

          if (this.waypoints != null && this.waypoints.length > 0) {
            var s = this.graph.view.scale;
            var tr = this.graph.view.translate;
            geo.points = [];

            for (var i = 0; i < this.waypoints.length; i++) {
              var pt = this.waypoints[i];
              geo.points.push(new mxPoint(pt.x / s - tr.x, pt.y / s - tr.y));
            }
          }

          if (target == null) {
            var t = this.graph.view.translate;
            var s = this.graph.view.scale;
            var pt =
              this.originalPoint != null
                ? new mxPoint(this.originalPoint.x / s - t.x, this.originalPoint.y / s - t.y)
                : new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
            pt.x -= this.graph.panDx / this.graph.view.scale;
            pt.y -= this.graph.panDy / this.graph.view.scale;
            geo.setTerminalPoint(pt, false);
          }

          this.fireEvent(
            new mxEventObject(
              mxEvent.CONNECT,
              'cell',
              edge,
              'terminal',
              target,
              'event',
              evt,
              'target',
              dropTarget,
              'terminalInserted',
              terminalInserted
            )
          );
        }
      } catch (e) {
        mxLog.show();
        mxLog.debug(e.message);
      } finally {
        model.endUpdate();
      }

      if (this.select) {
        this.selectCells(edge, terminalInserted ? target : null);
      }
    }
  }

  selectCells(edge, target) {
    this.graph.setSelectionCell(edge);
  }

  insertEdge(parent, id, value, source, target, style) {
    if (this.factoryMethod == null) {
      return this.graph.insertEdge(parent, id, value, source, target, style);
    } else {
      var edge = this.createEdge(value, source, target, style);
      edge = this.graph.addEdge(edge, parent, source, target);
      return edge;
    }
  }

  createTargetVertex(evt, source) {
    var geo = this.graph.getCellGeometry(source);

    while (geo != null && geo.relative) {
      source = this.graph.getModel().getParent(source);
      geo = this.graph.getCellGeometry(source);
    }

    var clone = this.graph.cloneCell(source);
    var geo = this.graph.getModel().getGeometry(clone);

    if (geo != null) {
      var t = this.graph.view.translate;
      var s = this.graph.view.scale;
      var point = new mxPoint(this.currentPoint.x / s - t.x, this.currentPoint.y / s - t.y);
      geo.x = Math.round(point.x - geo.width / 2 - this.graph.panDx / s);
      geo.y = Math.round(point.y - geo.height / 2 - this.graph.panDy / s);
      var tol = this.getAlignmentTolerance();

      if (tol > 0) {
        var sourceState = this.graph.view.getState(source);

        if (sourceState != null) {
          var x = sourceState.x / s - t.x;
          var y = sourceState.y / s - t.y;

          if (Math.abs(x - geo.x) <= tol) {
            geo.x = Math.round(x);
          }

          if (Math.abs(y - geo.y) <= tol) {
            geo.y = Math.round(y);
          }
        }
      }
    }

    return clone;
  }

  getAlignmentTolerance(evt) {
    return this.graph.isGridEnabled() ? this.graph.gridSize / 2 : this.graph.tolerance;
  }

  createEdge(value, source, target, style) {
    var edge = null;

    if (this.factoryMethod != null) {
      edge = this.factoryMethod(source, target, style);
    }

    if (edge == null) {
      edge = new mxCell(value || '');
      edge.setEdge(true);
      edge.setStyle(style);
      var geo = new mxGeometry();
      geo.relative = true;
      edge.setGeometry(geo);
    }

    return edge;
  }

  destroy() {
    this.graph.removeMouseListener(this);

    if (this.shape != null) {
      this.shape.destroy();
      this.shape = null;
    }

    if (this.marker != null) {
      this.marker.destroy();
      this.marker = null;
    }

    if (this.constraintHandler != null) {
      this.constraintHandler.destroy();
      this.constraintHandler = null;
    }

    if (this.changeHandler != null) {
      this.graph.getModel().removeListener(this.changeHandler);
      this.graph.getView().removeListener(this.changeHandler);
      this.changeHandler = null;
    }

    if (this.drillHandler != null) {
      this.graph.removeListener(this.drillHandler);
      this.graph.getView().removeListener(this.drillHandler);
      this.drillHandler = null;
    }

    if (this.escapeHandler != null) {
      this.graph.removeListener(this.escapeHandler);
      this.escapeHandler = null;
    }
  }
}
