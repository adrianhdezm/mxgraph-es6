import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxImageShape } from '@mxgraph/shape/mxImageShape';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxPoint } from '@mxgraph/util/mxPoint';

export class mxHandle {
  ignoreGrid = false;

  constructor(state, cursor, image, shape) {
    this.graph = state.view.graph;
    this.state = state;
    this.cursor = cursor != null ? cursor : this.cursor;
    this.image = image != null ? image : this.image;
    this.shape = shape != null ? shape : null;
    this.init();
  }

  getPosition(bounds) {}

  setPosition(bounds, pt, me) {}

  execute(me) {}

  copyStyle(key) {
    this.graph.setCellStyles(key, this.state.style[key], [this.state.cell]);
  }

  processEvent(me) {
    var scale = this.graph.view.scale;
    var tr = this.graph.view.translate;
    var pt = new mxPoint(me.getGraphX() / scale - tr.x, me.getGraphY() / scale - tr.y);

    if (this.shape != null && this.shape.bounds != null) {
      pt.x -= this.shape.bounds.width / scale / 4;
      pt.y -= this.shape.bounds.height / scale / 4;
    }

    var alpha1 = -mxUtils.toRadians(this.getRotation());
    var alpha2 = -mxUtils.toRadians(this.getTotalRotation()) - alpha1;
    pt = this.flipPoint(
      this.rotatePoint(
        this.snapPoint(this.rotatePoint(pt, alpha1), this.ignoreGrid || !this.graph.isGridEnabledEvent(me.getEvent())),
        alpha2
      )
    );
    this.setPosition(this.state.getPaintBounds(), pt, me);
    this.redraw();
  }

  positionChanged() {
    if (this.state.text != null) {
      this.state.text.apply(this.state);
    }

    if (this.state.shape != null) {
      this.state.shape.apply(this.state);
    }

    this.graph.cellRenderer.redraw(this.state, true);
  }

  getRotation() {
    if (this.state.shape != null) {
      return this.state.shape.getRotation();
    }

    return 0;
  }

  getTotalRotation() {
    if (this.state.shape != null) {
      return this.state.shape.getShapeRotation();
    }

    return 0;
  }

  init() {
    var html = this.isHtmlRequired();

    if (this.image != null) {
      this.shape = new mxImageShape(new mxRectangle(0, 0, this.image.width, this.image.height), this.image.src);
      this.shape.preserveImageAspect = false;
    } else if (this.shape == null) {
      this.shape = this.createShape(html);
    }

    this.initShape(html);
  }

  createShape(html) {
    var bounds = new mxRectangle(0, 0, mxConstants.HANDLE_SIZE, mxConstants.HANDLE_SIZE);
    return new mxRectangleShape(bounds, mxConstants.HANDLE_FILLCOLOR, mxConstants.HANDLE_STROKECOLOR);
  }

  initShape(html) {
    if (html && this.shape.isHtmlAllowed()) {
      this.shape.dialect = mxConstants.DIALECT_STRICTHTML;
      this.shape.init(this.graph.container);
    } else {
      this.shape.dialect =
        this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;

      if (this.cursor != null) {
        this.shape.init(this.graph.getView().getOverlayPane());
      }
    }

    mxEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);
    this.shape.node.style.cursor = this.cursor;
  }

  redraw() {
    if (this.shape != null && this.state.shape != null) {
      var pt = this.getPosition(this.state.getPaintBounds());

      if (pt != null) {
        var alpha = mxUtils.toRadians(this.getTotalRotation());
        pt = this.rotatePoint(this.flipPoint(pt), alpha);
        var scale = this.graph.view.scale;
        var tr = this.graph.view.translate;
        this.shape.bounds.x = Math.floor((pt.x + tr.x) * scale - this.shape.bounds.width / 2);
        this.shape.bounds.y = Math.floor((pt.y + tr.y) * scale - this.shape.bounds.height / 2);
        this.shape.redraw();
      }
    }
  }

  isHtmlRequired() {
    return this.state.text != null && this.state.text.node.parentNode == this.graph.container;
  }

  rotatePoint(pt, alpha) {
    var bounds = this.state.getCellBounds();
    var cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    return mxUtils.getRotatedPoint(pt, cos, sin, cx);
  }

  flipPoint(pt) {
    if (this.state.shape != null) {
      var bounds = this.state.getCellBounds();

      if (this.state.shape.flipH) {
        pt.x = 2 * bounds.x + bounds.width - pt.x;
      }

      if (this.state.shape.flipV) {
        pt.y = 2 * bounds.y + bounds.height - pt.y;
      }
    }

    return pt;
  }

  snapPoint(pt, ignore) {
    if (!ignore) {
      pt.x = this.graph.snap(pt.x);
      pt.y = this.graph.snap(pt.y);
    }

    return pt;
  }

  setVisible(visible) {
    if (this.shape != null && this.shape.node != null) {
      this.shape.node.style.display = visible ? '' : 'none';
    }
  }

  reset() {
    this.setVisible(true);
    this.state.style = this.graph.getCellStyle(this.state.cell);
    this.positionChanged();
  }

  destroy() {
    if (this.shape != null) {
      this.shape.destroy();
      this.shape = null;
    }
  }
}
