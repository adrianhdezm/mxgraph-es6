import { mxRectangleShape } from '@mxgraph/shape/mxRectangleShape';
import { mxClient } from '@mxgraph/mxClient';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxImageShape extends mxRectangleShape {
  preserveImageAspect = true;

  constructor(bounds, image, fill, stroke, strokewidth) {
    super();
    this.bounds = bounds;
    this.image = image;
    this.fill = fill;
    this.stroke = stroke;
    this.strokewidth = strokewidth != null ? strokewidth : 1;
    this.shadow = false;
  }

  getSvgScreenOffset() {
    return 0;
  }

  apply(state) {
    super.apply(state);
    this.fill = null;
    this.stroke = null;
    this.gradient = null;

    if (this.style != null) {
      this.preserveImageAspect = mxUtils.getNumber(this.style, mxConstants.STYLE_IMAGE_ASPECT, 1) == 1;
      this.flipH = this.flipH || mxUtils.getValue(this.style, 'imageFlipH', 0) == 1;
      this.flipV = this.flipV || mxUtils.getValue(this.style, 'imageFlipV', 0) == 1;
    }
  }

  isHtmlAllowed() {
    return !this.preserveImageAspect;
  }

  createHtml() {
    var node = document.createElement('div');
    node.style.position = 'absolute';
    return node;
  }

  isRoundable(c, x, y, w, h) {
    return false;
  }

  paintVertexShape(c, x, y, w, h) {
    if (this.image != null) {
      var fill = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BACKGROUND, null);
      var stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, null);

      if (fill != null) {
        c.setFillColor(fill);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.fillAndStroke();
      }

      c.image(x, y, w, h, this.image, this.preserveImageAspect, false, false);
      var stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, null);

      if (stroke != null) {
        c.setShadow(false);
        c.setStrokeColor(stroke);
        c.rect(x, y, w, h);
        c.stroke();
      }
    } else {
      super.paintBackground(c, x, y, w, h);
    }
  }

  redrawHtmlShape() {
    this.node.style.left = Math.round(this.bounds.x) + 'px';
    this.node.style.top = Math.round(this.bounds.y) + 'px';
    this.node.style.width = Math.max(0, Math.round(this.bounds.width)) + 'px';
    this.node.style.height = Math.max(0, Math.round(this.bounds.height)) + 'px';
    this.node.innerHTML = '';

    if (this.image != null) {
      var fill = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BACKGROUND, '');
      var stroke = mxUtils.getValue(this.style, mxConstants.STYLE_IMAGE_BORDER, '');
      this.node.style.backgroundColor = fill;
      this.node.style.borderColor = stroke;
      var useVml = this.rotation != 0;
      var img = document.createElement(useVml ? mxClient.VML_PREFIX + ':image' : 'img');
      img.setAttribute('border', '0');
      img.style.position = 'absolute';
      img.src = this.image;
      var filter = this.opacity < 100 ? 'alpha(opacity=' + this.opacity + ')' : '';
      this.node.style.filter = filter;

      if (this.flipH && this.flipV) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
      } else if (this.flipH) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(mirror=1)';
      } else if (this.flipV) {
        filter += 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)';
      }

      if (img.style.filter != filter) {
        img.style.filter = filter;
      }

      if (img.nodeName == 'image') {
        img.style.rotation = this.rotation;
      } else if (this.rotation != 0) {
        mxUtils.setPrefixedStyle(img.style, 'transform', 'rotate(' + this.rotation + 'deg)');
      } else {
        mxUtils.setPrefixedStyle(img.style, 'transform', '');
      }

      img.style.width = this.node.style.width;
      img.style.height = this.node.style.height;
      this.node.style.backgroundImage = '';
      this.node.appendChild(img);
    } else {
      this.setTransparentBackgroundImage(this.node);
    }
  }
}
