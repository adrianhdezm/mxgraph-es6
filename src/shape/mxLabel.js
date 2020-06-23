import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';

export class mxLabel extends mxRectangleShape {
  static imageSize = mxConstants.DEFAULT_IMAGESIZE;
  spacing = 2;
  indicatorSize = 10;
  indicatorSpacing = 2;

  constructor(bounds, fill, stroke, strokewidth) {
    super(bounds, fill, stroke, strokewidth);
  }

  init(container) {
    super.init(container);

    if (this.indicatorShape != null) {
      this.indicator = new this.indicatorShape();
      this.indicator.dialect = this.dialect;
      this.indicator.init(this.node);
    }
  }

  redraw() {
    if (this.indicator != null) {
      this.indicator.fill = this.indicatorColor;
      this.indicator.stroke = this.indicatorStrokeColor;
      this.indicator.gradient = this.indicatorGradientColor;
      this.indicator.direction = this.indicatorDirection;
      this.indicator.redraw();
    }

    super.redraw();
  }

  isHtmlAllowed() {
    return super.isHtmlAllowed() && this.indicatorColor == null && this.indicatorShape == null;
  }

  paintForeground(c, x, y, w, h) {
    this.paintImage(c, x, y, w, h);
    this.paintIndicator(c, x, y, w, h);
    super.paintForeground(c, x, y, w, h);
  }

  paintImage(c, x, y, w, h) {
    if (this.image != null) {
      var bounds = this.getImageBounds(x, y, w, h);
      c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.image, false, false, false);
    }
  }

  getImageBounds(x, y, w, h) {
    var align = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
    var valign = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
    var width = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_WIDTH, mxConstants.DEFAULT_IMAGESIZE);
    var height = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_HEIGHT, mxConstants.DEFAULT_IMAGESIZE);
    var spacing = mxUtils.getNumber(this.style, mxConstants.STYLE_SPACING, this.spacing) + 5;

    if (align == mxConstants.ALIGN_CENTER) {
      x += (w - width) / 2;
    } else if (align == mxConstants.ALIGN_RIGHT) {
      x += w - width - spacing;
    } else {
      x += spacing;
    }

    if (valign == mxConstants.ALIGN_TOP) {
      y += spacing;
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      y += h - height - spacing;
    } else {
      y += (h - height) / 2;
    }

    return new mxRectangle(x, y, width, height);
  }

  paintIndicator(c, x, y, w, h) {
    if (this.indicator != null) {
      this.indicator.bounds = this.getIndicatorBounds(x, y, w, h);
      this.indicator.paint(c);
    } else if (this.indicatorImage != null) {
      var bounds = this.getIndicatorBounds(x, y, w, h);
      c.image(bounds.x, bounds.y, bounds.width, bounds.height, this.indicatorImage, false, false, false);
    }
  }

  getIndicatorBounds(x, y, w, h) {
    var align = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_ALIGN, mxConstants.ALIGN_LEFT);
    var valign = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE);
    var width = mxUtils.getNumber(this.style, mxConstants.STYLE_INDICATOR_WIDTH, this.indicatorSize);
    var height = mxUtils.getNumber(this.style, mxConstants.STYLE_INDICATOR_HEIGHT, this.indicatorSize);
    var spacing = this.spacing + 5;

    if (align == mxConstants.ALIGN_RIGHT) {
      x += w - width - spacing;
    } else if (align == mxConstants.ALIGN_CENTER) {
      x += (w - width) / 2;
    } else {
      x += spacing;
    }

    if (valign == mxConstants.ALIGN_BOTTOM) {
      y += h - height - spacing;
    } else if (valign == mxConstants.ALIGN_TOP) {
      y += spacing;
    } else {
      y += (h - height) / 2;
    }

    return new mxRectangle(x, y, width, height);
  }

  redrawHtmlShape() {
    super.redrawHtmlShape();

    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild);
    }

    if (this.image != null) {
      var node = document.createElement('img');
      node.style.position = 'relative';
      node.setAttribute('border', '0');
      var bounds = this.getImageBounds(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
      bounds.x -= this.bounds.x;
      bounds.y -= this.bounds.y;
      node.style.left = Math.round(bounds.x) + 'px';
      node.style.top = Math.round(bounds.y) + 'px';
      node.style.width = Math.round(bounds.width) + 'px';
      node.style.height = Math.round(bounds.height) + 'px';
      node.src = this.image;
      this.node.appendChild(node);
    }
  }
}
