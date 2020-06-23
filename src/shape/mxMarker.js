import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxMarker {
  static markers = [];

  static addMarker(type, funct) {
    mxMarker.markers[type] = funct;
  }

  static createMarker(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
    var funct = mxMarker.markers[type];
    return funct != null ? funct(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) : null;
  }
}

export function diamond(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
  var swFactor = type == mxConstants.ARROW_DIAMOND ? 0.7071 : 0.9862;
  var endOffsetX = unitX * sw * swFactor;
  var endOffsetY = unitY * sw * swFactor;
  unitX = unitX * (size + sw);
  unitY = unitY * (size + sw);
  var pt = pe.clone();
  pt.x -= endOffsetX;
  pt.y -= endOffsetY;
  pe.x += -unitX - endOffsetX;
  pe.y += -unitY - endOffsetY;
  var tk = type == mxConstants.ARROW_DIAMOND ? 2 : 3.4;
  return function () {
    canvas.begin();
    canvas.moveTo(pt.x, pt.y);
    canvas.lineTo(pt.x - unitX / 2 - unitY / tk, pt.y + unitX / tk - unitY / 2);
    canvas.lineTo(pt.x - unitX, pt.y - unitY);
    canvas.lineTo(pt.x - unitX / 2 + unitY / tk, pt.y - unitY / 2 - unitX / tk);
    canvas.close();

    if (filled) {
      canvas.fillAndStroke();
    } else {
      canvas.stroke();
    }
  };
}

export function createOpenArrow(widthFactor) {
  widthFactor = widthFactor != null ? widthFactor : 2;
  return function (canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
    var endOffsetX = unitX * sw * 1.118;
    var endOffsetY = unitY * sw * 1.118;
    unitX = unitX * (size + sw);
    unitY = unitY * (size + sw);
    var pt = pe.clone();
    pt.x -= endOffsetX;
    pt.y -= endOffsetY;
    pe.x += -endOffsetX * 2;
    pe.y += -endOffsetY * 2;
    return function () {
      canvas.begin();
      canvas.moveTo(pt.x - unitX - unitY / widthFactor, pt.y - unitY + unitX / widthFactor);
      canvas.lineTo(pt.x, pt.y);
      canvas.lineTo(pt.x + unitY / widthFactor - unitX, pt.y - unitY - unitX / widthFactor);
      canvas.stroke();
    };
  };
}

export function createArrow(widthFactor) {
  widthFactor = widthFactor != null ? widthFactor : 2;
  return function (canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
    var endOffsetX = unitX * sw * 1.118;
    var endOffsetY = unitY * sw * 1.118;
    unitX = unitX * (size + sw);
    unitY = unitY * (size + sw);
    var pt = pe.clone();
    pt.x -= endOffsetX;
    pt.y -= endOffsetY;
    var f = type != mxConstants.ARROW_CLASSIC && type != mxConstants.ARROW_CLASSIC_THIN ? 1 : 3 / 4;
    pe.x += -unitX * f - endOffsetX;
    pe.y += -unitY * f - endOffsetY;
    return function () {
      canvas.begin();
      canvas.moveTo(pt.x, pt.y);
      canvas.lineTo(pt.x - unitX - unitY / widthFactor, pt.y - unitY + unitX / widthFactor);

      if (type == mxConstants.ARROW_CLASSIC || type == mxConstants.ARROW_CLASSIC_THIN) {
        canvas.lineTo(pt.x - (unitX * 3) / 4, pt.y - (unitY * 3) / 4);
      }

      canvas.lineTo(pt.x + unitY / widthFactor - unitX, pt.y - unitY - unitX / widthFactor);
      canvas.close();

      if (filled) {
        canvas.fillAndStroke();
      } else {
        canvas.stroke();
      }
    };
  };
}

export function oval(canvas, shape, type, pe, unitX, unitY, size, source, sw, filled) {
  var a = size / 2;
  var pt = pe.clone();
  pe.x -= unitX * a;
  pe.y -= unitY * a;
  return function () {
    canvas.ellipse(pt.x - a, pt.y - a, size, size);

    if (filled) {
      canvas.fillAndStroke();
    } else {
      canvas.stroke();
    }
  };
}
