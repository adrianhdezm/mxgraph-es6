import { mxGraphLayout } from '@mxgraph/layout/mxGraphLayout';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';

export class mxParallelEdgeLayout extends mxGraphLayout {
  spacing = 20;

  constructor(graph) {
    super(graph);
  }

  execute(parent) {
    var lookup = this.findParallels(parent);
    this.graph.model.beginUpdate();

    try {
      for (var i in lookup) {
        var parallels = lookup[i];

        if (parallels.length > 1) {
          this.layout(parallels);
        }
      }
    } finally {
      this.graph.model.endUpdate();
    }
  }

  findParallels(parent) {
    var model = this.graph.getModel();
    var lookup = [];
    var childCount = model.getChildCount(parent);

    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(parent, i);

      if (!this.isEdgeIgnored(child)) {
        var id = this.getEdgeId(child);

        if (id != null) {
          if (lookup[id] == null) {
            lookup[id] = [];
          }

          lookup[id].push(child);
        }
      }
    }

    return lookup;
  }

  getEdgeId(edge) {
    var view = this.graph.getView();
    var src = view.getVisibleTerminal(edge, true);
    var trg = view.getVisibleTerminal(edge, false);

    if (src != null && trg != null) {
      src = mxObjectIdentity.get(src);
      trg = mxObjectIdentity.get(trg);
      return src > trg ? trg + '-' + src : src + '-' + trg;
    }

    return null;
  }

  layout(parallels) {
    var edge = parallels[0];
    var view = this.graph.getView();
    var model = this.graph.getModel();
    var src = model.getGeometry(view.getVisibleTerminal(edge, true));
    var trg = model.getGeometry(view.getVisibleTerminal(edge, false));

    if (src == trg) {
      var x0 = src.x + src.width + this.spacing;
      var y0 = src.y + src.height / 2;

      for (var i = 0; i < parallels.length; i++) {
        this.route(parallels[i], x0, y0);
        x0 += this.spacing;
      }
    } else if (src != null && trg != null) {
      var scx = src.x + src.width / 2;
      var scy = src.y + src.height / 2;
      var tcx = trg.x + trg.width / 2;
      var tcy = trg.y + trg.height / 2;
      var dx = tcx - scx;
      var dy = tcy - scy;
      var len = Math.sqrt(dx * dx + dy * dy);

      if (len > 0) {
        var x0 = scx + dx / 2;
        var y0 = scy + dy / 2;
        var nx = (dy * this.spacing) / len;
        var ny = (dx * this.spacing) / len;
        x0 += (nx * (parallels.length - 1)) / 2;
        y0 -= (ny * (parallels.length - 1)) / 2;

        for (var i = 0; i < parallels.length; i++) {
          this.route(parallels[i], x0, y0);
          x0 -= nx;
          y0 += ny;
        }
      }
    }
  }

  route(edge, x, y) {
    if (this.graph.isCellMovable(edge)) {
      this.setEdgePoints(edge, [new mxPoint(x, y)]);
    }
  }
}
