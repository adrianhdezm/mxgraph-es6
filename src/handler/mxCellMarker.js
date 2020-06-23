import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxCellHighlight } from '@mxgraph/handler/mxCellHighlight';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxCellMarker extends mxEventSource {
  graph = null;
  enabled = true;
  hotspot = mxConstants.DEFAULT_HOTSPOT;
  hotspotEnabled = false;
  validColor = null;
  invalidColor = null;
  currentColor = null;
  validState = null;
  markedState = null;

  constructor(graph, validColor, invalidColor, hotspot) {
    super();

    if (graph != null) {
      this.graph = graph;
      this.validColor = validColor != null ? validColor : mxConstants.DEFAULT_VALID_COLOR;
      this.invalidColor = invalidColor != null ? invalidColor : mxConstants.DEFAULT_INVALID_COLOR;
      this.hotspot = hotspot != null ? hotspot : mxConstants.DEFAULT_HOTSPOT;
      this.highlight = new mxCellHighlight(graph);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  setHotspot(hotspot) {
    this.hotspot = hotspot;
  }

  getHotspot() {
    return this.hotspot;
  }

  setHotspotEnabled(enabled) {
    this.hotspotEnabled = enabled;
  }

  isHotspotEnabled() {
    return this.hotspotEnabled;
  }

  hasValidState() {
    return this.validState != null;
  }

  getValidState() {
    return this.validState;
  }

  getMarkedState() {
    return this.markedState;
  }

  reset() {
    this.validState = null;

    if (this.markedState != null) {
      this.markedState = null;
      this.unmark();
    }
  }

  process(me) {
    var state = null;

    if (this.isEnabled()) {
      state = this.getState(me);
      this.setCurrentState(state, me);
    }

    return state;
  }

  setCurrentState(state, me, color) {
    var isValid = state != null ? this.isValidState(state) : false;
    color = color != null ? color : this.getMarkerColor(me.getEvent(), state, isValid);

    if (isValid) {
      this.validState = state;
    } else {
      this.validState = null;
    }

    if (state != this.markedState || color != this.currentColor) {
      this.currentColor = color;

      if (state != null && this.currentColor != null) {
        this.markedState = state;
        this.mark();
      } else if (this.markedState != null) {
        this.markedState = null;
        this.unmark();
      }
    }
  }

  markCell(cell, color) {
    var state = this.graph.getView().getState(cell);

    if (state != null) {
      this.currentColor = color != null ? color : this.validColor;
      this.markedState = state;
      this.mark();
    }
  }

  mark() {
    this.highlight.setHighlightColor(this.currentColor);
    this.highlight.highlight(this.markedState);
    this.fireEvent(new mxEventObject(mxEvent.MARK, 'state', this.markedState));
  }

  unmark() {
    this.mark();
  }

  isValidState(state) {
    return true;
  }

  getMarkerColor(evt, state, isValid) {
    return isValid ? this.validColor : this.invalidColor;
  }

  getState(me) {
    var view = this.graph.getView();
    var cell = this.getCell(me);
    var state = this.getStateToMark(view.getState(cell));
    return state != null && this.intersects(state, me) ? state : null;
  }

  getCell(me) {
    return me.getCell();
  }

  getStateToMark(state) {
    return state;
  }

  intersects(state, me) {
    if (this.hotspotEnabled) {
      return mxUtils.intersectsHotspot(
        state,
        me.getGraphX(),
        me.getGraphY(),
        this.hotspot,
        mxConstants.MIN_HOTSPOT_SIZE,
        mxConstants.MAX_HOTSPOT_SIZE
      );
    }

    return true;
  }

  destroy() {
    this.graph.getView().removeListener(this.resetHandler);
    this.graph.getModel().removeListener(this.resetHandler);
    this.highlight.destroy();
  }
}
