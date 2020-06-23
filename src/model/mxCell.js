import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxCell {
  id = null;
  geometry = null;
  style = null;
  vertex = false;
  edge = false;
  connectable = true;
  visible = true;
  collapsed = false;
  parent = null;
  source = null;
  target = null;
  children = null;
  edges = null;
  mxTransient = ['id', 'value', 'parent', 'source', 'target', 'children', 'edges'];

  constructor(value, geometry, style) {
    this.value = value;
    this.setGeometry(geometry);
    this.setStyle(style);

    if (this.onInit != null) {
      this.onInit();
    }
  }

  getId() {
    return this.id;
  }

  setId(id) {
    this.id = id;
  }

  getValue() {
    return this.value;
  }

  setValue(value) {
    this.value = value;
  }

  valueChanged(newValue) {
    var previous = this.getValue();
    this.setValue(newValue);
    return previous;
  }

  getGeometry() {
    return this.geometry;
  }

  setGeometry(geometry) {
    this.geometry = geometry;
  }

  getStyle() {
    return this.style;
  }

  setStyle(style) {
    this.style = style;
  }

  isVertex() {
    return this.vertex != 0;
  }

  setVertex(vertex) {
    this.vertex = vertex;
  }

  isEdge() {
    return this.edge != 0;
  }

  setEdge(edge) {
    this.edge = edge;
  }

  isConnectable() {
    return this.connectable != 0;
  }

  setConnectable(connectable) {
    this.connectable = connectable;
  }

  isVisible() {
    return this.visible != 0;
  }

  setVisible(visible) {
    this.visible = visible;
  }

  isCollapsed() {
    return this.collapsed != 0;
  }

  setCollapsed(collapsed) {
    this.collapsed = collapsed;
  }

  getParent() {
    return this.parent;
  }

  setParent(parent) {
    this.parent = parent;
  }

  getTerminal(source) {
    return source ? this.source : this.target;
  }

  setTerminal(terminal, isSource) {
    if (isSource) {
      this.source = terminal;
    } else {
      this.target = terminal;
    }

    return terminal;
  }

  getChildCount() {
    return this.children == null ? 0 : this.children.length;
  }

  getIndex(child) {
    return mxUtils.indexOf(this.children, child);
  }

  getChildAt(index) {
    return this.children == null ? null : this.children[index];
  }

  insert(child, index) {
    if (child != null) {
      if (index == null) {
        index = this.getChildCount();

        if (child.getParent() == this) {
          index--;
        }
      }

      child.removeFromParent();
      child.setParent(this);

      if (this.children == null) {
        this.children = [];
        this.children.push(child);
      } else {
        this.children.splice(index, 0, child);
      }
    }

    return child;
  }

  remove(index) {
    var child = null;

    if (this.children != null && index >= 0) {
      child = this.getChildAt(index);

      if (child != null) {
        this.children.splice(index, 1);
        child.setParent(null);
      }
    }

    return child;
  }

  removeFromParent() {
    if (this.parent != null) {
      var index = this.parent.getIndex(this);
      this.parent.remove(index);
    }
  }

  getEdgeCount() {
    return this.edges == null ? 0 : this.edges.length;
  }

  getEdgeIndex(edge) {
    return mxUtils.indexOf(this.edges, edge);
  }

  getEdgeAt(index) {
    return this.edges == null ? null : this.edges[index];
  }

  insertEdge(edge, isOutgoing) {
    if (edge != null) {
      edge.removeFromTerminal(isOutgoing);
      edge.setTerminal(this, isOutgoing);

      if (this.edges == null || edge.getTerminal(!isOutgoing) != this || mxUtils.indexOf(this.edges, edge) < 0) {
        if (this.edges == null) {
          this.edges = [];
        }

        this.edges.push(edge);
      }
    }

    return edge;
  }

  removeEdge(edge, isOutgoing) {
    if (edge != null) {
      if (edge.getTerminal(!isOutgoing) != this && this.edges != null) {
        var index = this.getEdgeIndex(edge);

        if (index >= 0) {
          this.edges.splice(index, 1);
        }
      }

      edge.setTerminal(null, isOutgoing);
    }

    return edge;
  }

  removeFromTerminal(isSource) {
    var terminal = this.getTerminal(isSource);

    if (terminal != null) {
      terminal.removeEdge(this, isSource);
    }
  }

  hasAttribute(name) {
    var userObject = this.getValue();
    return userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT && userObject.hasAttribute
      ? userObject.hasAttribute(name)
      : userObject.getAttribute(name) != null;
  }

  getAttribute(name, defaultValue) {
    var userObject = this.getValue();
    var val =
      userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT ? userObject.getAttribute(name) : null;
    return val != null ? val : defaultValue;
  }

  setAttribute(name, value) {
    var userObject = this.getValue();

    if (userObject != null && userObject.nodeType == mxConstants.NODETYPE_ELEMENT) {
      userObject.setAttribute(name, value);
    }
  }

  clone() {
    var clone = mxUtils.clone(this, this.mxTransient);
    clone.setValue(this.cloneValue());
    return clone;
  }

  cloneValue() {
    var value = this.getValue();

    if (value != null) {
      if (typeof value.clone == 'function') {
        value = value.clone();
      } else if (!isNaN(value.nodeType)) {
        value = value.cloneNode(true);
      }
    }

    return value;
  }
}
