import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxDivResizer {
  resizeWidth = true;
  resizeHeight = true;
  handlingResize = false;

  constructor(div, container) {
    if (div.nodeName.toLowerCase() == 'div') {
      if (container == null) {
        container = window;
      }

      this.div = div;
      var style = mxUtils.getCurrentStyle(div);

      if (style != null) {
        this.resizeWidth = style.width == 'auto';
        this.resizeHeight = style.height == 'auto';
      }

      mxEvent.addListener(container, 'resize', (evt) => {
        if (!this.handlingResize) {
          this.handlingResize = true;
          this.resize();
          this.handlingResize = false;
        }
      });
      this.resize();
    }
  }

  resize() {
    var w = this.getDocumentWidth();
    var h = this.getDocumentHeight();
    var l = parseInt(this.div.style.left);
    var r = parseInt(this.div.style.right);
    var t = parseInt(this.div.style.top);
    var b = parseInt(this.div.style.bottom);

    if (this.resizeWidth && !isNaN(l) && !isNaN(r) && l >= 0 && r >= 0 && w - r - l > 0) {
      this.div.style.width = w - r - l + 'px';
    }

    if (this.resizeHeight && !isNaN(t) && !isNaN(b) && t >= 0 && b >= 0 && h - t - b > 0) {
      this.div.style.height = h - t - b + 'px';
    }
  }

  getDocumentWidth() {
    return document.body.clientWidth;
  }

  getDocumentHeight() {
    return document.body.clientHeight;
  }
}
