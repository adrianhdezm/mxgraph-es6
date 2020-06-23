import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUrlConverter } from '@mxgraph/util/mxUrlConverter';

export class mxAbstractCanvas2D {
  state = null;
  states = null;
  path = null;
  rotateHtml = true;
  lastX = 0;
  lastY = 0;
  moveOp = 'M';
  lineOp = 'L';
  quadOp = 'Q';
  curveOp = 'C';
  closeOp = 'Z';
  pointerEvents = false;

  constructor() {
    this.converter = this.createUrlConverter();
    this.reset();
  }

  createUrlConverter() {
    return new mxUrlConverter();
  }

  reset() {
    this.state = this.createState();
    this.states = [];
  }

  createState() {
    return {
      dx: 0,
      dy: 0,
      scale: 1,
      alpha: 1,
      fillAlpha: 1,
      strokeAlpha: 1,
      fillColor: null,
      gradientFillAlpha: 1,
      gradientColor: null,
      gradientAlpha: 1,
      gradientDirection: null,
      strokeColor: null,
      strokeWidth: 1,
      dashed: false,
      dashPattern: '3 3',
      fixDash: false,
      lineCap: 'flat',
      lineJoin: 'miter',
      miterLimit: 10,
      fontColor: '#000000',
      fontBackgroundColor: null,
      fontBorderColor: null,
      fontSize: mxConstants.DEFAULT_FONTSIZE,
      fontFamily: mxConstants.DEFAULT_FONTFAMILY,
      fontStyle: 0,
      shadow: false,
      shadowColor: mxConstants.SHADOWCOLOR,
      shadowAlpha: mxConstants.SHADOW_OPACITY,
      shadowDx: mxConstants.SHADOW_OFFSET_X,
      shadowDy: mxConstants.SHADOW_OFFSET_Y,
      rotation: 0,
      rotationCx: 0,
      rotationCy: 0
    };
  }

  format(value) {
    return Math.round(parseFloat(value));
  }

  addOp() {
    if (this.path != null) {
      this.path.push(arguments[0]);

      if (arguments.length > 2) {
        var s = this.state;

        for (var i = 2; i < arguments.length; i += 2) {
          this.lastX = arguments[i - 1];
          this.lastY = arguments[i];
          this.path.push(this.format((this.lastX + s.dx) * s.scale));
          this.path.push(this.format((this.lastY + s.dy) * s.scale));
        }
      }
    }
  }

  rotatePoint(x, y, theta, cx, cy) {
    var rad = theta * (Math.PI / 180);
    return mxUtils.getRotatedPoint(new mxPoint(x, y), Math.cos(rad), Math.sin(rad), new mxPoint(cx, cy));
  }

  save() {
    this.states.push(this.state);
    this.state = mxUtils.clone(this.state);
  }

  restore() {
    if (this.states.length > 0) {
      this.state = this.states.pop();
    }
  }

  setLink(link) {}

  scale(value) {
    this.state.scale *= value;
    this.state.strokeWidth *= value;
  }

  translate(dx, dy) {
    this.state.dx += dx;
    this.state.dy += dy;
  }

  rotate(theta, flipH, flipV, cx, cy) {}

  setAlpha(value) {
    this.state.alpha = value;
  }

  setFillAlpha(value) {
    this.state.fillAlpha = value;
  }

  setStrokeAlpha(value) {
    this.state.strokeAlpha = value;
  }

  setFillColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.fillColor = value;
    this.state.gradientColor = null;
  }

  setGradient(color1, color2, x, y, w, h, direction, alpha1, alpha2) {
    var s = this.state;
    s.fillColor = color1;
    s.gradientFillAlpha = alpha1 != null ? alpha1 : 1;
    s.gradientColor = color2;
    s.gradientAlpha = alpha2 != null ? alpha2 : 1;
    s.gradientDirection = direction;
  }

  setStrokeColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.strokeColor = value;
  }

  setStrokeWidth(value) {
    this.state.strokeWidth = value;
  }

  setDashed(value, fixDash) {
    this.state.dashed = value;
    this.state.fixDash = fixDash;
  }

  setDashPattern(value) {
    this.state.dashPattern = value;
  }

  setLineCap(value) {
    this.state.lineCap = value;
  }

  setLineJoin(value) {
    this.state.lineJoin = value;
  }

  setMiterLimit(value) {
    this.state.miterLimit = value;
  }

  setFontColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.fontColor = value;
  }

  setFontBackgroundColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.fontBackgroundColor = value;
  }

  setFontBorderColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.fontBorderColor = value;
  }

  setFontSize(value) {
    this.state.fontSize = parseFloat(value);
  }

  setFontFamily(value) {
    this.state.fontFamily = value;
  }

  setFontStyle(value) {
    if (value == null) {
      value = 0;
    }

    this.state.fontStyle = value;
  }

  setShadow(enabled) {
    this.state.shadow = enabled;
  }

  setShadowColor(value) {
    if (value == mxConstants.NONE) {
      value = null;
    }

    this.state.shadowColor = value;
  }

  setShadowAlpha(value) {
    this.state.shadowAlpha = value;
  }

  setShadowOffset(dx, dy) {
    this.state.shadowDx = dx;
    this.state.shadowDy = dy;
  }

  begin() {
    this.lastX = 0;
    this.lastY = 0;
    this.path = [];
  }

  moveTo(x, y) {
    this.addOp(this.moveOp, x, y);
  }

  lineTo(x, y) {
    this.addOp(this.lineOp, x, y);
  }

  quadTo(x1, y1, x2, y2) {
    this.addOp(this.quadOp, x1, y1, x2, y2);
  }

  curveTo(x1, y1, x2, y2, x3, y3) {
    this.addOp(this.curveOp, x1, y1, x2, y2, x3, y3);
  }

  arcTo(rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
    var curves = mxUtils.arcToCurves(this.lastX, this.lastY, rx, ry, angle, largeArcFlag, sweepFlag, x, y);

    if (curves != null) {
      for (var i = 0; i < curves.length; i += 6) {
        this.curveTo(curves[i], curves[i + 1], curves[i + 2], curves[i + 3], curves[i + 4], curves[i + 5]);
      }
    }
  }

  close(x1, y1, x2, y2, x3, y3) {
    this.addOp(this.closeOp);
  }

  end() {}
}
