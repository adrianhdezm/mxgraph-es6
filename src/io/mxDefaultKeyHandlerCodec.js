import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxDefaultKeyHandler } from '@mxgraph/editor/mxDefaultKeyHandler';

export class mxDefaultKeyHandlerCodec extends mxObjectCodec {
  constructor() {
    super(new mxDefaultKeyHandler());
  }

  encode(enc, obj) {
    return null;
  }

  decode(dec, node, into) {
    if (into != null) {
      var editor = into.editor;
      node = node.firstChild;

      while (node != null) {
        if (!this.processInclude(dec, node, into) && node.nodeName == 'add') {
          var as = node.getAttribute('as');
          var action = node.getAttribute('action');
          var control = node.getAttribute('control');
          into.bindAction(as, action, control);
        }

        node = node.nextSibling;
      }
    }

    return into;
  }
}
