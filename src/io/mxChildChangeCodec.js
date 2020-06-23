import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxChildChange } from '@mxgraph/model/changes/mxChildChange';

export class mxChildChangeCodec extends mxObjectCodec {
  constructor() {
    super(new mxChildChange(), ['model', 'child', 'previousIndex'], ['parent', 'previous']);
  }

  isReference(obj, attr, value, isWrite) {
    if (attr == 'child' && (!isWrite || obj.model.contains(obj.previous))) {
      return true;
    }

    return mxUtils.indexOf(this.idrefs, attr) >= 0;
  }

  isExcluded(obj, attr, value, write) {
    return (
      super.isExcluded(obj, attr, value, write) ||
      (write && value != null && (attr == 'previous' || attr == 'parent') && !obj.model.contains(value))
    );
  }

  afterEncode(enc, obj, node) {
    if (this.isReference(obj, 'child', obj.child, true)) {
      node.setAttribute('child', enc.getId(obj.child));
    } else {
      enc.encodeCell(obj.child, node);
    }

    return node;
  }

  beforeDecode(dec, node, obj) {
    if (node.firstChild != null && node.firstChild.nodeType == mxConstants.NODETYPE_ELEMENT) {
      node = node.cloneNode(true);
      var tmp = node.firstChild;
      obj.child = dec.decodeCell(tmp, false);
      var tmp2 = tmp.nextSibling;
      tmp.parentNode.removeChild(tmp);
      tmp = tmp2;

      while (tmp != null) {
        tmp2 = tmp.nextSibling;

        if (tmp.nodeType == mxConstants.NODETYPE_ELEMENT) {
          var id = tmp.getAttribute('id');

          if (dec.lookup(id) == null) {
            dec.decodeCell(tmp);
          }
        }

        tmp.parentNode.removeChild(tmp);
        tmp = tmp2;
      }
    } else {
      var childRef = node.getAttribute('child');
      obj.child = dec.getObject(childRef);
    }

    return node;
  }

  afterDecode(dec, node, obj) {
    if (obj.child != null) {
      if (obj.child.parent != null && obj.previous != null && obj.child.parent != obj.previous) {
        obj.previous = obj.child.parent;
      }

      obj.child.parent = obj.previous;
      obj.previous = obj.parent;
      obj.previousIndex = obj.index;
    }

    return obj;
  }
}
