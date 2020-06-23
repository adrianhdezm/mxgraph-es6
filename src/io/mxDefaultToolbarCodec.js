import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxDefaultToolbar } from '@mxgraph/editor/mxDefaultToolbar';

export class mxDefaultToolbarCodec extends mxObjectCodec {
  static allowEval = true;

  constructor() {
    super(new mxDefaultToolbar());
  }

  encode(enc, obj) {
    return null;
  }

  decode(dec, node, into) {
    if (into != null) {
      var editor = into.editor;
      node = node.firstChild;

      while (node != null) {
        if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
          if (!this.processInclude(dec, node, into)) {
            if (node.nodeName == 'separator') {
              into.addSeparator();
            } else if (node.nodeName == 'br') {
              into.toolbar.addBreak();
            } else if (node.nodeName == 'hr') {
              into.toolbar.addLine();
            } else if (node.nodeName == 'add') {
              var as = node.getAttribute('as');
              as = mxResources.get(as) || as;
              var icon = node.getAttribute('icon');
              var pressedIcon = node.getAttribute('pressedIcon');
              var action = node.getAttribute('action');
              var mode = node.getAttribute('mode');
              var template = node.getAttribute('template');
              var toggle = node.getAttribute('toggle') != '0';
              var text = mxUtils.getTextContent(node);
              var elt = null;

              if (action != null) {
                elt = into.addItem(as, icon, action, pressedIcon);
              } else if (mode != null) {
                var funct = mxDefaultToolbarCodec.allowEval ? mxUtils.eval(text) : null;
                elt = into.addMode(as, icon, mode, pressedIcon, funct);
              } else if (template != null || (text != null && text.length > 0)) {
                var cell = editor.templates[template];
                var style = node.getAttribute('style');

                if (cell != null && style != null) {
                  cell = editor.graph.cloneCell(cell);
                  cell.setStyle(style);
                }

                var insertFunction = null;

                if (text != null && text.length > 0 && mxDefaultToolbarCodec.allowEval) {
                  insertFunction = mxUtils.eval(text);
                }

                elt = into.addPrototype(as, icon, cell, pressedIcon, insertFunction, toggle);
              } else {
                var children = mxUtils.getChildNodes(node);

                if (children.length > 0) {
                  if (icon == null) {
                    var combo = into.addActionCombo(as);

                    for (var i = 0; i < children.length; i++) {
                      var child = children[i];

                      if (child.nodeName == 'separator') {
                        into.addOption(combo, '---');
                      } else if (child.nodeName == 'add') {
                        var lab = child.getAttribute('as');
                        var act = child.getAttribute('action');
                        into.addActionOption(combo, lab, act);
                      }
                    }
                  } else {
                    var select = null;

                    var create = function () {
                      var template = editor.templates[select.value];

                      if (template != null) {
                        var clone = template.clone();
                        var style = select.options[select.selectedIndex].cellStyle;

                        if (style != null) {
                          clone.setStyle(style);
                        }

                        return clone;
                      } else {
                        mxLog.warn('Template ' + template + ' not found');
                      }

                      return null;
                    };

                    var img = into.addPrototype(as, icon, create, null, null, toggle);
                    select = into.addCombo();
                    mxEvent.addListener(select, 'change', function () {
                      into.toolbar.selectMode(img, function (evt) {
                        var pt = mxUtils.convertPoint(
                          editor.graph.container,
                          mxEvent.getClientX(evt),
                          mxEvent.getClientY(evt)
                        );
                        return editor.addVertex(null, funct(), pt.x, pt.y);
                      });
                      into.toolbar.noReset = false;
                    });

                    for (var i = 0; i < children.length; i++) {
                      var child = children[i];

                      if (child.nodeName == 'separator') {
                        into.addOption(select, '---');
                      } else if (child.nodeName == 'add') {
                        var lab = child.getAttribute('as');
                        var tmp = child.getAttribute('template');
                        var option = into.addOption(select, lab, tmp || template);
                        option.cellStyle = child.getAttribute('style');
                      }
                    }
                  }
                }
              }

              if (elt != null) {
                var id = node.getAttribute('id');

                if (id != null && id.length > 0) {
                  elt.setAttribute('id', id);
                }
              }
            }
          }
        }

        node = node.nextSibling;
      }
    }

    return into;
  }
}
