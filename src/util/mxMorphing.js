import { mxAnimation } from '@mxgraph/util/mxAnimation';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxCellStatePreview } from '@mxgraph/view/mxCellStatePreview';

export class mxMorphing extends mxAnimation {
  step = 0;
  cells = null;

  constructor(graph, steps, ease, delay) {
    super(delay);
    this.graph = graph;
    this.steps = steps != null ? steps : 6;
    this.ease = ease != null ? ease : 1.5;
  }

  updateAnimation() {
    super.updateAnimation();
    var move = new mxCellStatePreview(this.graph);

    if (this.cells != null) {
      for (var i = 0; i < this.cells.length; i++) {
        this.animateCell(this.cells[i], move, false);
      }
    } else {
      this.animateCell(this.graph.getModel().getRoot(), move, true);
    }

    this.show(move);

    if (move.isEmpty() || this.step++ >= this.steps) {
      this.stopAnimation();
    }
  }

  show(move) {
    move.show();
  }

  animateCell(cell, move, recurse) {
    var state = this.graph.getView().getState(cell);
    var delta = null;

    if (state != null) {
      delta = this.getDelta(state);

      if (this.graph.getModel().isVertex(cell) && (delta.x != 0 || delta.y != 0)) {
        var translate = this.graph.view.getTranslate();
        var scale = this.graph.view.getScale();
        delta.x += translate.x * scale;
        delta.y += translate.y * scale;
        move.moveState(state, -delta.x / this.ease, -delta.y / this.ease);
      }
    }

    if (recurse && !this.stopRecursion(state, delta)) {
      var childCount = this.graph.getModel().getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        this.animateCell(this.graph.getModel().getChildAt(cell, i), move, recurse);
      }
    }
  }

  stopRecursion(state, delta) {
    return delta != null && (delta.x != 0 || delta.y != 0);
  }

  getDelta(state) {
    var origin = this.getOriginForCell(state.cell);
    var translate = this.graph.getView().getTranslate();
    var scale = this.graph.getView().getScale();
    var x = state.x / scale - translate.x;
    var y = state.y / scale - translate.y;
    return new mxPoint((origin.x - x) * scale, (origin.y - y) * scale);
  }

  getOriginForCell(cell) {
    var result = null;

    if (cell != null) {
      var parent = this.graph.getModel().getParent(cell);
      var geo = this.graph.getCellGeometry(cell);
      result = this.getOriginForCell(parent);

      if (geo != null) {
        if (geo.relative) {
          var pgeo = this.graph.getCellGeometry(parent);

          if (pgeo != null) {
            result.x += geo.x * pgeo.width;
            result.y += geo.y * pgeo.height;
          }
        } else {
          result.x += geo.x;
          result.y += geo.y;
        }
      }
    }

    if (result == null) {
      var t = this.graph.view.getTranslate();
      result = new mxPoint(-t.x, -t.y);
    }

    return result;
  }
}
