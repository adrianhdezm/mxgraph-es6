import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxRootChange } from '@mxgraph/model/changes/mxRootChange';

export class mxRootChangeCodec extends mxObjectCodec {
  constructor() {
    super(new mxRootChange(), ['model', 'previous', 'root']);
  }

  afterEncode(enc, obj, node) {
    enc.encodeCell(obj.root, node);
    return node;
  }

  beforeDecode(dec, node, obj) {
    if (node.firstChild != null && node.firstChild.nodeType == mxConstants.NODETYPE_ELEMENT) {
      node = node.cloneNode(true);
      var tmp = node.firstChild;
      obj.root = dec.decodeCell(tmp, false);
      var tmp2 = tmp.nextSibling;
      tmp.parentNode.removeChild(tmp);
      tmp = tmp2;

      while (tmp != null) {
        tmp2 = tmp.nextSibling;
        dec.decodeCell(tmp);
        tmp.parentNode.removeChild(tmp);
        tmp = tmp2;
      }
    }

    return node;
  }

  afterDecode(dec, node, obj) {
    obj.previous = obj.root;
    return obj;
  }
}
