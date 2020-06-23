import { mxEdgeHandler } from '@mxgraph/handler/mxEdgeHandler';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxEdgeStyle } from '@mxgraph/view/mxEdgeStyle';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxClient } from '@mxgraph/mxClient';

export class mxElbowEdgeHandler extends mxEdgeHandler {
  flipEnabled = true;
  doubleClickOrientationResource = mxClient.language != 'none' ? 'doubleClickOrientation' : '';

  constructor(state) {
    super(state);
  }

  createBends() {
    var bends = [];
    var bend = this.createHandleShape(0);
    this.initBend(bend);
    bend.setCursor(mxConstants.CURSOR_TERMINAL_HANDLE);
    bends.push(bend);
    bends.push(
      this.createVirtualBend((evt) => {
        if (!mxEvent.isConsumed(evt) && this.flipEnabled) {
          this.graph.flipEdge(this.state.cell, evt);
          mxEvent.consume(evt);
        }
      })
    );
    this.points.push(new mxPoint(0, 0));
    bend = this.createHandleShape(2);
    this.initBend(bend);
    bend.setCursor(mxConstants.CURSOR_TERMINAL_HANDLE);
    bends.push(bend);
    return bends;
  }

  createVirtualBend(dblClickHandler) {
    var bend = this.createHandleShape();
    this.initBend(bend, dblClickHandler);
    bend.setCursor(this.getCursorForBend());

    if (!this.graph.isCellBendable(this.state.cell)) {
      bend.node.style.display = 'none';
    }

    return bend;
  }

  getCursorForBend() {
    return this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.TopToBottom ||
      this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_TOPTOBOTTOM ||
      ((this.state.style[mxConstants.STYLE_EDGE] == mxEdgeStyle.ElbowConnector ||
        this.state.style[mxConstants.STYLE_EDGE] == mxConstants.EDGESTYLE_ELBOW) &&
        this.state.style[mxConstants.STYLE_ELBOW] == mxConstants.ELBOW_VERTICAL)
      ? 'row-resize'
      : 'col-resize';
  }

  getTooltipForNode(node) {
    var tip = null;

    if (
      this.bends != null &&
      this.bends[1] != null &&
      (node == this.bends[1].node || node.parentNode == this.bends[1].node)
    ) {
      tip = this.doubleClickOrientationResource;
      tip = mxResources.get(tip) || tip;
    }

    return tip;
  }

  convertPoint(point, gridEnabled) {
    var scale = this.graph.getView().getScale();
    var tr = this.graph.getView().getTranslate();
    var origin = this.state.origin;

    if (gridEnabled) {
      point.x = this.graph.snap(point.x);
      point.y = this.graph.snap(point.y);
    }

    point.x = Math.round(point.x / scale - tr.x - origin.x);
    point.y = Math.round(point.y / scale - tr.y - origin.y);
    return point;
  }

  redrawInnerBends(p0, pe) {
    var g = this.graph.getModel().getGeometry(this.state.cell);
    var pts = this.state.absolutePoints;
    var pt = null;

    if (pts.length > 1) {
      p0 = pts[1];
      pe = pts[pts.length - 2];
    } else if (g.points != null && g.points.length > 0) {
      pt = pts[0];
    }

    if (pt == null) {
      pt = new mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
    } else {
      pt = new mxPoint(
        this.graph.getView().scale * (pt.x + this.graph.getView().translate.x + this.state.origin.x),
        this.graph.getView().scale * (pt.y + this.graph.getView().translate.y + this.state.origin.y)
      );
    }

    var b = this.bends[1].bounds;
    var w = b.width;
    var h = b.height;
    var bounds = new mxRectangle(Math.round(pt.x - w / 2), Math.round(pt.y - h / 2), w, h);

    if (this.manageLabelHandle) {
      this.checkLabelHandle(bounds);
    } else if (
      this.handleImage == null &&
      this.labelShape.visible &&
      mxUtils.intersects(bounds, this.labelShape.bounds)
    ) {
      w = mxConstants.HANDLE_SIZE + 3;
      h = mxConstants.HANDLE_SIZE + 3;
      bounds = new mxRectangle(Math.floor(pt.x - w / 2), Math.floor(pt.y - h / 2), w, h);
    }

    this.bends[1].bounds = bounds;
    this.bends[1].redraw();

    if (this.manageLabelHandle) {
      this.checkLabelHandle(this.bends[1].bounds);
    }
  }
}
