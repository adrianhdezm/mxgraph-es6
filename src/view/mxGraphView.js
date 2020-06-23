import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxCellState } from '@mxgraph/view/mxCellState';
import { mxStyleRegistry } from '@mxgraph/view/mxStyleRegistry';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUndoableEdit } from '@mxgraph/util/mxUndoableEdit';
import { mxCurrentRootChange } from '@mxgraph/view/mxCurrentRootChange';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxClient } from '@mxgraph/mxClient';
import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxGraphView extends mxEventSource {
  EMPTY_POINT = new mxPoint();
  doneResource = mxClient.language != 'none' ? 'done' : '';
  updatingDocumentResource = mxClient.language != 'none' ? 'updatingDocument' : '';
  allowEval = false;
  captureDocumentGesture = true;
  optimizeVmlReflows = true;
  rendering = true;
  currentRoot = null;
  scale = 1;
  updateStyle = false;
  lastNode = null;
  lastHtmlNode = null;
  lastForegroundNode = null;
  lastForegroundHtmlNode = null;

  constructor(graph) {
    super();
    this.graph = graph;
    this.translate = new mxPoint();
    this.graphBounds = new mxRectangle();
    this.states = new mxDictionary();
  }

  getGraphBounds() {
    return this.graphBounds;
  }

  setGraphBounds(value) {
    this.graphBounds = value;
  }

  getBounds(cells) {
    var result = null;

    if (cells != null && cells.length > 0) {
      var model = this.graph.getModel();

      for (var i = 0; i < cells.length; i++) {
        if (model.isVertex(cells[i]) || model.isEdge(cells[i])) {
          var state = this.getState(cells[i]);

          if (state != null) {
            if (result == null) {
              result = mxRectangle.fromRectangle(state);
            } else {
              result.add(state);
            }
          }
        }
      }
    }

    return result;
  }

  setCurrentRoot(root) {
    if (this.currentRoot != root) {
      var change = new mxCurrentRootChange(this, root);
      change.execute();
      var edit = new mxUndoableEdit(this, true);
      edit.add(change);
      this.fireEvent(new mxEventObject(mxEvent.UNDO, 'edit', edit));
      this.graph.sizeDidChange();
    }

    return root;
  }

  scaleAndTranslate(scale, dx, dy) {
    var previousScale = this.scale;
    var previousTranslate = new mxPoint(this.translate.x, this.translate.y);

    if (this.scale != scale || this.translate.x != dx || this.translate.y != dy) {
      this.scale = scale;
      this.translate.x = dx;
      this.translate.y = dy;

      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }

    this.fireEvent(
      new mxEventObject(
        mxEvent.SCALE_AND_TRANSLATE,
        'scale',
        scale,
        'previousScale',
        previousScale,
        'translate',
        this.translate,
        'previousTranslate',
        previousTranslate
      )
    );
  }

  getScale() {
    return this.scale;
  }

  setScale(value) {
    var previousScale = this.scale;

    if (this.scale != value) {
      this.scale = value;

      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }

    this.fireEvent(new mxEventObject(mxEvent.SCALE, 'scale', value, 'previousScale', previousScale));
  }

  getTranslate() {
    return this.translate;
  }

  setTranslate(dx, dy) {
    var previousTranslate = new mxPoint(this.translate.x, this.translate.y);

    if (this.translate.x != dx || this.translate.y != dy) {
      this.translate.x = dx;
      this.translate.y = dy;

      if (this.isEventsEnabled()) {
        this.viewStateChanged();
      }
    }

    this.fireEvent(
      new mxEventObject(mxEvent.TRANSLATE, 'translate', this.translate, 'previousTranslate', previousTranslate)
    );
  }

  viewStateChanged() {
    this.revalidate();
    this.graph.sizeDidChange();
  }

  refresh() {
    if (this.currentRoot != null) {
      this.clear();
    }

    this.revalidate();
  }

  revalidate() {
    this.invalidate();
    this.validate();
  }

  clear(cell, force, recurse) {
    var model = this.graph.getModel();
    cell = cell || model.getRoot();
    force = force != null ? force : false;
    recurse = recurse != null ? recurse : true;
    this.removeState(cell);

    if (recurse && (force || cell != this.currentRoot)) {
      var childCount = model.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        this.clear(model.getChildAt(cell, i), force);
      }
    } else {
      this.invalidate(cell);
    }
  }

  invalidate(cell, recurse, includeEdges) {
    var model = this.graph.getModel();
    cell = cell || model.getRoot();
    recurse = recurse != null ? recurse : true;
    includeEdges = includeEdges != null ? includeEdges : true;
    var state = this.getState(cell);

    if (state != null) {
      state.invalid = true;
    }

    if (!cell.invalidating) {
      cell.invalidating = true;

      if (recurse) {
        var childCount = model.getChildCount(cell);

        for (var i = 0; i < childCount; i++) {
          var child = model.getChildAt(cell, i);
          this.invalidate(child, recurse, includeEdges);
        }
      }

      if (includeEdges) {
        var edgeCount = model.getEdgeCount(cell);

        for (var i = 0; i < edgeCount; i++) {
          this.invalidate(model.getEdgeAt(cell, i), recurse, includeEdges);
        }
      }

      delete cell.invalidating;
    }
  }

  validate(cell) {
    var t0 = mxLog.enter('mxGraphView.validate');
    window.status = mxResources.get(this.updatingDocumentResource) || this.updatingDocumentResource;
    this.resetValidationState();
    var prevDisplay = null;

    if (
      this.optimizeVmlReflows &&
      this.canvas != null &&
      this.textDiv == null &&
      ((document.documentMode == 8 && !mxClient.IS_EM) || mxClient.IS_QUIRKS)
    ) {
      this.placeholder = document.createElement('div');
      this.placeholder.style.position = 'absolute';
      this.placeholder.style.width = this.canvas.clientWidth + 'px';
      this.placeholder.style.height = this.canvas.clientHeight + 'px';
      this.canvas.parentNode.appendChild(this.placeholder);
      prevDisplay = this.drawPane.style.display;
      this.canvas.style.display = 'none';
      this.textDiv = document.createElement('div');
      this.textDiv.style.position = 'absolute';
      this.textDiv.style.whiteSpace = 'nowrap';
      this.textDiv.style.visibility = 'hidden';
      this.textDiv.style.display = mxClient.IS_QUIRKS ? 'inline' : 'inline-block';
      this.textDiv.style.zoom = '1';
      document.body.appendChild(this.textDiv);
    }

    var graphBounds = this.getBoundingBox(
      this.validateCellState(
        this.validateCell(cell || (this.currentRoot != null ? this.currentRoot : this.graph.getModel().getRoot()))
      )
    );
    this.setGraphBounds(graphBounds != null ? graphBounds : this.getEmptyBounds());
    this.validateBackground();

    if (prevDisplay != null) {
      this.canvas.style.display = prevDisplay;
      this.textDiv.parentNode.removeChild(this.textDiv);

      if (this.placeholder != null) {
        this.placeholder.parentNode.removeChild(this.placeholder);
      }

      this.textDiv = null;
    }

    this.resetValidationState();
    window.status = mxResources.get(this.doneResource) || this.doneResource;
    mxLog.leave('mxGraphView.validate', t0);
  }

  getEmptyBounds() {
    return new mxRectangle(this.translate.x * this.scale, this.translate.y * this.scale);
  }

  getBoundingBox(state, recurse) {
    recurse = recurse != null ? recurse : true;
    var bbox = null;

    if (state != null) {
      if (state.shape != null && state.shape.boundingBox != null) {
        bbox = state.shape.boundingBox.clone();
      }

      if (state.text != null && state.text.boundingBox != null) {
        if (bbox != null) {
          bbox.add(state.text.boundingBox);
        } else {
          bbox = state.text.boundingBox.clone();
        }
      }

      if (recurse) {
        var model = this.graph.getModel();
        var childCount = model.getChildCount(state.cell);

        for (var i = 0; i < childCount; i++) {
          var bounds = this.getBoundingBox(this.getState(model.getChildAt(state.cell, i)));

          if (bounds != null) {
            if (bbox == null) {
              bbox = bounds;
            } else {
              bbox.add(bounds);
            }
          }
        }
      }
    }

    return bbox;
  }

  createBackgroundPageShape(bounds) {
    return new mxRectangleShape(bounds, 'white', 'black');
  }

  validateBackground() {
    this.validateBackgroundImage();
    this.validateBackgroundPage();
  }

  validateBackgroundImage() {
    var bg = this.graph.getBackgroundImage();

    if (bg != null) {
      if (this.backgroundImage == null || this.backgroundImage.image != bg.src) {
        if (this.backgroundImage != null) {
          this.backgroundImage.destroy();
        }

        var bounds = new mxRectangle(0, 0, 1, 1);
        this.backgroundImage = new mxImageShape(bounds, bg.src);
        this.backgroundImage.dialect = this.graph.dialect;
        this.backgroundImage.init(this.backgroundPane);
        this.backgroundImage.redraw();

        if (document.documentMode == 8 && !mxClient.IS_EM) {
          mxEvent.addGestureListeners(
            this.backgroundImage.node,
            (evt) => {
              this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
            },
            (evt) => {
              this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
            },
            (evt) => {
              this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
            }
          );
        }
      }

      this.redrawBackgroundImage(this.backgroundImage, bg);
    } else if (this.backgroundImage != null) {
      this.backgroundImage.destroy();
      this.backgroundImage = null;
    }
  }

  validateBackgroundPage() {
    if (this.graph.pageVisible) {
      var bounds = this.getBackgroundPageBounds();

      if (this.backgroundPageShape == null) {
        this.backgroundPageShape = this.createBackgroundPageShape(bounds);
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.isShadow = true;
        this.backgroundPageShape.dialect = this.graph.dialect;
        this.backgroundPageShape.init(this.backgroundPane);
        this.backgroundPageShape.redraw();

        if (this.graph.nativeDblClickEnabled) {
          mxEvent.addListener(this.backgroundPageShape.node, 'dblclick', (evt) => {
            this.graph.dblClick(evt);
          });
        }

        mxEvent.addGestureListeners(
          this.backgroundPageShape.node,
          (evt) => {
            this.graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
          },
          (evt) => {
            if (this.graph.tooltipHandler != null && this.graph.tooltipHandler.isHideOnHover()) {
              this.graph.tooltipHandler.hide();
            }

            if (this.graph.isMouseDown && !mxEvent.isConsumed(evt)) {
              this.graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
            }
          },
          (evt) => {
            this.graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
          }
        );
      } else {
        this.backgroundPageShape.scale = this.scale;
        this.backgroundPageShape.bounds = bounds;
        this.backgroundPageShape.redraw();
      }
    } else if (this.backgroundPageShape != null) {
      this.backgroundPageShape.destroy();
      this.backgroundPageShape = null;
    }
  }

  getBackgroundPageBounds() {
    var fmt = this.graph.pageFormat;
    var ps = this.scale * this.graph.pageScale;
    var bounds = new mxRectangle(
      this.scale * this.translate.x,
      this.scale * this.translate.y,
      fmt.width * ps,
      fmt.height * ps
    );
    return bounds;
  }

  redrawBackgroundImage(backgroundImage, bg) {
    backgroundImage.scale = this.scale;
    backgroundImage.bounds.x = this.scale * this.translate.x;
    backgroundImage.bounds.y = this.scale * this.translate.y;
    backgroundImage.bounds.width = this.scale * bg.width;
    backgroundImage.bounds.height = this.scale * bg.height;
    backgroundImage.redraw();
  }

  validateCell(cell, visible) {
    visible = visible != null ? visible : true;

    if (cell != null) {
      visible = visible && this.graph.isCellVisible(cell);
      var state = this.getState(cell, visible);

      if (state != null && !visible) {
        this.removeState(cell);
      } else {
        var model = this.graph.getModel();
        var childCount = model.getChildCount(cell);

        for (var i = 0; i < childCount; i++) {
          this.validateCell(
            model.getChildAt(cell, i),
            visible && (!this.isCellCollapsed(cell) || cell == this.currentRoot)
          );
        }
      }
    }

    return cell;
  }

  validateCellState(cell, recurse) {
    recurse = recurse != null ? recurse : true;
    var state = null;

    if (cell != null) {
      state = this.getState(cell);

      if (state != null) {
        var model = this.graph.getModel();

        if (state.invalid) {
          state.invalid = false;

          if (state.style == null || state.invalidStyle) {
            state.style = this.graph.getCellStyle(state.cell);
            state.invalidStyle = false;
          }

          if (cell != this.currentRoot) {
            this.validateCellState(model.getParent(cell), false);
          }

          state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, true), false), true);
          state.setVisibleTerminalState(this.validateCellState(this.getVisibleTerminal(cell, false), false), false);
          this.updateCellState(state);

          if (cell != this.currentRoot && !state.invalid) {
            this.graph.cellRenderer.redraw(state, false, this.isRendering());
            state.updateCachedBounds();
          }
        }

        if (recurse && !state.invalid) {
          if (state.shape != null) {
            this.stateValidated(state);
          }

          var childCount = model.getChildCount(cell);

          for (var i = 0; i < childCount; i++) {
            this.validateCellState(model.getChildAt(cell, i));
          }
        }
      }
    }

    return state;
  }

  updateCellState(state) {
    state.absoluteOffset.x = 0;
    state.absoluteOffset.y = 0;
    state.origin.x = 0;
    state.origin.y = 0;
    state.length = 0;

    if (state.cell != this.currentRoot) {
      var model = this.graph.getModel();
      var pState = this.getState(model.getParent(state.cell));

      if (pState != null && pState.cell != this.currentRoot) {
        state.origin.x += pState.origin.x;
        state.origin.y += pState.origin.y;
      }

      var offset = this.graph.getChildOffsetForCell(state.cell);

      if (offset != null) {
        state.origin.x += offset.x;
        state.origin.y += offset.y;
      }

      var geo = this.graph.getCellGeometry(state.cell);

      if (geo != null) {
        if (!model.isEdge(state.cell)) {
          offset = geo.offset != null ? geo.offset : this.EMPTY_POINT;

          if (geo.relative && pState != null) {
            if (model.isEdge(pState.cell)) {
              var origin = this.getPoint(pState, geo);

              if (origin != null) {
                state.origin.x += origin.x / this.scale - pState.origin.x - this.translate.x;
                state.origin.y += origin.y / this.scale - pState.origin.y - this.translate.y;
              }
            } else {
              state.origin.x += geo.x * pState.unscaledWidth + offset.x;
              state.origin.y += geo.y * pState.unscaledHeight + offset.y;
            }
          } else {
            state.absoluteOffset.x = this.scale * offset.x;
            state.absoluteOffset.y = this.scale * offset.y;
            state.origin.x += geo.x;
            state.origin.y += geo.y;
          }
        }

        state.x = this.scale * (this.translate.x + state.origin.x);
        state.y = this.scale * (this.translate.y + state.origin.y);
        state.width = this.scale * geo.width;
        state.unscaledWidth = geo.width;
        state.height = this.scale * geo.height;
        state.unscaledHeight = geo.height;

        if (model.isVertex(state.cell)) {
          this.updateVertexState(state, geo);
        }

        if (model.isEdge(state.cell)) {
          this.updateEdgeState(state, geo);
        }
      }
    }

    state.updateCachedBounds();
  }

  isCellCollapsed(cell) {
    return this.graph.isCellCollapsed(cell);
  }

  updateVertexState(state, geo) {
    var model = this.graph.getModel();
    var pState = this.getState(model.getParent(state.cell));

    if (geo.relative && pState != null && !model.isEdge(pState.cell)) {
      var alpha = mxUtils.toRadians(pState.style[mxConstants.STYLE_ROTATION] || '0');

      if (alpha != 0) {
        var cos = Math.cos(alpha);
        var sin = Math.sin(alpha);
        var ct = new mxPoint(state.getCenterX(), state.getCenterY());
        var cx = new mxPoint(pState.getCenterX(), pState.getCenterY());
        var pt = mxUtils.getRotatedPoint(ct, cos, sin, cx);
        state.x = pt.x - state.width / 2;
        state.y = pt.y - state.height / 2;
      }
    }

    this.updateVertexLabelOffset(state);
  }

  updateEdgeState(state, geo) {
    var source = state.getVisibleTerminalState(true);
    var target = state.getVisibleTerminalState(false);

    if (
      (this.graph.model.getTerminal(state.cell, true) != null && source == null) ||
      (source == null && geo.getTerminalPoint(true) == null) ||
      (this.graph.model.getTerminal(state.cell, false) != null && target == null) ||
      (target == null && geo.getTerminalPoint(false) == null)
    ) {
      this.clear(state.cell, true);
    } else {
      this.updateFixedTerminalPoints(state, source, target);
      this.updatePoints(state, geo.points, source, target);
      this.updateFloatingTerminalPoints(state, source, target);
      var pts = state.absolutePoints;

      if (
        state.cell != this.currentRoot &&
        (pts == null || pts.length < 2 || pts[0] == null || pts[pts.length - 1] == null)
      ) {
        this.clear(state.cell, true);
      } else {
        this.updateEdgeBounds(state);
        this.updateEdgeLabelOffset(state);
      }
    }
  }

  updateVertexLabelOffset(state) {
    var h = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);

    if (h == mxConstants.ALIGN_LEFT) {
      var lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);

      if (lw != null) {
        lw *= this.scale;
      } else {
        lw = state.width;
      }

      state.absoluteOffset.x -= lw;
    } else if (h == mxConstants.ALIGN_RIGHT) {
      state.absoluteOffset.x += state.width;
    } else if (h == mxConstants.ALIGN_CENTER) {
      var lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);

      if (lw != null) {
        var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
        var dx = 0;

        if (align == mxConstants.ALIGN_CENTER) {
          dx = 0.5;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          dx = 1;
        }

        if (dx != 0) {
          state.absoluteOffset.x -= (lw * this.scale - state.width) * dx;
        }
      }
    }

    var v = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);

    if (v == mxConstants.ALIGN_TOP) {
      state.absoluteOffset.y -= state.height;
    } else if (v == mxConstants.ALIGN_BOTTOM) {
      state.absoluteOffset.y += state.height;
    }
  }

  resetValidationState() {
    this.lastNode = null;
    this.lastHtmlNode = null;
    this.lastForegroundNode = null;
    this.lastForegroundHtmlNode = null;
  }

  stateValidated(state) {
    var fg =
      (this.graph.getModel().isEdge(state.cell) && this.graph.keepEdgesInForeground) ||
      (this.graph.getModel().isVertex(state.cell) && this.graph.keepEdgesInBackground);
    var htmlNode = fg ? this.lastForegroundHtmlNode || this.lastHtmlNode : this.lastHtmlNode;
    var node = fg ? this.lastForegroundNode || this.lastNode : this.lastNode;
    var result = this.graph.cellRenderer.insertStateAfter(state, node, htmlNode);

    if (fg) {
      this.lastForegroundHtmlNode = result[1];
      this.lastForegroundNode = result[0];
    } else {
      this.lastHtmlNode = result[1];
      this.lastNode = result[0];
    }
  }

  updateFixedTerminalPoints(edge, source, target) {
    this.updateFixedTerminalPoint(edge, source, true, this.graph.getConnectionConstraint(edge, source, true));
    this.updateFixedTerminalPoint(edge, target, false, this.graph.getConnectionConstraint(edge, target, false));
  }

  updateFixedTerminalPoint(edge, terminal, source, constraint) {
    edge.setAbsoluteTerminalPoint(this.getFixedTerminalPoint(edge, terminal, source, constraint), source);
  }

  getFixedTerminalPoint(edge, terminal, source, constraint) {
    var pt = null;

    if (constraint != null) {
      pt = this.graph.getConnectionPoint(terminal, constraint, false);
    }

    if (pt == null && terminal == null) {
      var s = this.scale;
      var tr = this.translate;
      var orig = edge.origin;
      var geo = this.graph.getCellGeometry(edge.cell);
      pt = geo.getTerminalPoint(source);

      if (pt != null) {
        pt = new mxPoint(s * (tr.x + pt.x + orig.x), s * (tr.y + pt.y + orig.y));
      }
    }

    return pt;
  }

  updateBoundsFromStencil(state) {
    var previous = null;

    if (state != null && state.shape != null && state.shape.stencil != null && state.shape.stencil.aspect == 'fixed') {
      previous = mxRectangle.fromRectangle(state);
      var asp = state.shape.stencil.computeAspect(state.style, state.x, state.y, state.width, state.height);
      state.setRect(asp.x, asp.y, state.shape.stencil.w0 * asp.width, state.shape.stencil.h0 * asp.height);
    }

    return previous;
  }

  updatePoints(edge, points, source, target) {
    if (edge != null) {
      var pts = [];
      pts.push(edge.absolutePoints[0]);
      var edgeStyle = this.getEdgeStyle(edge, points, source, target);

      if (edgeStyle != null) {
        var src = this.getTerminalPort(edge, source, true);
        var trg = this.getTerminalPort(edge, target, false);
        var srcBounds = this.updateBoundsFromStencil(src);
        var trgBounds = this.updateBoundsFromStencil(trg);
        edgeStyle(edge, src, trg, points, pts);

        if (srcBounds != null) {
          src.setRect(srcBounds.x, srcBounds.y, srcBounds.width, srcBounds.height);
        }

        if (trgBounds != null) {
          trg.setRect(trgBounds.x, trgBounds.y, trgBounds.width, trgBounds.height);
        }
      } else if (points != null) {
        for (var i = 0; i < points.length; i++) {
          if (points[i] != null) {
            var pt = mxUtils.clone(points[i]);
            pts.push(this.transformControlPoint(edge, pt));
          }
        }
      }

      var tmp = edge.absolutePoints;
      pts.push(tmp[tmp.length - 1]);
      edge.absolutePoints = pts;
    }
  }

  transformControlPoint(state, pt, ignoreScale) {
    if (state != null && pt != null) {
      var orig = state.origin;
      var scale = ignoreScale ? 1 : this.scale;
      return new mxPoint(scale * (pt.x + this.translate.x + orig.x), scale * (pt.y + this.translate.y + orig.y));
    }

    return null;
  }

  isLoopStyleEnabled(edge, points, source, target) {
    var sc = this.graph.getConnectionConstraint(edge, source, true);
    var tc = this.graph.getConnectionConstraint(edge, target, false);

    if (
      (points == null || points.length < 2) &&
      (!mxUtils.getValue(edge.style, mxConstants.STYLE_ORTHOGONAL_LOOP, false) ||
        ((sc == null || sc.point == null) && (tc == null || tc.point == null)))
    ) {
      return source != null && source == target;
    }

    return false;
  }

  getEdgeStyle(edge, points, source, target) {
    var edgeStyle = this.isLoopStyleEnabled(edge, points, source, target)
      ? mxUtils.getValue(edge.style, mxConstants.STYLE_LOOP, this.graph.defaultLoopStyle)
      : !mxUtils.getValue(edge.style, mxConstants.STYLE_NOEDGESTYLE, false)
      ? edge.style[mxConstants.STYLE_EDGE]
      : null;

    if (typeof edgeStyle == 'string') {
      var tmp = mxStyleRegistry.getValue(edgeStyle);

      if (tmp == null && this.isAllowEval()) {
        tmp = mxUtils.eval(edgeStyle);
      }

      edgeStyle = tmp;
    }

    if (typeof edgeStyle == 'function') {
      return edgeStyle;
    }

    return null;
  }

  updateFloatingTerminalPoints(state, source, target) {
    var pts = state.absolutePoints;
    var p0 = pts[0];
    var pe = pts[pts.length - 1];

    if (pe == null && target != null) {
      this.updateFloatingTerminalPoint(state, target, source, false);
    }

    if (p0 == null && source != null) {
      this.updateFloatingTerminalPoint(state, source, target, true);
    }
  }

  updateFloatingTerminalPoint(edge, start, end, source) {
    edge.setAbsoluteTerminalPoint(this.getFloatingTerminalPoint(edge, start, end, source), source);
  }

  getFloatingTerminalPoint(edge, start, end, source) {
    start = this.getTerminalPort(edge, start, source);
    var next = this.getNextPoint(edge, end, source);
    var orth = this.graph.isOrthogonal(edge);
    var alpha = mxUtils.toRadians(Number(start.style[mxConstants.STYLE_ROTATION] || '0'));
    var center = new mxPoint(start.getCenterX(), start.getCenterY());

    if (alpha != 0) {
      var cos = Math.cos(-alpha);
      var sin = Math.sin(-alpha);
      next = mxUtils.getRotatedPoint(next, cos, sin, center);
    }

    var border = parseFloat(edge.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
    border += parseFloat(
      edge.style[source ? mxConstants.STYLE_SOURCE_PERIMETER_SPACING : mxConstants.STYLE_TARGET_PERIMETER_SPACING] || 0
    );
    var pt = this.getPerimeterPoint(start, next, alpha == 0 && orth, border);

    if (alpha != 0) {
      var cos = Math.cos(alpha);
      var sin = Math.sin(alpha);
      pt = mxUtils.getRotatedPoint(pt, cos, sin, center);
    }

    return pt;
  }

  getTerminalPort(state, terminal, source) {
    var key = source ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
    var id = mxUtils.getValue(state.style, key);

    if (id != null) {
      var tmp = this.getState(this.graph.getModel().getCell(id));

      if (tmp != null) {
        terminal = tmp;
      }
    }

    return terminal;
  }

  getPerimeterPoint(terminal, next, orthogonal, border) {
    var point = null;

    if (terminal != null) {
      var perimeter = this.getPerimeterFunction(terminal);

      if (perimeter != null && next != null) {
        var bounds = this.getPerimeterBounds(terminal, border);

        if (bounds.width > 0 || bounds.height > 0) {
          point = new mxPoint(next.x, next.y);
          var flipH = false;
          var flipV = false;

          if (this.graph.model.isVertex(terminal.cell)) {
            flipH = mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPH, 0) == 1;
            flipV = mxUtils.getValue(terminal.style, mxConstants.STYLE_FLIPV, 0) == 1;

            if (terminal.shape != null && terminal.shape.stencil != null) {
              flipH = mxUtils.getValue(terminal.style, 'stencilFlipH', 0) == 1 || flipH;
              flipV = mxUtils.getValue(terminal.style, 'stencilFlipV', 0) == 1 || flipV;
            }

            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }

            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }

          point = perimeter(bounds, terminal, point, orthogonal);

          if (point != null) {
            if (flipH) {
              point.x = 2 * bounds.getCenterX() - point.x;
            }

            if (flipV) {
              point.y = 2 * bounds.getCenterY() - point.y;
            }
          }
        }
      }

      if (point == null) {
        point = this.getPoint(terminal);
      }
    }

    return point;
  }

  getRoutingCenterX(state) {
    var f = state.style != null ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_X]) || 0 : 0;
    return state.getCenterX() + f * state.width;
  }

  getRoutingCenterY(state) {
    var f = state.style != null ? parseFloat(state.style[mxConstants.STYLE_ROUTING_CENTER_Y]) || 0 : 0;
    return state.getCenterY() + f * state.height;
  }

  getPerimeterBounds(terminal, border) {
    border = border != null ? border : 0;

    if (terminal != null) {
      border += parseFloat(terminal.style[mxConstants.STYLE_PERIMETER_SPACING] || 0);
    }

    return terminal.getPerimeterBounds(border * this.scale);
  }

  getPerimeterFunction(state) {
    var perimeter = state.style[mxConstants.STYLE_PERIMETER];

    if (typeof perimeter == 'string') {
      var tmp = mxStyleRegistry.getValue(perimeter);

      if (tmp == null && this.isAllowEval()) {
        tmp = mxUtils.eval(perimeter);
      }

      perimeter = tmp;
    }

    if (typeof perimeter == 'function') {
      return perimeter;
    }

    return null;
  }

  getNextPoint(edge, opposite, source) {
    var pts = edge.absolutePoints;
    var point = null;

    if (pts != null && pts.length >= 2) {
      var count = pts.length;
      point = pts[source ? Math.min(1, count - 1) : Math.max(0, count - 2)];
    }

    if (point == null && opposite != null) {
      point = new mxPoint(opposite.getCenterX(), opposite.getCenterY());
    }

    return point;
  }

  getVisibleTerminal(edge, source) {
    var model = this.graph.getModel();
    var result = model.getTerminal(edge, source);
    var best = result;

    while (result != null && result != this.currentRoot) {
      if (!this.graph.isCellVisible(best) || this.isCellCollapsed(result)) {
        best = result;
      }

      result = model.getParent(result);
    }

    if (
      best != null &&
      (!model.contains(best) || model.getParent(best) == model.getRoot() || best == this.currentRoot)
    ) {
      best = null;
    }

    return best;
  }

  updateEdgeBounds(state) {
    var points = state.absolutePoints;
    var p0 = points[0];
    var pe = points[points.length - 1];

    if (p0.x != pe.x || p0.y != pe.y) {
      var dx = pe.x - p0.x;
      var dy = pe.y - p0.y;
      state.terminalDistance = Math.sqrt(dx * dx + dy * dy);
    } else {
      state.terminalDistance = 0;
    }

    var length = 0;
    var segments = [];
    var pt = p0;

    if (pt != null) {
      var minX = pt.x;
      var minY = pt.y;
      var maxX = minX;
      var maxY = minY;

      for (var i = 1; i < points.length; i++) {
        var tmp = points[i];

        if (tmp != null) {
          var dx = pt.x - tmp.x;
          var dy = pt.y - tmp.y;
          var segment = Math.sqrt(dx * dx + dy * dy);
          segments.push(segment);
          length += segment;
          pt = tmp;
          minX = Math.min(pt.x, minX);
          minY = Math.min(pt.y, minY);
          maxX = Math.max(pt.x, maxX);
          maxY = Math.max(pt.y, maxY);
        }
      }

      state.length = length;
      state.segments = segments;
      var markerSize = 1;
      state.x = minX;
      state.y = minY;
      state.width = Math.max(markerSize, maxX - minX);
      state.height = Math.max(markerSize, maxY - minY);
    }
  }

  getPoint(state, geometry) {
    var x = state.getCenterX();
    var y = state.getCenterY();

    if (state.segments != null && (geometry == null || geometry.relative)) {
      var gx = geometry != null ? geometry.x / 2 : 0;
      var pointCount = state.absolutePoints.length;
      var dist = Math.round((gx + 0.5) * state.length);
      var segment = state.segments[0];
      var length = 0;
      var index = 1;

      while (dist >= Math.round(length + segment) && index < pointCount - 1) {
        length += segment;
        segment = state.segments[index++];
      }

      var factor = segment == 0 ? 0 : (dist - length) / segment;
      var p0 = state.absolutePoints[index - 1];
      var pe = state.absolutePoints[index];

      if (p0 != null && pe != null) {
        var gy = 0;
        var offsetX = 0;
        var offsetY = 0;

        if (geometry != null) {
          gy = geometry.y;
          var offset = geometry.offset;

          if (offset != null) {
            offsetX = offset.x;
            offsetY = offset.y;
          }
        }

        var dx = pe.x - p0.x;
        var dy = pe.y - p0.y;
        var nx = segment == 0 ? 0 : dy / segment;
        var ny = segment == 0 ? 0 : dx / segment;
        x = p0.x + dx * factor + (nx * gy + offsetX) * this.scale;
        y = p0.y + dy * factor - (ny * gy - offsetY) * this.scale;
      }
    } else if (geometry != null) {
      var offset = geometry.offset;

      if (offset != null) {
        x += offset.x;
        y += offset.y;
      }
    }

    return new mxPoint(x, y);
  }

  getRelativePoint(edgeState, x, y) {
    var model = this.graph.getModel();
    var geometry = model.getGeometry(edgeState.cell);

    if (geometry != null) {
      var pointCount = edgeState.absolutePoints.length;

      if (geometry.relative && pointCount > 1) {
        var totalLength = edgeState.length;
        var segments = edgeState.segments;
        var p0 = edgeState.absolutePoints[0];
        var pe = edgeState.absolutePoints[1];
        var minDist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);
        var index = 0;
        var tmp = 0;
        var length = 0;

        for (var i = 2; i < pointCount; i++) {
          tmp += segments[i - 2];
          pe = edgeState.absolutePoints[i];
          var dist = mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y);

          if (dist <= minDist) {
            minDist = dist;
            index = i - 1;
            length = tmp;
          }

          p0 = pe;
        }

        var seg = segments[index];
        p0 = edgeState.absolutePoints[index];
        pe = edgeState.absolutePoints[index + 1];
        var x2 = p0.x;
        var y2 = p0.y;
        var x1 = pe.x;
        var y1 = pe.y;
        var px = x;
        var py = y;
        var xSegment = x2 - x1;
        var ySegment = y2 - y1;
        px -= x1;
        py -= y1;
        var projlenSq = 0;
        px = xSegment - px;
        py = ySegment - py;
        var dotprod = px * xSegment + py * ySegment;

        if (dotprod <= 0.0) {
          projlenSq = 0;
        } else {
          projlenSq = (dotprod * dotprod) / (xSegment * xSegment + ySegment * ySegment);
        }

        var projlen = Math.sqrt(projlenSq);

        if (projlen > seg) {
          projlen = seg;
        }

        var yDistance = Math.sqrt(mxUtils.ptSegDistSq(p0.x, p0.y, pe.x, pe.y, x, y));
        var direction = mxUtils.relativeCcw(p0.x, p0.y, pe.x, pe.y, x, y);

        if (direction == -1) {
          yDistance = -yDistance;
        }

        return new mxPoint(((totalLength / 2 - length - projlen) / totalLength) * -2, yDistance / this.scale);
      }
    }

    return new mxPoint();
  }

  updateEdgeLabelOffset(state) {
    var points = state.absolutePoints;
    state.absoluteOffset.x = state.getCenterX();
    state.absoluteOffset.y = state.getCenterY();

    if (points != null && points.length > 0 && state.segments != null) {
      var geometry = this.graph.getCellGeometry(state.cell);

      if (geometry.relative) {
        var offset = this.getPoint(state, geometry);

        if (offset != null) {
          state.absoluteOffset = offset;
        }
      } else {
        var p0 = points[0];
        var pe = points[points.length - 1];

        if (p0 != null && pe != null) {
          var dx = pe.x - p0.x;
          var dy = pe.y - p0.y;
          var x0 = 0;
          var y0 = 0;
          var off = geometry.offset;

          if (off != null) {
            x0 = off.x;
            y0 = off.y;
          }

          var x = p0.x + dx / 2 + x0 * this.scale;
          var y = p0.y + dy / 2 + y0 * this.scale;
          state.absoluteOffset.x = x;
          state.absoluteOffset.y = y;
        }
      }
    }
  }

  getState(cell, create) {
    create = create || false;
    var state = null;

    if (cell != null) {
      state = this.states.get(cell);

      if (create && (state == null || this.updateStyle) && this.graph.isCellVisible(cell)) {
        if (state == null) {
          state = this.createState(cell);
          this.states.put(cell, state);
        } else {
          state.style = this.graph.getCellStyle(cell);
        }
      }
    }

    return state;
  }

  isRendering() {
    return this.rendering;
  }

  setRendering(value) {
    this.rendering = value;
  }

  isAllowEval() {
    return this.allowEval;
  }

  setAllowEval(value) {
    this.allowEval = value;
  }

  getStates() {
    return this.states;
  }

  setStates(value) {
    this.states = value;
  }

  getCellStates(cells) {
    if (cells == null) {
      return this.states;
    } else {
      var result = [];

      for (var i = 0; i < cells.length; i++) {
        var state = this.getState(cells[i]);

        if (state != null) {
          result.push(state);
        }
      }

      return result;
    }
  }

  removeState(cell) {
    var state = null;

    if (cell != null) {
      state = this.states.remove(cell);

      if (state != null) {
        this.graph.cellRenderer.destroy(state);
        state.invalid = true;
        state.destroy();
      }
    }

    return state;
  }

  createState(cell) {
    return new mxCellState(this, cell, this.graph.getCellStyle(cell));
  }

  getCanvas() {
    return this.canvas;
  }

  getBackgroundPane() {
    return this.backgroundPane;
  }

  getDrawPane() {
    return this.drawPane;
  }

  getOverlayPane() {
    return this.overlayPane;
  }

  getDecoratorPane() {
    return this.decoratorPane;
  }

  isContainerEvent(evt) {
    var source = mxEvent.getSource(evt);
    return (
      source == this.graph.container ||
      source.parentNode == this.backgroundPane ||
      (source.parentNode != null && source.parentNode.parentNode == this.backgroundPane) ||
      source == this.canvas.parentNode ||
      source == this.canvas ||
      source == this.backgroundPane ||
      source == this.drawPane ||
      source == this.overlayPane ||
      source == this.decoratorPane
    );
  }

  isScrollEvent(evt) {
    var offset = mxUtils.getOffset(this.graph.container);
    var pt = new mxPoint(evt.clientX - offset.x, evt.clientY - offset.y);
    var outWidth = this.graph.container.offsetWidth;
    var inWidth = this.graph.container.clientWidth;

    if (outWidth > inWidth && pt.x > inWidth + 2 && pt.x <= outWidth) {
      return true;
    }

    var outHeight = this.graph.container.offsetHeight;
    var inHeight = this.graph.container.clientHeight;

    if (outHeight > inHeight && pt.y > inHeight + 2 && pt.y <= outHeight) {
      return true;
    }

    return false;
  }

  init() {
    this.installListeners();
    var graph = this.graph;

    if (graph.dialect == mxConstants.DIALECT_SVG) {
      this.createSvg();
    } else if (graph.dialect == mxConstants.DIALECT_VML) {
      this.createVml();
    } else {
      this.createHtml();
    }
  }

  installListeners() {
    var graph = this.graph;
    var container = graph.container;

    if (container != null) {
      if (mxClient.IS_TOUCH) {
        mxEvent.addListener(container, 'gesturestart', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
        mxEvent.addListener(container, 'gesturechange', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
        mxEvent.addListener(container, 'gestureend', (evt) => {
          graph.fireGestureEvent(evt);
          mxEvent.consume(evt);
        });
      }

      mxEvent.addGestureListeners(
        container,
        (evt) => {
          if (
            this.isContainerEvent(evt) &&
            ((!mxClient.IS_IE11 && !mxClient.IS_GC && !mxClient.IS_OP && !mxClient.IS_SF) || !this.isScrollEvent(evt))
          ) {
            graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt));
          }
        },
        (evt) => {
          if (this.isContainerEvent(evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt));
          }
        },
        (evt) => {
          if (this.isContainerEvent(evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
          }
        }
      );
      mxEvent.addListener(container, 'dblclick', (evt) => {
        if (this.isContainerEvent(evt)) {
          graph.dblClick(evt);
        }
      });

      var getState = function (evt) {
        var state = null;

        if (mxClient.IS_TOUCH) {
          var x = mxEvent.getClientX(evt);
          var y = mxEvent.getClientY(evt);
          var pt = mxUtils.convertPoint(container, x, y);
          state = graph.view.getState(graph.getCellAt(pt.x, pt.y));
        }

        return state;
      };

      graph.addMouseListener({
        mouseDown: function (sender, me) {
          graph.popupMenuHandler.hideMenu();
        },
        mouseMove: function () {},
        mouseUp: function () {}
      });

      this.moveHandler = (evt) => {
        if (graph.tooltipHandler != null && graph.tooltipHandler.isHideOnHover()) {
          graph.tooltipHandler.hide();
        }

        if (
          this.captureDocumentGesture &&
          graph.isMouseDown &&
          graph.container != null &&
          !this.isContainerEvent(evt) &&
          graph.container.style.display != 'none' &&
          graph.container.style.visibility != 'hidden' &&
          !mxEvent.isConsumed(evt)
        ) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
        }
      };

      this.endHandler = (evt) => {
        if (
          this.captureDocumentGesture &&
          graph.isMouseDown &&
          graph.container != null &&
          !this.isContainerEvent(evt) &&
          graph.container.style.display != 'none' &&
          graph.container.style.visibility != 'hidden'
        ) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt));
        }
      };

      mxEvent.addGestureListeners(document, null, this.moveHandler, this.endHandler);
    }
  }

  createHtml() {
    var container = this.graph.container;

    if (container != null) {
      this.canvas = this.createHtmlPane('100%', '100%');
      this.canvas.style.overflow = 'hidden';
      this.backgroundPane = this.createHtmlPane('1px', '1px');
      this.drawPane = this.createHtmlPane('1px', '1px');
      this.overlayPane = this.createHtmlPane('1px', '1px');
      this.decoratorPane = this.createHtmlPane('1px', '1px');
      this.canvas.appendChild(this.backgroundPane);
      this.canvas.appendChild(this.drawPane);
      this.canvas.appendChild(this.overlayPane);
      this.canvas.appendChild(this.decoratorPane);
      container.appendChild(this.canvas);
      this.updateContainerStyle(container);

      if (mxClient.IS_QUIRKS) {
        var onResize = (evt) => {
          var bounds = this.getGraphBounds();
          var width = bounds.x + bounds.width + this.graph.border;
          var height = bounds.y + bounds.height + this.graph.border;
          this.updateHtmlCanvasSize(width, height);
        };

        mxEvent.addListener(window, 'resize', onResize);
      }
    }
  }

  updateHtmlCanvasSize(width, height) {
    if (this.graph.container != null) {
      var ow = this.graph.container.offsetWidth;
      var oh = this.graph.container.offsetHeight;

      if (ow < width) {
        this.canvas.style.width = width + 'px';
      } else {
        this.canvas.style.width = '100%';
      }

      if (oh < height) {
        this.canvas.style.height = height + 'px';
      } else {
        this.canvas.style.height = '100%';
      }
    }
  }

  createHtmlPane(width, height) {
    var pane = document.createElement('DIV');

    if (width != null && height != null) {
      pane.style.position = 'absolute';
      pane.style.left = '0px';
      pane.style.top = '0px';
      pane.style.width = width;
      pane.style.height = height;
    } else {
      pane.style.position = 'relative';
    }

    return pane;
  }

  createVml() {
    var container = this.graph.container;

    if (container != null) {
      var width = container.offsetWidth;
      var height = container.offsetHeight;
      this.canvas = this.createVmlPane(width, height);
      this.canvas.style.overflow = 'hidden';
      this.backgroundPane = this.createVmlPane(width, height);
      this.drawPane = this.createVmlPane(width, height);
      this.overlayPane = this.createVmlPane(width, height);
      this.decoratorPane = this.createVmlPane(width, height);
      this.canvas.appendChild(this.backgroundPane);
      this.canvas.appendChild(this.drawPane);
      this.canvas.appendChild(this.overlayPane);
      this.canvas.appendChild(this.decoratorPane);
      container.appendChild(this.canvas);
    }
  }

  createVmlPane(width, height) {
    var pane = document.createElement(mxClient.VML_PREFIX + ':group');
    pane.style.position = 'absolute';
    pane.style.left = '0px';
    pane.style.top = '0px';
    pane.style.width = width + 'px';
    pane.style.height = height + 'px';
    pane.setAttribute('coordsize', width + ',' + height);
    pane.setAttribute('coordorigin', '0,0');
    return pane;
  }

  createSvg() {
    var container = this.graph.container;
    this.canvas = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.backgroundPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.backgroundPane);
    this.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.drawPane);
    this.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.overlayPane);
    this.decoratorPane = document.createElementNS(mxConstants.NS_SVG, 'g');
    this.canvas.appendChild(this.decoratorPane);
    var root = document.createElementNS(mxConstants.NS_SVG, 'svg');
    root.style.left = '0px';
    root.style.top = '0px';
    root.style.width = '100%';
    root.style.height = '100%';
    root.style.display = 'block';
    root.appendChild(this.canvas);

    if (mxClient.IS_IE11) {
      root.style.overflow = 'hidden';
    }

    if (container != null) {
      container.appendChild(root);
      this.updateContainerStyle(container);
    }
  }

  updateContainerStyle(container) {
    var style = mxUtils.getCurrentStyle(container);

    if (style != null && style.position == 'static') {
      container.style.position = 'relative';
    }

    if (mxClient.IS_POINTER) {
      container.style.touchAction = 'none';
    }
  }

  destroy() {
    var root = this.canvas != null ? this.canvas.ownerSVGElement : null;

    if (root == null) {
      root = this.canvas;
    }

    if (root != null && root.parentNode != null) {
      this.clear(this.currentRoot, true);
      mxEvent.removeGestureListeners(document, null, this.moveHandler, this.endHandler);
      mxEvent.release(this.graph.container);
      root.parentNode.removeChild(root);
      this.moveHandler = null;
      this.endHandler = null;
      this.canvas = null;
      this.backgroundPane = null;
      this.drawPane = null;
      this.overlayPane = null;
      this.decoratorPane = null;
    }
  }
}
