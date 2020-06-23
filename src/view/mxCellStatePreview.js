import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxDictionary } from '@mxgraph/util/mxDictionary';

export class mxCellStatePreview {
  count = 0;

  constructor(graph) {
    this.deltas = new mxDictionary();
    this.graph = graph;
  }

  isEmpty() {
    return this.count == 0;
  }

  moveState(state, dx, dy, add, includeEdges) {
    add = add != null ? add : true;
    includeEdges = includeEdges != null ? includeEdges : true;
    var delta = this.deltas.get(state.cell);

    if (delta == null) {
      delta = {
        point: new mxPoint(dx, dy),
        state: state
      };
      this.deltas.put(state.cell, delta);
      this.count++;
    } else if (add) {
      delta.point.x += dx;
      delta.point.y += dy;
    } else {
      delta.point.x = dx;
      delta.point.y = dy;
    }

    if (includeEdges) {
      this.addEdges(state);
    }

    return delta.point;
  }

  show(visitor) {
    this.deltas.visit((key, delta) => {
      this.translateState(delta.state, delta.point.x, delta.point.y);
    });
    this.deltas.visit((key, delta) => {
      this.revalidateState(delta.state, delta.point.x, delta.point.y, visitor);
    });
  }

  translateState(state, dx, dy) {
    if (state != null) {
      var model = this.graph.getModel();

      if (model.isVertex(state.cell)) {
        state.view.updateCellState(state);
        var geo = model.getGeometry(state.cell);

        if ((dx != 0 || dy != 0) && geo != null && (!geo.relative || this.deltas.get(state.cell) != null)) {
          state.x += dx;
          state.y += dy;
        }
      }

      var childCount = model.getChildCount(state.cell);

      for (var i = 0; i < childCount; i++) {
        this.translateState(state.view.getState(model.getChildAt(state.cell, i)), dx, dy);
      }
    }
  }

  revalidateState(state, dx, dy, visitor) {
    if (state != null) {
      var model = this.graph.getModel();

      if (model.isEdge(state.cell)) {
        state.view.updateCellState(state);
      }

      var geo = this.graph.getCellGeometry(state.cell);
      var pState = state.view.getState(model.getParent(state.cell));

      if (
        (dx != 0 || dy != 0) &&
        geo != null &&
        geo.relative &&
        model.isVertex(state.cell) &&
        (pState == null || model.isVertex(pState.cell) || this.deltas.get(state.cell) != null)
      ) {
        state.x += dx;
        state.y += dy;
      }

      this.graph.cellRenderer.redraw(state);

      if (visitor != null) {
        visitor(state);
      }

      var childCount = model.getChildCount(state.cell);

      for (var i = 0; i < childCount; i++) {
        this.revalidateState(this.graph.view.getState(model.getChildAt(state.cell, i)), dx, dy, visitor);
      }
    }
  }

  addEdges(state) {
    var model = this.graph.getModel();
    var edgeCount = model.getEdgeCount(state.cell);

    for (var i = 0; i < edgeCount; i++) {
      var s = state.view.getState(model.getEdgeAt(state.cell, i));

      if (s != null) {
        this.moveState(s, 0, 0);
      }
    }
  }
}
