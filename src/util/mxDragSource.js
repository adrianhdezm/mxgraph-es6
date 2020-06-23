import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxCellHighlight } from '@mxgraph/handler/mxCellHighlight';
import { mxGuide } from '@mxgraph/util/mxGuide';
import { mxClient } from '@mxgraph/mxClient';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';

export class mxDragSource {
  dragOffset = null;
  dragElement = null;
  previewElement = null;
  enabled = true;
  currentGraph = null;
  currentDropTarget = null;
  currentPoint = null;
  currentGuide = null;
  currentHighlight = null;
  autoscroll = true;
  guidesEnabled = true;
  gridEnabled = true;
  highlightDropTargets = true;
  dragElementZIndex = 100;
  dragElementOpacity = 70;
  checkEventSource = true;

  constructor(element, dropHandler) {
    this.element = element;
    this.dropHandler = dropHandler;
    mxEvent.addGestureListeners(element, (evt) => {
      this.mouseDown(evt);
    });
    mxEvent.addListener(element, 'dragstart', function (evt) {
      mxEvent.consume(evt);
    });

    this.eventConsumer = function (sender, evt) {
      var evtName = evt.getProperty('eventName');
      var me = evt.getProperty('event');

      if (evtName != mxEvent.MOUSE_DOWN) {
        me.consume();
      }
    };
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  isGuidesEnabled() {
    return this.guidesEnabled;
  }

  setGuidesEnabled(value) {
    this.guidesEnabled = value;
  }

  isGridEnabled() {
    return this.gridEnabled;
  }

  setGridEnabled(value) {
    this.gridEnabled = value;
  }

  getGraphForEvent(evt) {
    return null;
  }

  getDropTarget(graph, x, y, evt) {
    return graph.getCellAt(x, y);
  }

  createDragElement(evt) {
    return this.element.cloneNode(true);
  }

  createPreviewElement(graph) {
    return null;
  }

  isActive() {
    return this.mouseMoveHandler != null;
  }

  reset() {
    if (this.currentGraph != null) {
      this.dragExit(this.currentGraph);
      this.currentGraph = null;
    }

    this.removeDragElement();
    this.removeListeners();
    this.stopDrag();
  }

  mouseDown(evt) {
    if (this.enabled && !mxEvent.isConsumed(evt) && this.mouseMoveHandler == null) {
      this.startDrag(evt);
      this.mouseMoveHandler = mxUtils.bind(this, this.mouseMove);
      this.mouseUpHandler = mxUtils.bind(this, this.mouseUp);
      mxEvent.addGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);

      if (mxClient.IS_TOUCH && !mxEvent.isMouseEvent(evt)) {
        this.eventSource = mxEvent.getSource(evt);
        mxEvent.addGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      }
    }
  }

  startDrag(evt) {
    this.dragElement = this.createDragElement(evt);
    this.dragElement.style.position = 'absolute';
    this.dragElement.style.zIndex = this.dragElementZIndex;
    mxUtils.setOpacity(this.dragElement, this.dragElementOpacity);

    if (this.checkEventSource && mxClient.IS_SVG) {
      this.dragElement.style.pointerEvents = 'none';
    }
  }

  stopDrag() {
    this.removeDragElement();
  }

  removeDragElement() {
    if (this.dragElement != null) {
      if (this.dragElement.parentNode != null) {
        this.dragElement.parentNode.removeChild(this.dragElement);
      }

      this.dragElement = null;
    }
  }

  getElementForEvent(evt) {
    return mxEvent.isTouchEvent(evt) || mxEvent.isPenEvent(evt)
      ? document.elementFromPoint(mxEvent.getClientX(evt), mxEvent.getClientY(evt))
      : mxEvent.getSource(evt);
  }

  graphContainsEvent(graph, evt) {
    var x = mxEvent.getClientX(evt);
    var y = mxEvent.getClientY(evt);
    var offset = mxUtils.getOffset(graph.container);
    var origin = mxUtils.getScrollOrigin();
    var elt = this.getElementForEvent(evt);

    if (this.checkEventSource) {
      while (elt != null && elt != graph.container) {
        elt = elt.parentNode;
      }
    }

    return (
      elt != null &&
      x >= offset.x - origin.x &&
      y >= offset.y - origin.y &&
      x <= offset.x - origin.x + graph.container.offsetWidth &&
      y <= offset.y - origin.y + graph.container.offsetHeight
    );
  }

  mouseMove(evt) {
    var graph = this.getGraphForEvent(evt);

    if (graph != null && !this.graphContainsEvent(graph, evt)) {
      graph = null;
    }

    if (graph != this.currentGraph) {
      if (this.currentGraph != null) {
        this.dragExit(this.currentGraph, evt);
      }

      this.currentGraph = graph;

      if (this.currentGraph != null) {
        this.dragEnter(this.currentGraph, evt);
      }
    }

    if (this.currentGraph != null) {
      this.dragOver(this.currentGraph, evt);
    }

    if (
      this.dragElement != null &&
      (this.previewElement == null || this.previewElement.style.visibility != 'visible')
    ) {
      var x = mxEvent.getClientX(evt);
      var y = mxEvent.getClientY(evt);

      if (this.dragElement.parentNode == null) {
        document.body.appendChild(this.dragElement);
      }

      this.dragElement.style.visibility = 'visible';

      if (this.dragOffset != null) {
        x += this.dragOffset.x;
        y += this.dragOffset.y;
      }

      var offset = mxUtils.getDocumentScrollOrigin(document);
      this.dragElement.style.left = x + offset.x + 'px';
      this.dragElement.style.top = y + offset.y + 'px';
    } else if (this.dragElement != null) {
      this.dragElement.style.visibility = 'hidden';
    }

    mxEvent.consume(evt);
  }

  mouseUp(evt) {
    if (this.currentGraph != null) {
      if (
        this.currentPoint != null &&
        (this.previewElement == null || this.previewElement.style.visibility != 'hidden')
      ) {
        var scale = this.currentGraph.view.scale;
        var tr = this.currentGraph.view.translate;
        var x = this.currentPoint.x / scale - tr.x;
        var y = this.currentPoint.y / scale - tr.y;
        this.drop(this.currentGraph, evt, this.currentDropTarget, x, y);
      }

      this.dragExit(this.currentGraph);
      this.currentGraph = null;
    }

    this.stopDrag();
    this.removeListeners();
    mxEvent.consume(evt);
  }

  removeListeners() {
    if (this.eventSource != null) {
      mxEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveHandler, this.mouseUpHandler);
      this.eventSource = null;
    }

    mxEvent.removeGestureListeners(document, null, this.mouseMoveHandler, this.mouseUpHandler);
    this.mouseMoveHandler = null;
    this.mouseUpHandler = null;
  }

  dragEnter(graph, evt) {
    graph.isMouseDown = true;
    graph.isMouseTrigger = mxEvent.isMouseEvent(evt);
    this.previewElement = this.createPreviewElement(graph);

    if (this.previewElement != null && this.checkEventSource && mxClient.IS_SVG) {
      this.previewElement.style.pointerEvents = 'none';
    }

    if (this.isGuidesEnabled() && this.previewElement != null) {
      this.currentGuide = new mxGuide(graph, graph.graphHandler.getGuideStates());
    }

    if (this.highlightDropTargets) {
      this.currentHighlight = new mxCellHighlight(graph, mxConstants.DROP_TARGET_COLOR);
    }

    graph.addListener(mxEvent.FIRE_MOUSE_EVENT, this.eventConsumer);
  }

  dragExit(graph, evt) {
    this.currentDropTarget = null;
    this.currentPoint = null;
    graph.isMouseDown = false;
    graph.removeListener(this.eventConsumer);

    if (this.previewElement != null) {
      if (this.previewElement.parentNode != null) {
        this.previewElement.parentNode.removeChild(this.previewElement);
      }

      this.previewElement = null;
    }

    if (this.currentGuide != null) {
      this.currentGuide.destroy();
      this.currentGuide = null;
    }

    if (this.currentHighlight != null) {
      this.currentHighlight.destroy();
      this.currentHighlight = null;
    }
  }

  dragOver(graph, evt) {
    var offset = mxUtils.getOffset(graph.container);
    var origin = mxUtils.getScrollOrigin(graph.container);
    var x = mxEvent.getClientX(evt) - offset.x + origin.x - graph.panDx;
    var y = mxEvent.getClientY(evt) - offset.y + origin.y - graph.panDy;

    if (graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
      graph.scrollPointToVisible(x, y, graph.autoExtend);
    }

    if (this.currentHighlight != null && graph.isDropEnabled()) {
      this.currentDropTarget = this.getDropTarget(graph, x, y, evt);
      var state = graph.getView().getState(this.currentDropTarget);
      this.currentHighlight.highlight(state);
    }

    if (this.previewElement != null) {
      if (this.previewElement.parentNode == null) {
        graph.container.appendChild(this.previewElement);
        this.previewElement.style.zIndex = '3';
        this.previewElement.style.position = 'absolute';
      }

      var gridEnabled = this.isGridEnabled() && graph.isGridEnabledEvent(evt);
      var hideGuide = true;

      if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
        var w = parseInt(this.previewElement.style.width);
        var h = parseInt(this.previewElement.style.height);
        var bounds = new mxRectangle(0, 0, w, h);
        var delta = new mxPoint(x, y);
        delta = this.currentGuide.move(bounds, delta, gridEnabled, true);
        hideGuide = false;
        x = delta.x;
        y = delta.y;
      } else if (gridEnabled) {
        var scale = graph.view.scale;
        var tr = graph.view.translate;
        var off = graph.gridSize / 2;
        x = (graph.snap(x / scale - tr.x - off) + tr.x) * scale;
        y = (graph.snap(y / scale - tr.y - off) + tr.y) * scale;
      }

      if (this.currentGuide != null && hideGuide) {
        this.currentGuide.hide();
      }

      if (this.previewOffset != null) {
        x += this.previewOffset.x;
        y += this.previewOffset.y;
      }

      this.previewElement.style.left = Math.round(x) + 'px';
      this.previewElement.style.top = Math.round(y) + 'px';
      this.previewElement.style.visibility = 'visible';
    }

    this.currentPoint = new mxPoint(x, y);
  }

  drop(graph, evt, dropTarget, x, y) {
    this.dropHandler.apply(this, arguments);

    if (graph.container.style.visibility != 'hidden') {
      graph.container.focus();
    }
  }
}
