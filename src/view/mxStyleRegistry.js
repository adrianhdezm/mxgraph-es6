export class mxStyleRegistry {
  static values = [];

  static putValue(name, obj) {
    mxStyleRegistry.values[name] = obj;
  }

  static getValue(name) {
    return mxStyleRegistry.values[name];
  }

  static getName(value) {
    for (var key in mxStyleRegistry.values) {
      if (mxStyleRegistry.values[key] == value) {
        return key;
      }
    }

    return null;
  }
}
