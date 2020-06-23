import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxCell } from '@mxgraph/model/mxCell';
import { mxOutline } from '@mxgraph/view/mxOutline';
import { mxForm } from '@mxgraph/util/mxForm';
import { mxWindow } from '@mxgraph/util/mxWindow';
import { mxDefaultToolbar } from '@mxgraph/editor/mxDefaultToolbar';
import { mxCompactTreeLayout } from '@mxgraph/layout/mxCompactTreeLayout';
import { mxStackLayout } from '@mxgraph/layout/mxStackLayout';
import { mxCellAttributeChange } from '@mxgraph/model/changes/mxCellAttributeChange';
import { mxValueChange } from '@mxgraph/model/changes/mxValueChange';
import { mxRootChange } from '@mxgraph/model/changes/mxRootChange';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxDivResizer } from '@mxgraph/util/mxDivResizer';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxRubberband } from '@mxgraph/handler/mxRubberband';
import { mxLayoutManager } from '@mxgraph/view/mxLayoutManager';
import { mxSwimlaneManager } from '@mxgraph/view/mxSwimlaneManager';
import { mxGraph } from '@mxgraph/view/mxGraph';
import { mxCodec } from '@mxgraph/io/mxCodec';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxClipboard } from '@mxgraph/util/mxClipboard';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxPrintPreview } from '@mxgraph/view/mxPrintPreview';
import { mxDefaultKeyHandler } from '@mxgraph/editor/mxDefaultKeyHandler';
import { mxUndoManager } from '@mxgraph/util/mxUndoManager';
import { mxDefaultPopupMenu } from '@mxgraph/editor/mxDefaultPopupMenu';
import { mxClient } from '@mxgraph/mxClient';
import { mxResources } from '@mxgraph/util/mxResources';

export class mxEditor extends mxEventSource {
  askZoomResource = mxClient.language != 'none' ? 'askZoom' : '';
  lastSavedResource = mxClient.language != 'none' ? 'lastSaved' : '';
  currentFileResource = mxClient.language != 'none' ? 'currentFile' : '';
  propertiesResource = mxClient.language != 'none' ? 'properties' : '';
  tasksResource = mxClient.language != 'none' ? 'tasks' : '';
  helpResource = mxClient.language != 'none' ? 'help' : '';
  outlineResource = mxClient.language != 'none' ? 'outline' : '';
  outline = null;
  graph = null;
  graphRenderHint = null;
  toolbar = null;
  status = null;
  popupHandler = null;
  undoManager = null;
  keyHandler = null;
  dblClickAction = 'edit';
  swimlaneRequired = false;
  disableContextMenu = true;
  insertFunction = null;
  forcedInserting = false;
  templates = null;
  defaultEdge = null;
  defaultEdgeStyle = null;
  defaultGroup = null;
  groupBorderSize = null;
  filename = null;
  linefeed = '&#xa;';
  postParameterName = 'xml';
  escapePostData = true;
  urlPost = null;
  urlImage = null;
  horizontalFlow = false;
  layoutDiagram = false;
  swimlaneSpacing = 0;
  maintainSwimlanes = false;
  layoutSwimlanes = false;
  cycleAttributeValues = null;
  cycleAttributeIndex = 0;
  cycleAttributeName = 'fillColor';
  tasks = null;
  tasksWindowImage = null;
  tasksTop = 20;
  help = null;
  helpWindowImage = null;
  urlHelp = null;
  helpWidth = 300;
  helpHeight = 260;
  propertiesWidth = 240;
  propertiesHeight = null;
  movePropertiesDialog = false;
  validating = false;
  modified = false;

  constructor(config) {
    super();
    this.actions = [];
    this.addActions();

    if (document.body != null) {
      this.cycleAttributeValues = [];
      this.popupHandler = new mxDefaultPopupMenu();
      this.undoManager = new mxUndoManager();
      this.graph = this.createGraph();
      this.toolbar = this.createToolbar();
      this.keyHandler = new mxDefaultKeyHandler(this);
      this.configure(config);
      this.graph.swimlaneIndicatorColorAttribute = this.cycleAttributeName;

      if (this.onInit != null) {
        this.onInit();
      }
    }
  }

  isModified() {
    return this.modified;
  }

  setModified(value) {
    this.modified = value;
  }

  addActions() {
    this.addAction('save', function (editor) {
      editor.save();
    });
    this.addAction('print', function (editor) {
      var preview = new mxPrintPreview(editor.graph, 1);
      preview.open();
    });
    this.addAction('show', function (editor) {
      mxUtils.show(editor.graph, null, 10, 10);
    });
    this.addAction('exportImage', function (editor) {
      var url = editor.getUrlImage();

      if (url == null || mxClient.IS_LOCAL) {
        editor.execute('show');
      } else {
        var node = mxUtils.getViewXml(editor.graph, 1);
        var xml = mxUtils.getXml(node, '\n');
        mxUtils.submit(url, editor.postParameterName + '=' + encodeURIComponent(xml), document, '_blank');
      }
    });
    this.addAction('refresh', function (editor) {
      editor.graph.refresh();
    });
    this.addAction('cut', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.cut(editor.graph);
      }
    });
    this.addAction('copy', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.copy(editor.graph);
      }
    });
    this.addAction('paste', function (editor) {
      if (editor.graph.isEnabled()) {
        mxClipboard.paste(editor.graph);
      }
    });
    this.addAction('delete', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.removeCells();
      }
    });
    this.addAction('group', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setSelectionCell(editor.groupCells());
      }
    });
    this.addAction('ungroup', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setSelectionCells(editor.graph.ungroupCells());
      }
    });
    this.addAction('removeFromParent', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.removeCellsFromParent();
      }
    });
    this.addAction('undo', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.undo();
      }
    });
    this.addAction('redo', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.redo();
      }
    });
    this.addAction('zoomIn', function (editor) {
      editor.graph.zoomIn();
    });
    this.addAction('zoomOut', function (editor) {
      editor.graph.zoomOut();
    });
    this.addAction('actualSize', function (editor) {
      editor.graph.zoomActual();
    });
    this.addAction('fit', function (editor) {
      editor.graph.fit();
    });
    this.addAction('showProperties', function (editor, cell) {
      editor.showProperties(cell);
    });
    this.addAction('selectAll', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectAll();
      }
    });
    this.addAction('selectNone', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.clearSelection();
      }
    });
    this.addAction('selectVertices', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectVertices();
      }
    });
    this.addAction('selectEdges', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectEdges();
      }
    });
    this.addAction('edit', function (editor, cell) {
      if (editor.graph.isEnabled() && editor.graph.isCellEditable(cell)) {
        editor.graph.startEditingAtCell(cell);
      }
    });
    this.addAction('toBack', function (editor, cell) {
      if (editor.graph.isEnabled()) {
        editor.graph.orderCells(true);
      }
    });
    this.addAction('toFront', function (editor, cell) {
      if (editor.graph.isEnabled()) {
        editor.graph.orderCells(false);
      }
    });
    this.addAction('enterGroup', function (editor, cell) {
      editor.graph.enterGroup(cell);
    });
    this.addAction('exitGroup', function (editor) {
      editor.graph.exitGroup();
    });
    this.addAction('home', function (editor) {
      editor.graph.home();
    });
    this.addAction('selectPrevious', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectPreviousCell();
      }
    });
    this.addAction('selectNext', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectNextCell();
      }
    });
    this.addAction('selectParent', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectParentCell();
      }
    });
    this.addAction('selectChild', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.selectChildCell();
      }
    });
    this.addAction('collapse', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.foldCells(true);
      }
    });
    this.addAction('collapseAll', function (editor) {
      if (editor.graph.isEnabled()) {
        var cells = editor.graph.getChildVertices();
        editor.graph.foldCells(true, false, cells);
      }
    });
    this.addAction('expand', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.foldCells(false);
      }
    });
    this.addAction('expandAll', function (editor) {
      if (editor.graph.isEnabled()) {
        var cells = editor.graph.getChildVertices();
        editor.graph.foldCells(false, false, cells);
      }
    });
    this.addAction('bold', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_BOLD);
      }
    });
    this.addAction('italic', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_ITALIC);
      }
    });
    this.addAction('underline', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, mxConstants.FONT_UNDERLINE);
      }
    });
    this.addAction('alignCellsLeft', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_LEFT);
      }
    });
    this.addAction('alignCellsCenter', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_CENTER);
      }
    });
    this.addAction('alignCellsRight', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_RIGHT);
      }
    });
    this.addAction('alignCellsTop', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_TOP);
      }
    });
    this.addAction('alignCellsMiddle', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_MIDDLE);
      }
    });
    this.addAction('alignCellsBottom', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.alignCells(mxConstants.ALIGN_BOTTOM);
      }
    });
    this.addAction('alignFontLeft', function (editor) {
      editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
    });
    this.addAction('alignFontCenter', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER);
      }
    });
    this.addAction('alignFontRight', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_ALIGN, mxConstants.ALIGN_RIGHT);
      }
    });
    this.addAction('alignFontTop', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_TOP);
      }
    });
    this.addAction('alignFontMiddle', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
      }
    });
    this.addAction('alignFontBottom', function (editor) {
      if (editor.graph.isEnabled()) {
        editor.graph.setCellStyles(mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_BOTTOM);
      }
    });
    this.addAction('zoom', function (editor) {
      var current = editor.graph.getView().scale * 100;
      var scale =
        parseFloat(mxUtils.prompt(mxResources.get(editor.askZoomResource) || editor.askZoomResource, current)) / 100;

      if (!isNaN(scale)) {
        editor.graph.getView().setScale(scale);
      }
    });
    this.addAction('toggleTasks', function (editor) {
      if (editor.tasks != null) {
        editor.tasks.setVisible(!editor.tasks.isVisible());
      } else {
        editor.showTasks();
      }
    });
    this.addAction('toggleHelp', function (editor) {
      if (editor.help != null) {
        editor.help.setVisible(!editor.help.isVisible());
      } else {
        editor.showHelp();
      }
    });
    this.addAction('toggleOutline', function (editor) {
      if (editor.outline == null) {
        editor.showOutline();
      } else {
        editor.outline.setVisible(!editor.outline.isVisible());
      }
    });
    this.addAction('toggleConsole', function (editor) {
      mxLog.setVisible(!mxLog.isVisible());
    });
  }

  configure(node) {
    if (node != null) {
      var dec = new mxCodec(node.ownerDocument);
      dec.decode(node, this);
      this.resetHistory();
    }
  }

  resetFirstTime() {
    document.cookie = 'mxgraph=seen; expires=Fri, 27 Jul 2001 02:47:11 UTC; path=/';
  }

  resetHistory() {
    this.lastSnapshot = new Date().getTime();
    this.undoManager.clear();
    this.ignoredChanges = 0;
    this.setModified(false);
  }

  addAction(actionname, funct) {
    this.actions[actionname] = funct;
  }

  execute(actionname, cell, evt) {
    var action = this.actions[actionname];

    if (action != null) {
      try {
        var args = arguments;
        args[0] = this;
        action.apply(this, args);
      } catch (e) {
        mxUtils.error('Cannot execute ' + actionname + ': ' + e.message, 280, true);
        throw e;
      }
    } else {
      mxUtils.error('Cannot find action ' + actionname, 280, true);
    }
  }

  addTemplate(name, template) {
    this.templates[name] = template;
  }

  getTemplate(name) {
    return this.templates[name];
  }

  createGraph() {
    var graph = new mxGraph(null, null, this.graphRenderHint);
    graph.setTooltips(true);
    graph.setPanning(true);
    this.installDblClickHandler(graph);
    this.installUndoHandler(graph);
    this.installDrillHandler(graph);
    this.installChangeHandler(graph);
    this.installInsertHandler(graph);

    graph.popupMenuHandler.factoryMethod = (menu, cell, evt) => {
      return this.createPopupMenu(menu, cell, evt);
    };

    graph.connectionHandler.factoryMethod = (source, target) => {
      return this.createEdge(source, target);
    };

    this.createSwimlaneManager(graph);
    this.createLayoutManager(graph);
    return graph;
  }

  createSwimlaneManager(graph) {
    var swimlaneMgr = new mxSwimlaneManager(graph, false);

    swimlaneMgr.isHorizontal = () => {
      return this.horizontalFlow;
    };

    swimlaneMgr.isEnabled = () => {
      return this.maintainSwimlanes;
    };

    return swimlaneMgr;
  }

  createLayoutManager(graph) {
    var layoutMgr = new mxLayoutManager(graph);
    var self = this;

    layoutMgr.getLayout = function (cell) {
      var layout = null;
      var model = self.graph.getModel();

      if (model.getParent(cell) != null) {
        if (self.layoutSwimlanes && graph.isSwimlane(cell)) {
          if (self.swimlaneLayout == null) {
            self.swimlaneLayout = self.createSwimlaneLayout();
          }

          layout = self.swimlaneLayout;
        } else if (self.layoutDiagram && (graph.isValidRoot(cell) || model.getParent(model.getParent(cell)) == null)) {
          if (self.diagramLayout == null) {
            self.diagramLayout = self.createDiagramLayout();
          }

          layout = self.diagramLayout;
        }
      }

      return layout;
    };

    return layoutMgr;
  }

  setGraphContainer(container) {
    if (this.graph.container == null) {
      this.graph.init(container);
      this.rubberband = new mxRubberband(this.graph);

      if (this.disableContextMenu) {
        mxEvent.disableContextMenu(container);
      }

      if (mxClient.IS_QUIRKS) {
        new mxDivResizer(container);
      }
    }
  }

  installDblClickHandler(graph) {
    graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {
      var cell = evt.getProperty('cell');

      if (cell != null && graph.isEnabled() && this.dblClickAction != null) {
        this.execute(this.dblClickAction, cell);
        evt.consume();
      }
    });
  }

  installUndoHandler(graph) {
    var listener = (sender, evt) => {
      var edit = evt.getProperty('edit');
      this.undoManager.undoableEditHappened(edit);
    };

    graph.getModel().addListener(mxEvent.UNDO, listener);
    graph.getView().addListener(mxEvent.UNDO, listener);

    var undoHandler = function (sender, evt) {
      var changes = evt.getProperty('edit').changes;
      graph.setSelectionCells(graph.getSelectionCellsForChanges(changes));
    };

    this.undoManager.addListener(mxEvent.UNDO, undoHandler);
    this.undoManager.addListener(mxEvent.REDO, undoHandler);
  }

  installDrillHandler(graph) {
    var listener = (sender) => {
      this.fireEvent(new mxEventObject(mxEvent.ROOT));
    };

    graph.getView().addListener(mxEvent.DOWN, listener);
    graph.getView().addListener(mxEvent.UP, listener);
  }

  installChangeHandler(graph) {
    var listener = (sender, evt) => {
      this.setModified(true);

      if (this.validating == true) {
        graph.validateGraph();
      }

      var changes = evt.getProperty('edit').changes;

      for (var i = 0; i < changes.length; i++) {
        var change = changes[i];

        if (
          change instanceof mxRootChange ||
          (change instanceof mxValueChange && change.cell == this.graph.model.root) ||
          (change instanceof mxCellAttributeChange && change.cell == this.graph.model.root)
        ) {
          this.fireEvent(new mxEventObject(mxEvent.ROOT));
          break;
        }
      }
    };

    graph.getModel().addListener(mxEvent.CHANGE, listener);
  }

  installInsertHandler(graph) {
    var self = this;
    var insertHandler = {
      mouseDown: function (sender, me) {
        if (self.insertFunction != null && !me.isPopupTrigger() && (self.forcedInserting || me.getState() == null)) {
          self.graph.clearSelection();
          self.insertFunction(me.getEvent(), me.getCell());
          this.isActive = true;
          me.consume();
        }
      },
      mouseMove: function (sender, me) {
        if (this.isActive) {
          me.consume();
        }
      },
      mouseUp: function (sender, me) {
        if (this.isActive) {
          this.isActive = false;
          me.consume();
        }
      }
    };
    graph.addMouseListener(insertHandler);
  }

  createDiagramLayout() {
    var gs = this.graph.gridSize;
    var layout = new mxStackLayout(this.graph, !this.horizontalFlow, this.swimlaneSpacing, 2 * gs, 2 * gs);

    layout.isVertexIgnored = function (cell) {
      return !layout.graph.isSwimlane(cell);
    };

    return layout;
  }

  createSwimlaneLayout() {
    return new mxCompactTreeLayout(this.graph, this.horizontalFlow);
  }

  createToolbar() {
    return new mxDefaultToolbar(null, this);
  }

  setToolbarContainer(container) {
    this.toolbar.init(container);

    if (mxClient.IS_QUIRKS) {
      new mxDivResizer(container);
    }
  }

  setStatusContainer(container) {
    if (this.status == null) {
      this.status = container;
      this.addListener(mxEvent.SAVE, () => {
        var tstamp = new Date().toLocaleString();
        this.setStatus((mxResources.get(this.lastSavedResource) || this.lastSavedResource) + ': ' + tstamp);
      });
      this.addListener(mxEvent.OPEN, () => {
        this.setStatus((mxResources.get(this.currentFileResource) || this.currentFileResource) + ': ' + this.filename);
      });

      if (mxClient.IS_QUIRKS) {
        new mxDivResizer(container);
      }
    }
  }

  setStatus(message) {
    if (this.status != null && message != null) {
      this.status.innerHTML = message;
    }
  }

  setTitleContainer(container) {
    this.addListener(mxEvent.ROOT, (sender) => {
      container.innerHTML = this.getTitle();
    });

    if (mxClient.IS_QUIRKS) {
      new mxDivResizer(container);
    }
  }

  treeLayout(cell, horizontal) {
    if (cell != null) {
      var layout = new mxCompactTreeLayout(this.graph, horizontal);
      layout.execute(cell);
    }
  }

  getTitle() {
    var title = '';
    var graph = this.graph;
    var cell = graph.getCurrentRoot();

    while (cell != null && graph.getModel().getParent(graph.getModel().getParent(cell)) != null) {
      if (graph.isValidRoot(cell)) {
        title = ' > ' + graph.convertValueToString(cell) + title;
      }

      cell = graph.getModel().getParent(cell);
    }

    var prefix = this.getRootTitle();
    return prefix + title;
  }

  getRootTitle() {
    var root = this.graph.getModel().getRoot();
    return this.graph.convertValueToString(root);
  }

  undo() {
    this.undoManager.undo();
  }

  redo() {
    this.undoManager.redo();
  }

  groupCells() {
    var border = this.groupBorderSize != null ? this.groupBorderSize : this.graph.gridSize;
    return this.graph.groupCells(this.createGroup(), border);
  }

  createGroup() {
    var model = this.graph.getModel();
    return model.cloneCell(this.defaultGroup);
  }

  open(filename) {
    if (filename != null) {
      var xml = mxUtils.load(filename).getXml();
      this.readGraphModel(xml.documentElement);
      this.filename = filename;
      this.fireEvent(new mxEventObject(mxEvent.OPEN, 'filename', filename));
    }
  }

  readGraphModel(node) {
    var dec = new mxCodec(node.ownerDocument);
    dec.decode(node, this.graph.getModel());
    this.resetHistory();
  }

  save(url, linefeed) {
    url = url || this.getUrlPost();

    if (url != null && url.length > 0) {
      var data = this.writeGraphModel(linefeed);
      this.postDiagram(url, data);
      this.setModified(false);
    }

    this.fireEvent(new mxEventObject(mxEvent.SAVE, 'url', url));
  }

  postDiagram(url, data) {
    if (this.escapePostData) {
      data = encodeURIComponent(data);
    }

    mxUtils.post(url, this.postParameterName + '=' + data, (req) => {
      this.fireEvent(new mxEventObject(mxEvent.POST, 'request', req, 'url', url, 'data', data));
    });
  }

  writeGraphModel(linefeed) {
    linefeed = linefeed != null ? linefeed : this.linefeed;
    var enc = new mxCodec();
    var node = enc.encode(this.graph.getModel());
    return mxUtils.getXml(node, linefeed);
  }

  getUrlPost() {
    return this.urlPost;
  }

  getUrlImage() {
    return this.urlImage;
  }

  swapStyles(first, second) {
    var style = this.graph.getStylesheet().styles[second];
    this.graph.getView().getStylesheet().putCellStyle(second, this.graph.getStylesheet().styles[first]);
    this.graph.getStylesheet().putCellStyle(first, style);
    this.graph.refresh();
  }

  showProperties(cell) {
    cell = cell || this.graph.getSelectionCell();

    if (cell == null) {
      cell = this.graph.getCurrentRoot();

      if (cell == null) {
        cell = this.graph.getModel().getRoot();
      }
    }

    if (cell != null) {
      this.graph.stopEditing(true);
      var offset = mxUtils.getOffset(this.graph.container);
      var x = offset.x + 10;
      var y = offset.y;

      if (this.properties != null && !this.movePropertiesDialog) {
        x = this.properties.getX();
        y = this.properties.getY();
      } else {
        var bounds = this.graph.getCellBounds(cell);

        if (bounds != null) {
          x += bounds.x + Math.min(200, bounds.width);
          y += bounds.y;
        }
      }

      this.hideProperties();
      var node = this.createProperties(cell);

      if (node != null) {
        this.properties = new mxWindow(
          mxResources.get(this.propertiesResource) || this.propertiesResource,
          node,
          x,
          y,
          this.propertiesWidth,
          this.propertiesHeight,
          false
        );
        this.properties.setVisible(true);
      }
    }
  }

  isPropertiesVisible() {
    return this.properties != null;
  }

  createProperties(cell) {
    var model = this.graph.getModel();
    var value = model.getValue(cell);

    if (mxUtils.isNode(value)) {
      var form = new mxForm('properties');
      var id = form.addText('ID', cell.getId());
      id.setAttribute('readonly', 'true');
      var geo = null;
      var yField = null;
      var xField = null;
      var widthField = null;
      var heightField = null;

      if (model.isVertex(cell)) {
        geo = model.getGeometry(cell);

        if (geo != null) {
          yField = form.addText('top', geo.y);
          xField = form.addText('left', geo.x);
          widthField = form.addText('width', geo.width);
          heightField = form.addText('height', geo.height);
        }
      }

      var tmp = model.getStyle(cell);
      var style = form.addText('Style', tmp || '');
      var attrs = value.attributes;
      var texts = [];

      for (var i = 0; i < attrs.length; i++) {
        var val = attrs[i].value;
        texts[i] = form.addTextarea(attrs[i].nodeName, val, attrs[i].nodeName == 'label' ? 4 : 2);
      }

      var okFunction = () => {
        this.hideProperties();
        model.beginUpdate();

        try {
          if (geo != null) {
            geo = geo.clone();
            geo.x = parseFloat(xField.value);
            geo.y = parseFloat(yField.value);
            geo.width = parseFloat(widthField.value);
            geo.height = parseFloat(heightField.value);
            model.setGeometry(cell, geo);
          }

          if (style.value.length > 0) {
            model.setStyle(cell, style.value);
          } else {
            model.setStyle(cell, null);
          }

          for (var i = 0; i < attrs.length; i++) {
            var edit = new mxCellAttributeChange(cell, attrs[i].nodeName, texts[i].value);
            model.execute(edit);
          }

          if (this.graph.isAutoSizeCell(cell)) {
            this.graph.updateCellSize(cell);
          }
        } finally {
          model.endUpdate();
        }
      };

      var cancelFunction = () => {
        this.hideProperties();
      };

      form.addButtons(okFunction, cancelFunction);
      return form.table;
    }

    return null;
  }

  hideProperties() {
    if (this.properties != null) {
      this.properties.destroy();
      this.properties = null;
    }
  }

  showTasks() {
    if (this.tasks == null) {
      var div = document.createElement('div');
      div.style.padding = '4px';
      div.style.paddingLeft = '20px';
      var w = document.body.clientWidth;
      var wnd = new mxWindow(
        mxResources.get(this.tasksResource) || this.tasksResource,
        div,
        w - 220,
        this.tasksTop,
        200
      );
      wnd.setClosable(true);
      wnd.destroyOnClose = false;

      var funct = (sender) => {
        mxEvent.release(div);
        div.innerHTML = '';
        this.createTasks(div);
      };

      this.graph.getModel().addListener(mxEvent.CHANGE, funct);
      this.graph.getSelectionModel().addListener(mxEvent.CHANGE, funct);
      this.graph.addListener(mxEvent.ROOT, funct);

      if (this.tasksWindowImage != null) {
        wnd.setImage(this.tasksWindowImage);
      }

      this.tasks = wnd;
      this.createTasks(div);
    }

    this.tasks.setVisible(true);
  }

  refreshTasks(div) {
    if (this.tasks != null) {
      var div = this.tasks.content;
      mxEvent.release(div);
      div.innerHTML = '';
      this.createTasks(div);
    }
  }

  createTasks(div) {}

  showHelp(tasks) {
    if (this.help == null) {
      var frame = document.createElement('iframe');
      frame.setAttribute('src', mxResources.get('urlHelp') || this.urlHelp);
      frame.setAttribute('height', '100%');
      frame.setAttribute('width', '100%');
      frame.setAttribute('frameBorder', '0');
      frame.style.backgroundColor = 'white';
      var w = document.body.clientWidth;
      var h = document.body.clientHeight || document.documentElement.clientHeight;
      var wnd = new mxWindow(
        mxResources.get(this.helpResource) || this.helpResource,
        frame,
        (w - this.helpWidth) / 2,
        (h - this.helpHeight) / 3,
        this.helpWidth,
        this.helpHeight
      );
      wnd.setMaximizable(true);
      wnd.setClosable(true);
      wnd.destroyOnClose = false;
      wnd.setResizable(true);

      if (this.helpWindowImage != null) {
        wnd.setImage(this.helpWindowImage);
      }

      if (mxClient.IS_NS) {
        var handler = function (sender) {
          var h = wnd.div.offsetHeight;
          frame.setAttribute('height', h - 26 + 'px');
        };

        wnd.addListener(mxEvent.RESIZE_END, handler);
        wnd.addListener(mxEvent.MAXIMIZE, handler);
        wnd.addListener(mxEvent.NORMALIZE, handler);
        wnd.addListener(mxEvent.SHOW, handler);
      }

      this.help = wnd;
    }

    this.help.setVisible(true);
  }

  showOutline() {
    var create = this.outline == null;

    if (create) {
      var div = document.createElement('div');
      div.style.overflow = 'hidden';
      div.style.position = 'relative';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.background = 'white';
      div.style.cursor = 'move';

      if (document.documentMode == 8) {
        div.style.filter = 'progid:DXImageTransform.Microsoft.alpha(opacity=100)';
      }

      var wnd = new mxWindow(
        mxResources.get(this.outlineResource) || this.outlineResource,
        div,
        600,
        480,
        200,
        200,
        false
      );
      var outline = new mxOutline(this.graph, div);
      wnd.setClosable(true);
      wnd.setResizable(true);
      wnd.destroyOnClose = false;
      wnd.addListener(mxEvent.RESIZE_END, function () {
        outline.update();
      });
      this.outline = wnd;
      this.outline.outline = outline;
    }

    this.outline.setVisible(true);
    this.outline.outline.update(true);
  }

  setMode(modename) {
    if (modename == 'select') {
      this.graph.panningHandler.useLeftButtonForPanning = false;
      this.graph.setConnectable(false);
    } else if (modename == 'connect') {
      this.graph.panningHandler.useLeftButtonForPanning = false;
      this.graph.setConnectable(true);
    } else if (modename == 'pan') {
      this.graph.panningHandler.useLeftButtonForPanning = true;
      this.graph.setConnectable(false);
    }
  }

  createPopupMenu(menu, cell, evt) {
    this.popupHandler.createMenu(this, menu, cell, evt);
  }

  createEdge(source, target) {
    var e = null;

    if (this.defaultEdge != null) {
      var model = this.graph.getModel();
      e = model.cloneCell(this.defaultEdge);
    } else {
      e = new mxCell('');
      e.setEdge(true);
      var geo = new mxGeometry();
      geo.relative = true;
      e.setGeometry(geo);
    }

    var style = this.getEdgeStyle();

    if (style != null) {
      e.setStyle(style);
    }

    return e;
  }

  getEdgeStyle() {
    return this.defaultEdgeStyle;
  }

  consumeCycleAttribute(cell) {
    return this.cycleAttributeValues != null && this.cycleAttributeValues.length > 0 && this.graph.isSwimlane(cell)
      ? this.cycleAttributeValues[this.cycleAttributeIndex++ % this.cycleAttributeValues.length]
      : null;
  }

  cycleAttribute(cell) {
    if (this.cycleAttributeName != null) {
      var value = this.consumeCycleAttribute(cell);

      if (value != null) {
        cell.setStyle(cell.getStyle() + ';' + this.cycleAttributeName + '=' + value);
      }
    }
  }

  addVertex(parent, vertex, x, y) {
    var model = this.graph.getModel();

    while (parent != null && !this.graph.isValidDropTarget(parent)) {
      parent = model.getParent(parent);
    }

    parent = parent != null ? parent : this.graph.getSwimlaneAt(x, y);
    var scale = this.graph.getView().scale;
    var geo = model.getGeometry(vertex);
    var pgeo = model.getGeometry(parent);

    if (this.graph.isSwimlane(vertex) && !this.graph.swimlaneNesting) {
      parent = null;
    } else if (parent == null && this.swimlaneRequired) {
      return null;
    } else if (parent != null && pgeo != null) {
      var state = this.graph.getView().getState(parent);

      if (state != null) {
        x -= state.origin.x * scale;
        y -= state.origin.y * scale;

        if (this.graph.isConstrainedMoving) {
          var width = geo.width;
          var height = geo.height;
          var tmp = state.x + state.width;

          if (x + width > tmp) {
            x -= x + width - tmp;
          }

          tmp = state.y + state.height;

          if (y + height > tmp) {
            y -= y + height - tmp;
          }
        }
      } else if (pgeo != null) {
        x -= pgeo.x * scale;
        y -= pgeo.y * scale;
      }
    }

    geo = geo.clone();
    geo.x = this.graph.snap(x / scale - this.graph.getView().translate.x - this.graph.gridSize / 2);
    geo.y = this.graph.snap(y / scale - this.graph.getView().translate.y - this.graph.gridSize / 2);
    vertex.setGeometry(geo);

    if (parent == null) {
      parent = this.graph.getDefaultParent();
    }

    this.cycleAttribute(vertex);
    this.fireEvent(new mxEventObject(mxEvent.BEFORE_ADD_VERTEX, 'vertex', vertex, 'parent', parent));
    model.beginUpdate();

    try {
      vertex = this.graph.addCell(vertex, parent);

      if (vertex != null) {
        this.graph.constrainChild(vertex);
        this.fireEvent(new mxEventObject(mxEvent.ADD_VERTEX, 'vertex', vertex));
      }
    } finally {
      model.endUpdate();
    }

    if (vertex != null) {
      this.graph.setSelectionCell(vertex);
      this.graph.scrollCellToVisible(vertex);
      this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
    }

    return vertex;
  }

  destroy() {
    if (!this.destroyed) {
      this.destroyed = true;

      if (this.tasks != null) {
        this.tasks.destroy();
      }

      if (this.outline != null) {
        this.outline.destroy();
      }

      if (this.properties != null) {
        this.properties.destroy();
      }

      if (this.keyHandler != null) {
        this.keyHandler.destroy();
      }

      if (this.rubberband != null) {
        this.rubberband.destroy();
      }

      if (this.toolbar != null) {
        this.toolbar.destroy();
      }

      if (this.graph != null) {
        this.graph.destroy();
      }

      this.status = null;
      this.templates = null;
    }
  }
}
