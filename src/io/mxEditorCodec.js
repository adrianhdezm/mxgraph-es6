import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxClient } from '@mxgraph/mxClient';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxWindow } from '@mxgraph/util/mxWindow';
import { mxEditor } from '@mxgraph/editor/mxEditor';

export class mxEditorCodec extends mxObjectCodec {
  constructor() {
    super(new mxEditor(), [
      'modified',
      'lastSnapshot',
      'ignoredChanges',
      'undoManager',
      'graphContainer',
      'toolbarContainer'
    ]);
  }

  afterDecode(dec, node, obj) {
    var defaultEdge = node.getAttribute('defaultEdge');

    if (defaultEdge != null) {
      node.removeAttribute('defaultEdge');
      obj.defaultEdge = obj.templates[defaultEdge];
    }

    var defaultGroup = node.getAttribute('defaultGroup');

    if (defaultGroup != null) {
      node.removeAttribute('defaultGroup');
      obj.defaultGroup = obj.templates[defaultGroup];
    }

    return obj;
  }

  decodeChild(dec, child, obj) {
    if (child.nodeName == 'Array') {
      var role = child.getAttribute('as');

      if (role == 'templates') {
        this.decodeTemplates(dec, child, obj);
        return;
      }
    } else if (child.nodeName == 'ui') {
      this.decodeUi(dec, child, obj);
      return;
    }

    super.decodeChild(dec, child, obj);
  }

  decodeUi(dec, node, editor) {
    var tmp = node.firstChild;

    while (tmp != null) {
      if (tmp.nodeName == 'add') {
        var as = tmp.getAttribute('as');
        var elt = tmp.getAttribute('element');
        var style = tmp.getAttribute('style');
        var element = null;

        if (elt != null) {
          element = document.getElementById(elt);

          if (element != null && style != null) {
            element.style.cssText += ';' + style;
          }
        } else {
          var x = parseInt(tmp.getAttribute('x'));
          var y = parseInt(tmp.getAttribute('y'));
          var width = tmp.getAttribute('width');
          var height = tmp.getAttribute('height');
          element = document.createElement('div');
          element.style.cssText = style;
          var wnd = new mxWindow(mxResources.get(as) || as, element, x, y, width, height, false, true);
          wnd.setVisible(true);
        }

        if (as == 'graph') {
          editor.setGraphContainer(element);
        } else if (as == 'toolbar') {
          editor.setToolbarContainer(element);
        } else if (as == 'title') {
          editor.setTitleContainer(element);
        } else if (as == 'status') {
          editor.setStatusContainer(element);
        } else if (as == 'map') {
          editor.setMapContainer(element);
        }
      } else if (tmp.nodeName == 'resource') {
        mxResources.add(tmp.getAttribute('basename'));
      } else if (tmp.nodeName == 'stylesheet') {
        mxClient.link('stylesheet', tmp.getAttribute('name'));
      }

      tmp = tmp.nextSibling;
    }
  }

  decodeTemplates(dec, node, editor) {
    if (editor.templates == null) {
      editor.templates = [];
    }

    var children = mxUtils.getChildNodes(node);

    for (var j = 0; j < children.length; j++) {
      var name = children[j].getAttribute('as');
      var child = children[j].firstChild;

      while (child != null && child.nodeType != 1) {
        child = child.nextSibling;
      }

      if (child != null) {
        editor.templates[name] = dec.decodeCell(child);
      }
    }
  }
}
