import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxTerminalChange } from '@mxgraph/model/changes/mxTerminalChange';

export class mxTerminalChangeCodec extends mxObjectCodec {
  constructor() {
    super(new mxTerminalChange(), ['model', 'previous'], ['cell', 'terminal']);
  }

  afterDecode(dec, node, obj) {
    obj.previous = obj.terminal;
    return obj;
  }
}
