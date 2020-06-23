import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxGraph } from '@mxgraph/view/mxGraph';

export class mxGraphCodec extends mxObjectCodec {
  constructor() {
    super(new mxGraph(), [
      'graphListeners',
      'eventListeners',
      'view',
      'container',
      'cellRenderer',
      'editor',
      'selection'
    ]);
  }
}
