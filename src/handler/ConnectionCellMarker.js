import { mxCellMarker } from '@mxgraph/handler/mxCellMarker';

export class ConnectionCellMarker extends mxCellMarker {
  constructor(connectionHandler, hotspotEnabled, graph) {
    super(graph);
    this.connectionHandler = connectionHandler;
    this.hotspotEnabled = hotspotEnabled;
  }

  getCell(me) {
    var cell = super.getCell(me);
    this.connectionHandler.error = null;

    if (cell == null && this.connectionHandler.currentPoint != null) {
      cell = this.connectionHandler.graph.getCellAt(
        this.connectionHandler.currentPoint.x,
        this.connectionHandler.currentPoint.y
      );
    }

    if (cell != null && !this.connectionHandler.graph.isCellConnectable(cell)) {
      var parent = this.connectionHandler.graph.getModel().getParent(cell);

      if (
        this.connectionHandler.graph.getModel().isVertex(parent) &&
        this.connectionHandler.graph.isCellConnectable(parent)
      ) {
        cell = parent;
      }
    }

    if (
      (this.connectionHandler.graph.isSwimlane(cell) &&
        this.connectionHandler.currentPoint != null &&
        this.connectionHandler.graph.hitsSwimlaneContent(
          cell,
          this.connectionHandler.currentPoint.x,
          this.connectionHandler.currentPoint.y
        )) ||
      !this.connectionHandler.isConnectableCell(cell)
    ) {
      cell = null;
    }

    if (cell != null) {
      if (this.connectionHandler.isConnecting()) {
        if (this.connectionHandler.previous != null) {
          this.connectionHandler.error = this.connectionHandler.validateConnection(
            this.connectionHandler.previous.cell,
            cell
          );

          if (this.connectionHandler.error != null && this.connectionHandler.error.length == 0) {
            cell = null;

            if (this.connectionHandler.isCreateTarget(me.getEvent())) {
              this.connectionHandler.error = null;
            }
          }
        }
      } else if (!this.connectionHandler.isValidSource(cell, me)) {
        cell = null;
      }
    } else if (
      this.connectionHandler.isConnecting() &&
      !this.connectionHandler.isCreateTarget(me.getEvent()) &&
      !this.connectionHandler.graph.allowDanglingEdges
    ) {
      this.connectionHandler.error = '';
    }

    return cell;
  }

  isValidState(state) {
    if (this.connectionHandler.isConnecting()) {
      return this.connectionHandler.error == null;
    } else {
      return super.isValidState(state);
    }
  }

  getMarkerColor(evt, state, isValid) {
    return this.connectionHandler.connectImage == null || this.connectionHandler.isConnecting()
      ? super.getMarkerColor(evt, state, isValid)
      : null;
  }

  intersects(state, evt) {
    if (this.connectionHandler.connectImage != null || this.connectionHandler.isConnecting()) {
      return true;
    }

    return super.intersects(state, evt);
  }
}
