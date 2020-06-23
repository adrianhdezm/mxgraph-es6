import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxStyleRegistry } from '@mxgraph/view/mxStyleRegistry';
import { mxStylesheet } from '@mxgraph/view/mxStylesheet';

export class mxStylesheetCodec extends mxObjectCodec {
  static allowEval = true;

  constructor() {
    super(new mxStylesheet());
  }

  encode(enc, obj) {
    var node = enc.document.createElement(this.getName());

    for (var i in obj.styles) {
      var style = obj.styles[i];
      var styleNode = enc.document.createElement('add');

      if (i != null) {
        styleNode.setAttribute('as', i);

        for (var j in style) {
          var value = this.getStringValue(j, style[j]);

          if (value != null) {
            var entry = enc.document.createElement('add');
            entry.setAttribute('value', value);
            entry.setAttribute('as', j);
            styleNode.appendChild(entry);
          }
        }

        if (styleNode.childNodes.length > 0) {
          node.appendChild(styleNode);
        }
      }
    }

    return node;
  }

  getStringValue(key, value) {
    var type = typeof value;

    if (type == 'function') {
      value = mxStyleRegistry.getName(value);
    } else if (type == 'object') {
      value = null;
    }

    return value;
  }

  decode(dec, node, into) {
    var obj = into || new this.template.constructor();
    var id = node.getAttribute('id');

    if (id != null) {
      dec.objects[id] = obj;
    }

    node = node.firstChild;

    while (node != null) {
      if (!this.processInclude(dec, node, obj) && node.nodeName == 'add') {
        var as = node.getAttribute('as');

        if (as != null) {
          var extend = node.getAttribute('extend');
          var style = extend != null ? mxUtils.clone(obj.styles[extend]) : null;

          if (style == null) {
            if (extend != null) {
              mxLog.warn('mxStylesheetCodec.decode: stylesheet ' + extend + ' not found to extend');
            }

            style = new Object();
          }

          var entry = node.firstChild;

          while (entry != null) {
            if (entry.nodeType == mxConstants.NODETYPE_ELEMENT) {
              var key = entry.getAttribute('as');

              if (entry.nodeName == 'add') {
                var text = mxUtils.getTextContent(entry);
                var value = null;

                if (text != null && text.length > 0 && mxStylesheetCodec.allowEval) {
                  value = mxUtils.eval(text);
                } else {
                  value = entry.getAttribute('value');

                  if (mxUtils.isNumeric(value)) {
                    value = parseFloat(value);
                  }
                }

                if (value != null) {
                  style[key] = value;
                }
              } else if (entry.nodeName == 'remove') {
                delete style[key];
              }
            }

            entry = entry.nextSibling;
          }

          obj.putCellStyle(as, style);
        }
      }

      node = node.nextSibling;
    }

    return obj;
  }
}
