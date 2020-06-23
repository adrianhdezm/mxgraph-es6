import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxDefaultPopupMenu } from '@mxgraph/editor/mxDefaultPopupMenu';

export class mxDefaultPopupMenuCodec extends mxObjectCodec {
  constructor() {
    super(new mxDefaultPopupMenu());
  }

  encode(enc, obj) {
    return null;
  }

  decode(dec, node, into) {
    var inc = node.getElementsByTagName('include')[0];

    if (inc != null) {
      this.processInclude(dec, inc, into);
    } else if (into != null) {
      into.config = node;
    }

    return into;
  }
}
