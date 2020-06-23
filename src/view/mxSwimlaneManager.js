import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxSwimlaneManager extends mxEventSource {
  graph = null;
  enabled = true;

  constructor(graph, horizontal, addEnabled, resizeEnabled) {
    super();
    this.horizontal = horizontal != null ? horizontal : true;
    this.addEnabled = addEnabled != null ? addEnabled : true;
    this.resizeEnabled = resizeEnabled != null ? resizeEnabled : true;

    this.addHandler = (sender, evt) => {
      if (this.isEnabled() && this.isAddEnabled()) {
        this.cellsAdded(evt.getProperty('cells'));
      }
    };

    this.resizeHandler = (sender, evt) => {
      if (this.isEnabled() && this.isResizeEnabled()) {
        this.cellsResized(evt.getProperty('cells'));
      }
    };

    this.setGraph(graph);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  isHorizontal() {
    return this.horizontal;
  }

  setHorizontal(value) {
    this.horizontal = value;
  }

  isAddEnabled() {
    return this.addEnabled;
  }

  setAddEnabled(value) {
    this.addEnabled = value;
  }

  isResizeEnabled() {
    return this.resizeEnabled;
  }

  setResizeEnabled(value) {
    this.resizeEnabled = value;
  }

  getGraph() {
    return this.graph;
  }

  setGraph(graph) {
    if (this.graph != null) {
      this.graph.removeListener(this.addHandler);
      this.graph.removeListener(this.resizeHandler);
    }

    this.graph = graph;

    if (this.graph != null) {
      this.graph.addListener(mxEvent.ADD_CELLS, this.addHandler);
      this.graph.addListener(mxEvent.CELLS_RESIZED, this.resizeHandler);
    }
  }

  isSwimlaneIgnored(swimlane) {
    return !this.getGraph().isSwimlane(swimlane);
  }

  isCellHorizontal(cell) {
    if (this.graph.isSwimlane(cell)) {
      var style = this.graph.getCellStyle(cell);
      return mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, 1) == 1;
    }

    return !this.isHorizontal();
  }

  cellsAdded(cells) {
    if (cells != null) {
      var model = this.getGraph().getModel();
      model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            this.swimlaneAdded(cells[i]);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  swimlaneAdded(swimlane) {
    var model = this.getGraph().getModel();
    var parent = model.getParent(swimlane);
    var childCount = model.getChildCount(parent);
    var geo = null;

    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(parent, i);

      if (child != swimlane && !this.isSwimlaneIgnored(child)) {
        geo = model.getGeometry(child);

        if (geo != null) {
          break;
        }
      }
    }

    if (geo != null) {
      var parentHorizontal = parent != null ? this.isCellHorizontal(parent) : this.horizontal;
      this.resizeSwimlane(swimlane, geo.width, geo.height, parentHorizontal);
    }
  }

  cellsResized(cells) {
    if (cells != null) {
      var model = this.getGraph().getModel();
      model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          if (!this.isSwimlaneIgnored(cells[i])) {
            var geo = model.getGeometry(cells[i]);

            if (geo != null) {
              var size = new mxRectangle(0, 0, geo.width, geo.height);
              var top = cells[i];
              var current = top;

              while (current != null) {
                top = current;
                current = model.getParent(current);
                var tmp = this.graph.isSwimlane(current) ? this.graph.getStartSize(current) : new mxRectangle();
                size.width += tmp.width;
                size.height += tmp.height;
              }

              var parentHorizontal = current != null ? this.isCellHorizontal(current) : this.horizontal;
              this.resizeSwimlane(top, size.width, size.height, parentHorizontal);
            }
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  resizeSwimlane(swimlane, w, h, parentHorizontal) {
    var model = this.getGraph().getModel();
    model.beginUpdate();

    try {
      var horizontal = this.isCellHorizontal(swimlane);

      if (!this.isSwimlaneIgnored(swimlane)) {
        var geo = model.getGeometry(swimlane);

        if (geo != null) {
          if ((parentHorizontal && geo.height != h) || (!parentHorizontal && geo.width != w)) {
            geo = geo.clone();

            if (parentHorizontal) {
              geo.height = h;
            } else {
              geo.width = w;
            }

            model.setGeometry(swimlane, geo);
          }
        }
      }

      var tmp = this.graph.isSwimlane(swimlane) ? this.graph.getStartSize(swimlane) : new mxRectangle();
      w -= tmp.width;
      h -= tmp.height;
      var childCount = model.getChildCount(swimlane);

      for (var i = 0; i < childCount; i++) {
        var child = model.getChildAt(swimlane, i);
        this.resizeSwimlane(child, w, h, horizontal);
      }
    } finally {
      model.endUpdate();
    }
  }

  destroy() {
    this.setGraph(null);
  }
}
