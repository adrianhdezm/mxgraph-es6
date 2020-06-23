export class mxEventObject {
  consumed = false;

  constructor(name) {
    this.name = name;
    this.properties = [];

    for (var i = 1; i < arguments.length; i += 2) {
      if (arguments[i + 1] != null) {
        this.properties[arguments[i]] = arguments[i + 1];
      }
    }
  }

  getName() {
    return this.name;
  }

  getProperties() {
    return this.properties;
  }

  getProperty(key) {
    return this.properties[key];
  }

  isConsumed() {
    return this.consumed;
  }

  consume() {
    this.consumed = true;
  }
}
