import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxCell } from '@mxgraph/model/mxCell';
import { mxCodecRegistry } from '@mxgraph/io/mxCodecRegistry';

export class mxCellCodec extends mxObjectCodec {
  constructor() {
    super(new mxCell(), ['children', 'edges', 'overlays', 'mxTransient'], ['parent', 'source', 'target']);
  }

  isCellCodec() {
    return true;
  }

  isNumericAttribute(dec, attr, obj) {
    return attr.nodeName !== 'value' && super.isNumericAttribute(dec, attr, obj);
  }

  isExcluded(obj, attr, value, isWrite) {
    return (
      super.isExcluded(obj, attr, value, isWrite) ||
      (isWrite && attr == 'value' && value.nodeType == mxConstants.NODETYPE_ELEMENT)
    );
  }

  afterEncode(enc, obj, node) {
    if (obj.value != null && obj.value.nodeType == mxConstants.NODETYPE_ELEMENT) {
      var tmp = node;
      node = mxUtils.importNode(enc.document, obj.value, true);
      node.appendChild(tmp);
      var id = tmp.getAttribute('id');
      node.setAttribute('id', id);
      tmp.removeAttribute('id');
    }

    return node;
  }

  beforeDecode(dec, node, obj) {
    var inner = node.cloneNode(true);
    var classname = this.getName();

    if (node.nodeName != classname) {
      var tmp = node.getElementsByTagName(classname)[0];

      if (tmp != null && tmp.parentNode == node) {
        mxUtils.removeWhitespace(tmp, true);
        mxUtils.removeWhitespace(tmp, false);
        tmp.parentNode.removeChild(tmp);
        inner = tmp;
      } else {
        inner = null;
      }

      obj.value = node.cloneNode(true);
      var id = obj.value.getAttribute('id');

      if (id != null) {
        obj.setId(id);
        obj.value.removeAttribute('id');
      }
    } else {
      obj.setId(node.getAttribute('id'));
    }

    if (inner != null) {
      for (var i = 0; i < this.idrefs.length; i++) {
        var attr = this.idrefs[i];
        var ref = inner.getAttribute(attr);

        if (ref != null) {
          inner.removeAttribute(attr);
          var object = dec.objects[ref] || dec.lookup(ref);

          if (object == null) {
            var element = dec.getElementById(ref);

            if (element != null) {
              var decoder = mxCodecRegistry.codecs[element.nodeName] || this;
              object = decoder.decode(dec, element);
            }
          }

          obj[attr] = object;
        }
      }
    }

    return inner;
  }
}
