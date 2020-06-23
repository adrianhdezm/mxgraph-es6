import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxDictionary } from '@mxgraph/util/mxDictionary';

export class mxSelectionCellsHandler extends mxEventSource {
  enabled = true;
  maxHandlers = 100;

  constructor(graph) {
    super();
    this.graph = graph;
    this.handlers = new mxDictionary();
    this.graph.addMouseListener(this);

    this.refreshHandler = (sender, evt) => {
      if (this.isEnabled()) {
        this.refresh();
      }
    };

    this.graph.getSelectionModel().addListener(mxEvent.CHANGE, this.refreshHandler);
    this.graph.getModel().addListener(mxEvent.CHANGE, this.refreshHandler);
    this.graph.getView().addListener(mxEvent.SCALE, this.refreshHandler);
    this.graph.getView().addListener(mxEvent.TRANSLATE, this.refreshHandler);
    this.graph.getView().addListener(mxEvent.SCALE_AND_TRANSLATE, this.refreshHandler);
    this.graph.getView().addListener(mxEvent.DOWN, this.refreshHandler);
    this.graph.getView().addListener(mxEvent.UP, this.refreshHandler);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  getHandler(cell) {
    return this.handlers.get(cell);
  }

  isHandled(cell) {
    return this.getHandler(cell) != null;
  }

  reset() {
    this.handlers.visit(function (key, handler) {
      handler.reset.apply(handler);
    });
  }

  getHandledSelectionCells() {
    return this.graph.getSelectionCells();
  }

  refresh() {
    var oldHandlers = this.handlers;
    this.handlers = new mxDictionary();
    var tmp = mxUtils.sortCells(this.getHandledSelectionCells(), false);

    for (var i = 0; i < tmp.length; i++) {
      var state = this.graph.view.getState(tmp[i]);

      if (state != null) {
        var handler = oldHandlers.remove(tmp[i]);

        if (handler != null) {
          if (handler.state != state) {
            handler.destroy();
            handler = null;
          } else if (!this.isHandlerActive(handler)) {
            if (handler.refresh != null) {
              handler.refresh();
            }

            handler.redraw();
          }
        }

        if (handler == null) {
          handler = this.graph.createHandler(state);
          this.fireEvent(new mxEventObject(mxEvent.ADD, 'state', state));
        }

        if (handler != null) {
          this.handlers.put(tmp[i], handler);
        }
      }
    }

    oldHandlers.visit((key, handler) => {
      this.fireEvent(new mxEventObject(mxEvent.REMOVE, 'state', handler.state));
      handler.destroy();
    });
  }

  isHandlerActive(handler) {
    return handler.index != null;
  }

  updateHandler(state) {
    var handler = this.handlers.remove(state.cell);

    if (handler != null) {
      var index = handler.index;
      var x = handler.startX;
      var y = handler.startY;
      handler.destroy();
      handler = this.graph.createHandler(state);

      if (handler != null) {
        this.handlers.put(state.cell, handler);

        if (index != null && x != null && y != null) {
          handler.start(x, y, index);
        }
      }
    }
  }

  mouseDown(sender, me) {
    if (this.graph.isEnabled() && this.isEnabled()) {
      var args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseDown.apply(handler, args);
      });
    }
  }

  mouseMove(sender, me) {
    if (this.graph.isEnabled() && this.isEnabled()) {
      var args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseMove.apply(handler, args);
      });
    }
  }

  mouseUp(sender, me) {
    if (this.graph.isEnabled() && this.isEnabled()) {
      var args = [sender, me];
      this.handlers.visit(function (key, handler) {
        handler.mouseUp.apply(handler, args);
      });
    }
  }

  destroy() {
    this.graph.removeMouseListener(this);

    if (this.refreshHandler != null) {
      this.graph.getSelectionModel().removeListener(this.refreshHandler);
      this.graph.getModel().removeListener(this.refreshHandler);
      this.graph.getView().removeListener(this.refreshHandler);
      this.refreshHandler = null;
    }
  }
}
