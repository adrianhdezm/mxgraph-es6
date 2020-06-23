import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxObjectIdentity {
  static FIELD_NAME = 'mxObjectId';
  static counter = 0;

  static get(obj) {
    if (obj != null) {
      if (obj[mxObjectIdentity.FIELD_NAME] == null) {
        if (typeof obj === 'object') {
          var ctor = mxUtils.getFunctionName(obj.constructor);
          obj[mxObjectIdentity.FIELD_NAME] = ctor + '#' + mxObjectIdentity.counter++;
        } else if (typeof obj === 'function') {
          obj[mxObjectIdentity.FIELD_NAME] = 'Function#' + mxObjectIdentity.counter++;
        }
      }

      return obj[mxObjectIdentity.FIELD_NAME];
    }

    return null;
  }

  static clear(obj) {
    if (typeof obj === 'object' || typeof obj === 'function') {
      delete obj[mxObjectIdentity.FIELD_NAME];
    }
  }
}
