export class mxObjectIdentity {
  static FIELD_NAME = 'mxObjectId';
  static counter = 0;

  static get(obj) {
    if (obj != null) {
      if (obj[mxObjectIdentity.FIELD_NAME] == null) {
        if (typeof obj === 'object') {
          var ctor = getFunctionName(obj.constructor);
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

function getFunctionName(f) {
  var str = null;

  if (f != null) {
    if (f.name != null) {
      str = f.name;
    } else {
      str = f.toString().trim();

      if (/^function\s/.test(str)) {
        str = ltrim(str.substring(9));
        var idx2 = str.indexOf('(');

        if (idx2 > 0) {
          str = str.substring(0, idx2);
        }
      }
    }
  }

  return str;
}

function ltrim(str, chars) {
  chars = chars || '\\s';
  return str != null ? str.replace(new RegExp('^[' + chars + ']+', 'g'), '') : null;
}
