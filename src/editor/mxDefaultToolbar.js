import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxClient } from '@mxgraph/mxClient';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxToolbar } from '@mxgraph/util/mxToolbar';

export class mxDefaultToolbar {
  toolbar = null;
  resetHandler = null;
  spacing = 4;
  connectOnDrop = false;

  constructor(container, editor) {
    this.editor = editor;

    if (container != null && editor != null) {
      this.init(container);
    }
  }

  init(container) {
    if (container != null) {
      this.toolbar = new mxToolbar(container);
      this.toolbar.addListener(mxEvent.SELECT, (sender, evt) => {
        var funct = evt.getProperty('function');

        if (funct != null) {
          this.editor.insertFunction = () => {
            funct.apply(this, arguments);
            this.toolbar.resetMode();
          };
        } else {
          this.editor.insertFunction = null;
        }
      });

      this.resetHandler = () => {
        if (this.toolbar != null) {
          this.toolbar.resetMode(true);
        }
      };

      this.editor.graph.addListener(mxEvent.DOUBLE_CLICK, this.resetHandler);
      this.editor.addListener(mxEvent.ESCAPE, this.resetHandler);
    }
  }

  addItem(title, icon, action, pressed) {
    var clickHandler = () => {
      if (action != null && action.length > 0) {
        this.editor.execute(action);
      }
    };

    return this.toolbar.addItem(title, icon, clickHandler, pressed);
  }

  addSeparator(icon) {
    icon = icon || mxClient.imageBasePath + '/separator.gif';
    this.toolbar.addSeparator(icon);
  }

  addCombo() {
    return this.toolbar.addCombo();
  }

  addActionCombo(title) {
    return this.toolbar.addActionCombo(title);
  }

  addActionOption(combo, title, action) {
    var clickHandler = () => {
      this.editor.execute(action);
    };

    this.addOption(combo, title, clickHandler);
  }

  addOption(combo, title, value) {
    return this.toolbar.addOption(combo, title, value);
  }

  addMode(title, icon, mode, pressed, funct) {
    var clickHandler = () => {
      this.editor.setMode(mode);

      if (funct != null) {
        funct(this.editor);
      }
    };

    return this.toolbar.addSwitchMode(title, icon, clickHandler, pressed);
  }

  addPrototype(title, icon, ptype, pressed, insert, toggle) {
    var factory = () => {
      if (typeof ptype == 'function') {
        return ptype();
      } else if (ptype != null) {
        return this.editor.graph.cloneCell(ptype);
      }

      return null;
    };

    var clickHandler = (evt, cell) => {
      if (typeof insert == 'function') {
        insert(this.editor, factory(), evt, cell);
      } else {
        this.drop(factory(), evt, cell);
      }

      this.toolbar.resetMode();
      mxEvent.consume(evt);
    };

    var img = this.toolbar.addMode(title, icon, clickHandler, pressed, null, toggle);

    var dropHandler = function (graph, evt, cell) {
      clickHandler(evt, cell);
    };

    this.installDropHandler(img, dropHandler);
    return img;
  }

  drop(vertex, evt, target) {
    var graph = this.editor.graph;
    var model = graph.getModel();

    if (target == null || model.isEdge(target) || !this.connectOnDrop || !graph.isCellConnectable(target)) {
      while (target != null && !graph.isValidDropTarget(target, [vertex], evt)) {
        target = model.getParent(target);
      }

      this.insert(vertex, evt, target);
    } else {
      this.connect(vertex, evt, target);
    }
  }

  insert(vertex, evt, target) {
    var graph = this.editor.graph;

    if (graph.canImportCell(vertex)) {
      var x = mxEvent.getClientX(evt);
      var y = mxEvent.getClientY(evt);
      var pt = mxUtils.convertPoint(graph.container, x, y);

      if (graph.isSplitEnabled() && graph.isSplitTarget(target, [vertex], evt)) {
        return graph.splitEdge(target, [vertex], null, pt.x, pt.y);
      } else {
        return this.editor.addVertex(target, vertex, pt.x, pt.y);
      }
    }

    return null;
  }

  connect(vertex, evt, source) {
    var graph = this.editor.graph;
    var model = graph.getModel();

    if (source != null && graph.isCellConnectable(vertex) && graph.isEdgeValid(null, source, vertex)) {
      var edge = null;
      model.beginUpdate();

      try {
        var geo = model.getGeometry(source);
        var g = model.getGeometry(vertex).clone();
        g.x = geo.x + (geo.width - g.width) / 2;
        g.y = geo.y + (geo.height - g.height) / 2;
        var step = this.spacing * graph.gridSize;
        var dist = model.getDirectedEdgeCount(source, true) * 20;

        if (this.editor.horizontalFlow) {
          g.x += (g.width + geo.width) / 2 + step + dist;
        } else {
          g.y += (g.height + geo.height) / 2 + step + dist;
        }

        vertex.setGeometry(g);
        var parent = model.getParent(source);
        graph.addCell(vertex, parent);
        graph.constrainChild(vertex);
        edge = this.editor.createEdge(source, vertex);

        if (model.getGeometry(edge) == null) {
          var edgeGeometry = new mxGeometry();
          edgeGeometry.relative = true;
          model.setGeometry(edge, edgeGeometry);
        }

        graph.addEdge(edge, parent, source, vertex);
      } finally {
        model.endUpdate();
      }

      graph.setSelectionCells([vertex, edge]);
      graph.scrollCellToVisible(vertex);
    }
  }

  installDropHandler(img, dropHandler) {
    var sprite = document.createElement('img');
    sprite.setAttribute('src', img.getAttribute('src'));

    var loader = (evt) => {
      sprite.style.width = 2 * img.offsetWidth + 'px';
      sprite.style.height = 2 * img.offsetHeight + 'px';
      mxUtils.makeDraggable(img, this.editor.graph, dropHandler, sprite);
      mxEvent.removeListener(sprite, 'load', loader);
    };

    mxEvent.addListener(sprite, 'load', loader);
  }

  destroy() {
    if (this.resetHandler != null) {
      this.editor.graph.removeListener('dblclick', this.resetHandler);
      this.editor.removeListener('escape', this.resetHandler);
      this.resetHandler = null;
    }

    if (this.toolbar != null) {
      this.toolbar.destroy();
      this.toolbar = null;
    }
  }
}
