export class mxImageBundle {
  constructor(alt) {
    this.images = [];
    this.alt = alt != null ? alt : false;
  }

  putImage(key, value, fallback) {
    this.images[key] = {
      value: value,
      fallback: fallback
    };
  }

  getImage(key) {
    var result = null;

    if (key != null) {
      var img = this.images[key];

      if (img != null) {
        result = this.alt ? img.fallback : img.value;
      }
    }

    return result;
  }
}
