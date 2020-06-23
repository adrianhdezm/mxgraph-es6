import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxElbowEdgeHandler } from '@mxgraph/handler/mxElbowEdgeHandler';
import { mxEdgeSegmentHandler } from '@mxgraph/handler/mxEdgeSegmentHandler';
import { mxEdgeHandler } from '@mxgraph/handler/mxEdgeHandler';
import { mxVertexHandler } from '@mxgraph/handler/mxVertexHandler';
import { mxConnectionConstraint } from '@mxgraph/view/mxConnectionConstraint';
import { mxLabel } from '@mxgraph/shape/mxLabel';
import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxPolyline } from '@mxgraph/shape/mxPolyline';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxPanningManager } from '@mxgraph/util/mxPanningManager';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxCellOverlay } from '@mxgraph/view/mxCellOverlay';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxStyleChange } from '@mxgraph/model/changes/mxStyleChange';
import { mxValueChange } from '@mxgraph/model/changes/mxValueChange';
import { mxGeometryChange } from '@mxgraph/model/changes/mxGeometryChange';
import { mxTerminalChange } from '@mxgraph/model/changes/mxTerminalChange';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxCell } from '@mxgraph/model/mxCell';
import { mxChildChange } from '@mxgraph/model/changes/mxChildChange';
import { mxRootChange } from '@mxgraph/model/changes/mxRootChange';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxCellEditor } from '@mxgraph/view/mxCellEditor';
import { mxCellRenderer } from '@mxgraph/view/mxCellRenderer';
import { mxGraphView } from '@mxgraph/view/mxGraphView';
import { mxStylesheet } from '@mxgraph/view/mxStylesheet';
import { mxGraphSelectionModel } from '@mxgraph/view/mxGraphSelectionModel';
import { mxPopupMenuHandler } from '@mxgraph/handler/mxPopupMenuHandler';
import { mxPanningHandler } from '@mxgraph/handler/mxPanningHandler';
import { mxGraphHandler } from '@mxgraph/handler/mxGraphHandler';
import { mxConnectionHandler } from '@mxgraph/handler/mxConnectionHandler';
import { mxSelectionCellsHandler } from '@mxgraph/handler/mxSelectionCellsHandler';
import { mxTooltipHandler } from '@mxgraph/handler/mxTooltipHandler';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxGraphModel } from '@mxgraph/model/mxGraphModel';
import { mxImage } from '@mxgraph/util/mxImage';
import { mxEdgeStyle } from '@mxgraph/view/mxEdgeStyle';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxClient } from '@mxgraph/mxClient';
import { mxResources } from '@mxgraph/util/mxResources';

export class mxGraph extends mxEventSource {
  isMouseDown = false;
  stylesheet = null;
  selectionModel = null;
  cellEditor = null;
  dialect = null;
  gridSize = 10;
  gridEnabled = true;
  portsEnabled = true;
  nativeDblClickEnabled = true;
  doubleTapEnabled = true;
  doubleTapTimeout = 500;
  doubleTapTolerance = 25;
  lastTouchY = 0;
  lastTouchY = 0;
  lastTouchTime = 0;
  tapAndHoldEnabled = true;
  tapAndHoldDelay = 500;
  tapAndHoldInProgress = false;
  tapAndHoldValid = false;
  initialTouchX = 0;
  initialTouchY = 0;
  tolerance = 4;
  defaultOverlap = 0.5;
  defaultParent = null;
  alternateEdgeStyle = null;
  backgroundImage = null;
  pageVisible = false;
  pageBreaksVisible = false;
  pageBreakColor = 'gray';
  pageBreakDashed = true;
  minPageBreakDist = 20;
  preferPageSize = false;
  pageFormat = mxConstants.PAGE_FORMAT_A4_PORTRAIT;
  pageScale = 1.5;
  enabled = true;
  escapeEnabled = true;
  invokesStopCellEditing = true;
  enterStopsCellEditing = false;
  useScrollbarsForPanning = true;
  exportEnabled = true;
  importEnabled = true;
  cellsLocked = false;
  cellsCloneable = true;
  foldingEnabled = true;
  cellsEditable = true;
  cellsDeletable = true;
  cellsMovable = true;
  edgeLabelsMovable = true;
  vertexLabelsMovable = false;
  dropEnabled = false;
  splitEnabled = true;
  cellsResizable = true;
  cellsBendable = true;
  cellsSelectable = true;
  cellsDisconnectable = true;
  autoSizeCells = false;
  autoSizeCellsOnAdd = false;
  autoScroll = true;
  ignoreScrollbars = false;
  translateToScrollPosition = false;
  timerAutoScroll = false;
  allowAutoPanning = false;
  autoExtend = true;
  maximumGraphBounds = null;
  minimumGraphSize = null;
  minimumContainerSize = null;
  maximumContainerSize = null;
  resizeContainer = false;
  border = 0;
  keepEdgesInForeground = false;
  keepEdgesInBackground = false;
  allowNegativeCoordinates = true;
  constrainChildren = true;
  constrainRelativeChildren = false;
  extendParents = true;
  extendParentsOnAdd = true;
  extendParentsOnMove = false;
  recursiveResize = false;
  collapseToPreferredSize = true;
  zoomFactor = 1.2;
  keepSelectionVisibleOnZoom = false;
  centerZoom = true;
  resetViewOnRootChange = true;
  resetEdgesOnResize = false;
  resetEdgesOnMove = false;
  resetEdgesOnConnect = true;
  allowLoops = false;
  defaultLoopStyle = mxEdgeStyle.Loop;
  multigraph = true;
  connectableEdges = false;
  allowDanglingEdges = true;
  cloneInvalidEdges = false;
  disconnectOnMove = true;
  labelsVisible = true;
  htmlLabels = false;
  swimlaneSelectionEnabled = true;
  swimlaneNesting = true;
  swimlaneIndicatorColorAttribute = mxConstants.STYLE_FILLCOLOR;
  minFitScale = 0.1;
  maxFitScale = 8;
  panDx = 0;
  panDy = 0;
  collapsedImage = new mxImage(mxClient.imageBasePath + '/collapsed.gif', 9, 9);
  expandedImage = new mxImage(mxClient.imageBasePath + '/expanded.gif', 9, 9);
  warningImage = new mxImage(mxClient.imageBasePath + '/warning' + (mxClient.IS_MAC ? '.png' : '.gif'), 16, 16);
  alreadyConnectedResource = mxClient.language != 'none' ? 'alreadyConnected' : '';
  containsValidationErrorsResource = mxClient.language != 'none' ? 'containsValidationErrors' : '';
  collapseExpandResource = mxClient.language != 'none' ? 'collapse-expand' : '';

  constructor(container, model, renderHint, stylesheet) {
    super();
    this.mouseListeners = null;
    this.renderHint = renderHint;

    if (mxClient.IS_SVG) {
      this.dialect = mxConstants.DIALECT_SVG;
    } else if (renderHint == mxConstants.RENDERING_HINT_FASTEST) {
      this.dialect = mxConstants.DIALECT_STRICTHTML;
    } else if (renderHint == mxConstants.RENDERING_HINT_FASTER) {
      this.dialect = mxConstants.DIALECT_PREFERHTML;
    } else {
      this.dialect = mxConstants.DIALECT_MIXEDHTML;
    }

    this.model = model != null ? model : new mxGraphModel();
    this.multiplicities = [];
    this.imageBundles = [];
    this.cellRenderer = this.createCellRenderer();
    this.setSelectionModel(this.createSelectionModel());
    this.setStylesheet(stylesheet != null ? stylesheet : this.createStylesheet());
    this.view = this.createGraphView();

    this.graphModelChangeListener = (sender, evt) => {
      this.graphModelChanged(evt.getProperty('edit').changes);
    };

    this.model.addListener(mxEvent.CHANGE, this.graphModelChangeListener);
    this.createHandlers();

    if (container != null) {
      this.init(container);
    }

    this.view.revalidate();
  }

  init(container) {
    this.container = container;
    this.cellEditor = this.createCellEditor();
    this.view.init();
    this.sizeDidChange();
    mxEvent.addListener(container, 'mouseleave', () => {
      if (this.tooltipHandler != null) {
        this.tooltipHandler.hide();
      }
    });

    if (document.documentMode == 8) {
      container.insertAdjacentHTML(
        'beforeend',
        '<' + mxClient.VML_PREFIX + ':group' + ' style="DISPLAY: none;"></' + mxClient.VML_PREFIX + ':group>'
      );
    }
  }

  createHandlers() {
    this.tooltipHandler = this.createTooltipHandler();
    this.tooltipHandler.setEnabled(false);
    this.selectionCellsHandler = this.createSelectionCellsHandler();
    this.connectionHandler = this.createConnectionHandler();
    this.connectionHandler.setEnabled(false);
    this.graphHandler = this.createGraphHandler();
    this.panningHandler = this.createPanningHandler();
    this.panningHandler.panningEnabled = false;
    this.popupMenuHandler = this.createPopupMenuHandler();
  }

  createTooltipHandler() {
    return new mxTooltipHandler(this);
  }

  createSelectionCellsHandler() {
    return new mxSelectionCellsHandler(this);
  }

  createConnectionHandler() {
    return new mxConnectionHandler(this);
  }

  createGraphHandler() {
    return new mxGraphHandler(this);
  }

  createPanningHandler() {
    return new mxPanningHandler(this);
  }

  createPopupMenuHandler() {
    return new mxPopupMenuHandler(this);
  }

  createSelectionModel() {
    return new mxGraphSelectionModel(this);
  }

  createStylesheet() {
    return new mxStylesheet();
  }

  createGraphView() {
    return new mxGraphView(this);
  }

  createCellRenderer() {
    return new mxCellRenderer();
  }

  createCellEditor() {
    return new mxCellEditor(this);
  }

  getModel() {
    return this.model;
  }

  getView() {
    return this.view;
  }

  getStylesheet() {
    return this.stylesheet;
  }

  setStylesheet(stylesheet) {
    this.stylesheet = stylesheet;
  }

  getSelectionModel() {
    return this.selectionModel;
  }

  setSelectionModel(selectionModel) {
    this.selectionModel = selectionModel;
  }

  getSelectionCellsForChanges(changes, ignoreFn) {
    var dict = new mxDictionary();
    var cells = [];

    var addCell = (cell) => {
      if (!dict.get(cell) && this.model.contains(cell)) {
        if (this.model.isEdge(cell) || this.model.isVertex(cell)) {
          dict.put(cell, true);
          cells.push(cell);
        } else {
          var childCount = this.model.getChildCount(cell);

          for (var i = 0; i < childCount; i++) {
            addCell(this.model.getChildAt(cell, i));
          }
        }
      }
    };

    for (var i = 0; i < changes.length; i++) {
      var change = changes[i];

      if (change.constructor != mxRootChange && (ignoreFn == null || !ignoreFn(change))) {
        var cell = null;

        if (change instanceof mxChildChange) {
          cell = change.child;
        } else if (change.cell != null && change.cell instanceof mxCell) {
          cell = change.cell;
        }

        if (cell != null) {
          addCell(cell);
        }
      }
    }

    return cells;
  }

  graphModelChanged(changes) {
    for (var i = 0; i < changes.length; i++) {
      this.processChange(changes[i]);
    }

    this.updateSelection();
    this.view.validate();
    this.sizeDidChange();
  }

  updateSelection() {
    var cells = this.getSelectionCells();
    var removed = [];

    for (var i = 0; i < cells.length; i++) {
      if (!this.model.contains(cells[i]) || !this.isCellVisible(cells[i])) {
        removed.push(cells[i]);
      } else {
        var par = this.model.getParent(cells[i]);

        while (par != null && par != this.view.currentRoot) {
          if (this.isCellCollapsed(par) || !this.isCellVisible(par)) {
            removed.push(cells[i]);
            break;
          }

          par = this.model.getParent(par);
        }
      }
    }

    this.removeSelectionCells(removed);
  }

  processChange(change) {
    if (change instanceof mxRootChange) {
      this.clearSelection();
      this.setDefaultParent(null);
      this.removeStateForCell(change.previous);

      if (this.resetViewOnRootChange) {
        this.view.scale = 1;
        this.view.translate.x = 0;
        this.view.translate.y = 0;
      }

      this.fireEvent(new mxEventObject(mxEvent.ROOT));
    } else if (change instanceof mxChildChange) {
      var newParent = this.model.getParent(change.child);
      this.view.invalidate(change.child, true, true);

      if (!this.model.contains(newParent) || this.isCellCollapsed(newParent)) {
        this.view.invalidate(change.child, true, true);
        this.removeStateForCell(change.child);

        if (this.view.currentRoot == change.child) {
          this.home();
        }
      }

      if (newParent != change.previous) {
        if (newParent != null) {
          this.view.invalidate(newParent, false, false);
        }

        if (change.previous != null) {
          this.view.invalidate(change.previous, false, false);
        }
      }
    } else if (change instanceof mxTerminalChange || change instanceof mxGeometryChange) {
      if (
        change instanceof mxTerminalChange ||
        (change.previous == null && change.geometry != null) ||
        (change.previous != null && !change.previous.equals(change.geometry))
      ) {
        this.view.invalidate(change.cell);
      }
    } else if (change instanceof mxValueChange) {
      this.view.invalidate(change.cell, false, false);
    } else if (change instanceof mxStyleChange) {
      this.view.invalidate(change.cell, true, true);
      var state = this.view.getState(change.cell);

      if (state != null) {
        state.invalidStyle = true;
      }
    } else if (change.cell != null && change.cell instanceof mxCell) {
      this.removeStateForCell(change.cell);
    }
  }

  removeStateForCell(cell) {
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      this.removeStateForCell(this.model.getChildAt(cell, i));
    }

    this.view.invalidate(cell, false, true);
    this.view.removeState(cell);
  }

  addCellOverlay(cell, overlay) {
    if (cell.overlays == null) {
      cell.overlays = [];
    }

    cell.overlays.push(overlay);
    var state = this.view.getState(cell);

    if (state != null) {
      this.cellRenderer.redraw(state);
    }

    this.fireEvent(new mxEventObject(mxEvent.ADD_OVERLAY, 'cell', cell, 'overlay', overlay));
    return overlay;
  }

  getCellOverlays(cell) {
    return cell.overlays;
  }

  removeCellOverlay(cell, overlay) {
    if (overlay == null) {
      this.removeCellOverlays(cell);
    } else {
      var index = mxUtils.indexOf(cell.overlays, overlay);

      if (index >= 0) {
        cell.overlays.splice(index, 1);

        if (cell.overlays.length == 0) {
          cell.overlays = null;
        }

        var state = this.view.getState(cell);

        if (state != null) {
          this.cellRenderer.redraw(state);
        }

        this.fireEvent(new mxEventObject(mxEvent.REMOVE_OVERLAY, 'cell', cell, 'overlay', overlay));
      } else {
        overlay = null;
      }
    }

    return overlay;
  }

  removeCellOverlays(cell) {
    var overlays = cell.overlays;

    if (overlays != null) {
      cell.overlays = null;
      var state = this.view.getState(cell);

      if (state != null) {
        this.cellRenderer.redraw(state);
      }

      for (var i = 0; i < overlays.length; i++) {
        this.fireEvent(new mxEventObject(mxEvent.REMOVE_OVERLAY, 'cell', cell, 'overlay', overlays[i]));
      }
    }

    return overlays;
  }

  clearCellOverlays(cell) {
    cell = cell != null ? cell : this.model.getRoot();
    this.removeCellOverlays(cell);
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = this.model.getChildAt(cell, i);
      this.clearCellOverlays(child);
    }
  }

  setCellWarning(cell, warning, img, isSelect) {
    if (warning != null && warning.length > 0) {
      img = img != null ? img : this.warningImage;
      var overlay = new mxCellOverlay(img, '<font color=red>' + warning + '</font>');

      if (isSelect) {
        overlay.addListener(mxEvent.CLICK, (sender, evt) => {
          if (this.isEnabled()) {
            this.setSelectionCell(cell);
          }
        });
      }

      return this.addCellOverlay(cell, overlay);
    } else {
      this.removeCellOverlays(cell);
    }

    return null;
  }

  startEditing(evt) {
    this.startEditingAtCell(null, evt);
  }

  startEditingAtCell(cell, evt) {
    if (evt == null || !mxEvent.isMultiTouchEvent(evt)) {
      if (cell == null) {
        cell = this.getSelectionCell();

        if (cell != null && !this.isCellEditable(cell)) {
          cell = null;
        }
      }

      if (cell != null) {
        this.fireEvent(new mxEventObject(mxEvent.START_EDITING, 'cell', cell, 'event', evt));
        this.cellEditor.startEditing(cell, evt);
        this.fireEvent(new mxEventObject(mxEvent.EDITING_STARTED, 'cell', cell, 'event', evt));
      }
    }
  }

  getEditingValue(cell, evt) {
    return this.convertValueToString(cell);
  }

  stopEditing(cancel) {
    this.cellEditor.stopEditing(cancel);
    this.fireEvent(new mxEventObject(mxEvent.EDITING_STOPPED, 'cancel', cancel));
  }

  labelChanged(cell, value, evt) {
    this.model.beginUpdate();

    try {
      var old = cell.value;
      this.cellLabelChanged(cell, value, this.isAutoSizeCell(cell));
      this.fireEvent(new mxEventObject(mxEvent.LABEL_CHANGED, 'cell', cell, 'value', value, 'old', old, 'event', evt));
    } finally {
      this.model.endUpdate();
    }

    return cell;
  }

  cellLabelChanged(cell, value, autoSize) {
    this.model.beginUpdate();

    try {
      this.model.setValue(cell, value);

      if (autoSize) {
        this.cellSizeUpdated(cell, false);
      }
    } finally {
      this.model.endUpdate();
    }
  }

  escape(evt) {
    this.fireEvent(new mxEventObject(mxEvent.ESCAPE, 'event', evt));
  }

  click(me) {
    var evt = me.getEvent();
    var cell = me.getCell();
    var mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);

    if (me.isConsumed()) {
      mxe.consume();
    }

    this.fireEvent(mxe);

    if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed()) {
      if (cell != null) {
        if (this.isTransparentClickEvent(evt)) {
          var active = false;
          var tmp = this.getCellAt(me.graphX, me.graphY, null, null, null, (state) => {
            var selected = this.isCellSelected(state.cell);
            active = active || selected;
            return !active || selected || (state.cell != cell && this.model.isAncestor(state.cell, cell));
          });

          if (tmp != null) {
            cell = tmp;
          }
        }
      } else if (this.isSwimlaneSelectionEnabled()) {
        cell = this.getSwimlaneAt(me.getGraphX(), me.getGraphY());

        if (cell != null && (!this.isToggleEvent(evt) || !mxEvent.isAltDown(evt))) {
          var temp = cell;
          var swimlanes = [];

          while (temp != null) {
            temp = this.model.getParent(temp);
            var state = this.view.getState(temp);

            if (this.isSwimlane(temp) && state != null) {
              swimlanes.push(temp);
            }
          }

          if (swimlanes.length > 0) {
            swimlanes = swimlanes.reverse();
            swimlanes.splice(0, 0, cell);
            swimlanes.push(cell);

            for (var i = 0; i < swimlanes.length - 1; i++) {
              if (this.isCellSelected(swimlanes[i])) {
                cell = swimlanes[this.isToggleEvent(evt) ? i : i + 1];
              }
            }
          }
        }
      }

      if (cell != null) {
        this.selectCellForEvent(cell, evt);
      } else if (!this.isToggleEvent(evt)) {
        this.clearSelection();
      }
    }
  }

  isSiblingSelected(cell) {
    var model = this.model;
    var parent = model.getParent(cell);
    var childCount = model.getChildCount(parent);

    for (var i = 0; i < childCount; i++) {
      var child = model.getChildAt(parent, i);

      if (cell != child && this.isCellSelected(child)) {
        return true;
      }
    }

    return false;
  }

  dblClick(evt, cell) {
    var mxe = new mxEventObject(mxEvent.DOUBLE_CLICK, 'event', evt, 'cell', cell);
    this.fireEvent(mxe);

    if (
      this.isEnabled() &&
      !mxEvent.isConsumed(evt) &&
      !mxe.isConsumed() &&
      cell != null &&
      this.isCellEditable(cell) &&
      !this.isEditing(cell)
    ) {
      this.startEditingAtCell(cell, evt);
      mxEvent.consume(evt);
    }
  }

  tapAndHold(me) {
    var evt = me.getEvent();
    var mxe = new mxEventObject(mxEvent.TAP_AND_HOLD, 'event', evt, 'cell', me.getCell());
    this.fireEvent(mxe);

    if (mxe.isConsumed()) {
      this.panningHandler.panningTrigger = false;
    }

    if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed() && this.connectionHandler.isEnabled()) {
      var state = this.view.getState(this.connectionHandler.marker.getCell(me));

      if (state != null) {
        this.connectionHandler.marker.currentColor = this.connectionHandler.marker.validColor;
        this.connectionHandler.marker.markedState = state;
        this.connectionHandler.marker.mark();
        this.connectionHandler.first = new mxPoint(me.getGraphX(), me.getGraphY());
        this.connectionHandler.edgeState = this.connectionHandler.createEdgeState(me);
        this.connectionHandler.previous = state;
        this.connectionHandler.fireEvent(new mxEventObject(mxEvent.START, 'state', this.connectionHandler.previous));
      }
    }
  }

  scrollPointToVisible(x, y, extend, border) {
    if (!this.timerAutoScroll && (this.ignoreScrollbars || mxUtils.hasScrollbars(this.container))) {
      var c = this.container;
      border = border != null ? border : 20;

      if (
        x >= c.scrollLeft &&
        y >= c.scrollTop &&
        x <= c.scrollLeft + c.clientWidth &&
        y <= c.scrollTop + c.clientHeight
      ) {
        var dx = c.scrollLeft + c.clientWidth - x;

        if (dx < border) {
          var old = c.scrollLeft;
          c.scrollLeft += border - dx;

          if (extend && old == c.scrollLeft) {
            if (this.dialect == mxConstants.DIALECT_SVG) {
              var root = this.view.getDrawPane().ownerSVGElement;
              var width = this.container.scrollWidth + border - dx;
              root.style.width = width + 'px';
            } else {
              var width = Math.max(c.clientWidth, c.scrollWidth) + border - dx;
              var canvas = this.view.getCanvas();
              canvas.style.width = width + 'px';
            }

            c.scrollLeft += border - dx;
          }
        } else {
          dx = x - c.scrollLeft;

          if (dx < border) {
            c.scrollLeft -= border - dx;
          }
        }

        var dy = c.scrollTop + c.clientHeight - y;

        if (dy < border) {
          var old = c.scrollTop;
          c.scrollTop += border - dy;

          if (old == c.scrollTop && extend) {
            if (this.dialect == mxConstants.DIALECT_SVG) {
              var root = this.view.getDrawPane().ownerSVGElement;
              var height = this.container.scrollHeight + border - dy;
              root.style.height = height + 'px';
            } else {
              var height = Math.max(c.clientHeight, c.scrollHeight) + border - dy;
              var canvas = this.view.getCanvas();
              canvas.style.height = height + 'px';
            }

            c.scrollTop += border - dy;
          }
        } else {
          dy = y - c.scrollTop;

          if (dy < border) {
            c.scrollTop -= border - dy;
          }
        }
      }
    } else if (this.allowAutoPanning && !this.panningHandler.isActive()) {
      if (this.panningManager == null) {
        this.panningManager = this.createPanningManager();
      }

      this.panningManager.panTo(x + this.panDx, y + this.panDy);
    }
  }

  createPanningManager() {
    return new mxPanningManager(this);
  }

  getBorderSizes() {
    var css = mxUtils.getCurrentStyle(this.container);
    return new mxRectangle(
      mxUtils.parseCssNumber(css.paddingLeft) +
        (css.borderLeftStyle != 'none' ? mxUtils.parseCssNumber(css.borderLeftWidth) : 0),
      mxUtils.parseCssNumber(css.paddingTop) +
        (css.borderTopStyle != 'none' ? mxUtils.parseCssNumber(css.borderTopWidth) : 0),
      mxUtils.parseCssNumber(css.paddingRight) +
        (css.borderRightStyle != 'none' ? mxUtils.parseCssNumber(css.borderRightWidth) : 0),
      mxUtils.parseCssNumber(css.paddingBottom) +
        (css.borderBottomStyle != 'none' ? mxUtils.parseCssNumber(css.borderBottomWidth) : 0)
    );
  }

  getPreferredPageSize(bounds, width, height) {
    var scale = this.view.scale;
    var tr = this.view.translate;
    var fmt = this.pageFormat;
    var ps = this.pageScale;
    var page = new mxRectangle(0, 0, Math.ceil(fmt.width * ps), Math.ceil(fmt.height * ps));
    var hCount = this.pageBreaksVisible ? Math.ceil(width / page.width) : 1;
    var vCount = this.pageBreaksVisible ? Math.ceil(height / page.height) : 1;
    return new mxRectangle(0, 0, hCount * page.width + 2 + tr.x, vCount * page.height + 2 + tr.y);
  }

  fit(border, keepOrigin, margin, enabled, ignoreWidth, ignoreHeight, maxHeight) {
    if (this.container != null) {
      border = border != null ? border : this.getBorder();
      keepOrigin = keepOrigin != null ? keepOrigin : false;
      margin = margin != null ? margin : 0;
      enabled = enabled != null ? enabled : true;
      ignoreWidth = ignoreWidth != null ? ignoreWidth : false;
      ignoreHeight = ignoreHeight != null ? ignoreHeight : false;
      var cssBorder = this.getBorderSizes();
      var w1 = this.container.offsetWidth - cssBorder.x - cssBorder.width - 1;
      var h1 = maxHeight != null ? maxHeight : this.container.offsetHeight - cssBorder.y - cssBorder.height - 1;
      var bounds = this.view.getGraphBounds();

      if (bounds.width > 0 && bounds.height > 0) {
        if (keepOrigin && bounds.x != null && bounds.y != null) {
          bounds = bounds.clone();
          bounds.width += bounds.x;
          bounds.height += bounds.y;
          bounds.x = 0;
          bounds.y = 0;
        }

        var s = this.view.scale;
        var w2 = bounds.width / s;
        var h2 = bounds.height / s;

        if (this.backgroundImage != null) {
          w2 = Math.max(w2, this.backgroundImage.width - bounds.x / s);
          h2 = Math.max(h2, this.backgroundImage.height - bounds.y / s);
        }

        var b = (keepOrigin ? border : 2 * border) + margin + 1;
        w1 -= b;
        h1 -= b;
        var s2 = ignoreWidth ? h1 / h2 : ignoreHeight ? w1 / w2 : Math.min(w1 / w2, h1 / h2);

        if (this.minFitScale != null) {
          s2 = Math.max(s2, this.minFitScale);
        }

        if (this.maxFitScale != null) {
          s2 = Math.min(s2, this.maxFitScale);
        }

        if (enabled) {
          if (!keepOrigin) {
            if (!mxUtils.hasScrollbars(this.container)) {
              var x0 =
                bounds.x != null ? Math.floor(this.view.translate.x - bounds.x / s + border / s2 + margin / 2) : border;
              var y0 =
                bounds.y != null ? Math.floor(this.view.translate.y - bounds.y / s + border / s2 + margin / 2) : border;
              this.view.scaleAndTranslate(s2, x0, y0);
            } else {
              this.view.setScale(s2);
              var b2 = this.getGraphBounds();

              if (b2.x != null) {
                this.container.scrollLeft = b2.x;
              }

              if (b2.y != null) {
                this.container.scrollTop = b2.y;
              }
            }
          } else if (this.view.scale != s2) {
            this.view.setScale(s2);
          }
        } else {
          return s2;
        }
      }
    }

    return this.view.scale;
  }

  sizeDidChange() {
    var bounds = this.getGraphBounds();

    if (this.container != null) {
      var border = this.getBorder();
      var width = Math.max(0, bounds.x) + bounds.width + 2 * border;
      var height = Math.max(0, bounds.y) + bounds.height + 2 * border;

      if (this.minimumContainerSize != null) {
        width = Math.max(width, this.minimumContainerSize.width);
        height = Math.max(height, this.minimumContainerSize.height);
      }

      if (this.resizeContainer) {
        this.doResizeContainer(width, height);
      }

      if (this.preferPageSize || this.pageVisible) {
        var size = this.getPreferredPageSize(bounds, Math.max(1, width), Math.max(1, height));

        if (size != null) {
          width = size.width * this.view.scale;
          height = size.height * this.view.scale;
        }
      }

      if (this.minimumGraphSize != null) {
        width = Math.max(width, this.minimumGraphSize.width * this.view.scale);
        height = Math.max(height, this.minimumGraphSize.height * this.view.scale);
      }

      width = Math.ceil(width);
      height = Math.ceil(height);

      if (this.dialect == mxConstants.DIALECT_SVG) {
        var root = this.view.getDrawPane().ownerSVGElement;

        if (root != null) {
          root.style.minWidth = Math.max(1, width) + 'px';
          root.style.minHeight = Math.max(1, height) + 'px';
          root.style.width = '100%';
          root.style.height = '100%';
        }
      } else {
        if (mxClient.IS_QUIRKS) {
          this.view.updateHtmlCanvasSize(Math.max(1, width), Math.max(1, height));
        } else {
          this.view.canvas.style.minWidth = Math.max(1, width) + 'px';
          this.view.canvas.style.minHeight = Math.max(1, height) + 'px';
        }
      }

      this.updatePageBreaks(this.pageBreaksVisible, width, height);
    }

    this.fireEvent(new mxEventObject(mxEvent.SIZE, 'bounds', bounds));
  }

  doResizeContainer(width, height) {
    if (this.maximumContainerSize != null) {
      width = Math.min(this.maximumContainerSize.width, width);
      height = Math.min(this.maximumContainerSize.height, height);
    }

    this.container.style.width = Math.ceil(width) + 'px';
    this.container.style.height = Math.ceil(height) + 'px';
  }

  updatePageBreaks(visible, width, height) {
    var scale = this.view.scale;
    var tr = this.view.translate;
    var fmt = this.pageFormat;
    var ps = scale * this.pageScale;
    var bounds = new mxRectangle(0, 0, fmt.width * ps, fmt.height * ps);
    var gb = mxRectangle.fromRectangle(this.getGraphBounds());
    gb.width = Math.max(1, gb.width);
    gb.height = Math.max(1, gb.height);
    bounds.x = Math.floor((gb.x - tr.x * scale) / bounds.width) * bounds.width + tr.x * scale;
    bounds.y = Math.floor((gb.y - tr.y * scale) / bounds.height) * bounds.height + tr.y * scale;
    gb.width = Math.ceil((gb.width + (gb.x - bounds.x)) / bounds.width) * bounds.width;
    gb.height = Math.ceil((gb.height + (gb.y - bounds.y)) / bounds.height) * bounds.height;
    visible = visible && Math.min(bounds.width, bounds.height) > this.minPageBreakDist;
    var horizontalCount = visible ? Math.ceil(gb.height / bounds.height) + 1 : 0;
    var verticalCount = visible ? Math.ceil(gb.width / bounds.width) + 1 : 0;
    var right = (verticalCount - 1) * bounds.width;
    var bottom = (horizontalCount - 1) * bounds.height;

    if (this.horizontalPageBreaks == null && horizontalCount > 0) {
      this.horizontalPageBreaks = [];
    }

    if (this.verticalPageBreaks == null && verticalCount > 0) {
      this.verticalPageBreaks = [];
    }

    var drawPageBreaks = (breaks) => {
      if (breaks != null) {
        var count = breaks == this.horizontalPageBreaks ? horizontalCount : verticalCount;

        for (var i = 0; i <= count; i++) {
          var pts =
            breaks == this.horizontalPageBreaks
              ? [
                  new mxPoint(Math.round(bounds.x), Math.round(bounds.y + i * bounds.height)),
                  new mxPoint(Math.round(bounds.x + right), Math.round(bounds.y + i * bounds.height))
                ]
              : [
                  new mxPoint(Math.round(bounds.x + i * bounds.width), Math.round(bounds.y)),
                  new mxPoint(Math.round(bounds.x + i * bounds.width), Math.round(bounds.y + bottom))
                ];

          if (breaks[i] != null) {
            breaks[i].points = pts;
            breaks[i].redraw();
          } else {
            var pageBreak = new mxPolyline(pts, this.pageBreakColor);
            pageBreak.dialect = this.dialect;
            pageBreak.pointerEvents = false;
            pageBreak.isDashed = this.pageBreakDashed;
            pageBreak.init(this.view.backgroundPane);
            pageBreak.redraw();
            breaks[i] = pageBreak;
          }
        }

        for (var i = count; i < breaks.length; i++) {
          breaks[i].destroy();
        }

        breaks.splice(count, breaks.length - count);
      }
    };

    drawPageBreaks(this.horizontalPageBreaks);
    drawPageBreaks(this.verticalPageBreaks);
  }

  getCurrentCellStyle(cell, ignoreState) {
    var state = ignoreState ? null : this.view.getState(cell);
    return state != null ? state.style : this.getCellStyle(cell);
  }

  getCellStyle(cell) {
    var stylename = this.model.getStyle(cell);
    var style = null;

    if (this.model.isEdge(cell)) {
      style = this.stylesheet.getDefaultEdgeStyle();
    } else {
      style = this.stylesheet.getDefaultVertexStyle();
    }

    if (stylename != null) {
      style = this.postProcessCellStyle(this.stylesheet.getCellStyle(stylename, style));
    }

    if (style == null) {
      style = new Object();
    }

    return style;
  }

  postProcessCellStyle(style) {
    if (style != null) {
      var key = style[mxConstants.STYLE_IMAGE];
      var image = this.getImageFromBundles(key);

      if (image != null) {
        style[mxConstants.STYLE_IMAGE] = image;
      } else {
        image = key;
      }

      if (image != null && image.substring(0, 11) == 'data:image/') {
        if (image.substring(0, 20) == 'data:image/svg+xml,<') {
          image = image.substring(0, 19) + encodeURIComponent(image.substring(19));
        } else if (image.substring(0, 22) != 'data:image/svg+xml,%3C') {
          var comma = image.indexOf(',');

          if (comma > 0 && image.substring(comma - 7, comma + 1) != ';base64,') {
            image = image.substring(0, comma) + ';base64,' + image.substring(comma + 1);
          }
        }

        style[mxConstants.STYLE_IMAGE] = image;
      }
    }

    return style;
  }

  setCellStyle(style, cells) {
    cells = cells || this.getSelectionCells();

    if (cells != null) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          this.model.setStyle(cells[i], style);
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  toggleCellStyle(key, defaultValue, cell) {
    cell = cell || this.getSelectionCell();
    return this.toggleCellStyles(key, defaultValue, [cell]);
  }

  toggleCellStyles(key, defaultValue, cells) {
    defaultValue = defaultValue != null ? defaultValue : false;
    cells = cells || this.getSelectionCells();
    var value = null;

    if (cells != null && cells.length > 0) {
      var style = this.getCurrentCellStyle(cells[0]);
      value = mxUtils.getValue(style, key, defaultValue) ? 0 : 1;
      this.setCellStyles(key, value, cells);
    }

    return value;
  }

  setCellStyles(key, value, cells) {
    cells = cells || this.getSelectionCells();
    mxUtils.setCellStyles(this.model, cells, key, value);
  }

  toggleCellStyleFlags(key, flag, cells) {
    this.setCellStyleFlags(key, flag, null, cells);
  }

  setCellStyleFlags(key, flag, value, cells) {
    cells = cells || this.getSelectionCells();

    if (cells != null && cells.length > 0) {
      if (value == null) {
        var style = this.getCurrentCellStyle(cells[0]);
        var current = parseInt(style[key] || 0);
        value = !((current & flag) == flag);
      }

      mxUtils.setCellStyleFlags(this.model, cells, key, flag, value);
    }
  }

  alignCells(align, cells, param) {
    if (cells == null) {
      cells = this.getSelectionCells();
    }

    if (cells != null && cells.length > 1) {
      if (param == null) {
        for (var i = 0; i < cells.length; i++) {
          var state = this.view.getState(cells[i]);

          if (state != null && !this.model.isEdge(cells[i])) {
            if (param == null) {
              if (align == mxConstants.ALIGN_CENTER) {
                param = state.x + state.width / 2;
                break;
              } else if (align == mxConstants.ALIGN_RIGHT) {
                param = state.x + state.width;
              } else if (align == mxConstants.ALIGN_TOP) {
                param = state.y;
              } else if (align == mxConstants.ALIGN_MIDDLE) {
                param = state.y + state.height / 2;
                break;
              } else if (align == mxConstants.ALIGN_BOTTOM) {
                param = state.y + state.height;
              } else {
                param = state.x;
              }
            } else {
              if (align == mxConstants.ALIGN_RIGHT) {
                param = Math.max(param, state.x + state.width);
              } else if (align == mxConstants.ALIGN_TOP) {
                param = Math.min(param, state.y);
              } else if (align == mxConstants.ALIGN_BOTTOM) {
                param = Math.max(param, state.y + state.height);
              } else {
                param = Math.min(param, state.x);
              }
            }
          }
        }
      }

      if (param != null) {
        var s = this.view.scale;
        this.model.beginUpdate();

        try {
          for (var i = 0; i < cells.length; i++) {
            var state = this.view.getState(cells[i]);

            if (state != null) {
              var geo = this.getCellGeometry(cells[i]);

              if (geo != null && !this.model.isEdge(cells[i])) {
                geo = geo.clone();

                if (align == mxConstants.ALIGN_CENTER) {
                  geo.x += (param - state.x - state.width / 2) / s;
                } else if (align == mxConstants.ALIGN_RIGHT) {
                  geo.x += (param - state.x - state.width) / s;
                } else if (align == mxConstants.ALIGN_TOP) {
                  geo.y += (param - state.y) / s;
                } else if (align == mxConstants.ALIGN_MIDDLE) {
                  geo.y += (param - state.y - state.height / 2) / s;
                } else if (align == mxConstants.ALIGN_BOTTOM) {
                  geo.y += (param - state.y - state.height) / s;
                } else {
                  geo.x += (param - state.x) / s;
                }

                this.resizeCell(cells[i], geo);
              }
            }
          }

          this.fireEvent(new mxEventObject(mxEvent.ALIGN_CELLS, 'align', align, 'cells', cells));
        } finally {
          this.model.endUpdate();
        }
      }
    }

    return cells;
  }

  flipEdge(edge) {
    if (edge != null && this.alternateEdgeStyle != null) {
      this.model.beginUpdate();

      try {
        var style = this.model.getStyle(edge);

        if (style == null || style.length == 0) {
          this.model.setStyle(edge, this.alternateEdgeStyle);
        } else {
          this.model.setStyle(edge, null);
        }

        this.resetEdge(edge);
        this.fireEvent(new mxEventObject(mxEvent.FLIP_EDGE, 'edge', edge));
      } finally {
        this.model.endUpdate();
      }
    }

    return edge;
  }

  addImageBundle(bundle) {
    this.imageBundles.push(bundle);
  }

  removeImageBundle(bundle) {
    var tmp = [];

    for (var i = 0; i < this.imageBundles.length; i++) {
      if (this.imageBundles[i] != bundle) {
        tmp.push(this.imageBundles[i]);
      }
    }

    this.imageBundles = tmp;
  }

  getImageFromBundles(key) {
    if (key != null) {
      for (var i = 0; i < this.imageBundles.length; i++) {
        var image = this.imageBundles[i].getImage(key);

        if (image != null) {
          return image;
        }
      }
    }

    return null;
  }

  orderCells(back, cells) {
    if (cells == null) {
      cells = mxUtils.sortCells(this.getSelectionCells(), true);
    }

    this.model.beginUpdate();

    try {
      this.cellsOrdered(cells, back);
      this.fireEvent(new mxEventObject(mxEvent.ORDER_CELLS, 'back', back, 'cells', cells));
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsOrdered(cells, back) {
    if (cells != null) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          var parent = this.model.getParent(cells[i]);

          if (back) {
            this.model.add(parent, cells[i], i);
          } else {
            this.model.add(parent, cells[i], this.model.getChildCount(parent) - 1);
          }
        }

        this.fireEvent(new mxEventObject(mxEvent.CELLS_ORDERED, 'back', back, 'cells', cells));
      } finally {
        this.model.endUpdate();
      }
    }
  }

  groupCells(group, border, cells) {
    if (cells == null) {
      cells = mxUtils.sortCells(this.getSelectionCells(), true);
    }

    cells = this.getCellsForGroup(cells);

    if (group == null) {
      group = this.createGroupCell(cells);
    }

    var bounds = this.getBoundsForGroup(group, cells, border);

    if (cells.length > 0 && bounds != null) {
      var parent = this.model.getParent(group);

      if (parent == null) {
        parent = this.model.getParent(cells[0]);
      }

      this.model.beginUpdate();

      try {
        if (this.getCellGeometry(group) == null) {
          this.model.setGeometry(group, new mxGeometry());
        }

        var index = this.model.getChildCount(parent);
        this.cellsAdded([group], parent, index, null, null, false, false, false);
        index = this.model.getChildCount(group);
        this.cellsAdded(cells, group, index, null, null, false, false, false);
        this.cellsMoved(cells, -bounds.x, -bounds.y, false, false, false);
        this.cellsResized([group], [bounds], false);
        this.fireEvent(new mxEventObject(mxEvent.GROUP_CELLS, 'group', group, 'border', border, 'cells', cells));
      } finally {
        this.model.endUpdate();
      }
    }

    return group;
  }

  getCellsForGroup(cells) {
    var result = [];

    if (cells != null && cells.length > 0) {
      var parent = this.model.getParent(cells[0]);
      result.push(cells[0]);

      for (var i = 1; i < cells.length; i++) {
        if (this.model.getParent(cells[i]) == parent) {
          result.push(cells[i]);
        }
      }
    }

    return result;
  }

  getBoundsForGroup(group, children, border) {
    var result = this.getBoundingBoxFromGeometry(children, true);

    if (result != null) {
      if (this.isSwimlane(group)) {
        var size = this.getStartSize(group);
        result.x -= size.width;
        result.y -= size.height;
        result.width += size.width;
        result.height += size.height;
      }

      if (border != null) {
        result.x -= border;
        result.y -= border;
        result.width += 2 * border;
        result.height += 2 * border;
      }
    }

    return result;
  }

  createGroupCell(cells) {
    var group = new mxCell('');
    group.setVertex(true);
    group.setConnectable(false);
    return group;
  }

  ungroupCells(cells) {
    var result = [];

    if (cells == null) {
      cells = this.getSelectionCells();
      var tmp = [];

      for (var i = 0; i < cells.length; i++) {
        if (this.model.getChildCount(cells[i]) > 0) {
          tmp.push(cells[i]);
        }
      }

      cells = tmp;
    }

    if (cells != null && cells.length > 0) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          var children = this.model.getChildren(cells[i]);

          if (children != null && children.length > 0) {
            children = children.slice();
            var parent = this.model.getParent(cells[i]);
            var index = this.model.getChildCount(parent);
            this.cellsAdded(children, parent, index, null, null, true);
            result = result.concat(children);
          }
        }

        this.removeCellsAfterUngroup(cells);
        this.fireEvent(new mxEventObject(mxEvent.UNGROUP_CELLS, 'cells', cells));
      } finally {
        this.model.endUpdate();
      }
    }

    return result;
  }

  removeCellsAfterUngroup(cells) {
    this.cellsRemoved(this.addAllEdges(cells));
  }

  removeCellsFromParent(cells) {
    if (cells == null) {
      cells = this.getSelectionCells();
    }

    this.model.beginUpdate();

    try {
      var parent = this.getDefaultParent();
      var index = this.model.getChildCount(parent);
      this.cellsAdded(cells, parent, index, null, null, true);
      this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS_FROM_PARENT, 'cells', cells));
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  updateGroupBounds(cells, border, moveGroup, topBorder, rightBorder, bottomBorder, leftBorder) {
    if (cells == null) {
      cells = this.getSelectionCells();
    }

    border = border != null ? border : 0;
    moveGroup = moveGroup != null ? moveGroup : false;
    topBorder = topBorder != null ? topBorder : 0;
    rightBorder = rightBorder != null ? rightBorder : 0;
    bottomBorder = bottomBorder != null ? bottomBorder : 0;
    leftBorder = leftBorder != null ? leftBorder : 0;
    this.model.beginUpdate();

    try {
      for (var i = cells.length - 1; i >= 0; i--) {
        var geo = this.getCellGeometry(cells[i]);

        if (geo != null) {
          var children = this.getChildCells(cells[i]);

          if (children != null && children.length > 0) {
            var bounds = this.getBoundingBoxFromGeometry(children, true);

            if (bounds != null && bounds.width > 0 && bounds.height > 0) {
              var left = 0;
              var top = 0;

              if (this.isSwimlane(cells[i])) {
                var size = this.getStartSize(cells[i]);
                left = size.width;
                top = size.height;
              }

              geo = geo.clone();

              if (moveGroup) {
                geo.x = Math.round(geo.x + bounds.x - border - left - leftBorder);
                geo.y = Math.round(geo.y + bounds.y - border - top - topBorder);
              }

              geo.width = Math.round(bounds.width + 2 * border + left + leftBorder + rightBorder);
              geo.height = Math.round(bounds.height + 2 * border + top + topBorder + bottomBorder);
              this.model.setGeometry(cells[i], geo);
              this.moveCells(children, border + left - bounds.x + leftBorder, border + top - bounds.y + topBorder);
            }
          }
        }
      }
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  getBoundingBox(cells) {
    var result = null;

    if (cells != null && cells.length > 0) {
      for (var i = 0; i < cells.length; i++) {
        if (this.model.isVertex(cells[i]) || this.model.isEdge(cells[i])) {
          var bbox = this.view.getBoundingBox(this.view.getState(cells[i]), true);

          if (bbox != null) {
            if (result == null) {
              result = mxRectangle.fromRectangle(bbox);
            } else {
              result.add(bbox);
            }
          }
        }
      }
    }

    return result;
  }

  cloneCell(cell, allowInvalidEdges, mapping, keepPosition) {
    return this.cloneCells([cell], allowInvalidEdges, mapping, keepPosition)[0];
  }

  cloneCells(cells, allowInvalidEdges, mapping, keepPosition) {
    allowInvalidEdges = allowInvalidEdges != null ? allowInvalidEdges : true;
    var clones = null;

    if (cells != null) {
      var dict = new mxDictionary();
      var tmp = [];

      for (var i = 0; i < cells.length; i++) {
        dict.put(cells[i], true);
        tmp.push(cells[i]);
      }

      if (tmp.length > 0) {
        var scale = this.view.scale;
        var trans = this.view.translate;
        clones = this.model.cloneCells(cells, true, mapping);

        for (var i = 0; i < cells.length; i++) {
          if (
            !allowInvalidEdges &&
            this.model.isEdge(clones[i]) &&
            this.getEdgeValidationError(
              clones[i],
              this.model.getTerminal(clones[i], true),
              this.model.getTerminal(clones[i], false)
            ) != null
          ) {
            clones[i] = null;
          } else {
            var g = this.model.getGeometry(clones[i]);

            if (g != null) {
              var state = this.view.getState(cells[i]);
              var pstate = this.view.getState(this.model.getParent(cells[i]));

              if (state != null && pstate != null) {
                var dx = keepPosition ? 0 : pstate.origin.x;
                var dy = keepPosition ? 0 : pstate.origin.y;

                if (this.model.isEdge(clones[i])) {
                  var pts = state.absolutePoints;

                  if (pts != null) {
                    var src = this.model.getTerminal(cells[i], true);

                    while (src != null && !dict.get(src)) {
                      src = this.model.getParent(src);
                    }

                    if (src == null && pts[0] != null) {
                      g.setTerminalPoint(new mxPoint(pts[0].x / scale - trans.x, pts[0].y / scale - trans.y), true);
                    }

                    var trg = this.model.getTerminal(cells[i], false);

                    while (trg != null && !dict.get(trg)) {
                      trg = this.model.getParent(trg);
                    }

                    var n = pts.length - 1;

                    if (trg == null && pts[n] != null) {
                      g.setTerminalPoint(new mxPoint(pts[n].x / scale - trans.x, pts[n].y / scale - trans.y), false);
                    }

                    var points = g.points;

                    if (points != null) {
                      for (var j = 0; j < points.length; j++) {
                        points[j].x += dx;
                        points[j].y += dy;
                      }
                    }
                  }
                } else {
                  g.translate(dx, dy);
                }
              }
            }
          }
        }
      } else {
        clones = [];
      }
    }

    return clones;
  }

  insertVertex(parent, id, value, x, y, width, height, style, relative) {
    var vertex = this.createVertex(parent, id, value, x, y, width, height, style, relative);
    return this.addCell(vertex, parent);
  }

  createVertex(parent, id, value, x, y, width, height, style, relative) {
    var geometry = new mxGeometry(x, y, width, height);
    geometry.relative = relative != null ? relative : false;
    var vertex = new mxCell(value, geometry, style);
    vertex.setId(id);
    vertex.setVertex(true);
    vertex.setConnectable(true);
    return vertex;
  }

  insertEdge(parent, id, value, source, target, style) {
    var edge = this.createEdge(parent, id, value, source, target, style);
    return this.addEdge(edge, parent, source, target);
  }

  createEdge(parent, id, value, source, target, style) {
    var edge = new mxCell(value, new mxGeometry(), style);
    edge.setId(id);
    edge.setEdge(true);
    edge.geometry.relative = true;
    return edge;
  }

  addEdge(edge, parent, source, target, index) {
    return this.addCell(edge, parent, index, source, target);
  }

  addCell(cell, parent, index, source, target) {
    return this.addCells([cell], parent, index, source, target)[0];
  }

  addCells(cells, parent, index, source, target, absolute) {
    if (parent == null) {
      parent = this.getDefaultParent();
    }

    if (index == null) {
      index = this.model.getChildCount(parent);
    }

    this.model.beginUpdate();

    try {
      this.cellsAdded(cells, parent, index, source, target, absolute != null ? absolute : false, true);
      this.fireEvent(
        new mxEventObject(
          mxEvent.ADD_CELLS,
          'cells',
          cells,
          'parent',
          parent,
          'index',
          index,
          'source',
          source,
          'target',
          target
        )
      );
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsAdded(cells, parent, index, source, target, absolute, constrain, extend) {
    if (cells != null && parent != null && index != null) {
      this.model.beginUpdate();

      try {
        var parentState = absolute ? this.view.getState(parent) : null;
        var o1 = parentState != null ? parentState.origin : null;
        var zero = new mxPoint(0, 0);

        for (var i = 0; i < cells.length; i++) {
          if (cells[i] == null) {
            index--;
          } else {
            var previous = this.model.getParent(cells[i]);

            if (o1 != null && cells[i] != parent && parent != previous) {
              var oldState = this.view.getState(previous);
              var o2 = oldState != null ? oldState.origin : zero;
              var geo = this.model.getGeometry(cells[i]);

              if (geo != null) {
                var dx = o2.x - o1.x;
                var dy = o2.y - o1.y;
                geo = geo.clone();
                geo.translate(dx, dy);

                if (!geo.relative && this.model.isVertex(cells[i]) && !this.isAllowNegativeCoordinates()) {
                  geo.x = Math.max(0, geo.x);
                  geo.y = Math.max(0, geo.y);
                }

                this.model.setGeometry(cells[i], geo);
              }
            }

            if (parent == previous && index + i > this.model.getChildCount(parent)) {
              index--;
            }

            this.model.add(parent, cells[i], index + i);

            if (this.autoSizeCellsOnAdd) {
              this.autoSizeCell(cells[i], true);
            }

            if ((extend == null || extend) && this.isExtendParentsOnAdd(cells[i]) && this.isExtendParent(cells[i])) {
              this.extendParent(cells[i]);
            }

            if (constrain == null || constrain) {
              this.constrainChild(cells[i]);
            }

            if (source != null) {
              this.cellConnected(cells[i], source, true);
            }

            if (target != null) {
              this.cellConnected(cells[i], target, false);
            }
          }
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELLS_ADDED,
            'cells',
            cells,
            'parent',
            parent,
            'index',
            index,
            'source',
            source,
            'target',
            target,
            'absolute',
            absolute
          )
        );
      } finally {
        this.model.endUpdate();
      }
    }
  }

  autoSizeCell(cell, recurse) {
    recurse = recurse != null ? recurse : true;

    if (recurse) {
      var childCount = this.model.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        this.autoSizeCell(this.model.getChildAt(cell, i));
      }
    }

    if (this.getModel().isVertex(cell) && this.isAutoSizeCell(cell)) {
      this.updateCellSize(cell);
    }
  }

  removeCells(cells, includeEdges) {
    includeEdges = includeEdges != null ? includeEdges : true;

    if (cells == null) {
      cells = this.getDeletableCells(this.getSelectionCells());
    }

    if (includeEdges) {
      cells = this.getDeletableCells(this.addAllEdges(cells));
    } else {
      cells = cells.slice();
      var edges = this.getDeletableCells(this.getAllEdges(cells));
      var dict = new mxDictionary();

      for (var i = 0; i < cells.length; i++) {
        dict.put(cells[i], true);
      }

      for (var i = 0; i < edges.length; i++) {
        if (this.view.getState(edges[i]) == null && !dict.get(edges[i])) {
          dict.put(edges[i], true);
          cells.push(edges[i]);
        }
      }
    }

    this.model.beginUpdate();

    try {
      this.cellsRemoved(cells);
      this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS, 'cells', cells, 'includeEdges', includeEdges));
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsRemoved(cells) {
    if (cells != null && cells.length > 0) {
      var scale = this.view.scale;
      var tr = this.view.translate;
      this.model.beginUpdate();

      try {
        var dict = new mxDictionary();

        for (var i = 0; i < cells.length; i++) {
          dict.put(cells[i], true);
        }

        for (var i = 0; i < cells.length; i++) {
          var edges = this.getAllEdges([cells[i]]);

          var disconnectTerminal = (edge, source) => {
            var geo = this.model.getGeometry(edge);

            if (geo != null) {
              var terminal = this.model.getTerminal(edge, source);
              var connected = false;
              var tmp = terminal;

              while (tmp != null) {
                if (cells[i] == tmp) {
                  connected = true;
                  break;
                }

                tmp = this.model.getParent(tmp);
              }

              if (connected) {
                geo = geo.clone();
                var state = this.view.getState(edge);

                if (state != null && state.absolutePoints != null) {
                  var pts = state.absolutePoints;
                  var n = source ? 0 : pts.length - 1;
                  geo.setTerminalPoint(
                    new mxPoint(pts[n].x / scale - tr.x - state.origin.x, pts[n].y / scale - tr.y - state.origin.y),
                    source
                  );
                } else {
                  var tstate = this.view.getState(terminal);

                  if (tstate != null) {
                    geo.setTerminalPoint(
                      new mxPoint(tstate.getCenterX() / scale - tr.x, tstate.getCenterY() / scale - tr.y),
                      source
                    );
                  }
                }

                this.model.setGeometry(edge, geo);
                this.model.setTerminal(edge, null, source);
              }
            }
          };

          for (var j = 0; j < edges.length; j++) {
            if (!dict.get(edges[j])) {
              dict.put(edges[j], true);
              disconnectTerminal(edges[j], true);
              disconnectTerminal(edges[j], false);
            }
          }

          this.model.remove(cells[i]);
        }

        this.fireEvent(new mxEventObject(mxEvent.CELLS_REMOVED, 'cells', cells));
      } finally {
        this.model.endUpdate();
      }
    }
  }

  splitEdge(edge, cells, newEdge, dx, dy, x, y, parent) {
    dx = dx || 0;
    dy = dy || 0;
    parent = parent != null ? parent : this.model.getParent(edge);
    var source = this.model.getTerminal(edge, true);
    this.model.beginUpdate();

    try {
      if (newEdge == null) {
        newEdge = this.cloneCell(edge);
        var state = this.view.getState(edge);
        var geo = this.getCellGeometry(newEdge);

        if (geo != null && geo.points != null && state != null) {
          var t = this.view.translate;
          var s = this.view.scale;
          var idx = mxUtils.findNearestSegment(state, (dx + t.x) * s, (dy + t.y) * s);
          geo.points = geo.points.slice(0, idx);
          geo = this.getCellGeometry(edge);

          if (geo != null && geo.points != null) {
            geo = geo.clone();
            geo.points = geo.points.slice(idx);
            this.model.setGeometry(edge, geo);
          }
        }
      }

      this.cellsMoved(cells, dx, dy, false, false);
      this.cellsAdded(cells, parent, this.model.getChildCount(parent), null, null, true);
      this.cellsAdded([newEdge], parent, this.model.getChildCount(parent), source, cells[0], false);
      this.cellConnected(edge, cells[0], true);
      this.fireEvent(
        new mxEventObject(mxEvent.SPLIT_EDGE, 'edge', edge, 'cells', cells, 'newEdge', newEdge, 'dx', dx, 'dy', dy)
      );
    } finally {
      this.model.endUpdate();
    }

    return newEdge;
  }

  toggleCells(show, cells, includeEdges) {
    if (cells == null) {
      cells = this.getSelectionCells();
    }

    if (includeEdges) {
      cells = this.addAllEdges(cells);
    }

    this.model.beginUpdate();

    try {
      this.cellsToggled(cells, show);
      this.fireEvent(
        new mxEventObject(mxEvent.TOGGLE_CELLS, 'show', show, 'cells', cells, 'includeEdges', includeEdges)
      );
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsToggled(cells, show) {
    if (cells != null && cells.length > 0) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          this.model.setVisible(cells[i], show);
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  foldCells(collapse, recurse, cells, checkFoldable, evt) {
    recurse = recurse != null ? recurse : false;

    if (cells == null) {
      cells = this.getFoldableCells(this.getSelectionCells(), collapse);
    }

    this.stopEditing(false);
    this.model.beginUpdate();

    try {
      this.cellsFolded(cells, collapse, recurse, checkFoldable);
      this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS, 'collapse', collapse, 'recurse', recurse, 'cells', cells));
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsFolded(cells, collapse, recurse, checkFoldable) {
    if (cells != null && cells.length > 0) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          if (
            (!checkFoldable || this.isCellFoldable(cells[i], collapse)) &&
            collapse != this.isCellCollapsed(cells[i])
          ) {
            this.model.setCollapsed(cells[i], collapse);
            this.swapBounds(cells[i], collapse);

            if (this.isExtendParent(cells[i])) {
              this.extendParent(cells[i]);
            }

            if (recurse) {
              var children = this.model.getChildren(cells[i]);
              this.cellsFolded(children, collapse, recurse);
            }

            this.constrainChild(cells[i]);
          }
        }

        this.fireEvent(
          new mxEventObject(mxEvent.CELLS_FOLDED, 'cells', cells, 'collapse', collapse, 'recurse', recurse)
        );
      } finally {
        this.model.endUpdate();
      }
    }
  }

  swapBounds(cell, willCollapse) {
    if (cell != null) {
      var geo = this.model.getGeometry(cell);

      if (geo != null) {
        geo = geo.clone();
        this.updateAlternateBounds(cell, geo, willCollapse);
        geo.swap();
        this.model.setGeometry(cell, geo);
      }
    }
  }

  updateAlternateBounds(cell, geo, willCollapse) {
    if (cell != null && geo != null) {
      var style = this.getCurrentCellStyle(cell);

      if (geo.alternateBounds == null) {
        var bounds = geo;

        if (this.collapseToPreferredSize) {
          var tmp = this.getPreferredSizeForCell(cell);

          if (tmp != null) {
            bounds = tmp;
            var startSize = mxUtils.getValue(style, mxConstants.STYLE_STARTSIZE);

            if (startSize > 0) {
              bounds.height = Math.max(bounds.height, startSize);
            }
          }
        }

        geo.alternateBounds = new mxRectangle(0, 0, bounds.width, bounds.height);
      }

      if (geo.alternateBounds != null) {
        geo.alternateBounds.x = geo.x;
        geo.alternateBounds.y = geo.y;
        var alpha = mxUtils.toRadians(style[mxConstants.STYLE_ROTATION] || 0);

        if (alpha != 0) {
          var dx = geo.alternateBounds.getCenterX() - geo.getCenterX();
          var dy = geo.alternateBounds.getCenterY() - geo.getCenterY();
          var cos = Math.cos(alpha);
          var sin = Math.sin(alpha);
          var dx2 = cos * dx - sin * dy;
          var dy2 = sin * dx + cos * dy;
          geo.alternateBounds.x += dx2 - dx;
          geo.alternateBounds.y += dy2 - dy;
        }
      }
    }
  }

  addAllEdges(cells) {
    var allCells = cells.slice();
    return mxUtils.removeDuplicates(allCells.concat(this.getAllEdges(cells)));
  }

  getAllEdges(cells) {
    var edges = [];

    if (cells != null) {
      for (var i = 0; i < cells.length; i++) {
        var edgeCount = this.model.getEdgeCount(cells[i]);

        for (var j = 0; j < edgeCount; j++) {
          edges.push(this.model.getEdgeAt(cells[i], j));
        }

        var children = this.model.getChildren(cells[i]);
        edges = edges.concat(this.getAllEdges(children));
      }
    }

    return edges;
  }

  updateCellSize(cell, ignoreChildren) {
    ignoreChildren = ignoreChildren != null ? ignoreChildren : false;
    this.model.beginUpdate();

    try {
      this.cellSizeUpdated(cell, ignoreChildren);
      this.fireEvent(new mxEventObject(mxEvent.UPDATE_CELL_SIZE, 'cell', cell, 'ignoreChildren', ignoreChildren));
    } finally {
      this.model.endUpdate();
    }

    return cell;
  }

  cellSizeUpdated(cell, ignoreChildren) {
    if (cell != null) {
      this.model.beginUpdate();

      try {
        var size = this.getPreferredSizeForCell(cell);
        var geo = this.model.getGeometry(cell);

        if (size != null && geo != null) {
          var collapsed = this.isCellCollapsed(cell);
          geo = geo.clone();

          if (this.isSwimlane(cell)) {
            var style = this.getCellStyle(cell);
            var cellStyle = this.model.getStyle(cell);

            if (cellStyle == null) {
              cellStyle = '';
            }

            if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
              cellStyle = mxUtils.setStyle(cellStyle, mxConstants.STYLE_STARTSIZE, size.height + 8);

              if (collapsed) {
                geo.height = size.height + 8;
              }

              geo.width = size.width;
            } else {
              cellStyle = mxUtils.setStyle(cellStyle, mxConstants.STYLE_STARTSIZE, size.width + 8);

              if (collapsed) {
                geo.width = size.width + 8;
              }

              geo.height = size.height;
            }

            this.model.setStyle(cell, cellStyle);
          } else {
            var state = this.view.createState(cell);
            var align = state.style[mxConstants.STYLE_ALIGN] || mxConstants.ALIGN_CENTER;

            if (align == mxConstants.ALIGN_RIGHT) {
              geo.x += geo.width - size.width;
            } else if (align == mxConstants.ALIGN_CENTER) {
              geo.x += Math.round((geo.width - size.width) / 2);
            }

            var valign = this.getVerticalAlign(state);

            if (valign == mxConstants.ALIGN_BOTTOM) {
              geo.y += geo.height - size.height;
            } else if (valign == mxConstants.ALIGN_MIDDLE) {
              geo.y += Math.round((geo.height - size.height) / 2);
            }

            geo.width = size.width;
            geo.height = size.height;
          }

          if (!ignoreChildren && !collapsed) {
            var bounds = this.view.getBounds(this.model.getChildren(cell));

            if (bounds != null) {
              var tr = this.view.translate;
              var scale = this.view.scale;
              var width = (bounds.x + bounds.width) / scale - geo.x - tr.x;
              var height = (bounds.y + bounds.height) / scale - geo.y - tr.y;
              geo.width = Math.max(geo.width, width);
              geo.height = Math.max(geo.height, height);
            }
          }

          this.cellsResized([cell], [geo], false);
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  getPreferredSizeForCell(cell, textWidth) {
    var result = null;

    if (cell != null) {
      var state = this.view.createState(cell);
      var style = state.style;

      if (!this.model.isEdge(cell)) {
        var fontSize = style[mxConstants.STYLE_FONTSIZE] || mxConstants.DEFAULT_FONTSIZE;
        var dx = 0;
        var dy = 0;

        if (this.getImage(state) != null || style[mxConstants.STYLE_IMAGE] != null) {
          if (style[mxConstants.STYLE_SHAPE] == mxConstants.SHAPE_LABEL) {
            if (style[mxConstants.STYLE_VERTICAL_ALIGN] == mxConstants.ALIGN_MIDDLE) {
              dx += parseFloat(style[mxConstants.STYLE_IMAGE_WIDTH]) || mxLabel.imageSize;
            }

            if (style[mxConstants.STYLE_ALIGN] != mxConstants.ALIGN_CENTER) {
              dy += parseFloat(style[mxConstants.STYLE_IMAGE_HEIGHT]) || mxLabel.imageSize;
            }
          }
        }

        dx += 2 * (style[mxConstants.STYLE_SPACING] || 0);
        dx += style[mxConstants.STYLE_SPACING_LEFT] || 0;
        dx += style[mxConstants.STYLE_SPACING_RIGHT] || 0;
        dy += 2 * (style[mxConstants.STYLE_SPACING] || 0);
        dy += style[mxConstants.STYLE_SPACING_TOP] || 0;
        dy += style[mxConstants.STYLE_SPACING_BOTTOM] || 0;
        var image = this.getFoldingImage(state);

        if (image != null) {
          dx += image.width + 8;
        }

        var value = this.cellRenderer.getLabelValue(state);

        if (value != null && value.length > 0) {
          if (!this.isHtmlLabel(state.cell)) {
            value = mxUtils.htmlEntities(value, false);
          }

          value = value.replace(/\n/g, '<br>');
          var size = mxUtils.getSizeForString(
            value,
            fontSize,
            style[mxConstants.STYLE_FONTFAMILY],
            textWidth,
            style[mxConstants.STYLE_FONTSTYLE]
          );
          var width = size.width + dx;
          var height = size.height + dy;

          if (!mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
            var tmp = height;
            height = width;
            width = tmp;
          }

          if (this.gridEnabled) {
            width = this.snap(width + this.gridSize / 2);
            height = this.snap(height + this.gridSize / 2);
          }

          result = new mxRectangle(0, 0, width, height);
        } else {
          var gs2 = 4 * this.gridSize;
          result = new mxRectangle(0, 0, gs2, gs2);
        }
      }
    }

    return result;
  }

  resizeCell(cell, bounds, recurse) {
    return this.resizeCells([cell], [bounds], recurse)[0];
  }

  resizeCells(cells, bounds, recurse) {
    recurse = recurse != null ? recurse : this.isRecursiveResize();
    this.model.beginUpdate();

    try {
      var prev = this.cellsResized(cells, bounds, recurse);
      this.fireEvent(new mxEventObject(mxEvent.RESIZE_CELLS, 'cells', cells, 'bounds', bounds, 'previous', prev));
    } finally {
      this.model.endUpdate();
    }

    return cells;
  }

  cellsResized(cells, bounds, recurse) {
    recurse = recurse != null ? recurse : false;
    var prev = [];

    if (cells != null && bounds != null && cells.length == bounds.length) {
      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          prev.push(this.cellResized(cells[i], bounds[i], false, recurse));

          if (this.isExtendParent(cells[i])) {
            this.extendParent(cells[i]);
          }

          this.constrainChild(cells[i]);
        }

        if (this.resetEdgesOnResize) {
          this.resetEdges(cells);
        }

        this.fireEvent(new mxEventObject(mxEvent.CELLS_RESIZED, 'cells', cells, 'bounds', bounds, 'previous', prev));
      } finally {
        this.model.endUpdate();
      }
    }

    return prev;
  }

  cellResized(cell, bounds, ignoreRelative, recurse) {
    var prev = this.model.getGeometry(cell);

    if (
      prev != null &&
      (prev.x != bounds.x || prev.y != bounds.y || prev.width != bounds.width || prev.height != bounds.height)
    ) {
      var geo = prev.clone();

      if (!ignoreRelative && geo.relative) {
        var offset = geo.offset;

        if (offset != null) {
          offset.x += bounds.x - geo.x;
          offset.y += bounds.y - geo.y;
        }
      } else {
        geo.x = bounds.x;
        geo.y = bounds.y;
      }

      geo.width = bounds.width;
      geo.height = bounds.height;

      if (!geo.relative && this.model.isVertex(cell) && !this.isAllowNegativeCoordinates()) {
        geo.x = Math.max(0, geo.x);
        geo.y = Math.max(0, geo.y);
      }

      this.model.beginUpdate();

      try {
        if (recurse) {
          this.resizeChildCells(cell, geo);
        }

        this.model.setGeometry(cell, geo);
        this.constrainChildCells(cell);
      } finally {
        this.model.endUpdate();
      }
    }

    return prev;
  }

  resizeChildCells(cell, newGeo) {
    var geo = this.model.getGeometry(cell);
    var dx = newGeo.width / geo.width;
    var dy = newGeo.height / geo.height;
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      this.scaleCell(this.model.getChildAt(cell, i), dx, dy, true);
    }
  }

  constrainChildCells(cell) {
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      this.constrainChild(this.model.getChildAt(cell, i));
    }
  }

  scaleCell(cell, dx, dy, recurse) {
    var geo = this.model.getGeometry(cell);

    if (geo != null) {
      var style = this.getCurrentCellStyle(cell);
      geo = geo.clone();
      var x = geo.x;
      var y = geo.y;
      var w = geo.width;
      var h = geo.height;
      geo.scale(dx, dy, style[mxConstants.STYLE_ASPECT] == 'fixed');

      if (style[mxConstants.STYLE_RESIZE_WIDTH] == '1') {
        geo.width = w * dx;
      } else if (style[mxConstants.STYLE_RESIZE_WIDTH] == '0') {
        geo.width = w;
      }

      if (style[mxConstants.STYLE_RESIZE_HEIGHT] == '1') {
        geo.height = h * dy;
      } else if (style[mxConstants.STYLE_RESIZE_HEIGHT] == '0') {
        geo.height = h;
      }

      if (!this.isCellMovable(cell)) {
        geo.x = x;
        geo.y = y;
      }

      if (!this.isCellResizable(cell)) {
        geo.width = w;
        geo.height = h;
      }

      if (this.model.isVertex(cell)) {
        this.cellResized(cell, geo, true, recurse);
      } else {
        this.model.setGeometry(cell, geo);
      }
    }
  }

  extendParent(cell) {
    if (cell != null) {
      var parent = this.model.getParent(cell);
      var p = this.getCellGeometry(parent);

      if (parent != null && p != null && !this.isCellCollapsed(parent)) {
        var geo = this.getCellGeometry(cell);

        if (geo != null && !geo.relative && (p.width < geo.x + geo.width || p.height < geo.y + geo.height)) {
          p = p.clone();
          p.width = Math.max(p.width, geo.x + geo.width);
          p.height = Math.max(p.height, geo.y + geo.height);
          this.cellsResized([parent], [p], false);
        }
      }
    }
  }

  importCells(cells, dx, dy, target, evt, mapping) {
    return this.moveCells(cells, dx, dy, true, target, evt, mapping);
  }

  moveCells(cells, dx, dy, clone, target, evt, mapping) {
    dx = dx != null ? dx : 0;
    dy = dy != null ? dy : 0;
    clone = clone != null ? clone : false;

    if (cells != null && (dx != 0 || dy != 0 || clone || target != null)) {
      cells = this.model.getTopmostCells(cells);
      this.model.beginUpdate();

      try {
        var dict = new mxDictionary();

        for (var i = 0; i < cells.length; i++) {
          dict.put(cells[i], true);
        }

        var isSelected = (cell) => {
          while (cell != null) {
            if (dict.get(cell)) {
              return true;
            }

            cell = this.model.getParent(cell);
          }

          return false;
        };

        var checked = [];

        for (var i = 0; i < cells.length; i++) {
          var geo = this.getCellGeometry(cells[i]);
          var parent = this.model.getParent(cells[i]);

          if (
            geo == null ||
            !geo.relative ||
            !this.model.isEdge(parent) ||
            (!isSelected(this.model.getTerminal(parent, true)) && !isSelected(this.model.getTerminal(parent, false)))
          ) {
            checked.push(cells[i]);
          }
        }

        cells = checked;

        if (clone) {
          cells = this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);

          if (target == null) {
            target = this.getDefaultParent();
          }
        }

        var previous = this.isAllowNegativeCoordinates();

        if (target != null) {
          this.setAllowNegativeCoordinates(true);
        }

        this.cellsMoved(
          cells,
          dx,
          dy,
          !clone && this.isDisconnectOnMove() && this.isAllowDanglingEdges(),
          target == null,
          this.isExtendParentsOnMove() && target == null
        );
        this.setAllowNegativeCoordinates(previous);

        if (target != null) {
          var index = this.model.getChildCount(target);
          this.cellsAdded(cells, target, index, null, null, true);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.MOVE_CELLS,
            'cells',
            cells,
            'dx',
            dx,
            'dy',
            dy,
            'clone',
            clone,
            'target',
            target,
            'event',
            evt
          )
        );
      } finally {
        this.model.endUpdate();
      }
    }

    return cells;
  }

  cellsMoved(cells, dx, dy, disconnect, constrain, extend) {
    if (cells != null && (dx != 0 || dy != 0)) {
      extend = extend != null ? extend : false;
      this.model.beginUpdate();

      try {
        if (disconnect) {
          this.disconnectGraph(cells);
        }

        for (var i = 0; i < cells.length; i++) {
          this.translateCell(cells[i], dx, dy);

          if (extend && this.isExtendParent(cells[i])) {
            this.extendParent(cells[i]);
          } else if (constrain) {
            this.constrainChild(cells[i]);
          }
        }

        if (this.resetEdgesOnMove) {
          this.resetEdges(cells);
        }

        this.fireEvent(
          new mxEventObject(mxEvent.CELLS_MOVED, 'cells', cells, 'dx', dx, 'dy', dy, 'disconnect', disconnect)
        );
      } finally {
        this.model.endUpdate();
      }
    }
  }

  translateCell(cell, dx, dy) {
    var geo = this.model.getGeometry(cell);

    if (geo != null) {
      dx = parseFloat(dx);
      dy = parseFloat(dy);
      geo = geo.clone();
      geo.translate(dx, dy);

      if (!geo.relative && this.model.isVertex(cell) && !this.isAllowNegativeCoordinates()) {
        geo.x = Math.max(0, parseFloat(geo.x));
        geo.y = Math.max(0, parseFloat(geo.y));
      }

      if (geo.relative && !this.model.isEdge(cell)) {
        var parent = this.model.getParent(cell);
        var angle = 0;

        if (this.model.isVertex(parent)) {
          var style = this.getCurrentCellStyle(parent);
          angle = mxUtils.getValue(style, mxConstants.STYLE_ROTATION, 0);
        }

        if (angle != 0) {
          var rad = mxUtils.toRadians(-angle);
          var cos = Math.cos(rad);
          var sin = Math.sin(rad);
          var pt = mxUtils.getRotatedPoint(new mxPoint(dx, dy), cos, sin, new mxPoint(0, 0));
          dx = pt.x;
          dy = pt.y;
        }

        if (geo.offset == null) {
          geo.offset = new mxPoint(dx, dy);
        } else {
          geo.offset.x = parseFloat(geo.offset.x) + dx;
          geo.offset.y = parseFloat(geo.offset.y) + dy;
        }
      }

      this.model.setGeometry(cell, geo);
    }
  }

  getCellContainmentArea(cell) {
    if (cell != null && !this.model.isEdge(cell)) {
      var parent = this.model.getParent(cell);

      if (parent != null && parent != this.getDefaultParent()) {
        var g = this.model.getGeometry(parent);

        if (g != null) {
          var x = 0;
          var y = 0;
          var w = g.width;
          var h = g.height;

          if (this.isSwimlane(parent)) {
            var size = this.getStartSize(parent);
            var style = this.getCurrentCellStyle(parent);
            var dir = mxUtils.getValue(style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST);
            var flipH = mxUtils.getValue(style, mxConstants.STYLE_FLIPH, 0) == 1;
            var flipV = mxUtils.getValue(style, mxConstants.STYLE_FLIPV, 0) == 1;

            if (dir == mxConstants.DIRECTION_SOUTH || dir == mxConstants.DIRECTION_NORTH) {
              var tmp = size.width;
              size.width = size.height;
              size.height = tmp;
            }

            if (
              (dir == mxConstants.DIRECTION_EAST && !flipV) ||
              (dir == mxConstants.DIRECTION_NORTH && !flipH) ||
              (dir == mxConstants.DIRECTION_WEST && flipV) ||
              (dir == mxConstants.DIRECTION_SOUTH && flipH)
            ) {
              x = size.width;
              y = size.height;
            }

            w -= size.width;
            h -= size.height;
          }

          return new mxRectangle(x, y, w, h);
        }
      }
    }

    return null;
  }

  getMaximumGraphBounds() {
    return this.maximumGraphBounds;
  }

  constrainChild(cell, sizeFirst) {
    sizeFirst = sizeFirst != null ? sizeFirst : true;

    if (cell != null) {
      var geo = this.getCellGeometry(cell);

      if (geo != null && (this.isConstrainRelativeChildren() || !geo.relative)) {
        var parent = this.model.getParent(cell);
        var pgeo = this.getCellGeometry(parent);
        var max = this.getMaximumGraphBounds();

        if (max != null) {
          var off = this.getBoundingBoxFromGeometry([parent], false);

          if (off != null) {
            max = mxRectangle.fromRectangle(max);
            max.x -= off.x;
            max.y -= off.y;
          }
        }

        if (this.isConstrainChild(cell)) {
          var tmp = this.getCellContainmentArea(cell);

          if (tmp != null) {
            var overlap = this.getOverlap(cell);

            if (overlap > 0) {
              tmp = mxRectangle.fromRectangle(tmp);
              tmp.x -= tmp.width * overlap;
              tmp.y -= tmp.height * overlap;
              tmp.width += 2 * tmp.width * overlap;
              tmp.height += 2 * tmp.height * overlap;
            }

            if (max == null) {
              max = tmp;
            } else {
              max = mxRectangle.fromRectangle(max);
              max.intersect(tmp);
            }
          }
        }

        if (max != null) {
          var cells = [cell];

          if (!this.isCellCollapsed(cell)) {
            var desc = this.model.getDescendants(cell);

            for (var i = 0; i < desc.length; i++) {
              if (this.isCellVisible(desc[i])) {
                cells.push(desc[i]);
              }
            }
          }

          var bbox = this.getBoundingBoxFromGeometry(cells, false);

          if (bbox != null) {
            geo = geo.clone();
            var dx = 0;

            if (geo.width > max.width) {
              dx = geo.width - max.width;
              geo.width -= dx;
            }

            if (bbox.x + bbox.width > max.x + max.width) {
              dx -= bbox.x + bbox.width - max.x - max.width - dx;
            }

            var dy = 0;

            if (geo.height > max.height) {
              dy = geo.height - max.height;
              geo.height -= dy;
            }

            if (bbox.y + bbox.height > max.y + max.height) {
              dy -= bbox.y + bbox.height - max.y - max.height - dy;
            }

            if (bbox.x < max.x) {
              dx -= bbox.x - max.x;
            }

            if (bbox.y < max.y) {
              dy -= bbox.y - max.y;
            }

            if (dx != 0 || dy != 0) {
              if (geo.relative) {
                if (geo.offset == null) {
                  geo.offset = new mxPoint();
                }

                geo.offset.x += dx;
                geo.offset.y += dy;
              } else {
                geo.x += dx;
                geo.y += dy;
              }
            }

            this.model.setGeometry(cell, geo);
          }
        }
      }
    }
  }

  resetEdges(cells) {
    if (cells != null) {
      var dict = new mxDictionary();

      for (var i = 0; i < cells.length; i++) {
        dict.put(cells[i], true);
      }

      this.model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          var edges = this.model.getEdges(cells[i]);

          if (edges != null) {
            for (var j = 0; j < edges.length; j++) {
              var state = this.view.getState(edges[j]);
              var source =
                state != null ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[j], true);
              var target =
                state != null ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[j], false);

              if (!dict.get(source) || !dict.get(target)) {
                this.resetEdge(edges[j]);
              }
            }
          }

          this.resetEdges(this.model.getChildren(cells[i]));
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  resetEdge(edge) {
    var geo = this.model.getGeometry(edge);

    if (geo != null && geo.points != null && geo.points.length > 0) {
      geo = geo.clone();
      geo.points = [];
      this.model.setGeometry(edge, geo);
    }

    return edge;
  }

  getOutlineConstraint(point, terminalState, me) {
    if (terminalState.shape != null) {
      var bounds = this.view.getPerimeterBounds(terminalState);
      var direction = terminalState.style[mxConstants.STYLE_DIRECTION];

      if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH) {
        bounds.x += bounds.width / 2 - bounds.height / 2;
        bounds.y += bounds.height / 2 - bounds.width / 2;
        var tmp = bounds.width;
        bounds.width = bounds.height;
        bounds.height = tmp;
      }

      var alpha = mxUtils.toRadians(terminalState.shape.getShapeRotation());

      if (alpha != 0) {
        var cos = Math.cos(-alpha);
        var sin = Math.sin(-alpha);
        var ct = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
        point = mxUtils.getRotatedPoint(point, cos, sin, ct);
      }

      var sx = 1;
      var sy = 1;
      var dx = 0;
      var dy = 0;

      if (this.getModel().isVertex(terminalState.cell)) {
        var flipH = terminalState.style[mxConstants.STYLE_FLIPH];
        var flipV = terminalState.style[mxConstants.STYLE_FLIPV];

        if (terminalState.shape != null && terminalState.shape.stencil != null) {
          flipH = mxUtils.getValue(terminalState.style, 'stencilFlipH', 0) == 1 || flipH;
          flipV = mxUtils.getValue(terminalState.style, 'stencilFlipV', 0) == 1 || flipV;
        }

        if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH) {
          var tmp = flipH;
          flipH = flipV;
          flipV = tmp;
        }

        if (flipH) {
          sx = -1;
          dx = -bounds.width;
        }

        if (flipV) {
          sy = -1;
          dy = -bounds.height;
        }
      }

      point = new mxPoint((point.x - bounds.x) * sx - dx + bounds.x, (point.y - bounds.y) * sy - dy + bounds.y);
      var x = bounds.width == 0 ? 0 : Math.round(((point.x - bounds.x) * 1000) / bounds.width) / 1000;
      var y = bounds.height == 0 ? 0 : Math.round(((point.y - bounds.y) * 1000) / bounds.height) / 1000;
      return new mxConnectionConstraint(new mxPoint(x, y), false);
    }

    return null;
  }

  getAllConnectionConstraints(terminal, source) {
    if (terminal != null && terminal.shape != null && terminal.shape.stencil != null) {
      return terminal.shape.stencil.constraints;
    }

    return null;
  }

  getConnectionConstraint(edge, terminal, source) {
    var point = null;
    var x = edge.style[source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X];

    if (x != null) {
      var y = edge.style[source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y];

      if (y != null) {
        point = new mxPoint(parseFloat(x), parseFloat(y));
      }
    }

    var perimeter = false;
    var dx = 0,
      dy = 0;

    if (point != null) {
      perimeter = mxUtils.getValue(
        edge.style,
        source ? mxConstants.STYLE_EXIT_PERIMETER : mxConstants.STYLE_ENTRY_PERIMETER,
        true
      );
      dx = parseFloat(edge.style[source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX]);
      dy = parseFloat(edge.style[source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY]);
      dx = isFinite(dx) ? dx : 0;
      dy = isFinite(dy) ? dy : 0;
    }

    return new mxConnectionConstraint(point, perimeter, null, dx, dy);
  }

  setConnectionConstraint(edge, terminal, source, constraint) {
    if (constraint != null) {
      this.model.beginUpdate();

      try {
        if (constraint == null || constraint.point == null) {
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X, null, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y, null, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX, null, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY, null, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_PERIMETER : mxConstants.STYLE_ENTRY_PERIMETER, null, [
            edge
          ]);
        } else if (constraint.point != null) {
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_X : mxConstants.STYLE_ENTRY_X, constraint.point.x, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_Y : mxConstants.STYLE_ENTRY_Y, constraint.point.y, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_DX : mxConstants.STYLE_ENTRY_DX, constraint.dx, [edge]);
          this.setCellStyles(source ? mxConstants.STYLE_EXIT_DY : mxConstants.STYLE_ENTRY_DY, constraint.dy, [edge]);

          if (!constraint.perimeter) {
            this.setCellStyles(source ? mxConstants.STYLE_EXIT_PERIMETER : mxConstants.STYLE_ENTRY_PERIMETER, '0', [
              edge
            ]);
          } else {
            this.setCellStyles(source ? mxConstants.STYLE_EXIT_PERIMETER : mxConstants.STYLE_ENTRY_PERIMETER, null, [
              edge
            ]);
          }
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  getConnectionPoint(vertex, constraint, round) {
    round = round != null ? round : true;
    var point = null;

    if (vertex != null && constraint.point != null) {
      var bounds = this.view.getPerimeterBounds(vertex);
      var cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
      var direction = vertex.style[mxConstants.STYLE_DIRECTION];
      var r1 = 0;

      if (direction != null && mxUtils.getValue(vertex.style, mxConstants.STYLE_ANCHOR_POINT_DIRECTION, 1) == 1) {
        if (direction == mxConstants.DIRECTION_NORTH) {
          r1 += 270;
        } else if (direction == mxConstants.DIRECTION_WEST) {
          r1 += 180;
        } else if (direction == mxConstants.DIRECTION_SOUTH) {
          r1 += 90;
        }

        if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH) {
          bounds.rotate90();
        }
      }

      var scale = this.view.scale;
      point = new mxPoint(
        bounds.x + constraint.point.x * bounds.width + constraint.dx * scale,
        bounds.y + constraint.point.y * bounds.height + constraint.dy * scale
      );
      var r2 = vertex.style[mxConstants.STYLE_ROTATION] || 0;

      if (constraint.perimeter) {
        if (r1 != 0) {
          var cos = 0;
          var sin = 0;

          if (r1 == 90) {
            sin = 1;
          } else if (r1 == 180) {
            cos = -1;
          } else if (r1 == 270) {
            sin = -1;
          }

          point = mxUtils.getRotatedPoint(point, cos, sin, cx);
        }

        point = this.view.getPerimeterPoint(vertex, point, false);
      } else {
        r2 += r1;

        if (this.getModel().isVertex(vertex.cell)) {
          var flipH = vertex.style[mxConstants.STYLE_FLIPH] == 1;
          var flipV = vertex.style[mxConstants.STYLE_FLIPV] == 1;

          if (vertex.shape != null && vertex.shape.stencil != null) {
            flipH = mxUtils.getValue(vertex.style, 'stencilFlipH', 0) == 1 || flipH;
            flipV = mxUtils.getValue(vertex.style, 'stencilFlipV', 0) == 1 || flipV;
          }

          if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH) {
            var temp = flipH;
            flipH = flipV;
            flipV = temp;
          }

          if (flipH) {
            point.x = 2 * bounds.getCenterX() - point.x;
          }

          if (flipV) {
            point.y = 2 * bounds.getCenterY() - point.y;
          }
        }
      }

      if (r2 != 0 && point != null) {
        var rad = mxUtils.toRadians(r2);
        var cos = Math.cos(rad);
        var sin = Math.sin(rad);
        point = mxUtils.getRotatedPoint(point, cos, sin, cx);
      }
    }

    if (round && point != null) {
      point.x = Math.round(point.x);
      point.y = Math.round(point.y);
    }

    return point;
  }

  connectCell(edge, terminal, source, constraint) {
    this.model.beginUpdate();

    try {
      var previous = this.model.getTerminal(edge, source);
      this.cellConnected(edge, terminal, source, constraint);
      this.fireEvent(
        new mxEventObject(
          mxEvent.CONNECT_CELL,
          'edge',
          edge,
          'terminal',
          terminal,
          'source',
          source,
          'previous',
          previous
        )
      );
    } finally {
      this.model.endUpdate();
    }

    return edge;
  }

  cellConnected(edge, terminal, source, constraint) {
    if (edge != null) {
      this.model.beginUpdate();

      try {
        var previous = this.model.getTerminal(edge, source);
        this.setConnectionConstraint(edge, terminal, source, constraint);

        if (this.isPortsEnabled()) {
          var id = null;

          if (this.isPort(terminal)) {
            id = terminal.getId();
            terminal = this.getTerminalForPort(terminal, source);
          }

          var key = source ? mxConstants.STYLE_SOURCE_PORT : mxConstants.STYLE_TARGET_PORT;
          this.setCellStyles(key, id, [edge]);
        }

        this.model.setTerminal(edge, terminal, source);

        if (this.resetEdgesOnConnect) {
          this.resetEdge(edge);
        }

        this.fireEvent(
          new mxEventObject(
            mxEvent.CELL_CONNECTED,
            'edge',
            edge,
            'terminal',
            terminal,
            'source',
            source,
            'previous',
            previous
          )
        );
      } finally {
        this.model.endUpdate();
      }
    }
  }

  disconnectGraph(cells) {
    if (cells != null) {
      this.model.beginUpdate();

      try {
        var scale = this.view.scale;
        var tr = this.view.translate;
        var dict = new mxDictionary();

        for (var i = 0; i < cells.length; i++) {
          dict.put(cells[i], true);
        }

        for (var i = 0; i < cells.length; i++) {
          if (this.model.isEdge(cells[i])) {
            var geo = this.model.getGeometry(cells[i]);

            if (geo != null) {
              var state = this.view.getState(cells[i]);
              var pstate = this.view.getState(this.model.getParent(cells[i]));

              if (state != null && pstate != null) {
                geo = geo.clone();
                var dx = -pstate.origin.x;
                var dy = -pstate.origin.y;
                var pts = state.absolutePoints;
                var src = this.model.getTerminal(cells[i], true);

                if (src != null && this.isCellDisconnectable(cells[i], src, true)) {
                  while (src != null && !dict.get(src)) {
                    src = this.model.getParent(src);
                  }

                  if (src == null) {
                    geo.setTerminalPoint(new mxPoint(pts[0].x / scale - tr.x + dx, pts[0].y / scale - tr.y + dy), true);
                    this.model.setTerminal(cells[i], null, true);
                  }
                }

                var trg = this.model.getTerminal(cells[i], false);

                if (trg != null && this.isCellDisconnectable(cells[i], trg, false)) {
                  while (trg != null && !dict.get(trg)) {
                    trg = this.model.getParent(trg);
                  }

                  if (trg == null) {
                    var n = pts.length - 1;
                    geo.setTerminalPoint(
                      new mxPoint(pts[n].x / scale - tr.x + dx, pts[n].y / scale - tr.y + dy),
                      false
                    );
                    this.model.setTerminal(cells[i], null, false);
                  }
                }

                this.model.setGeometry(cells[i], geo);
              }
            }
          }
        }
      } finally {
        this.model.endUpdate();
      }
    }
  }

  getCurrentRoot() {
    return this.view.currentRoot;
  }

  getTranslateForRoot(cell) {
    return null;
  }

  isPort(cell) {
    return false;
  }

  getTerminalForPort(cell, source) {
    return this.model.getParent(cell);
  }

  getChildOffsetForCell(cell) {
    return null;
  }

  enterGroup(cell) {
    cell = cell || this.getSelectionCell();

    if (cell != null && this.isValidRoot(cell)) {
      this.view.setCurrentRoot(cell);
      this.clearSelection();
    }
  }

  exitGroup() {
    var root = this.model.getRoot();
    var current = this.getCurrentRoot();

    if (current != null) {
      var next = this.model.getParent(current);

      while (next != root && !this.isValidRoot(next) && this.model.getParent(next) != root) {
        next = this.model.getParent(next);
      }

      if (next == root || this.model.getParent(next) == root) {
        this.view.setCurrentRoot(null);
      } else {
        this.view.setCurrentRoot(next);
      }

      var state = this.view.getState(current);

      if (state != null) {
        this.setSelectionCell(current);
      }
    }
  }

  home() {
    var current = this.getCurrentRoot();

    if (current != null) {
      this.view.setCurrentRoot(null);
      var state = this.view.getState(current);

      if (state != null) {
        this.setSelectionCell(current);
      }
    }
  }

  isValidRoot(cell) {
    return cell != null;
  }

  getGraphBounds() {
    return this.view.getGraphBounds();
  }

  getCellBounds(cell, includeEdges, includeDescendants) {
    var cells = [cell];

    if (includeEdges) {
      cells = cells.concat(this.model.getEdges(cell));
    }

    var result = this.view.getBounds(cells);

    if (includeDescendants) {
      var childCount = this.model.getChildCount(cell);

      for (var i = 0; i < childCount; i++) {
        var tmp = this.getCellBounds(this.model.getChildAt(cell, i), includeEdges, true);

        if (result != null) {
          result.add(tmp);
        } else {
          result = tmp;
        }
      }
    }

    return result;
  }

  getBoundingBoxFromGeometry(cells, includeEdges) {
    includeEdges = includeEdges != null ? includeEdges : false;
    var result = null;

    if (cells != null) {
      for (var i = 0; i < cells.length; i++) {
        if (includeEdges || this.model.isVertex(cells[i])) {
          var geo = this.getCellGeometry(cells[i]);

          if (geo != null) {
            var bbox = null;

            if (this.model.isEdge(cells[i])) {
              var addPoint = function (pt) {
                if (pt != null) {
                  if (tmp == null) {
                    tmp = new mxRectangle(pt.x, pt.y, 0, 0);
                  } else {
                    tmp.add(new mxRectangle(pt.x, pt.y, 0, 0));
                  }
                }
              };

              if (this.model.getTerminal(cells[i], true) == null) {
                addPoint(geo.getTerminalPoint(true));
              }

              if (this.model.getTerminal(cells[i], false) == null) {
                addPoint(geo.getTerminalPoint(false));
              }

              var pts = geo.points;

              if (pts != null && pts.length > 0) {
                var tmp = new mxRectangle(pts[0].x, pts[0].y, 0, 0);

                for (var j = 1; j < pts.length; j++) {
                  addPoint(pts[j]);
                }
              }

              bbox = tmp;
            } else {
              var parent = this.model.getParent(cells[i]);

              if (geo.relative) {
                if (this.model.isVertex(parent) && parent != this.view.currentRoot) {
                  var tmp = this.getBoundingBoxFromGeometry([parent], false);

                  if (tmp != null) {
                    bbox = new mxRectangle(geo.x * tmp.width, geo.y * tmp.height, geo.width, geo.height);

                    if (mxUtils.indexOf(cells, parent) >= 0) {
                      bbox.x += tmp.x;
                      bbox.y += tmp.y;
                    }
                  }
                }
              } else {
                bbox = mxRectangle.fromRectangle(geo);

                if (this.model.isVertex(parent) && mxUtils.indexOf(cells, parent) >= 0) {
                  var tmp = this.getBoundingBoxFromGeometry([parent], false);

                  if (tmp != null) {
                    bbox.x += tmp.x;
                    bbox.y += tmp.y;
                  }
                }
              }

              if (bbox != null && geo.offset != null) {
                bbox.x += geo.offset.x;
                bbox.y += geo.offset.y;
              }

              var style = this.getCurrentCellStyle(cells[i]);

              if (bbox != null) {
                var angle = mxUtils.getValue(style, mxConstants.STYLE_ROTATION, 0);

                if (angle != 0) {
                  bbox = mxUtils.getBoundingBox(bbox, angle);
                }
              }
            }

            if (bbox != null) {
              if (result == null) {
                result = mxRectangle.fromRectangle(bbox);
              } else {
                result.add(bbox);
              }
            }
          }
        }
      }
    }

    return result;
  }

  refresh(cell) {
    this.view.clear(cell, cell == null);
    this.view.validate();
    this.sizeDidChange();
    this.fireEvent(new mxEventObject(mxEvent.REFRESH));
  }

  snap(value) {
    if (this.gridEnabled) {
      value = Math.round(value / this.gridSize) * this.gridSize;
    }

    return value;
  }

  snapDelta(delta, bounds, ignoreGrid, ignoreHorizontal, ignoreVertical) {
    var t = this.view.translate;
    var s = this.view.scale;

    if (!ignoreGrid && this.gridEnabled) {
      var tol = this.gridSize * s * 0.5;

      if (!ignoreHorizontal) {
        var tx = bounds.x - (this.snap(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = this.snap(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        var ty = bounds.y - (this.snap(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = this.snap(delta.y / s) * s - ty;
        }
      }
    } else {
      var tol = 0.5 * s;

      if (!ignoreHorizontal) {
        var tx = bounds.x - (Math.round(bounds.x / s - t.x) + t.x) * s;

        if (Math.abs(delta.x - tx) < tol) {
          delta.x = 0;
        } else {
          delta.x = Math.round(delta.x / s) * s - tx;
        }
      }

      if (!ignoreVertical) {
        var ty = bounds.y - (Math.round(bounds.y / s - t.y) + t.y) * s;

        if (Math.abs(delta.y - ty) < tol) {
          delta.y = 0;
        } else {
          delta.y = Math.round(delta.y / s) * s - ty;
        }
      }
    }

    return delta;
  }

  panGraph(dx, dy) {
    if (this.useScrollbarsForPanning && mxUtils.hasScrollbars(this.container)) {
      this.container.scrollLeft = -dx;
      this.container.scrollTop = -dy;
    } else {
      var canvas = this.view.getCanvas();

      if (this.dialect == mxConstants.DIALECT_SVG) {
        if (dx == 0 && dy == 0) {
          canvas.removeAttribute('transform');

          if (this.shiftPreview1 != null) {
            var child = this.shiftPreview1.firstChild;

            while (child != null) {
              var next = child.nextSibling;
              this.container.appendChild(child);
              child = next;
            }

            if (this.shiftPreview1.parentNode != null) {
              this.shiftPreview1.parentNode.removeChild(this.shiftPreview1);
            }

            this.shiftPreview1 = null;
            this.container.appendChild(canvas.parentNode);
            child = this.shiftPreview2.firstChild;

            while (child != null) {
              var next = child.nextSibling;
              this.container.appendChild(child);
              child = next;
            }

            if (this.shiftPreview2.parentNode != null) {
              this.shiftPreview2.parentNode.removeChild(this.shiftPreview2);
            }

            this.shiftPreview2 = null;
          }
        } else {
          canvas.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');

          if (this.shiftPreview1 == null) {
            this.shiftPreview1 = document.createElement('div');
            this.shiftPreview1.style.position = 'absolute';
            this.shiftPreview1.style.overflow = 'visible';
            this.shiftPreview2 = document.createElement('div');
            this.shiftPreview2.style.position = 'absolute';
            this.shiftPreview2.style.overflow = 'visible';
            var current = this.shiftPreview1;
            var child = this.container.firstChild;

            while (child != null) {
              var next = child.nextSibling;

              if (child != canvas.parentNode) {
                current.appendChild(child);
              } else {
                current = this.shiftPreview2;
              }

              child = next;
            }

            if (this.shiftPreview1.firstChild != null) {
              this.container.insertBefore(this.shiftPreview1, canvas.parentNode);
            }

            if (this.shiftPreview2.firstChild != null) {
              this.container.appendChild(this.shiftPreview2);
            }
          }

          this.shiftPreview1.style.left = dx + 'px';
          this.shiftPreview1.style.top = dy + 'px';
          this.shiftPreview2.style.left = dx + 'px';
          this.shiftPreview2.style.top = dy + 'px';
        }
      } else {
        canvas.style.left = dx + 'px';
        canvas.style.top = dy + 'px';
      }

      this.panDx = dx;
      this.panDy = dy;
      this.fireEvent(new mxEventObject(mxEvent.PAN));
    }
  }

  zoomIn() {
    this.zoom(this.zoomFactor);
  }

  zoomOut() {
    this.zoom(1 / this.zoomFactor);
  }

  zoomActual() {
    if (this.view.scale == 1) {
      this.view.setTranslate(0, 0);
    } else {
      this.view.translate.x = 0;
      this.view.translate.y = 0;
      this.view.setScale(1);
    }
  }

  zoomTo(scale, center) {
    this.zoom(scale / this.view.scale, center);
  }

  center(horizontal, vertical, cx, cy) {
    horizontal = horizontal != null ? horizontal : true;
    vertical = vertical != null ? vertical : true;
    cx = cx != null ? cx : 0.5;
    cy = cy != null ? cy : 0.5;
    var hasScrollbars = mxUtils.hasScrollbars(this.container);
    var padding = 2 * this.getBorder();
    var cw = this.container.clientWidth - padding;
    var ch = this.container.clientHeight - padding;
    var bounds = this.getGraphBounds();
    var t = this.view.translate;
    var s = this.view.scale;
    var dx = horizontal ? cw - bounds.width : 0;
    var dy = vertical ? ch - bounds.height : 0;

    if (!hasScrollbars) {
      this.view.setTranslate(
        horizontal ? Math.floor(t.x - bounds.x * s + (dx * cx) / s) : t.x,
        vertical ? Math.floor(t.y - bounds.y * s + (dy * cy) / s) : t.y
      );
    } else {
      bounds.x -= t.x;
      bounds.y -= t.y;
      var sw = this.container.scrollWidth;
      var sh = this.container.scrollHeight;

      if (sw > cw) {
        dx = 0;
      }

      if (sh > ch) {
        dy = 0;
      }

      this.view.setTranslate(Math.floor(dx / 2 - bounds.x), Math.floor(dy / 2 - bounds.y));
      this.container.scrollLeft = (sw - cw) / 2;
      this.container.scrollTop = (sh - ch) / 2;
    }
  }

  zoom(factor, center) {
    center = center != null ? center : this.centerZoom;
    var scale = Math.round(this.view.scale * factor * 100) / 100;
    var state = this.view.getState(this.getSelectionCell());
    factor = scale / this.view.scale;

    if (this.keepSelectionVisibleOnZoom && state != null) {
      var rect = new mxRectangle(state.x * factor, state.y * factor, state.width * factor, state.height * factor);
      this.view.scale = scale;

      if (!this.scrollRectToVisible(rect)) {
        this.view.revalidate();
        this.view.setScale(scale);
      }
    } else {
      var hasScrollbars = mxUtils.hasScrollbars(this.container);

      if (center && !hasScrollbars) {
        var dx = this.container.offsetWidth;
        var dy = this.container.offsetHeight;

        if (factor > 1) {
          var f = (factor - 1) / (scale * 2);
          dx *= -f;
          dy *= -f;
        } else {
          var f = (1 / factor - 1) / (this.view.scale * 2);
          dx *= f;
          dy *= f;
        }

        this.view.scaleAndTranslate(scale, this.view.translate.x + dx, this.view.translate.y + dy);
      } else {
        var tx = this.view.translate.x;
        var ty = this.view.translate.y;
        var sl = this.container.scrollLeft;
        var st = this.container.scrollTop;
        this.view.setScale(scale);

        if (hasScrollbars) {
          var dx = 0;
          var dy = 0;

          if (center) {
            dx = (this.container.offsetWidth * (factor - 1)) / 2;
            dy = (this.container.offsetHeight * (factor - 1)) / 2;
          }

          this.container.scrollLeft = (this.view.translate.x - tx) * this.view.scale + Math.round(sl * factor + dx);
          this.container.scrollTop = (this.view.translate.y - ty) * this.view.scale + Math.round(st * factor + dy);
        }
      }
    }
  }

  zoomToRect(rect) {
    var scaleX = this.container.clientWidth / rect.width;
    var scaleY = this.container.clientHeight / rect.height;
    var aspectFactor = scaleX / scaleY;
    rect.x = Math.max(0, rect.x);
    rect.y = Math.max(0, rect.y);
    var rectRight = Math.min(this.container.scrollWidth, rect.x + rect.width);
    var rectBottom = Math.min(this.container.scrollHeight, rect.y + rect.height);
    rect.width = rectRight - rect.x;
    rect.height = rectBottom - rect.y;

    if (aspectFactor < 1.0) {
      var newHeight = rect.height / aspectFactor;
      var deltaHeightBuffer = (newHeight - rect.height) / 2.0;
      rect.height = newHeight;
      var upperBuffer = Math.min(rect.y, deltaHeightBuffer);
      rect.y = rect.y - upperBuffer;
      rectBottom = Math.min(this.container.scrollHeight, rect.y + rect.height);
      rect.height = rectBottom - rect.y;
    } else {
      var newWidth = rect.width * aspectFactor;
      var deltaWidthBuffer = (newWidth - rect.width) / 2.0;
      rect.width = newWidth;
      var leftBuffer = Math.min(rect.x, deltaWidthBuffer);
      rect.x = rect.x - leftBuffer;
      rectRight = Math.min(this.container.scrollWidth, rect.x + rect.width);
      rect.width = rectRight - rect.x;
    }

    var scale = this.container.clientWidth / rect.width;
    var newScale = this.view.scale * scale;

    if (!mxUtils.hasScrollbars(this.container)) {
      this.view.scaleAndTranslate(
        newScale,
        this.view.translate.x - rect.x / this.view.scale,
        this.view.translate.y - rect.y / this.view.scale
      );
    } else {
      this.view.setScale(newScale);
      this.container.scrollLeft = Math.round(rect.x * scale);
      this.container.scrollTop = Math.round(rect.y * scale);
    }
  }

  scrollCellToVisible(cell, center) {
    var x = -this.view.translate.x;
    var y = -this.view.translate.y;
    var state = this.view.getState(cell);

    if (state != null) {
      var bounds = new mxRectangle(x + state.x, y + state.y, state.width, state.height);

      if (center && this.container != null) {
        var w = this.container.clientWidth;
        var h = this.container.clientHeight;
        bounds.x = bounds.getCenterX() - w / 2;
        bounds.width = w;
        bounds.y = bounds.getCenterY() - h / 2;
        bounds.height = h;
      }

      var tr = new mxPoint(this.view.translate.x, this.view.translate.y);

      if (this.scrollRectToVisible(bounds)) {
        var tr2 = new mxPoint(this.view.translate.x, this.view.translate.y);
        this.view.translate.x = tr.x;
        this.view.translate.y = tr.y;
        this.view.setTranslate(tr2.x, tr2.y);
      }
    }
  }

  scrollRectToVisible(rect) {
    var isChanged = false;

    if (rect != null) {
      var w = this.container.offsetWidth;
      var h = this.container.offsetHeight;
      var widthLimit = Math.min(w, rect.width);
      var heightLimit = Math.min(h, rect.height);

      if (mxUtils.hasScrollbars(this.container)) {
        var c = this.container;
        rect.x += this.view.translate.x;
        rect.y += this.view.translate.y;
        var dx = c.scrollLeft - rect.x;
        var ddx = Math.max(dx - c.scrollLeft, 0);

        if (dx > 0) {
          c.scrollLeft -= dx + 2;
        } else {
          dx = rect.x + widthLimit - c.scrollLeft - c.clientWidth;

          if (dx > 0) {
            c.scrollLeft += dx + 2;
          }
        }

        var dy = c.scrollTop - rect.y;
        var ddy = Math.max(0, dy - c.scrollTop);

        if (dy > 0) {
          c.scrollTop -= dy + 2;
        } else {
          dy = rect.y + heightLimit - c.scrollTop - c.clientHeight;

          if (dy > 0) {
            c.scrollTop += dy + 2;
          }
        }

        if (!this.useScrollbarsForPanning && (ddx != 0 || ddy != 0)) {
          this.view.setTranslate(ddx, ddy);
        }
      } else {
        var x = -this.view.translate.x;
        var y = -this.view.translate.y;
        var s = this.view.scale;

        if (rect.x + widthLimit > x + w) {
          this.view.translate.x -= (rect.x + widthLimit - w - x) / s;
          isChanged = true;
        }

        if (rect.y + heightLimit > y + h) {
          this.view.translate.y -= (rect.y + heightLimit - h - y) / s;
          isChanged = true;
        }

        if (rect.x < x) {
          this.view.translate.x += (x - rect.x) / s;
          isChanged = true;
        }

        if (rect.y < y) {
          this.view.translate.y += (y - rect.y) / s;
          isChanged = true;
        }

        if (isChanged) {
          this.view.refresh();

          if (this.selectionCellsHandler != null) {
            this.selectionCellsHandler.refresh();
          }
        }
      }
    }

    return isChanged;
  }

  getCellGeometry(cell) {
    return this.model.getGeometry(cell);
  }

  isCellVisible(cell) {
    return this.model.isVisible(cell);
  }

  isCellCollapsed(cell) {
    return this.model.isCollapsed(cell);
  }

  isCellConnectable(cell) {
    return this.model.isConnectable(cell);
  }

  isOrthogonal(edge) {
    var orthogonal = edge.style[mxConstants.STYLE_ORTHOGONAL];

    if (orthogonal != null) {
      return orthogonal;
    }

    var tmp = this.view.getEdgeStyle(edge);
    return (
      tmp == mxEdgeStyle.SegmentConnector ||
      tmp == mxEdgeStyle.ElbowConnector ||
      tmp == mxEdgeStyle.SideToSide ||
      tmp == mxEdgeStyle.TopToBottom ||
      tmp == mxEdgeStyle.EntityRelation ||
      tmp == mxEdgeStyle.OrthConnector
    );
  }

  isLoop(state) {
    var src = state.getVisibleTerminalState(true);
    var trg = state.getVisibleTerminalState(false);
    return src != null && src == trg;
  }

  isCloneEvent(evt) {
    return mxEvent.isControlDown(evt);
  }

  isTransparentClickEvent(evt) {
    return false;
  }

  isToggleEvent(evt) {
    return mxClient.IS_MAC ? mxEvent.isMetaDown(evt) : mxEvent.isControlDown(evt);
  }

  isGridEnabledEvent(evt) {
    return evt != null && !mxEvent.isAltDown(evt);
  }

  isConstrainedEvent(evt) {
    return mxEvent.isShiftDown(evt);
  }

  isIgnoreTerminalEvent(evt) {
    return false;
  }

  validationAlert(message) {
    mxUtils.alert(message);
  }

  isEdgeValid(edge, source, target) {
    return this.getEdgeValidationError(edge, source, target) == null;
  }

  getEdgeValidationError(edge, source, target) {
    if (edge != null && !this.isAllowDanglingEdges() && (source == null || target == null)) {
      return '';
    }

    if (edge != null && this.model.getTerminal(edge, true) == null && this.model.getTerminal(edge, false) == null) {
      return null;
    }

    if (!this.allowLoops && source == target && source != null) {
      return '';
    }

    if (!this.isValidConnection(source, target)) {
      return '';
    }

    if (source != null && target != null) {
      var error = '';

      if (!this.multigraph) {
        var tmp = this.model.getEdgesBetween(source, target, true);

        if (tmp.length > 1 || (tmp.length == 1 && tmp[0] != edge)) {
          error += (mxResources.get(this.alreadyConnectedResource) || this.alreadyConnectedResource) + '\n';
        }
      }

      var sourceOut = this.model.getDirectedEdgeCount(source, true, edge);
      var targetIn = this.model.getDirectedEdgeCount(target, false, edge);

      if (this.multiplicities != null) {
        for (var i = 0; i < this.multiplicities.length; i++) {
          var err = this.multiplicities[i].check(this, edge, source, target, sourceOut, targetIn);

          if (err != null) {
            error += err;
          }
        }
      }

      var err = this.validateEdge(edge, source, target);

      if (err != null) {
        error += err;
      }

      return error.length > 0 ? error : null;
    }

    return this.allowDanglingEdges ? null : '';
  }

  validateEdge(edge, source, target) {
    return null;
  }

  validateGraph(cell, context) {
    cell = cell != null ? cell : this.model.getRoot();
    context = context != null ? context : new Object();
    var isValid = true;
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var tmp = this.model.getChildAt(cell, i);
      var ctx = context;

      if (this.isValidRoot(tmp)) {
        ctx = new Object();
      }

      var warn = this.validateGraph(tmp, ctx);

      if (warn != null) {
        this.setCellWarning(tmp, warn.replace(/\n/g, '<br>'));
      } else {
        this.setCellWarning(tmp, null);
      }

      isValid = isValid && warn == null;
    }

    var warning = '';

    if (this.isCellCollapsed(cell) && !isValid) {
      warning +=
        (mxResources.get(this.containsValidationErrorsResource) || this.containsValidationErrorsResource) + '\n';
    }

    if (this.model.isEdge(cell)) {
      warning +=
        this.getEdgeValidationError(cell, this.model.getTerminal(cell, true), this.model.getTerminal(cell, false)) ||
        '';
    } else {
      warning += this.getCellValidationError(cell) || '';
    }

    var err = this.validateCell(cell, context);

    if (err != null) {
      warning += err;
    }

    if (this.model.getParent(cell) == null) {
      this.view.validate();
    }

    return warning.length > 0 || !isValid ? warning : null;
  }

  getCellValidationError(cell) {
    var outCount = this.model.getDirectedEdgeCount(cell, true);
    var inCount = this.model.getDirectedEdgeCount(cell, false);
    var value = this.model.getValue(cell);
    var error = '';

    if (this.multiplicities != null) {
      for (var i = 0; i < this.multiplicities.length; i++) {
        var rule = this.multiplicities[i];

        if (
          rule.source &&
          mxUtils.isNode(value, rule.type, rule.attr, rule.value) &&
          (outCount > rule.max || outCount < rule.min)
        ) {
          error += rule.countError + '\n';
        } else if (
          !rule.source &&
          mxUtils.isNode(value, rule.type, rule.attr, rule.value) &&
          (inCount > rule.max || inCount < rule.min)
        ) {
          error += rule.countError + '\n';
        }
      }
    }

    return error.length > 0 ? error : null;
  }

  validateCell(cell, context) {
    return null;
  }

  getBackgroundImage() {
    return this.backgroundImage;
  }

  setBackgroundImage(image) {
    this.backgroundImage = image;
  }

  getFoldingImage(state) {
    if (state != null && this.foldingEnabled && !this.getModel().isEdge(state.cell)) {
      var tmp = this.isCellCollapsed(state.cell);

      if (this.isCellFoldable(state.cell, !tmp)) {
        return tmp ? this.collapsedImage : this.expandedImage;
      }
    }

    return null;
  }

  convertValueToString(cell) {
    var value = this.model.getValue(cell);

    if (value != null) {
      if (mxUtils.isNode(value)) {
        return value.nodeName;
      } else if (typeof value.toString == 'function') {
        return value.toString();
      }
    }

    return '';
  }

  getLabel(cell) {
    var result = '';

    if (this.labelsVisible && cell != null) {
      var style = this.getCurrentCellStyle(cell);

      if (!mxUtils.getValue(style, mxConstants.STYLE_NOLABEL, false)) {
        result = this.convertValueToString(cell);
      }
    }

    return result;
  }

  isHtmlLabel(cell) {
    return this.isHtmlLabels();
  }

  isHtmlLabels() {
    return this.htmlLabels;
  }

  setHtmlLabels(value) {
    this.htmlLabels = value;
  }

  isWrapping(cell) {
    return this.getCurrentCellStyle(cell)[mxConstants.STYLE_WHITE_SPACE] == 'wrap';
  }

  isLabelClipped(cell) {
    return this.getCurrentCellStyle(cell)[mxConstants.STYLE_OVERFLOW] == 'hidden';
  }

  getTooltip(state, node, x, y) {
    var tip = null;

    if (state != null) {
      if (state.control != null && (node == state.control.node || node.parentNode == state.control.node)) {
        tip = this.collapseExpandResource;
        tip = mxUtils.htmlEntities(mxResources.get(tip) || tip).replace(/\\n/g, '<br>');
      }

      if (tip == null && state.overlays != null) {
        state.overlays.visit(function (id, shape) {
          if (tip == null && (node == shape.node || node.parentNode == shape.node)) {
            tip = shape.overlay.toString();
          }
        });
      }

      if (tip == null) {
        var handler = this.selectionCellsHandler.getHandler(state.cell);

        if (handler != null && typeof handler.getTooltipForNode == 'function') {
          tip = handler.getTooltipForNode(node);
        }
      }

      if (tip == null) {
        tip = this.getTooltipForCell(state.cell);
      }
    }

    return tip;
  }

  getTooltipForCell(cell) {
    var tip = null;

    if (cell != null && cell.getTooltip != null) {
      tip = cell.getTooltip();
    } else {
      tip = this.convertValueToString(cell);
    }

    return tip;
  }

  getLinkForCell(cell) {
    return null;
  }

  getCursorForMouseEvent(me) {
    return this.getCursorForCell(me.getCell());
  }

  getCursorForCell(cell) {
    return null;
  }

  getStartSize(swimlane, ignoreState) {
    var result = new mxRectangle();
    var style = this.getCurrentCellStyle(swimlane, ignoreState);
    var size = parseInt(mxUtils.getValue(style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));

    if (mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true)) {
      result.height = size;
    } else {
      result.width = size;
    }

    return result;
  }

  getSwimlaneDirection(style) {
    var dir = mxUtils.getValue(style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST);
    var flipH = mxUtils.getValue(style, mxConstants.STYLE_FLIPH, 0) == 1;
    var flipV = mxUtils.getValue(style, mxConstants.STYLE_FLIPV, 0) == 1;
    var h = mxUtils.getValue(style, mxConstants.STYLE_HORIZONTAL, true);
    var n = h ? 0 : 3;

    if (dir == mxConstants.DIRECTION_NORTH) {
      n--;
    } else if (dir == mxConstants.DIRECTION_WEST) {
      n += 2;
    } else if (dir == mxConstants.DIRECTION_SOUTH) {
      n += 1;
    }

    var mod = mxUtils.mod(n, 2);

    if (flipH && mod == 1) {
      n += 2;
    }

    if (flipV && mod == 0) {
      n += 2;
    }

    return [
      mxConstants.DIRECTION_NORTH,
      mxConstants.DIRECTION_EAST,
      mxConstants.DIRECTION_SOUTH,
      mxConstants.DIRECTION_WEST
    ][mxUtils.mod(n, 4)];
  }

  getActualStartSize(swimlane, ignoreState) {
    var result = new mxRectangle();

    if (this.isSwimlane(swimlane, ignoreState)) {
      var style = this.getCurrentCellStyle(swimlane, ignoreState);
      var size = parseInt(mxUtils.getValue(style, mxConstants.STYLE_STARTSIZE, mxConstants.DEFAULT_STARTSIZE));
      var dir = this.getSwimlaneDirection(style);

      if (dir == mxConstants.DIRECTION_NORTH) {
        result.y = size;
      } else if (dir == mxConstants.DIRECTION_WEST) {
        result.x = size;
      } else if (dir == mxConstants.DIRECTION_SOUTH) {
        result.height = size;
      } else {
        result.width = size;
      }
    }

    return result;
  }

  getImage(state) {
    return state != null && state.style != null ? state.style[mxConstants.STYLE_IMAGE] : null;
  }

  isTransparentState(state) {
    var result = false;

    if (state != null) {
      var stroke = mxUtils.getValue(state.style, mxConstants.STYLE_STROKECOLOR, mxConstants.NONE);
      var fill = mxUtils.getValue(state.style, mxConstants.STYLE_FILLCOLOR, mxConstants.NONE);
      result = stroke == mxConstants.NONE && fill == mxConstants.NONE && this.getImage(state) == null;
    }

    return result;
  }

  getVerticalAlign(state) {
    return state != null && state.style != null
      ? state.style[mxConstants.STYLE_VERTICAL_ALIGN] || mxConstants.ALIGN_MIDDLE
      : null;
  }

  getIndicatorColor(state) {
    return state != null && state.style != null ? state.style[mxConstants.STYLE_INDICATOR_COLOR] : null;
  }

  getIndicatorGradientColor(state) {
    return state != null && state.style != null ? state.style[mxConstants.STYLE_INDICATOR_GRADIENTCOLOR] : null;
  }

  getIndicatorShape(state) {
    return state != null && state.style != null ? state.style[mxConstants.STYLE_INDICATOR_SHAPE] : null;
  }

  getIndicatorImage(state) {
    return state != null && state.style != null ? state.style[mxConstants.STYLE_INDICATOR_IMAGE] : null;
  }

  getBorder() {
    return this.border;
  }

  setBorder(value) {
    this.border = value;
  }

  isSwimlane(cell, ignoreState) {
    if (cell != null && this.model.getParent(cell) != this.model.getRoot() && !this.model.isEdge(cell)) {
      return this.getCurrentCellStyle(cell, ignoreState)[mxConstants.STYLE_SHAPE] == mxConstants.SHAPE_SWIMLANE;
    }

    return false;
  }

  isResizeContainer() {
    return this.resizeContainer;
  }

  setResizeContainer(value) {
    this.resizeContainer = value;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  isEscapeEnabled() {
    return this.escapeEnabled;
  }

  setEscapeEnabled(value) {
    this.escapeEnabled = value;
  }

  isInvokesStopCellEditing() {
    return this.invokesStopCellEditing;
  }

  setInvokesStopCellEditing(value) {
    this.invokesStopCellEditing = value;
  }

  isEnterStopsCellEditing() {
    return this.enterStopsCellEditing;
  }

  setEnterStopsCellEditing(value) {
    this.enterStopsCellEditing = value;
  }

  isCellLocked(cell) {
    var geometry = this.model.getGeometry(cell);
    return this.isCellsLocked() || (geometry != null && this.model.isVertex(cell) && geometry.relative);
  }

  isCellsLocked() {
    return this.cellsLocked;
  }

  setCellsLocked(value) {
    this.cellsLocked = value;
  }

  getCloneableCells(cells) {
    return this.model.filterCells(cells, (cell) => {
      return this.isCellCloneable(cell);
    });
  }

  isCellCloneable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isCellsCloneable() && style[mxConstants.STYLE_CLONEABLE] != 0;
  }

  isCellsCloneable() {
    return this.cellsCloneable;
  }

  setCellsCloneable(value) {
    this.cellsCloneable = value;
  }

  getExportableCells(cells) {
    return this.model.filterCells(cells, (cell) => {
      return this.canExportCell(cell);
    });
  }

  canExportCell(cell) {
    return this.exportEnabled;
  }

  getImportableCells(cells) {
    return this.model.filterCells(cells, (cell) => {
      return this.canImportCell(cell);
    });
  }

  canImportCell(cell) {
    return this.importEnabled;
  }

  isCellSelectable(cell) {
    return this.isCellsSelectable();
  }

  isCellsSelectable() {
    return this.cellsSelectable;
  }

  setCellsSelectable(value) {
    this.cellsSelectable = value;
  }

  getDeletableCells(cells) {
    return this.model.filterCells(cells, (cell) => {
      return this.isCellDeletable(cell);
    });
  }

  isCellDeletable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isCellsDeletable() && style[mxConstants.STYLE_DELETABLE] != 0;
  }

  isCellsDeletable() {
    return this.cellsDeletable;
  }

  setCellsDeletable(value) {
    this.cellsDeletable = value;
  }

  isLabelMovable(cell) {
    return (
      !this.isCellLocked(cell) &&
      ((this.model.isEdge(cell) && this.edgeLabelsMovable) || (this.model.isVertex(cell) && this.vertexLabelsMovable))
    );
  }

  isCellRotatable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return style[mxConstants.STYLE_ROTATABLE] != 0;
  }

  getMovableCells(cells) {
    return this.model.filterCells(cells, (cell) => {
      return this.isCellMovable(cell);
    });
  }

  isCellMovable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isCellsMovable() && !this.isCellLocked(cell) && style[mxConstants.STYLE_MOVABLE] != 0;
  }

  isCellsMovable() {
    return this.cellsMovable;
  }

  setCellsMovable(value) {
    this.cellsMovable = value;
  }

  isGridEnabled() {
    return this.gridEnabled;
  }

  setGridEnabled(value) {
    this.gridEnabled = value;
  }

  isPortsEnabled() {
    return this.portsEnabled;
  }

  setPortsEnabled(value) {
    this.portsEnabled = value;
  }

  getGridSize() {
    return this.gridSize;
  }

  setGridSize(value) {
    this.gridSize = value;
  }

  getTolerance() {
    return this.tolerance;
  }

  setTolerance(value) {
    this.tolerance = value;
  }

  isVertexLabelsMovable() {
    return this.vertexLabelsMovable;
  }

  setVertexLabelsMovable(value) {
    this.vertexLabelsMovable = value;
  }

  isEdgeLabelsMovable() {
    return this.edgeLabelsMovable;
  }

  setEdgeLabelsMovable(value) {
    this.edgeLabelsMovable = value;
  }

  isSwimlaneNesting() {
    return this.swimlaneNesting;
  }

  setSwimlaneNesting(value) {
    this.swimlaneNesting = value;
  }

  isSwimlaneSelectionEnabled() {
    return this.swimlaneSelectionEnabled;
  }

  setSwimlaneSelectionEnabled(value) {
    this.swimlaneSelectionEnabled = value;
  }

  isMultigraph() {
    return this.multigraph;
  }

  setMultigraph(value) {
    this.multigraph = value;
  }

  isAllowLoops() {
    return this.allowLoops;
  }

  setAllowDanglingEdges(value) {
    this.allowDanglingEdges = value;
  }

  isAllowDanglingEdges() {
    return this.allowDanglingEdges;
  }

  setConnectableEdges(value) {
    this.connectableEdges = value;
  }

  isConnectableEdges() {
    return this.connectableEdges;
  }

  setCloneInvalidEdges(value) {
    this.cloneInvalidEdges = value;
  }

  isCloneInvalidEdges() {
    return this.cloneInvalidEdges;
  }

  setAllowLoops(value) {
    this.allowLoops = value;
  }

  isDisconnectOnMove() {
    return this.disconnectOnMove;
  }

  setDisconnectOnMove(value) {
    this.disconnectOnMove = value;
  }

  isDropEnabled() {
    return this.dropEnabled;
  }

  setDropEnabled(value) {
    this.dropEnabled = value;
  }

  isSplitEnabled() {
    return this.splitEnabled;
  }

  setSplitEnabled(value) {
    this.splitEnabled = value;
  }

  isCellResizable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return (
      this.isCellsResizable() &&
      !this.isCellLocked(cell) &&
      mxUtils.getValue(style, mxConstants.STYLE_RESIZABLE, '1') != '0'
    );
  }

  isCellsResizable() {
    return this.cellsResizable;
  }

  setCellsResizable(value) {
    this.cellsResizable = value;
  }

  isTerminalPointMovable(cell, source) {
    return true;
  }

  isCellBendable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isCellsBendable() && !this.isCellLocked(cell) && style[mxConstants.STYLE_BENDABLE] != 0;
  }

  isCellsBendable() {
    return this.cellsBendable;
  }

  setCellsBendable(value) {
    this.cellsBendable = value;
  }

  isCellEditable(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isCellsEditable() && !this.isCellLocked(cell) && style[mxConstants.STYLE_EDITABLE] != 0;
  }

  isCellsEditable() {
    return this.cellsEditable;
  }

  setCellsEditable(value) {
    this.cellsEditable = value;
  }

  isCellDisconnectable(cell, terminal, source) {
    return this.isCellsDisconnectable() && !this.isCellLocked(cell);
  }

  isCellsDisconnectable() {
    return this.cellsDisconnectable;
  }

  setCellsDisconnectable(value) {
    this.cellsDisconnectable = value;
  }

  isValidSource(cell) {
    return (
      (cell == null && this.allowDanglingEdges) ||
      (cell != null && (!this.model.isEdge(cell) || this.connectableEdges) && this.isCellConnectable(cell))
    );
  }

  isValidTarget(cell) {
    return this.isValidSource(cell);
  }

  isValidConnection(source, target) {
    return this.isValidSource(source) && this.isValidTarget(target);
  }

  setConnectable(connectable) {
    this.connectionHandler.setEnabled(connectable);
  }

  isConnectable() {
    return this.connectionHandler.isEnabled();
  }

  setTooltips(enabled) {
    this.tooltipHandler.setEnabled(enabled);
  }

  setPanning(enabled) {
    this.panningHandler.panningEnabled = enabled;
  }

  isEditing(cell) {
    if (this.cellEditor != null) {
      var editingCell = this.cellEditor.getEditingCell();
      return cell == null ? editingCell != null : cell == editingCell;
    }

    return false;
  }

  isAutoSizeCell(cell) {
    var style = this.getCurrentCellStyle(cell);
    return this.isAutoSizeCells() || style[mxConstants.STYLE_AUTOSIZE] == 1;
  }

  isAutoSizeCells() {
    return this.autoSizeCells;
  }

  setAutoSizeCells(value) {
    this.autoSizeCells = value;
  }

  isExtendParent(cell) {
    return !this.getModel().isEdge(cell) && this.isExtendParents();
  }

  isExtendParents() {
    return this.extendParents;
  }

  setExtendParents(value) {
    this.extendParents = value;
  }

  isExtendParentsOnAdd(cell) {
    return this.extendParentsOnAdd;
  }

  setExtendParentsOnAdd(value) {
    this.extendParentsOnAdd = value;
  }

  isExtendParentsOnMove() {
    return this.extendParentsOnMove;
  }

  setExtendParentsOnMove(value) {
    this.extendParentsOnMove = value;
  }

  isRecursiveResize(state) {
    return this.recursiveResize;
  }

  setRecursiveResize(value) {
    this.recursiveResize = value;
  }

  isConstrainChild(cell) {
    return this.isConstrainChildren() && !this.getModel().isEdge(this.getModel().getParent(cell));
  }

  isConstrainChildren() {
    return this.constrainChildren;
  }

  setConstrainChildren(value) {
    this.constrainChildren = value;
  }

  isConstrainRelativeChildren() {
    return this.constrainRelativeChildren;
  }

  setConstrainRelativeChildren(value) {
    this.constrainRelativeChildren = value;
  }

  isAllowNegativeCoordinates() {
    return this.allowNegativeCoordinates;
  }

  setAllowNegativeCoordinates(value) {
    this.allowNegativeCoordinates = value;
  }

  getOverlap(cell) {
    return this.isAllowOverlapParent(cell) ? this.defaultOverlap : 0;
  }

  isAllowOverlapParent(cell) {
    return false;
  }

  getFoldableCells(cells, collapse) {
    return this.model.filterCells(cells, (cell) => {
      return this.isCellFoldable(cell, collapse);
    });
  }

  isCellFoldable(cell, collapse) {
    var style = this.getCurrentCellStyle(cell);
    return this.model.getChildCount(cell) > 0 && style[mxConstants.STYLE_FOLDABLE] != 0;
  }

  isValidDropTarget(cell, cells, evt) {
    return (
      cell != null &&
      ((this.isSplitEnabled() && this.isSplitTarget(cell, cells, evt)) ||
        (!this.model.isEdge(cell) &&
          (this.isSwimlane(cell) || (this.model.getChildCount(cell) > 0 && !this.isCellCollapsed(cell)))))
    );
  }

  isSplitTarget(target, cells, evt) {
    if (
      this.model.isEdge(target) &&
      cells != null &&
      cells.length == 1 &&
      this.isCellConnectable(cells[0]) &&
      this.getEdgeValidationError(target, this.model.getTerminal(target, true), cells[0]) == null
    ) {
      var src = this.model.getTerminal(target, true);
      var trg = this.model.getTerminal(target, false);
      return !this.model.isAncestor(cells[0], src) && !this.model.isAncestor(cells[0], trg);
    }

    return false;
  }

  getDropTarget(cells, evt, cell, clone) {
    if (!this.isSwimlaneNesting()) {
      for (var i = 0; i < cells.length; i++) {
        if (this.isSwimlane(cells[i])) {
          return null;
        }
      }
    }

    var pt = mxUtils.convertPoint(this.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
    pt.x -= this.panDx;
    pt.y -= this.panDy;
    var swimlane = this.getSwimlaneAt(pt.x, pt.y);

    if (cell == null) {
      cell = swimlane;
    } else if (swimlane != null) {
      var tmp = this.model.getParent(swimlane);

      while (tmp != null && this.isSwimlane(tmp) && tmp != cell) {
        tmp = this.model.getParent(tmp);
      }

      if (tmp == cell) {
        cell = swimlane;
      }
    }

    while (cell != null && !this.isValidDropTarget(cell, cells, evt) && !this.model.isLayer(cell)) {
      cell = this.model.getParent(cell);
    }

    if (clone == null || !clone) {
      var parent = cell;

      while (parent != null && mxUtils.indexOf(cells, parent) < 0) {
        parent = this.model.getParent(parent);
      }
    }

    return !this.model.isLayer(cell) && parent == null ? cell : null;
  }

  getDefaultParent() {
    var parent = this.getCurrentRoot();

    if (parent == null) {
      parent = this.defaultParent;

      if (parent == null) {
        var root = this.model.getRoot();
        parent = this.model.getChildAt(root, 0);
      }
    }

    return parent;
  }

  setDefaultParent(cell) {
    this.defaultParent = cell;
  }

  getSwimlane(cell) {
    while (cell != null && !this.isSwimlane(cell)) {
      cell = this.model.getParent(cell);
    }

    return cell;
  }

  getSwimlaneAt(x, y, parent) {
    if (parent == null) {
      parent = this.getCurrentRoot();

      if (parent == null) {
        parent = this.model.getRoot();
      }
    }

    if (parent != null) {
      var childCount = this.model.getChildCount(parent);

      for (var i = 0; i < childCount; i++) {
        var child = this.model.getChildAt(parent, i);

        if (child != null) {
          var result = this.getSwimlaneAt(x, y, child);

          if (result != null) {
            return result;
          } else if (this.isCellVisible(child) && this.isSwimlane(child)) {
            var state = this.view.getState(child);

            if (this.intersects(state, x, y)) {
              return child;
            }
          }
        }
      }
    }

    return null;
  }

  getCellAt(x, y, parent, vertices, edges, ignoreFn) {
    vertices = vertices != null ? vertices : true;
    edges = edges != null ? edges : true;

    if (parent == null) {
      parent = this.getCurrentRoot();

      if (parent == null) {
        parent = this.getModel().getRoot();
      }
    }

    if (parent != null) {
      var childCount = this.model.getChildCount(parent);

      for (var i = childCount - 1; i >= 0; i--) {
        var cell = this.model.getChildAt(parent, i);
        var result = this.getCellAt(x, y, cell, vertices, edges, ignoreFn);

        if (result != null) {
          return result;
        } else if (
          this.isCellVisible(cell) &&
          ((edges && this.model.isEdge(cell)) || (vertices && this.model.isVertex(cell)))
        ) {
          var state = this.view.getState(cell);

          if (state != null && (ignoreFn == null || !ignoreFn(state, x, y)) && this.intersects(state, x, y)) {
            return cell;
          }
        }
      }
    }

    return null;
  }

  intersects(state, x, y) {
    if (state != null) {
      var pts = state.absolutePoints;

      if (pts != null) {
        var t2 = this.tolerance * this.tolerance;
        var pt = pts[0];

        for (var i = 1; i < pts.length; i++) {
          var next = pts[i];
          var dist = mxUtils.ptSegDistSq(pt.x, pt.y, next.x, next.y, x, y);

          if (dist <= t2) {
            return true;
          }

          pt = next;
        }
      } else {
        var alpha = mxUtils.toRadians(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0);

        if (alpha != 0) {
          var cos = Math.cos(-alpha);
          var sin = Math.sin(-alpha);
          var cx = new mxPoint(state.getCenterX(), state.getCenterY());
          var pt = mxUtils.getRotatedPoint(new mxPoint(x, y), cos, sin, cx);
          x = pt.x;
          y = pt.y;
        }

        if (mxUtils.contains(state, x, y)) {
          return true;
        }
      }
    }

    return false;
  }

  hitsSwimlaneContent(swimlane, x, y) {
    var state = this.getView().getState(swimlane);
    var size = this.getStartSize(swimlane);

    if (state != null) {
      var scale = this.getView().getScale();
      x -= state.x;
      y -= state.y;

      if (size.width > 0 && x > 0 && x > size.width * scale) {
        return true;
      } else if (size.height > 0 && y > 0 && y > size.height * scale) {
        return true;
      }
    }

    return false;
  }

  getChildVertices(parent) {
    return this.getChildCells(parent, true, false);
  }

  getChildEdges(parent) {
    return this.getChildCells(parent, false, true);
  }

  getChildCells(parent, vertices, edges) {
    parent = parent != null ? parent : this.getDefaultParent();
    vertices = vertices != null ? vertices : false;
    edges = edges != null ? edges : false;
    var cells = this.model.getChildCells(parent, vertices, edges);
    var result = [];

    for (var i = 0; i < cells.length; i++) {
      if (this.isCellVisible(cells[i])) {
        result.push(cells[i]);
      }
    }

    return result;
  }

  getConnections(cell, parent) {
    return this.getEdges(cell, parent, true, true, false);
  }

  getIncomingEdges(cell, parent) {
    return this.getEdges(cell, parent, true, false, false);
  }

  getOutgoingEdges(cell, parent) {
    return this.getEdges(cell, parent, false, true, false);
  }

  getEdges(cell, parent, incoming, outgoing, includeLoops, recurse) {
    incoming = incoming != null ? incoming : true;
    outgoing = outgoing != null ? outgoing : true;
    includeLoops = includeLoops != null ? includeLoops : true;
    recurse = recurse != null ? recurse : false;
    var edges = [];
    var isCollapsed = this.isCellCollapsed(cell);
    var childCount = this.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = this.model.getChildAt(cell, i);

      if (isCollapsed || !this.isCellVisible(child)) {
        edges = edges.concat(this.model.getEdges(child, incoming, outgoing));
      }
    }

    edges = edges.concat(this.model.getEdges(cell, incoming, outgoing));
    var result = [];

    for (var i = 0; i < edges.length; i++) {
      var state = this.view.getState(edges[i]);
      var source = state != null ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
      var target = state != null ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);

      if (
        (includeLoops && source == target) ||
        (source != target &&
          ((incoming && target == cell && (parent == null || this.isValidAncestor(source, parent, recurse))) ||
            (outgoing && source == cell && (parent == null || this.isValidAncestor(target, parent, recurse)))))
      ) {
        result.push(edges[i]);
      }
    }

    return result;
  }

  isValidAncestor(cell, parent, recurse) {
    return recurse ? this.model.isAncestor(parent, cell) : this.model.getParent(cell) == parent;
  }

  getOpposites(edges, terminal, sources, targets) {
    sources = sources != null ? sources : true;
    targets = targets != null ? targets : true;
    var terminals = [];
    var dict = new mxDictionary();

    if (edges != null) {
      for (var i = 0; i < edges.length; i++) {
        var state = this.view.getState(edges[i]);
        var source = state != null ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
        var target = state != null ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);

        if (source == terminal && target != null && target != terminal && targets) {
          if (!dict.get(target)) {
            dict.put(target, true);
            terminals.push(target);
          }
        } else if (target == terminal && source != null && source != terminal && sources) {
          if (!dict.get(source)) {
            dict.put(source, true);
            terminals.push(source);
          }
        }
      }
    }

    return terminals;
  }

  getEdgesBetween(source, target, directed) {
    directed = directed != null ? directed : false;
    var edges = this.getEdges(source);
    var result = [];

    for (var i = 0; i < edges.length; i++) {
      var state = this.view.getState(edges[i]);
      var src = state != null ? state.getVisibleTerminal(true) : this.view.getVisibleTerminal(edges[i], true);
      var trg = state != null ? state.getVisibleTerminal(false) : this.view.getVisibleTerminal(edges[i], false);

      if ((src == source && trg == target) || (!directed && src == target && trg == source)) {
        result.push(edges[i]);
      }
    }

    return result;
  }

  getPointForEvent(evt, addOffset) {
    var p = mxUtils.convertPoint(this.container, mxEvent.getClientX(evt), mxEvent.getClientY(evt));
    var s = this.view.scale;
    var tr = this.view.translate;
    var off = addOffset != false ? this.gridSize / 2 : 0;
    p.x = this.snap(p.x / s - tr.x - off);
    p.y = this.snap(p.y / s - tr.y - off);
    return p;
  }

  getCells(x, y, width, height, parent, result) {
    result = result != null ? result : [];

    if (width > 0 || height > 0) {
      var model = this.getModel();
      var right = x + width;
      var bottom = y + height;

      if (parent == null) {
        parent = this.getCurrentRoot();

        if (parent == null) {
          parent = model.getRoot();
        }
      }

      if (parent != null) {
        var childCount = model.getChildCount(parent);

        for (var i = 0; i < childCount; i++) {
          var cell = model.getChildAt(parent, i);
          var state = this.view.getState(cell);

          if (state != null && this.isCellVisible(cell)) {
            var deg = mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0;
            var box = state;

            if (deg != 0) {
              box = mxUtils.getBoundingBox(box, deg);
            }

            if (
              (model.isEdge(cell) || model.isVertex(cell)) &&
              box.x >= x &&
              box.y + box.height <= bottom &&
              box.y >= y &&
              box.x + box.width <= right
            ) {
              result.push(cell);
            } else {
              this.getCells(x, y, width, height, cell, result);
            }
          }
        }
      }
    }

    return result;
  }

  getCellsBeyond(x0, y0, parent, rightHalfpane, bottomHalfpane) {
    var result = [];

    if (rightHalfpane || bottomHalfpane) {
      if (parent == null) {
        parent = this.getDefaultParent();
      }

      if (parent != null) {
        var childCount = this.model.getChildCount(parent);

        for (var i = 0; i < childCount; i++) {
          var child = this.model.getChildAt(parent, i);
          var state = this.view.getState(child);

          if (this.isCellVisible(child) && state != null) {
            if ((!rightHalfpane || state.x >= x0) && (!bottomHalfpane || state.y >= y0)) {
              result.push(child);
            }
          }
        }
      }
    }

    return result;
  }

  findTreeRoots(parent, isolate, invert) {
    isolate = isolate != null ? isolate : false;
    invert = invert != null ? invert : false;
    var roots = [];

    if (parent != null) {
      var model = this.getModel();
      var childCount = model.getChildCount(parent);
      var best = null;
      var maxDiff = 0;

      for (var i = 0; i < childCount; i++) {
        var cell = model.getChildAt(parent, i);

        if (this.model.isVertex(cell) && this.isCellVisible(cell)) {
          var conns = this.getConnections(cell, isolate ? parent : null);
          var fanOut = 0;
          var fanIn = 0;

          for (var j = 0; j < conns.length; j++) {
            var src = this.view.getVisibleTerminal(conns[j], true);

            if (src == cell) {
              fanOut++;
            } else {
              fanIn++;
            }
          }

          if ((invert && fanOut == 0 && fanIn > 0) || (!invert && fanIn == 0 && fanOut > 0)) {
            roots.push(cell);
          }

          var diff = invert ? fanIn - fanOut : fanOut - fanIn;

          if (diff > maxDiff) {
            maxDiff = diff;
            best = cell;
          }
        }
      }

      if (roots.length == 0 && best != null) {
        roots.push(best);
      }
    }

    return roots;
  }

  traverse(vertex, directed, func, edge, visited, inverse) {
    if (func != null && vertex != null) {
      directed = directed != null ? directed : true;
      inverse = inverse != null ? inverse : false;
      visited = visited || new mxDictionary();

      if (!visited.get(vertex)) {
        visited.put(vertex, true);
        var result = func(vertex, edge);

        if (result == null || result) {
          var edgeCount = this.model.getEdgeCount(vertex);

          if (edgeCount > 0) {
            for (var i = 0; i < edgeCount; i++) {
              var e = this.model.getEdgeAt(vertex, i);
              var isSource = this.model.getTerminal(e, true) == vertex;

              if (!directed || !inverse == isSource) {
                var next = this.model.getTerminal(e, !isSource);
                this.traverse(next, directed, func, e, visited, inverse);
              }
            }
          }
        }
      }
    }
  }

  isCellSelected(cell) {
    return this.getSelectionModel().isSelected(cell);
  }

  isSelectionEmpty() {
    return this.getSelectionModel().isEmpty();
  }

  clearSelection() {
    return this.getSelectionModel().clear();
  }

  getSelectionCount() {
    return this.getSelectionModel().cells.length;
  }

  getSelectionCell() {
    return this.getSelectionModel().cells[0];
  }

  getSelectionCells() {
    return this.getSelectionModel().cells.slice();
  }

  setSelectionCell(cell) {
    this.getSelectionModel().setCell(cell);
  }

  setSelectionCells(cells) {
    this.getSelectionModel().setCells(cells);
  }

  addSelectionCell(cell) {
    this.getSelectionModel().addCell(cell);
  }

  addSelectionCells(cells) {
    this.getSelectionModel().addCells(cells);
  }

  removeSelectionCell(cell) {
    this.getSelectionModel().removeCell(cell);
  }

  removeSelectionCells(cells) {
    this.getSelectionModel().removeCells(cells);
  }

  selectRegion(rect, evt) {
    var cells = this.getCells(rect.x, rect.y, rect.width, rect.height);
    this.selectCellsForEvent(cells, evt);
    return cells;
  }

  selectNextCell() {
    this.selectCell(true);
  }

  selectPreviousCell() {
    this.selectCell();
  }

  selectParentCell() {
    this.selectCell(false, true);
  }

  selectChildCell() {
    this.selectCell(false, false, true);
  }

  selectCell(isNext, isParent, isChild) {
    var sel = this.selectionModel;
    var cell = sel.cells.length > 0 ? sel.cells[0] : null;

    if (sel.cells.length > 1) {
      sel.clear();
    }

    var parent = cell != null ? this.model.getParent(cell) : this.getDefaultParent();
    var childCount = this.model.getChildCount(parent);

    if (cell == null && childCount > 0) {
      var child = this.model.getChildAt(parent, 0);
      this.setSelectionCell(child);
    } else if (
      (cell == null || isParent) &&
      this.view.getState(parent) != null &&
      this.model.getGeometry(parent) != null
    ) {
      if (this.getCurrentRoot() != parent) {
        this.setSelectionCell(parent);
      }
    } else if (cell != null && isChild) {
      var tmp = this.model.getChildCount(cell);

      if (tmp > 0) {
        var child = this.model.getChildAt(cell, 0);
        this.setSelectionCell(child);
      }
    } else if (childCount > 0) {
      var i = parent.getIndex(cell);

      if (isNext) {
        i++;
        var child = this.model.getChildAt(parent, i % childCount);
        this.setSelectionCell(child);
      } else {
        i--;
        var index = i < 0 ? childCount - 1 : i;
        var child = this.model.getChildAt(parent, index);
        this.setSelectionCell(child);
      }
    }
  }

  selectAll(parent, descendants) {
    parent = parent || this.getDefaultParent();
    var cells = descendants
      ? this.model.filterDescendants((cell) => {
          return cell != parent && this.view.getState(cell) != null;
        }, parent)
      : this.model.getChildren(parent);

    if (cells != null) {
      this.setSelectionCells(cells);
    }
  }

  selectVertices(parent, selectGroups) {
    this.selectCells(true, false, parent, selectGroups);
  }

  selectEdges(parent) {
    this.selectCells(false, true, parent);
  }

  selectCells(vertices, edges, parent, selectGroups) {
    parent = parent || this.getDefaultParent();

    var filter = (cell) => {
      return (
        this.view.getState(cell) != null &&
        (((selectGroups || this.model.getChildCount(cell) == 0) &&
          this.model.isVertex(cell) &&
          vertices &&
          !this.model.isEdge(this.model.getParent(cell))) ||
          (this.model.isEdge(cell) && edges))
      );
    };

    var cells = this.model.filterDescendants(filter, parent);

    if (cells != null) {
      this.setSelectionCells(cells);
    }
  }

  selectCellForEvent(cell, evt) {
    var isSelected = this.isCellSelected(cell);

    if (this.isToggleEvent(evt)) {
      if (isSelected) {
        this.removeSelectionCell(cell);
      } else {
        this.addSelectionCell(cell);
      }
    } else if (!isSelected || this.getSelectionCount() != 1) {
      this.setSelectionCell(cell);
    }
  }

  selectCellsForEvent(cells, evt) {
    if (this.isToggleEvent(evt)) {
      this.addSelectionCells(cells);
    } else {
      this.setSelectionCells(cells);
    }
  }

  createHandler(state) {
    var result = null;

    if (state != null) {
      if (this.model.isEdge(state.cell)) {
        var source = state.getVisibleTerminalState(true);
        var target = state.getVisibleTerminalState(false);
        var geo = this.getCellGeometry(state.cell);
        var edgeStyle = this.view.getEdgeStyle(state, geo != null ? geo.points : null, source, target);
        result = this.createEdgeHandler(state, edgeStyle);
      } else {
        result = this.createVertexHandler(state);
      }
    }

    return result;
  }

  createVertexHandler(state) {
    return new mxVertexHandler(state);
  }

  createEdgeHandler(state, edgeStyle) {
    var result = null;

    if (
      edgeStyle == mxEdgeStyle.Loop ||
      edgeStyle == mxEdgeStyle.ElbowConnector ||
      edgeStyle == mxEdgeStyle.SideToSide ||
      edgeStyle == mxEdgeStyle.TopToBottom
    ) {
      result = this.createElbowEdgeHandler(state);
    } else if (edgeStyle == mxEdgeStyle.SegmentConnector || edgeStyle == mxEdgeStyle.OrthConnector) {
      result = this.createEdgeSegmentHandler(state);
    } else {
      result = new mxEdgeHandler(state);
    }

    return result;
  }

  createEdgeSegmentHandler(state) {
    return new mxEdgeSegmentHandler(state);
  }

  createElbowEdgeHandler(state) {
    return new mxElbowEdgeHandler(state);
  }

  addMouseListener(listener) {
    if (this.mouseListeners == null) {
      this.mouseListeners = [];
    }

    this.mouseListeners.push(listener);
  }

  removeMouseListener(listener) {
    if (this.mouseListeners != null) {
      for (var i = 0; i < this.mouseListeners.length; i++) {
        if (this.mouseListeners[i] == listener) {
          this.mouseListeners.splice(i, 1);
          break;
        }
      }
    }
  }

  updateMouseEvent(me, evtName) {
    if (me.graphX == null || me.graphY == null) {
      var pt = mxUtils.convertPoint(this.container, me.getX(), me.getY());
      me.graphX = pt.x - this.panDx;
      me.graphY = pt.y - this.panDy;

      if (me.getCell() == null && this.isMouseDown && evtName == mxEvent.MOUSE_MOVE) {
        me.state = this.view.getState(
          this.getCellAt(pt.x, pt.y, null, null, null, function (state) {
            return (
              state.shape == null ||
              state.shape.paintBackground != mxRectangleShape.prototype.paintBackground ||
              mxUtils.getValue(state.style, mxConstants.STYLE_POINTER_EVENTS, '1') == '1' ||
              (state.shape.fill != null && state.shape.fill != mxConstants.NONE)
            );
          })
        );
      }
    }

    return me;
  }

  getStateForTouchEvent(evt) {
    var x = mxEvent.getClientX(evt);
    var y = mxEvent.getClientY(evt);
    var pt = mxUtils.convertPoint(this.container, x, y);
    return this.view.getState(this.getCellAt(pt.x, pt.y));
  }

  isEventIgnored(evtName, me, sender) {
    var mouseEvent = mxEvent.isMouseEvent(me.getEvent());
    var result = false;

    if (me.getEvent() == this.lastEvent) {
      result = true;
    } else {
      this.lastEvent = me.getEvent();
    }

    if (this.eventSource != null && evtName != mxEvent.MOUSE_MOVE) {
      mxEvent.removeGestureListeners(this.eventSource, null, this.mouseMoveRedirect, this.mouseUpRedirect);
      this.mouseMoveRedirect = null;
      this.mouseUpRedirect = null;
      this.eventSource = null;
    } else if (!mxClient.IS_GC && this.eventSource != null && me.getSource() != this.eventSource) {
      result = true;
    } else if (
      mxClient.IS_TOUCH &&
      evtName == mxEvent.MOUSE_DOWN &&
      !mouseEvent &&
      !mxEvent.isPenEvent(me.getEvent())
    ) {
      this.eventSource = me.getSource();

      this.mouseMoveRedirect = (evt) => {
        this.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, this.getStateForTouchEvent(evt)));
      };

      this.mouseUpRedirect = (evt) => {
        this.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, this.getStateForTouchEvent(evt)));
      };

      mxEvent.addGestureListeners(this.eventSource, null, this.mouseMoveRedirect, this.mouseUpRedirect);
    }

    if (this.isSyntheticEventIgnored(evtName, me, sender)) {
      result = true;
    }

    if (!mxEvent.isPopupTrigger(this.lastEvent) && evtName != mxEvent.MOUSE_MOVE && this.lastEvent.detail == 2) {
      return true;
    }

    if (evtName == mxEvent.MOUSE_UP && this.isMouseDown) {
      this.isMouseDown = false;
    } else if (evtName == mxEvent.MOUSE_DOWN && !this.isMouseDown) {
      this.isMouseDown = true;
      this.isMouseTrigger = mouseEvent;
    } else if (
      !result &&
      (((!mxClient.IS_FF || evtName != mxEvent.MOUSE_MOVE) && this.isMouseDown && this.isMouseTrigger != mouseEvent) ||
        (evtName == mxEvent.MOUSE_DOWN && this.isMouseDown) ||
        (evtName == mxEvent.MOUSE_UP && !this.isMouseDown))
    ) {
      result = true;
    }

    if (!result && evtName == mxEvent.MOUSE_DOWN) {
      this.lastMouseX = me.getX();
      this.lastMouseY = me.getY();
    }

    return result;
  }

  isSyntheticEventIgnored(evtName, me, sender) {
    var result = false;
    var mouseEvent = mxEvent.isMouseEvent(me.getEvent());

    if (this.ignoreMouseEvents && mouseEvent && evtName != mxEvent.MOUSE_MOVE) {
      this.ignoreMouseEvents = evtName != mxEvent.MOUSE_UP;
      result = true;
    } else if (mxClient.IS_FF && !mouseEvent && evtName == mxEvent.MOUSE_UP) {
      this.ignoreMouseEvents = true;
    }

    return result;
  }

  isEventSourceIgnored(evtName, me) {
    var source = me.getSource();
    var name = source.nodeName != null ? source.nodeName.toLowerCase() : '';
    var candidate = !mxEvent.isMouseEvent(me.getEvent()) || mxEvent.isLeftMouseButton(me.getEvent());
    return (
      evtName == mxEvent.MOUSE_DOWN &&
      candidate &&
      (name == 'select' ||
        name == 'option' ||
        (name == 'input' &&
          source.type != 'checkbox' &&
          source.type != 'radio' &&
          source.type != 'button' &&
          source.type != 'submit' &&
          source.type != 'file'))
    );
  }

  getEventState(state) {
    return state;
  }

  fireMouseEvent(evtName, me, sender) {
    if (this.isEventSourceIgnored(evtName, me)) {
      if (this.tooltipHandler != null) {
        this.tooltipHandler.hide();
      }

      return;
    }

    if (sender == null) {
      sender = this;
    }

    me = this.updateMouseEvent(me, evtName);

    if (
      (!this.nativeDblClickEnabled && !mxEvent.isPopupTrigger(me.getEvent())) ||
      (this.doubleTapEnabled &&
        mxClient.IS_TOUCH &&
        (mxEvent.isTouchEvent(me.getEvent()) || mxEvent.isPenEvent(me.getEvent())))
    ) {
      var currentTime = new Date().getTime();

      if (
        (!mxClient.IS_QUIRKS && evtName == mxEvent.MOUSE_DOWN) ||
        (mxClient.IS_QUIRKS && evtName == mxEvent.MOUSE_UP && !this.fireDoubleClick)
      ) {
        if (
          this.lastTouchEvent != null &&
          this.lastTouchEvent != me.getEvent() &&
          currentTime - this.lastTouchTime < this.doubleTapTimeout &&
          Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
          Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance &&
          this.doubleClickCounter < 2
        ) {
          this.doubleClickCounter++;
          var doubleClickFired = false;

          if (evtName == mxEvent.MOUSE_UP) {
            if (me.getCell() == this.lastTouchCell && this.lastTouchCell != null) {
              this.lastTouchTime = 0;
              var cell = this.lastTouchCell;
              this.lastTouchCell = null;

              if (mxClient.IS_QUIRKS) {
                me.getSource().fireEvent('ondblclick');
              }

              this.dblClick(me.getEvent(), cell);
              doubleClickFired = true;
            }
          } else {
            this.fireDoubleClick = true;
            this.lastTouchTime = 0;
          }

          if (!mxClient.IS_QUIRKS || doubleClickFired) {
            mxEvent.consume(me.getEvent());
            return;
          }
        } else if (this.lastTouchEvent == null || this.lastTouchEvent != me.getEvent()) {
          this.lastTouchCell = me.getCell();
          this.lastTouchX = me.getX();
          this.lastTouchY = me.getY();
          this.lastTouchTime = currentTime;
          this.lastTouchEvent = me.getEvent();
          this.doubleClickCounter = 0;
        }
      } else if ((this.isMouseDown || evtName == mxEvent.MOUSE_UP) && this.fireDoubleClick) {
        this.fireDoubleClick = false;
        var cell = this.lastTouchCell;
        this.lastTouchCell = null;
        this.isMouseDown = false;
        var valid =
          cell != null ||
          ((mxEvent.isTouchEvent(me.getEvent()) || mxEvent.isPenEvent(me.getEvent())) &&
            (mxClient.IS_GC || mxClient.IS_SF));

        if (
          valid &&
          Math.abs(this.lastTouchX - me.getX()) < this.doubleTapTolerance &&
          Math.abs(this.lastTouchY - me.getY()) < this.doubleTapTolerance
        ) {
          this.dblClick(me.getEvent(), cell);
        } else {
          mxEvent.consume(me.getEvent());
        }

        return;
      }
    }

    if (!this.isEventIgnored(evtName, me, sender)) {
      me.state = this.getEventState(me.getState());
      this.fireEvent(new mxEventObject(mxEvent.FIRE_MOUSE_EVENT, 'eventName', evtName, 'event', me));

      if (
        mxClient.IS_OP ||
        mxClient.IS_SF ||
        mxClient.IS_GC ||
        mxClient.IS_IE11 ||
        me.getEvent().target != this.container
      ) {
        if (
          evtName == mxEvent.MOUSE_MOVE &&
          this.isMouseDown &&
          this.autoScroll &&
          !mxEvent.isMultiTouchEvent(me.getEvent)
        ) {
          this.scrollPointToVisible(me.getGraphX(), me.getGraphY(), this.autoExtend);
        } else if (
          evtName == mxEvent.MOUSE_UP &&
          this.ignoreScrollbars &&
          this.translateToScrollPosition &&
          (this.container.scrollLeft != 0 || this.container.scrollTop != 0)
        ) {
          var s = this.view.scale;
          var tr = this.view.translate;
          this.view.setTranslate(tr.x - this.container.scrollLeft / s, tr.y - this.container.scrollTop / s);
          this.container.scrollLeft = 0;
          this.container.scrollTop = 0;
        }

        if (this.mouseListeners != null) {
          var args = [sender, me];

          if (!me.getEvent().preventDefault) {
            me.getEvent().returnValue = true;
          }

          for (var i = 0; i < this.mouseListeners.length; i++) {
            var l = this.mouseListeners[i];

            if (evtName == mxEvent.MOUSE_DOWN) {
              l.mouseDown.apply(l, args);
            } else if (evtName == mxEvent.MOUSE_MOVE) {
              l.mouseMove.apply(l, args);
            } else if (evtName == mxEvent.MOUSE_UP) {
              l.mouseUp.apply(l, args);
            }
          }
        }

        if (evtName == mxEvent.MOUSE_UP) {
          this.click(me);
        }
      }

      if (
        (mxEvent.isTouchEvent(me.getEvent()) || mxEvent.isPenEvent(me.getEvent())) &&
        evtName == mxEvent.MOUSE_DOWN &&
        this.tapAndHoldEnabled &&
        !this.tapAndHoldInProgress
      ) {
        this.tapAndHoldInProgress = true;
        this.initialTouchX = me.getGraphX();
        this.initialTouchY = me.getGraphY();

        var handler = function () {
          if (this.tapAndHoldValid) {
            this.tapAndHold(me);
          }

          this.tapAndHoldInProgress = false;
          this.tapAndHoldValid = false;
        };

        if (this.tapAndHoldThread) {
          window.clearTimeout(this.tapAndHoldThread);
        }

        this.tapAndHoldThread = window.setTimeout(mxUtils.bind(this, handler), this.tapAndHoldDelay);
        this.tapAndHoldValid = true;
      } else if (evtName == mxEvent.MOUSE_UP) {
        this.tapAndHoldInProgress = false;
        this.tapAndHoldValid = false;
      } else if (this.tapAndHoldValid) {
        this.tapAndHoldValid =
          Math.abs(this.initialTouchX - me.getGraphX()) < this.tolerance &&
          Math.abs(this.initialTouchY - me.getGraphY()) < this.tolerance;
      }

      if (evtName == mxEvent.MOUSE_DOWN && this.isEditing() && !this.cellEditor.isEventSource(me.getEvent())) {
        this.stopEditing(!this.isInvokesStopCellEditing());
      }

      this.consumeMouseEvent(evtName, me, sender);
    }
  }

  consumeMouseEvent(evtName, me, sender) {
    if (evtName == mxEvent.MOUSE_DOWN && mxEvent.isTouchEvent(me.getEvent())) {
      me.consume(false);
    }
  }

  fireGestureEvent(evt, cell) {
    this.lastTouchTime = 0;
    this.fireEvent(new mxEventObject(mxEvent.GESTURE, 'event', evt, 'cell', cell));
  }

  destroy() {
    if (!this.destroyed) {
      this.destroyed = true;

      if (this.tooltipHandler != null) {
        this.tooltipHandler.destroy();
      }

      if (this.selectionCellsHandler != null) {
        this.selectionCellsHandler.destroy();
      }

      if (this.panningHandler != null) {
        this.panningHandler.destroy();
      }

      if (this.popupMenuHandler != null) {
        this.popupMenuHandler.destroy();
      }

      if (this.connectionHandler != null) {
        this.connectionHandler.destroy();
      }

      if (this.graphHandler != null) {
        this.graphHandler.destroy();
      }

      if (this.cellEditor != null) {
        this.cellEditor.destroy();
      }

      if (this.view != null) {
        this.view.destroy();
      }

      if (this.model != null && this.graphModelChangeListener != null) {
        this.model.removeListener(this.graphModelChangeListener);
        this.graphModelChangeListener = null;
      }

      this.container = null;
    }
  }
}
