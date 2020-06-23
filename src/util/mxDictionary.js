import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';

export class mxDictionary {
  map = null;

  constructor() {
    this.clear();
  }

  clear() {
    this.map = {};
  }

  get(key) {
    var id = mxObjectIdentity.get(key);
    return this.map[id];
  }

  put(key, value) {
    var id = mxObjectIdentity.get(key);
    var previous = this.map[id];
    this.map[id] = value;
    return previous;
  }

  remove(key) {
    var id = mxObjectIdentity.get(key);
    var previous = this.map[id];
    delete this.map[id];
    return previous;
  }

  getKeys() {
    var result = [];

    for (var key in this.map) {
      result.push(key);
    }

    return result;
  }

  getValues() {
    var result = [];

    for (var key in this.map) {
      result.push(this.map[key]);
    }

    return result;
  }

  visit(visitor) {
    for (var key in this.map) {
      visitor(key, this.map[key]);
    }
  }
}
