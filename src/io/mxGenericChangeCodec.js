import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxGenericChangeCodec extends mxObjectCodec {
  constructor(obj, variable) {
    super(obj, ['model', 'previous'], ['cell']);
    this.variable = variable;
  }

  afterDecode(dec, node, obj) {
    if (mxUtils.isNode(obj.cell)) {
      obj.cell = dec.decodeCell(obj.cell, false);
    }

    obj.previous = obj[this.variable];
    return obj;
  }
}
