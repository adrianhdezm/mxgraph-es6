import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxPerimeter } from '@mxgraph/view/mxPerimeter';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxStylesheet {
  constructor() {
    this.styles = new Object();
    this.putDefaultVertexStyle(this.createDefaultVertexStyle());
    this.putDefaultEdgeStyle(this.createDefaultEdgeStyle());
  }

  createDefaultVertexStyle() {
    var style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_RECTANGLE;
    style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_FILLCOLOR] = '#C3D9FF';
    style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
    style[mxConstants.STYLE_FONTCOLOR] = '#774400';
    return style;
  }

  createDefaultEdgeStyle() {
    var style = new Object();
    style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_CONNECTOR;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
    style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_CENTER;
    style[mxConstants.STYLE_STROKECOLOR] = '#6482B9';
    style[mxConstants.STYLE_FONTCOLOR] = '#446299';
    return style;
  }

  putDefaultVertexStyle(style) {
    this.putCellStyle('defaultVertex', style);
  }

  putDefaultEdgeStyle(style) {
    this.putCellStyle('defaultEdge', style);
  }

  getDefaultVertexStyle() {
    return this.styles['defaultVertex'];
  }

  getDefaultEdgeStyle() {
    return this.styles['defaultEdge'];
  }

  putCellStyle(name, style) {
    this.styles[name] = style;
  }

  getCellStyle(name, defaultStyle) {
    var style = defaultStyle;

    if (name != null && name.length > 0) {
      var pairs = name.split(';');

      if (style != null && name.charAt(0) != ';') {
        style = mxUtils.clone(style);
      } else {
        style = new Object();
      }

      for (var i = 0; i < pairs.length; i++) {
        var tmp = pairs[i];
        var pos = tmp.indexOf('=');

        if (pos >= 0) {
          var key = tmp.substring(0, pos);
          var value = tmp.substring(pos + 1);

          if (value == mxConstants.NONE) {
            delete style[key];
          } else if (mxUtils.isNumeric(value)) {
            style[key] = parseFloat(value);
          } else {
            style[key] = value;
          }
        } else {
          var tmpStyle = this.styles[tmp];

          if (tmpStyle != null) {
            for (var key in tmpStyle) {
              style[key] = tmpStyle[key];
            }
          }
        }
      }
    }

    return style;
  }
}
