import { mxClient } from '@mxgraph/mxClient';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxCellHighlight {
  keepOnTop = false;
  graph = null;
  state = null;
  spacing = 2;
  resetHandler = null;

  constructor(graph, highlightColor, strokeWidth, dashed) {
    if (graph != null) {
      this.graph = graph;
      this.highlightColor = highlightColor != null ? highlightColor : mxConstants.DEFAULT_VALID_COLOR;
      this.strokeWidth = strokeWidth != null ? strokeWidth : mxConstants.HIGHLIGHT_STROKEWIDTH;
      this.dashed = dashed != null ? dashed : false;
      this.opacity = mxConstants.HIGHLIGHT_OPACITY;

      this.repaintHandler = () => {
        if (this.state != null) {
          var tmp = this.graph.view.getState(this.state.cell);

          if (tmp == null) {
            this.hide();
          } else {
            this.state = tmp;
            this.repaint();
          }
        }
      };

      this.graph.getView().addListener(mxEvent.SCALE, this.repaintHandler);
      this.graph.getView().addListener(mxEvent.TRANSLATE, this.repaintHandler);
      this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.repaintHandler);
      this.graph.getModel().addListener(mxEvent.CHANGE, this.repaintHandler);

      this.resetHandler = () => {
        this.hide();
      };

      this.graph.getView().addListener(mxEvent.DOWN, this.resetHandler);
      this.graph.getView().addListener(mxEvent.UP, this.resetHandler);
    }
  }

  setHighlightColor(color) {
    this.highlightColor = color;

    if (this.shape != null) {
      this.shape.stroke = color;
    }
  }

  drawHighlight() {
    this.shape = this.createShape();
    this.repaint();

    if (!this.keepOnTop && this.shape.node.parentNode.firstChild != this.shape.node) {
      this.shape.node.parentNode.insertBefore(this.shape.node, this.shape.node.parentNode.firstChild);
    }
  }

  createShape() {
    var shape = this.graph.cellRenderer.createShape(this.state);
    shape.svgStrokeTolerance = this.graph.tolerance;
    shape.points = this.state.absolutePoints;
    shape.apply(this.state);
    shape.stroke = this.highlightColor;
    shape.opacity = this.opacity;
    shape.isDashed = this.dashed;
    shape.isShadow = false;
    shape.dialect = this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    shape.init(this.graph.getView().getOverlayPane());
    mxEvent.redirectMouseEvents(shape.node, this.graph, this.state);

    if (this.graph.dialect != mxConstants.DIALECT_SVG) {
      shape.pointerEvents = false;
    } else {
      shape.svgPointerEvents = 'stroke';
    }

    return shape;
  }

  getStrokeWidth(state) {
    return this.strokeWidth;
  }

  repaint() {
    if (this.state != null && this.shape != null) {
      this.shape.scale = this.state.view.scale;

      if (this.graph.model.isEdge(this.state.cell)) {
        this.shape.strokewidth = this.getStrokeWidth();
        this.shape.points = this.state.absolutePoints;
        this.shape.outline = false;
      } else {
        this.shape.bounds = new mxRectangle(
          this.state.x - this.spacing,
          this.state.y - this.spacing,
          this.state.width + 2 * this.spacing,
          this.state.height + 2 * this.spacing
        );
        this.shape.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
        this.shape.strokewidth = this.getStrokeWidth() / this.state.view.scale;
        this.shape.outline = true;
      }

      if (this.state.shape != null) {
        this.shape.setCursor(this.state.shape.getCursor());
      }

      if (mxClient.IS_QUIRKS || document.documentMode == 8) {
        if (this.shape.stroke == 'transparent') {
          this.shape.stroke = 'white';
          this.shape.opacity = 1;
        } else {
          this.shape.opacity = this.opacity;
        }
      }

      this.shape.redraw();
    }
  }

  hide() {
    this.highlight(null);
  }

  highlight(state) {
    if (this.state != state) {
      if (this.shape != null) {
        this.shape.destroy();
        this.shape = null;
      }

      this.state = state;

      if (this.state != null) {
        this.drawHighlight();
      }
    }
  }

  isHighlightAt(x, y) {
    var hit = false;

    if (this.shape != null && document.elementFromPoint != null && !mxClient.IS_QUIRKS) {
      var elt = document.elementFromPoint(x, y);

      while (elt != null) {
        if (elt == this.shape.node) {
          hit = true;
          break;
        }

        elt = elt.parentNode;
      }
    }

    return hit;
  }

  destroy() {
    this.graph.getView().removeListener(this.resetHandler);
    this.graph.getView().removeListener(this.repaintHandler);
    this.graph.getModel().removeListener(this.repaintHandler);

    if (this.shape != null) {
      this.shape.destroy();
      this.shape = null;
    }
  }
}
