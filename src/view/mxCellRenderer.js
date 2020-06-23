import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxClient } from '@mxgraph/mxClient';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxShape } from '@mxgraph/shape/mxShape';
import { mxStencilRegistry } from '@mxgraph/shape/mxStencilRegistry';
import { mxText } from '@mxgraph/shape/mxText';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxConnector } from '@mxgraph/shape/mxConnector';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxCellRenderer {
  static defaultShapes = new Object();
  defaultEdgeShape = mxConnector;
  defaultVertexShape = mxRectangleShape;
  defaultTextShape = mxText;
  legacyControlPosition = true;
  legacySpacing = true;
  antiAlias = true;
  minSvgStrokeWidth = 1;
  forceControlClickHandler = false;

  constructor() {}

  static registerShape(key, shape) {
    mxCellRenderer.defaultShapes[key] = shape;
  }

  initializeShape(state) {
    state.shape.dialect = state.view.graph.dialect;
    this.configureShape(state);
    state.shape.init(state.view.getDrawPane());
  }

  createShape(state) {
    var shape = null;

    if (state.style != null) {
      var stencil = mxStencilRegistry.getStencil(state.style[mxConstants.STYLE_SHAPE]);

      if (stencil != null) {
        shape = new mxShape(stencil);
      } else {
        var ctor = this.getShapeConstructor(state);
        shape = new ctor();
      }
    }

    return shape;
  }

  createIndicatorShape(state) {
    state.shape.indicatorShape = this.getShape(state.view.graph.getIndicatorShape(state));
  }

  getShape(name) {
    return name != null ? mxCellRenderer.defaultShapes[name] : null;
  }

  getShapeConstructor(state) {
    var ctor = this.getShape(state.style[mxConstants.STYLE_SHAPE]);

    if (ctor == null) {
      ctor = state.view.graph.getModel().isEdge(state.cell) ? this.defaultEdgeShape : this.defaultVertexShape;
    }

    return ctor;
  }

  configureShape(state) {
    state.shape.apply(state);
    state.shape.image = state.view.graph.getImage(state);
    state.shape.indicatorColor = state.view.graph.getIndicatorColor(state);
    state.shape.indicatorStrokeColor = state.style[mxConstants.STYLE_INDICATOR_STROKECOLOR];
    state.shape.indicatorGradientColor = state.view.graph.getIndicatorGradientColor(state);
    state.shape.indicatorDirection = state.style[mxConstants.STYLE_INDICATOR_DIRECTION];
    state.shape.indicatorImage = state.view.graph.getIndicatorImage(state);
    this.postConfigureShape(state);
  }

  postConfigureShape(state) {
    if (state.shape != null) {
      this.resolveColor(state, 'indicatorGradientColor', mxConstants.STYLE_GRADIENTCOLOR);
      this.resolveColor(state, 'indicatorColor', mxConstants.STYLE_FILLCOLOR);
      this.resolveColor(state, 'gradient', mxConstants.STYLE_GRADIENTCOLOR);
      this.resolveColor(state, 'stroke', mxConstants.STYLE_STROKECOLOR);
      this.resolveColor(state, 'fill', mxConstants.STYLE_FILLCOLOR);
    }
  }

  checkPlaceholderStyles(state) {
    if (state.style != null) {
      var values = ['inherit', 'swimlane', 'indicated'];
      var styles = [
        mxConstants.STYLE_FILLCOLOR,
        mxConstants.STYLE_STROKECOLOR,
        mxConstants.STYLE_GRADIENTCOLOR,
        mxConstants.STYLE_FONTCOLOR
      ];

      for (var i = 0; i < styles.length; i++) {
        if (mxUtils.indexOf(values, state.style[styles[i]]) >= 0) {
          return true;
        }
      }
    }

    return false;
  }

  resolveColor(state, field, key) {
    var shape = key == mxConstants.STYLE_FONTCOLOR ? state.text : state.shape;

    if (shape != null) {
      var graph = state.view.graph;
      var value = shape[field];
      var referenced = null;

      if (value == 'inherit') {
        referenced = graph.model.getParent(state.cell);
      } else if (value == 'swimlane') {
        shape[field] =
          key == mxConstants.STYLE_STROKECOLOR || key == mxConstants.STYLE_FONTCOLOR ? '#000000' : '#ffffff';

        if (graph.model.getTerminal(state.cell, false) != null) {
          referenced = graph.model.getTerminal(state.cell, false);
        } else {
          referenced = state.cell;
        }

        referenced = graph.getSwimlane(referenced);
        key = graph.swimlaneIndicatorColorAttribute;
      } else if (value == 'indicated' && state.shape != null) {
        shape[field] = state.shape.indicatorColor;
      }

      if (referenced != null) {
        var rstate = graph.getView().getState(referenced);
        shape[field] = null;

        if (rstate != null) {
          var rshape = key == mxConstants.STYLE_FONTCOLOR ? rstate.text : rstate.shape;

          if (rshape != null && field != 'indicatorColor') {
            shape[field] = rshape[field];
          } else {
            shape[field] = rstate.style[key];
          }
        }
      }
    }
  }

  getLabelValue(state) {
    return state.view.graph.getLabel(state.cell);
  }

  createLabel(state, value) {
    var graph = state.view.graph;
    var isEdge = graph.getModel().isEdge(state.cell);

    if (state.style[mxConstants.STYLE_FONTSIZE] > 0 || state.style[mxConstants.STYLE_FONTSIZE] == null) {
      var isForceHtml = graph.isHtmlLabel(state.cell) || (value != null && mxUtils.isNode(value));
      state.text = new this.defaultTextShape(
        value,
        new mxRectangle(),
        state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER,
        graph.getVerticalAlign(state),
        state.style[mxConstants.STYLE_FONTCOLOR],
        state.style[mxConstants.STYLE_FONTFAMILY],
        state.style[mxConstants.STYLE_FONTSIZE],
        state.style[mxConstants.STYLE_FONTSTYLE],
        state.style[mxConstants.STYLE_SPACING],
        state.style[mxConstants.STYLE_SPACING_TOP],
        state.style[mxConstants.STYLE_SPACING_RIGHT],
        state.style[mxConstants.STYLE_SPACING_BOTTOM],
        state.style[mxConstants.STYLE_SPACING_LEFT],
        state.style[mxConstants.STYLE_HORIZONTAL],
        state.style[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR],
        state.style[mxConstants.STYLE_LABEL_BORDERCOLOR],
        graph.isWrapping(state.cell) && graph.isHtmlLabel(state.cell),
        graph.isLabelClipped(state.cell),
        state.style[mxConstants.STYLE_OVERFLOW],
        state.style[mxConstants.STYLE_LABEL_PADDING],
        mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION)
      );
      state.text.opacity = mxUtils.getValue(state.style, mxConstants.STYLE_TEXT_OPACITY, 100);
      state.text.dialect = isForceHtml ? mxConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
      state.text.style = state.style;
      state.text.state = state;
      this.initializeLabel(state, state.text);
      var forceGetCell = false;

      var getState = function (evt) {
        var result = state;

        if (mxClient.IS_TOUCH || forceGetCell) {
          var x = mxEvent.getClientX(evt);
          var y = mxEvent.getClientY(evt);
          var pt = mxUtils.convertPoint(graph.container, x, y);
          result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
        }

        return result;
      };

      mxEvent.addGestureListeners(
        state.text.node,
        (evt) => {
          if (this.isLabelEvent(state, evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
            forceGetCell = graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG';
          }
        },
        (evt) => {
          if (this.isLabelEvent(state, evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
          }
        },
        (evt) => {
          if (this.isLabelEvent(state, evt)) {
            graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
            forceGetCell = false;
          }
        }
      );

      if (graph.nativeDblClickEnabled) {
        mxEvent.addListener(state.text.node, 'dblclick', (evt) => {
          if (this.isLabelEvent(state, evt)) {
            graph.dblClick(evt, state.cell);
            mxEvent.consume(evt);
          }
        });
      }
    }
  }

  initializeLabel(state, shape) {
    if (mxClient.IS_SVG && mxClient.NO_FO && shape.dialect != mxConstants.DIALECT_SVG) {
      shape.init(state.view.graph.container);
    } else {
      shape.init(state.view.getDrawPane());
    }
  }

  createCellOverlays(state) {
    var graph = state.view.graph;
    var overlays = graph.getCellOverlays(state.cell);
    var dict = null;

    if (overlays != null) {
      dict = new mxDictionary();

      for (var i = 0; i < overlays.length; i++) {
        var shape = state.overlays != null ? state.overlays.remove(overlays[i]) : null;

        if (shape == null) {
          var tmp = new mxImageShape(new mxRectangle(), overlays[i].image.src);
          tmp.dialect = state.view.graph.dialect;
          tmp.preserveImageAspect = false;
          tmp.overlay = overlays[i];
          this.initializeOverlay(state, tmp);
          this.installCellOverlayListeners(state, overlays[i], tmp);

          if (overlays[i].cursor != null) {
            tmp.node.style.cursor = overlays[i].cursor;
          }

          dict.put(overlays[i], tmp);
        } else {
          dict.put(overlays[i], shape);
        }
      }
    }

    if (state.overlays != null) {
      state.overlays.visit(function (id, shape) {
        shape.destroy();
      });
    }

    state.overlays = dict;
  }

  initializeOverlay(state, overlay) {
    overlay.init(state.view.getOverlayPane());
  }

  installCellOverlayListeners(state, overlay, shape) {
    var graph = state.view.graph;
    mxEvent.addListener(shape.node, 'click', function (evt) {
      if (graph.isEditing()) {
        graph.stopEditing(!graph.isInvokesStopCellEditing());
      }

      overlay.fireEvent(new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', state.cell));
    });
    mxEvent.addGestureListeners(
      shape.node,
      function (evt) {
        mxEvent.consume(evt);
      },
      function (evt) {
        graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, state));
      }
    );

    if (mxClient.IS_TOUCH) {
      mxEvent.addListener(shape.node, 'touchend', function (evt) {
        overlay.fireEvent(new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', state.cell));
      });
    }
  }

  createControl(state) {
    var graph = state.view.graph;
    var image = graph.getFoldingImage(state);

    if (graph.foldingEnabled && image != null) {
      if (state.control == null) {
        var b = new mxRectangle(0, 0, image.width, image.height);
        state.control = new mxImageShape(b, image.src);
        state.control.preserveImageAspect = false;
        state.control.dialect = graph.dialect;
        this.initControl(state, state.control, true, this.createControlClickHandler(state));
      }
    } else if (state.control != null) {
      state.control.destroy();
      state.control = null;
    }
  }

  createControlClickHandler(state) {
    var graph = state.view.graph;
    return (evt) => {
      if (this.forceControlClickHandler || graph.isEnabled()) {
        var collapse = !graph.isCellCollapsed(state.cell);
        graph.foldCells(collapse, false, [state.cell], null, evt);
        mxEvent.consume(evt);
      }
    };
  }

  initControl(state, control, handleEvents, clickHandler) {
    var graph = state.view.graph;
    var isForceHtml = graph.isHtmlLabel(state.cell) && mxClient.NO_FO && graph.dialect == mxConstants.DIALECT_SVG;

    if (isForceHtml) {
      control.dialect = mxConstants.DIALECT_PREFERHTML;
      control.init(graph.container);
      control.node.style.zIndex = 1;
    } else {
      control.init(state.view.getOverlayPane());
    }

    var node = control.innerNode || control.node;

    if (clickHandler != null && !mxClient.IS_IOS) {
      if (graph.isEnabled()) {
        node.style.cursor = 'pointer';
      }

      mxEvent.addListener(node, 'click', clickHandler);
    }

    if (handleEvents) {
      var first = null;
      mxEvent.addGestureListeners(
        node,
        function (evt) {
          first = new mxPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt));
          graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
          mxEvent.consume(evt);
        },
        function (evt) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, state));
        },
        function (evt) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, state));
          mxEvent.consume(evt);
        }
      );

      if (clickHandler != null && mxClient.IS_IOS) {
        node.addEventListener(
          'touchend',
          function (evt) {
            if (first != null) {
              var tol = graph.tolerance;

              if (
                Math.abs(first.x - mxEvent.getClientX(evt)) < tol &&
                Math.abs(first.y - mxEvent.getClientY(evt)) < tol
              ) {
                clickHandler.call(clickHandler, evt);
                mxEvent.consume(evt);
              }
            }
          },
          true
        );
      }
    }

    return node;
  }

  isShapeEvent(state, evt) {
    return true;
  }

  isLabelEvent(state, evt) {
    return true;
  }

  installListeners(state) {
    var graph = state.view.graph;

    var getState = function (evt) {
      var result = state;

      if ((graph.dialect != mxConstants.DIALECT_SVG && mxEvent.getSource(evt).nodeName == 'IMG') || mxClient.IS_TOUCH) {
        var x = mxEvent.getClientX(evt);
        var y = mxEvent.getClientY(evt);
        var pt = mxUtils.convertPoint(graph.container, x, y);
        result = graph.view.getState(graph.getCellAt(pt.x, pt.y));
      }

      return result;
    };

    mxEvent.addGestureListeners(
      state.shape.node,
      (evt) => {
        if (this.isShapeEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, state));
        }
      },
      (evt) => {
        if (this.isShapeEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
        }
      },
      (evt) => {
        if (this.isShapeEvent(state, evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
        }
      }
    );

    if (graph.nativeDblClickEnabled) {
      mxEvent.addListener(state.shape.node, 'dblclick', (evt) => {
        if (this.isShapeEvent(state, evt)) {
          graph.dblClick(evt, state.cell);
          mxEvent.consume(evt);
        }
      });
    }
  }

  redrawLabel(state, forced) {
    var graph = state.view.graph;
    var value = this.getLabelValue(state);
    var wrapping = graph.isWrapping(state.cell);
    var clipping = graph.isLabelClipped(state.cell);
    var isForceHtml = state.view.graph.isHtmlLabel(state.cell) || (value != null && mxUtils.isNode(value));
    var dialect = isForceHtml ? mxConstants.DIALECT_STRICTHTML : state.view.graph.dialect;
    var overflow = state.style[mxConstants.STYLE_OVERFLOW] || 'visible';

    if (
      state.text != null &&
      (state.text.wrap != wrapping ||
        state.text.clipped != clipping ||
        state.text.overflow != overflow ||
        state.text.dialect != dialect)
    ) {
      state.text.destroy();
      state.text = null;
    }

    if (state.text == null && value != null && (mxUtils.isNode(value) || value.length > 0)) {
      this.createLabel(state, value);
    } else if (state.text != null && (value == null || value.length == 0)) {
      state.text.destroy();
      state.text = null;
    }

    if (state.text != null) {
      if (forced) {
        if (state.text.lastValue != null && this.isTextShapeInvalid(state, state.text)) {
          state.text.lastValue = null;
        }

        state.text.resetStyles();
        state.text.apply(state);
        state.text.valign = graph.getVerticalAlign(state);
      }

      var bounds = this.getLabelBounds(state);
      var nextScale = this.getTextScale(state);
      this.resolveColor(state, 'color', mxConstants.STYLE_FONTCOLOR);

      if (
        forced ||
        state.text.value != value ||
        state.text.isWrapping != wrapping ||
        state.text.overflow != overflow ||
        state.text.isClipping != clipping ||
        state.text.scale != nextScale ||
        state.text.dialect != dialect ||
        state.text.bounds == null ||
        !state.text.bounds.equals(bounds)
      ) {
        state.text.dialect = dialect;
        state.text.value = value;
        state.text.bounds = bounds;
        state.text.scale = nextScale;
        state.text.wrap = wrapping;
        state.text.clipped = clipping;
        state.text.overflow = overflow;
        var vis = state.text.node.style.visibility;
        this.redrawLabelShape(state.text);
        state.text.node.style.visibility = vis;
      }
    }
  }

  isTextShapeInvalid(state, shape) {
    function check(property, stylename, defaultValue) {
      var result = false;

      if (
        stylename == 'spacingTop' ||
        stylename == 'spacingRight' ||
        stylename == 'spacingBottom' ||
        stylename == 'spacingLeft'
      ) {
        result = parseFloat(shape[property]) - parseFloat(shape.spacing) != (state.style[stylename] || defaultValue);
      } else {
        result = shape[property] != (state.style[stylename] || defaultValue);
      }

      return result;
    }

    return (
      check('fontStyle', mxConstants.STYLE_FONTSTYLE, mxConstants.DEFAULT_FONTSTYLE) ||
      check('family', mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY) ||
      check('size', mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE) ||
      check('color', mxConstants.STYLE_FONTCOLOR, 'black') ||
      check('align', mxConstants.STYLE_ALIGN, '') ||
      check('valign', mxConstants.STYLE_VERTICAL_ALIGN, '') ||
      check('spacing', mxConstants.STYLE_SPACING, 2) ||
      check('spacingTop', mxConstants.STYLE_SPACING_TOP, 0) ||
      check('spacingRight', mxConstants.STYLE_SPACING_RIGHT, 0) ||
      check('spacingBottom', mxConstants.STYLE_SPACING_BOTTOM, 0) ||
      check('spacingLeft', mxConstants.STYLE_SPACING_LEFT, 0) ||
      check('horizontal', mxConstants.STYLE_HORIZONTAL, true) ||
      check('background', mxConstants.STYLE_LABEL_BACKGROUNDCOLOR) ||
      check('border', mxConstants.STYLE_LABEL_BORDERCOLOR) ||
      check('opacity', mxConstants.STYLE_TEXT_OPACITY, 100) ||
      check('textDirection', mxConstants.STYLE_TEXT_DIRECTION, mxConstants.DEFAULT_TEXT_DIRECTION)
    );
  }

  redrawLabelShape(shape) {
    shape.redraw();
  }

  getTextScale(state) {
    return state.view.scale;
  }

  getLabelBounds(state) {
    var graph = state.view.graph;
    var scale = state.view.scale;
    var isEdge = graph.getModel().isEdge(state.cell);
    var bounds = new mxRectangle(state.absoluteOffset.x, state.absoluteOffset.y);

    if (isEdge) {
      var spacing = state.text.getSpacing();
      bounds.x += spacing.x * scale;
      bounds.y += spacing.y * scale;
      var geo = graph.getCellGeometry(state.cell);

      if (geo != null) {
        bounds.width = Math.max(0, geo.width * scale);
        bounds.height = Math.max(0, geo.height * scale);
      }
    } else {
      if (state.text.isPaintBoundsInverted()) {
        var tmp = bounds.x;
        bounds.x = bounds.y;
        bounds.y = tmp;
      }

      bounds.x += state.x;
      bounds.y += state.y;
      bounds.width = Math.max(1, state.width);
      bounds.height = Math.max(1, state.height);
    }

    if (state.text.isPaintBoundsInverted()) {
      var t = (state.width - state.height) / 2;
      bounds.x += t;
      bounds.y -= t;
      var tmp = bounds.width;
      bounds.width = bounds.height;
      bounds.height = tmp;
    }

    if (state.shape != null) {
      var hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      var vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);

      if (hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE) {
        bounds = state.shape.getLabelBounds(bounds);
      }
    }

    var lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);

    if (lw != null) {
      bounds.width = parseFloat(lw) * scale;
    }

    if (!isEdge) {
      this.rotateLabelBounds(state, bounds);
    }

    return bounds;
  }

  rotateLabelBounds(state, bounds) {
    bounds.y -= state.text.margin.y * bounds.height;
    bounds.x -= state.text.margin.x * bounds.width;

    if (
      !this.legacySpacing ||
      (state.style[mxConstants.STYLE_OVERFLOW] != 'fill' && state.style[mxConstants.STYLE_OVERFLOW] != 'width')
    ) {
      var s = state.view.scale;
      var spacing = state.text.getSpacing();
      bounds.x += spacing.x * s;
      bounds.y += spacing.y * s;
      var hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      var vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
      var lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
      bounds.width = Math.max(
        0,
        bounds.width -
          (hpos == mxConstants.ALIGN_CENTER && lw == null
            ? state.text.spacingLeft * s + state.text.spacingRight * s
            : 0)
      );
      bounds.height = Math.max(
        0,
        bounds.height -
          (vpos == mxConstants.ALIGN_MIDDLE ? state.text.spacingTop * s + state.text.spacingBottom * s : 0)
      );
    }

    var theta = state.text.getTextRotation();

    if (theta != 0 && state != null && state.view.graph.model.isVertex(state.cell)) {
      var cx = state.getCenterX();
      var cy = state.getCenterY();

      if (bounds.x != cx || bounds.y != cy) {
        var rad = theta * (Math.PI / 180);
        var pt = mxUtils.getRotatedPoint(
          new mxPoint(bounds.x, bounds.y),
          Math.cos(rad),
          Math.sin(rad),
          new mxPoint(cx, cy)
        );
        bounds.x = pt.x;
        bounds.y = pt.y;
      }
    }
  }

  redrawCellOverlays(state, forced) {
    this.createCellOverlays(state);

    if (state.overlays != null) {
      var rot = mxUtils.mod(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0), 90);
      var rad = mxUtils.toRadians(rot);
      var cos = Math.cos(rad);
      var sin = Math.sin(rad);
      state.overlays.visit(function (id, shape) {
        var bounds = shape.overlay.getBounds(state);

        if (!state.view.graph.getModel().isEdge(state.cell)) {
          if (state.shape != null && rot != 0) {
            var cx = bounds.getCenterX();
            var cy = bounds.getCenterY();
            var point = mxUtils.getRotatedPoint(
              new mxPoint(cx, cy),
              cos,
              sin,
              new mxPoint(state.getCenterX(), state.getCenterY())
            );
            cx = point.x;
            cy = point.y;
            bounds.x = Math.round(cx - bounds.width / 2);
            bounds.y = Math.round(cy - bounds.height / 2);
          }
        }

        if (forced || shape.bounds == null || shape.scale != state.view.scale || !shape.bounds.equals(bounds)) {
          shape.bounds = bounds;
          shape.scale = state.view.scale;
          shape.redraw();
        }
      });
    }
  }

  redrawControl(state, forced) {
    var image = state.view.graph.getFoldingImage(state);

    if (state.control != null && image != null) {
      var bounds = this.getControlBounds(state, image.width, image.height);
      var r = this.legacyControlPosition
        ? mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0)
        : state.shape.getTextRotation();
      var s = state.view.scale;

      if (forced || state.control.scale != s || !state.control.bounds.equals(bounds) || state.control.rotation != r) {
        state.control.rotation = r;
        state.control.bounds = bounds;
        state.control.scale = s;
        state.control.redraw();
      }
    }
  }

  getControlBounds(state, w, h) {
    if (state.control != null) {
      var s = state.view.scale;
      var cx = state.getCenterX();
      var cy = state.getCenterY();

      if (!state.view.graph.getModel().isEdge(state.cell)) {
        cx = state.x + w * s;
        cy = state.y + h * s;

        if (state.shape != null) {
          var rot = state.shape.getShapeRotation();

          if (this.legacyControlPosition) {
            rot = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION, 0);
          } else {
            if (state.shape.isPaintBoundsInverted()) {
              var t = (state.width - state.height) / 2;
              cx += t;
              cy -= t;
            }
          }

          if (rot != 0) {
            var rad = mxUtils.toRadians(rot);
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);
            var point = mxUtils.getRotatedPoint(
              new mxPoint(cx, cy),
              cos,
              sin,
              new mxPoint(state.getCenterX(), state.getCenterY())
            );
            cx = point.x;
            cy = point.y;
          }
        }
      }

      return state.view.graph.getModel().isEdge(state.cell)
        ? new mxRectangle(
            Math.round(cx - (w / 2) * s),
            Math.round(cy - (h / 2) * s),
            Math.round(w * s),
            Math.round(h * s)
          )
        : new mxRectangle(
            Math.round(cx - (w / 2) * s),
            Math.round(cy - (h / 2) * s),
            Math.round(w * s),
            Math.round(h * s)
          );
    }

    return null;
  }

  insertStateAfter(state, node, htmlNode) {
    var shapes = this.getShapesForState(state);

    for (var i = 0; i < shapes.length; i++) {
      if (shapes[i] != null && shapes[i].node != null) {
        var html =
          shapes[i].node.parentNode != state.view.getDrawPane() &&
          shapes[i].node.parentNode != state.view.getOverlayPane();
        var temp = html ? htmlNode : node;

        if (temp != null && temp.nextSibling != shapes[i].node) {
          if (temp.nextSibling == null) {
            temp.parentNode.appendChild(shapes[i].node);
          } else {
            temp.parentNode.insertBefore(shapes[i].node, temp.nextSibling);
          }
        } else if (temp == null) {
          if (shapes[i].node.parentNode == state.view.graph.container) {
            var canvas = state.view.canvas;

            while (canvas != null && canvas.parentNode != state.view.graph.container) {
              canvas = canvas.parentNode;
            }

            if (canvas != null && canvas.nextSibling != null) {
              if (canvas.nextSibling != shapes[i].node) {
                shapes[i].node.parentNode.insertBefore(shapes[i].node, canvas.nextSibling);
              }
            } else {
              shapes[i].node.parentNode.appendChild(shapes[i].node);
            }
          } else if (
            shapes[i].node.parentNode != null &&
            shapes[i].node.parentNode.firstChild != null &&
            shapes[i].node.parentNode.firstChild != shapes[i].node
          ) {
            shapes[i].node.parentNode.insertBefore(shapes[i].node, shapes[i].node.parentNode.firstChild);
          }
        }

        if (html) {
          htmlNode = shapes[i].node;
        } else {
          node = shapes[i].node;
        }
      }
    }

    return [node, htmlNode];
  }

  getShapesForState(state) {
    return [state.shape, state.text, state.control];
  }

  redraw(state, force, rendering) {
    var shapeChanged = this.redrawShape(state, force, rendering);

    if (state.shape != null && (rendering == null || rendering)) {
      this.redrawLabel(state, shapeChanged);
      this.redrawCellOverlays(state, shapeChanged);
      this.redrawControl(state, shapeChanged);
    }
  }

  redrawShape(state, force, rendering) {
    var model = state.view.graph.model;
    var shapeChanged = false;

    if (
      state.shape != null &&
      state.shape.style != null &&
      state.style != null &&
      state.shape.style[mxConstants.STYLE_SHAPE] != state.style[mxConstants.STYLE_SHAPE]
    ) {
      state.shape.destroy();
      state.shape = null;
    }

    if (
      state.shape == null &&
      state.view.graph.container != null &&
      state.cell != state.view.currentRoot &&
      (model.isVertex(state.cell) || model.isEdge(state.cell))
    ) {
      state.shape = this.createShape(state);

      if (state.shape != null) {
        state.shape.minSvgStrokeWidth = this.minSvgStrokeWidth;
        state.shape.antiAlias = this.antiAlias;
        this.createIndicatorShape(state);
        this.initializeShape(state);
        this.createCellOverlays(state);
        this.installListeners(state);
        state.view.graph.selectionCellsHandler.updateHandler(state);
      }
    } else if (
      !force &&
      state.shape != null &&
      (!mxUtils.equalEntries(state.shape.style, state.style) || this.checkPlaceholderStyles(state))
    ) {
      state.shape.resetStyles();
      this.configureShape(state);
      state.view.graph.selectionCellsHandler.updateHandler(state);
      force = true;
    }

    if (state.shape != null && state.shape.indicatorShape != this.getShape(state.view.graph.getIndicatorShape(state))) {
      if (state.shape.indicator != null) {
        state.shape.indicator.destroy();
        state.shape.indicator = null;
      }

      this.createIndicatorShape(state);

      if (state.shape.indicatorShape != null) {
        state.shape.indicator = new state.shape.indicatorShape();
        state.shape.indicator.dialect = state.shape.dialect;
        state.shape.indicator.init(state.node);
        force = true;
      }
    }

    if (state.shape != null) {
      this.createControl(state);

      if (force || this.isShapeInvalid(state, state.shape)) {
        if (state.absolutePoints != null) {
          state.shape.points = state.absolutePoints.slice();
          state.shape.bounds = null;
        } else {
          state.shape.points = null;
          state.shape.bounds = new mxRectangle(state.x, state.y, state.width, state.height);
        }

        state.shape.scale = state.view.scale;

        if (rendering == null || rendering) {
          this.doRedrawShape(state);
        } else {
          state.shape.updateBoundingBox();
        }

        shapeChanged = true;
      }
    }

    return shapeChanged;
  }

  doRedrawShape(state) {
    state.shape.redraw();
  }

  isShapeInvalid(state, shape) {
    return (
      shape.bounds == null ||
      shape.scale != state.view.scale ||
      (state.absolutePoints == null && !shape.bounds.equals(state)) ||
      (state.absolutePoints != null && !mxUtils.equalPoints(shape.points, state.absolutePoints))
    );
  }

  destroy(state) {
    if (state.shape != null) {
      if (state.text != null) {
        state.text.destroy();
        state.text = null;
      }

      if (state.overlays != null) {
        state.overlays.visit(function (id, shape) {
          shape.destroy();
        });
        state.overlays = null;
      }

      if (state.control != null) {
        state.control.destroy();
        state.control = null;
      }

      state.shape.destroy();
      state.shape = null;
    }
  }
}
