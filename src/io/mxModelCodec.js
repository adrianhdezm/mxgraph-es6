import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxGraphModel } from '@mxgraph/model/mxGraphModel';

export class mxModelCodec extends mxObjectCodec {
  constructor() {
    super(new mxGraphModel());
  }

  encodeObject(enc, obj, node) {
    var rootNode = enc.document.createElement('root');
    enc.encodeCell(obj.getRoot(), rootNode);
    node.appendChild(rootNode);
  }

  decodeChild(dec, child, obj) {
    if (child.nodeName == 'root') {
      this.decodeRoot(dec, child, obj);
    } else {
      super.decodeChild(dec, child, obj);
    }
  }

  decodeRoot(dec, root, model) {
    var rootCell = null;
    var tmp = root.firstChild;

    while (tmp != null) {
      var cell = dec.decodeCell(tmp);

      if (cell != null && cell.getParent() == null) {
        rootCell = cell;
      }

      tmp = tmp.nextSibling;
    }

    if (rootCell != null) {
      model.setRoot(rootCell);
    }
  }
}
