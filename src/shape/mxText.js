import { mxShape } from '@mxgraph/shape/mxShape';
import { mxSvgCanvas2D } from '@mxgraph/util/mxSvgCanvas2D';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxVmlCanvas2D } from '@mxgraph/util/mxVmlCanvas2D';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxClient } from '@mxgraph/mxClient';

export class mxText extends mxShape {
  static baseSpacingTop = 0;
  static baseSpacingBottom = 0;
  static baseSpacingLeft = 0;
  static baseSpacingRight = 0;
  replaceLinefeeds = true;
  verticalTextRotation = -90;
  ignoreClippedStringSize = true;
  ignoreStringSize = false;
  textWidthPadding = document.documentMode == 8 && !mxClient.IS_EM ? 4 : 3;
  lastValue = null;
  cacheEnabled = true;

  constructor(
    value,
    bounds,
    align,
    valign,
    color,
    family,
    size,
    fontStyle,
    spacing,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    horizontal,
    background,
    border,
    wrap,
    clipped,
    overflow,
    labelPadding,
    textDirection
  ) {
    super();
    this.value = value;
    this.bounds = bounds;
    this.color = color != null ? color : 'black';
    this.align = align != null ? align : mxConstants.ALIGN_CENTER;
    this.valign = valign != null ? valign : mxConstants.ALIGN_MIDDLE;
    this.family = family != null ? family : mxConstants.DEFAULT_FONTFAMILY;
    this.size = size != null ? size : mxConstants.DEFAULT_FONTSIZE;
    this.fontStyle = fontStyle != null ? fontStyle : mxConstants.DEFAULT_FONTSTYLE;
    this.spacing = parseInt(spacing || 2);
    this.spacingTop = this.spacing + parseInt(spacingTop || 0);
    this.spacingRight = this.spacing + parseInt(spacingRight || 0);
    this.spacingBottom = this.spacing + parseInt(spacingBottom || 0);
    this.spacingLeft = this.spacing + parseInt(spacingLeft || 0);
    this.horizontal = horizontal != null ? horizontal : true;
    this.background = background;
    this.border = border;
    this.wrap = wrap != null ? wrap : false;
    this.clipped = clipped != null ? clipped : false;
    this.overflow = overflow != null ? overflow : 'visible';
    this.labelPadding = labelPadding != null ? labelPadding : 0;
    this.textDirection = textDirection;
    this.rotation = 0;
    this.updateMargin();
  }

  isParseVml() {
    return false;
  }

  isHtmlAllowed() {
    return document.documentMode != 8 || mxClient.IS_EM;
  }

  getSvgScreenOffset() {
    return 0;
  }

  checkBounds() {
    return (
      !isNaN(this.scale) &&
      isFinite(this.scale) &&
      this.scale > 0 &&
      this.bounds != null &&
      !isNaN(this.bounds.x) &&
      !isNaN(this.bounds.y) &&
      !isNaN(this.bounds.width) &&
      !isNaN(this.bounds.height)
    );
  }

  paint(c, update) {
    var s = this.scale;
    var x = this.bounds.x / s;
    var y = this.bounds.y / s;
    var w = this.bounds.width / s;
    var h = this.bounds.height / s;
    this.updateTransform(c, x, y, w, h);
    this.configureCanvas(c, x, y, w, h);

    if (update) {
      c.updateText(
        x,
        y,
        w,
        h,
        this.align,
        this.valign,
        this.wrap,
        this.overflow,
        this.clipped,
        this.getTextRotation(),
        this.node
      );
    } else {
      var realHtml = mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML;
      var fmt = realHtml || c instanceof mxVmlCanvas2D ? 'html' : '';
      var val = this.value;

      if (!realHtml && fmt == 'html') {
        val = mxUtils.htmlEntities(val, false);
      }

      if (fmt == 'html' && !mxUtils.isNode(this.value)) {
        val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
      }

      val = !mxUtils.isNode(this.value) && this.replaceLinefeeds && fmt == 'html' ? val.replace(/\n/g, '<br/>') : val;
      var dir = this.textDirection;

      if (dir == mxConstants.TEXT_DIRECTION_AUTO && !realHtml) {
        dir = this.getAutoDirection();
      }

      if (dir != mxConstants.TEXT_DIRECTION_LTR && dir != mxConstants.TEXT_DIRECTION_RTL) {
        dir = null;
      }

      c.text(
        x,
        y,
        w,
        h,
        val,
        this.align,
        this.valign,
        this.wrap,
        fmt,
        this.overflow,
        this.clipped,
        this.getTextRotation(),
        dir
      );
    }
  }

  redraw() {
    if (
      this.visible &&
      this.checkBounds() &&
      this.cacheEnabled &&
      this.lastValue == this.value &&
      (mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML)
    ) {
      if (this.node.nodeName == 'DIV' && this.isHtmlAllowed()) {
        if (mxClient.IS_SVG) {
          this.redrawHtmlShapeWithCss3();
        } else {
          this.updateSize(this.node, this.state == null || this.state.view.textDiv == null);
          this.updateHtmlTransform();
        }

        this.updateBoundingBox();
      } else {
        var canvas = this.createCanvas();

        if (canvas != null && canvas.updateText != null) {
          canvas.pointerEvents = this.pointerEvents;
          this.paint(canvas, true);
          this.destroyCanvas(canvas);
          this.updateBoundingBox();
        } else {
          super.redraw();
        }
      }
    } else {
      super.redraw();

      if (mxUtils.isNode(this.value) || this.dialect == mxConstants.DIALECT_STRICTHTML) {
        this.lastValue = this.value;
      } else {
        this.lastValue = null;
      }
    }
  }

  resetStyles() {
    super.resetStyles();
    this.color = 'black';
    this.align = mxConstants.ALIGN_CENTER;
    this.valign = mxConstants.ALIGN_MIDDLE;
    this.family = mxConstants.DEFAULT_FONTFAMILY;
    this.size = mxConstants.DEFAULT_FONTSIZE;
    this.fontStyle = mxConstants.DEFAULT_FONTSTYLE;
    this.spacing = 2;
    this.spacingTop = 2;
    this.spacingRight = 2;
    this.spacingBottom = 2;
    this.spacingLeft = 2;
    this.horizontal = true;
    delete this.background;
    delete this.border;
    this.textDirection = mxConstants.DEFAULT_TEXT_DIRECTION;
    delete this.margin;
  }

  apply(state) {
    var old = this.spacing;
    super.apply(state);

    if (this.style != null) {
      this.fontStyle = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSTYLE, this.fontStyle);
      this.family = mxUtils.getValue(this.style, mxConstants.STYLE_FONTFAMILY, this.family);
      this.size = mxUtils.getValue(this.style, mxConstants.STYLE_FONTSIZE, this.size);
      this.color = mxUtils.getValue(this.style, mxConstants.STYLE_FONTCOLOR, this.color);
      this.align = mxUtils.getValue(this.style, mxConstants.STYLE_ALIGN, this.align);
      this.valign = mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_ALIGN, this.valign);
      this.spacing = parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING, this.spacing));
      this.spacingTop =
        parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_TOP, this.spacingTop - old)) + this.spacing;
      this.spacingRight =
        parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_RIGHT, this.spacingRight - old)) + this.spacing;
      this.spacingBottom =
        parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_BOTTOM, this.spacingBottom - old)) +
        this.spacing;
      this.spacingLeft =
        parseInt(mxUtils.getValue(this.style, mxConstants.STYLE_SPACING_LEFT, this.spacingLeft - old)) + this.spacing;
      this.horizontal = mxUtils.getValue(this.style, mxConstants.STYLE_HORIZONTAL, this.horizontal);
      this.background = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, this.background);
      this.border = mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_BORDERCOLOR, this.border);
      this.textDirection = mxUtils.getValue(
        this.style,
        mxConstants.STYLE_TEXT_DIRECTION,
        mxConstants.DEFAULT_TEXT_DIRECTION
      );
      this.opacity = mxUtils.getValue(this.style, mxConstants.STYLE_TEXT_OPACITY, 100);
      this.updateMargin();
    }

    this.flipV = null;
    this.flipH = null;
  }

  getAutoDirection() {
    var tmp = /[A-Za-z\u05d0-\u065f\u066a-\u06ef\u06fa-\u07ff\ufb1d-\ufdff\ufe70-\ufefc]/.exec(this.value);
    return tmp != null && tmp.length > 0 && tmp[0] > 'z'
      ? mxConstants.TEXT_DIRECTION_RTL
      : mxConstants.TEXT_DIRECTION_LTR;
  }

  getContentNode() {
    var result = this.node;

    if (result != null) {
      if (result.ownerSVGElement == null) {
        result = this.node.firstChild.firstChild;
      } else {
        result = result.firstChild.firstChild.firstChild.firstChild.firstChild;
      }
    }

    return result;
  }

  updateBoundingBox() {
    var node = this.node;
    this.boundingBox = this.bounds.clone();
    var rot = this.getTextRotation();
    var h =
      this.style != null
        ? mxUtils.getValue(this.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER)
        : null;
    var v =
      this.style != null
        ? mxUtils.getValue(this.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE)
        : null;

    if (
      !this.ignoreStringSize &&
      node != null &&
      this.overflow != 'fill' &&
      (!this.clipped || !this.ignoreClippedStringSize || h != mxConstants.ALIGN_CENTER || v != mxConstants.ALIGN_MIDDLE)
    ) {
      var ow = null;
      var oh = null;

      if (node.ownerSVGElement != null) {
        if (
          node.firstChild != null &&
          node.firstChild.firstChild != null &&
          node.firstChild.firstChild.nodeName == 'foreignObject'
        ) {
          node = node.firstChild.firstChild.firstChild.firstChild;
          oh = node.offsetHeight * this.scale;

          if (this.overflow == 'width') {
            ow = this.boundingBox.width;
          } else {
            ow = node.offsetWidth * this.scale;
          }
        } else {
          try {
            var b = node.getBBox();

            if (typeof this.value == 'string' && mxUtils.trim(this.value) == 0) {
              this.boundingBox = null;
            } else if (b.width == 0 && b.height == 0) {
              this.boundingBox = null;
            } else {
              this.boundingBox = new mxRectangle(b.x, b.y, b.width, b.height);
            }

            return;
          } catch (e) {
            /* ignore */
          }
        }
      } else {
        var td = this.state != null ? this.state.view.textDiv : null;

        if (this.offsetWidth != null && this.offsetHeight != null) {
          ow = this.offsetWidth * this.scale;
          oh = this.offsetHeight * this.scale;
        } else {
          if (td != null) {
            this.updateFont(td);
            this.updateSize(td, false);
            this.updateInnerHtml(td);
            node = td;
          }

          var sizeDiv = node;

          if (document.documentMode == 8 && !mxClient.IS_EM) {
            var w = Math.round(this.bounds.width / this.scale);

            if (this.wrap && w > 0) {
              node.style.wordWrap = mxConstants.WORD_WRAP;
              node.style.whiteSpace = 'normal';

              if (node.style.wordWrap != 'break-word') {
                var divs = sizeDiv.getElementsByTagName('div');

                if (divs.length > 0) {
                  sizeDiv = divs[divs.length - 1];
                }

                ow = sizeDiv.offsetWidth + 2;
                divs = this.node.getElementsByTagName('div');

                if (this.clipped) {
                  ow = Math.min(w, ow);
                }

                if (divs.length > 1) {
                  divs[divs.length - 2].style.width = ow + 'px';
                }
              }
            } else {
              node.style.whiteSpace = 'nowrap';
            }
          } else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
            sizeDiv = sizeDiv.firstChild;
          }

          this.offsetWidth = sizeDiv.offsetWidth + this.textWidthPadding;
          this.offsetHeight = sizeDiv.offsetHeight;
          ow = this.offsetWidth * this.scale;
          oh = this.offsetHeight * this.scale;
        }
      }

      if (ow != null && oh != null) {
        this.boundingBox = new mxRectangle(this.bounds.x, this.bounds.y, ow, oh);
      }
    }

    if (this.boundingBox != null) {
      if (rot != 0) {
        var bbox = mxUtils.getBoundingBox(
          new mxRectangle(
            this.margin.x * this.boundingBox.width,
            this.margin.y * this.boundingBox.height,
            this.boundingBox.width,
            this.boundingBox.height
          ),
          rot,
          new mxPoint(0, 0)
        );
        this.unrotatedBoundingBox = mxRectangle.fromRectangle(this.boundingBox);
        this.unrotatedBoundingBox.x += this.margin.x * this.unrotatedBoundingBox.width;
        this.unrotatedBoundingBox.y += this.margin.y * this.unrotatedBoundingBox.height;
        this.boundingBox.x += bbox.x;
        this.boundingBox.y += bbox.y;
        this.boundingBox.width = bbox.width;
        this.boundingBox.height = bbox.height;
      } else {
        this.boundingBox.x += this.margin.x * this.boundingBox.width;
        this.boundingBox.y += this.margin.y * this.boundingBox.height;
        this.unrotatedBoundingBox = null;
      }
    }
  }

  getShapeRotation() {
    return 0;
  }

  getTextRotation() {
    return this.state != null && this.state.shape != null ? this.state.shape.getTextRotation() : 0;
  }

  isPaintBoundsInverted() {
    return !this.horizontal && this.state != null && this.state.view.graph.model.isVertex(this.state.cell);
  }

  configureCanvas(c, x, y, w, h) {
    super.configureCanvas(c, x, y, w, h);
    c.setFontColor(this.color);
    c.setFontBackgroundColor(this.background);
    c.setFontBorderColor(this.border);
    c.setFontFamily(this.family);
    c.setFontSize(this.size);
    c.setFontStyle(this.fontStyle);
  }

  updateVmlContainer() {
    this.node.style.left = Math.round(this.bounds.x) + 'px';
    this.node.style.top = Math.round(this.bounds.y) + 'px';
    this.node.style.width = '1px';
    this.node.style.height = '1px';
    this.node.style.overflow = 'visible';
  }

  getHtmlValue() {
    var val = this.value;

    if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
      val = mxUtils.htmlEntities(val, false);
    }

    val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
    val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;
    return val;
  }

  getTextCss() {
    var lh = mxConstants.ABSOLUTE_LINE_HEIGHT ? this.size * mxConstants.LINE_HEIGHT + 'px' : mxConstants.LINE_HEIGHT;
    var css =
      'display: inline-block; font-size: ' +
      this.size +
      'px; ' +
      'font-family: ' +
      this.family +
      '; color: ' +
      this.color +
      '; line-height: ' +
      lh +
      '; pointer-events: ' +
      (this.pointerEvents ? 'all' : 'none') +
      '; ';

    if ((this.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      css += 'font-weight: bold; ';
    }

    if ((this.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      css += 'font-style: italic; ';
    }

    var deco = [];

    if ((this.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      deco.push('underline');
    }

    if ((this.fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
      deco.push('line-through');
    }

    if (deco.length > 0) {
      css += 'text-decoration: ' + deco.join(' ') + '; ';
    }

    return css;
  }

  redrawHtmlShape() {
    if (mxClient.IS_SVG) {
      this.redrawHtmlShapeWithCss3();
    } else {
      var style = this.node.style;
      style.whiteSpace = 'normal';
      style.overflow = '';
      style.width = '';
      style.height = '';
      this.updateValue();
      this.updateFont(this.node);
      this.updateSize(this.node, this.state == null || this.state.view.textDiv == null);
      this.offsetWidth = null;
      this.offsetHeight = null;
      this.updateHtmlTransform();
    }
  }

  redrawHtmlShapeWithCss3() {
    var w = Math.max(0, Math.round(this.bounds.width / this.scale));
    var h = Math.max(0, Math.round(this.bounds.height / this.scale));
    var flex =
      'position: absolute; left: ' +
      Math.round(this.bounds.x) +
      'px; ' +
      'top: ' +
      Math.round(this.bounds.y) +
      'px; pointer-events: none; ';
    var block = this.getTextCss();
    mxSvgCanvas2D.createCss(
      w + 2,
      h,
      this.align,
      this.valign,
      this.wrap,
      this.overflow,
      this.clipped,
      this.background != null ? mxUtils.htmlEntities(this.background) : null,
      this.border != null ? mxUtils.htmlEntities(this.border) : null,
      flex,
      block,
      this.scale,
      (dx, dy, flex, item, block, ofl) => {
        var r = this.getTextRotation();
        var tr =
          (this.scale != 1 ? 'scale(' + this.scale + ') ' : '') +
          (r != 0 ? 'rotate(' + r + 'deg) ' : '') +
          (this.margin.x != 0 || this.margin.y != 0
            ? 'translate(' + this.margin.x * 100 + '%,' + this.margin.y * 100 + '%)'
            : '');

        if (tr != '') {
          tr = 'transform-origin: 0 0; transform: ' + tr + '; ';
        }

        if (ofl == '') {
          flex += item;
          item = 'display:inline-block; min-width: 100%; ' + tr;
        } else {
          item += tr;
        }

        if (this.opacity < 100) {
          block += 'opacity: ' + this.opacity / 100 + '; ';
        }

        this.node.setAttribute('style', flex);
        var html = mxUtils.isNode(this.value) ? this.value.outerHTML : this.getHtmlValue();

        if (this.node.firstChild == null) {
          this.node.innerHTML = '<div><div>' + html + '</div></div>';
        }

        this.node.firstChild.firstChild.setAttribute('style', block);
        this.node.firstChild.setAttribute('style', item);
      }
    );
  }

  updateHtmlTransform() {
    var theta = this.getTextRotation();
    var style = this.node.style;
    var dx = this.margin.x;
    var dy = this.margin.y;

    if (theta != 0) {
      mxUtils.setPrefixedStyle(style, 'transformOrigin', -dx * 100 + '%' + ' ' + -dy * 100 + '%');
      mxUtils.setPrefixedStyle(
        style,
        'transform',
        'translate(' + dx * 100 + '%' + ',' + dy * 100 + '%) ' + 'scale(' + this.scale + ') rotate(' + theta + 'deg)'
      );
    } else {
      mxUtils.setPrefixedStyle(style, 'transformOrigin', '0% 0%');
      mxUtils.setPrefixedStyle(
        style,
        'transform',
        'scale(' + this.scale + ') ' + 'translate(' + dx * 100 + '%' + ',' + dy * 100 + '%)'
      );
    }

    style.left =
      Math.round(this.bounds.x - Math.ceil(dx * (this.overflow != 'fill' && this.overflow != 'width' ? 3 : 1))) + 'px';
    style.top = Math.round(this.bounds.y - dy * (this.overflow != 'fill' ? 3 : 1)) + 'px';

    if (this.opacity < 100) {
      style.opacity = this.opacity / 100;
    } else {
      style.opacity = '';
    }
  }

  updateInnerHtml(elt) {
    if (mxUtils.isNode(this.value)) {
      elt.innerHTML = this.value.outerHTML;
    } else {
      var val = this.value;

      if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
        val = mxUtils.htmlEntities(val, false);
      }

      val = mxUtils.replaceTrailingNewlines(val, '<div>&nbsp;</div>');
      val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;
      val = '<div style="display:inline-block;_display:inline;">' + val + '</div>';
      elt.innerHTML = val;
    }
  }

  updateHtmlFilter() {
    var style = this.node.style;
    var dx = this.margin.x;
    var dy = this.margin.y;
    var s = this.scale;
    mxUtils.setOpacity(this.node, this.opacity);
    var ow = 0;
    var oh = 0;
    var td = this.state != null ? this.state.view.textDiv : null;
    var sizeDiv = this.node;

    if (td != null) {
      td.style.overflow = '';
      td.style.height = '';
      td.style.width = '';
      this.updateFont(td);
      this.updateSize(td, false);
      this.updateInnerHtml(td);
      var w = Math.round(this.bounds.width / this.scale);

      if (this.wrap && w > 0) {
        td.style.whiteSpace = 'normal';
        td.style.wordWrap = mxConstants.WORD_WRAP;
        ow = w;

        if (this.clipped) {
          ow = Math.min(ow, this.bounds.width);
        }

        td.style.width = ow + 'px';
      } else {
        td.style.whiteSpace = 'nowrap';
      }

      sizeDiv = td;

      if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
        sizeDiv = sizeDiv.firstChild;

        if (this.wrap && td.style.wordWrap == 'break-word') {
          sizeDiv.style.width = '100%';
        }
      }

      if (!this.clipped && this.wrap && w > 0) {
        ow = sizeDiv.offsetWidth + this.textWidthPadding;
        td.style.width = ow + 'px';
      }

      oh = sizeDiv.offsetHeight + 2;

      if (mxClient.IS_QUIRKS && this.border != null && this.border != mxConstants.NONE) {
        oh += 3;
      }
    } else if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
      sizeDiv = sizeDiv.firstChild;
      oh = sizeDiv.offsetHeight;
    }

    ow = sizeDiv.offsetWidth + this.textWidthPadding;

    if (this.clipped) {
      oh = Math.min(oh, this.bounds.height);
    }

    var w = this.bounds.width / s;
    var h = this.bounds.height / s;

    if (this.overflow == 'fill') {
      oh = h;
      ow = w;
    } else if (this.overflow == 'width') {
      oh = sizeDiv.scrollHeight;
      ow = w;
    }

    this.offsetWidth = ow;
    this.offsetHeight = oh;

    if (mxClient.IS_QUIRKS && (this.clipped || (this.overflow == 'width' && h > 0))) {
      h = Math.min(h, oh);
      style.height = Math.round(h) + 'px';
    } else {
      h = oh;
    }

    if (this.overflow != 'fill' && this.overflow != 'width') {
      if (this.clipped) {
        ow = Math.min(w, ow);
      }

      w = ow;

      if ((mxClient.IS_QUIRKS && this.clipped) || this.wrap) {
        style.width = Math.round(w) + 'px';
      }
    }

    h *= s;
    w *= s;
    var rad = this.getTextRotation() * (Math.PI / 180);
    var real_cos = parseFloat(parseFloat(Math.cos(rad)).toFixed(8));
    var real_sin = parseFloat(parseFloat(Math.sin(-rad)).toFixed(8));
    rad %= 2 * Math.PI;

    if (rad < 0) {
      rad += 2 * Math.PI;
    }

    rad %= Math.PI;

    if (rad > Math.PI / 2) {
      rad = Math.PI - rad;
    }

    var cos = Math.cos(rad);
    var sin = Math.sin(-rad);
    var tx = w * -(dx + 0.5);
    var ty = h * -(dy + 0.5);
    var top_fix = (h - h * cos + w * sin) / 2 + real_sin * tx - real_cos * ty;
    var left_fix = (w - w * cos + h * sin) / 2 - real_cos * tx - real_sin * ty;

    if (rad != 0) {
      var f =
        'progid:DXImageTransform.Microsoft.Matrix(M11=' +
        real_cos +
        ', M12=' +
        real_sin +
        ', M21=' +
        -real_sin +
        ', M22=' +
        real_cos +
        ", sizingMethod='auto expand')";

      if (style.filter != null && style.filter.length > 0) {
        style.filter += ' ' + f;
      } else {
        style.filter = f;
      }
    }

    var dy = 0;

    if (this.overflow != 'fill' && mxClient.IS_QUIRKS) {
      if (this.valign == mxConstants.ALIGN_TOP) {
        dy -= 1;
      } else if (this.valign == mxConstants.ALIGN_BOTTOM) {
        dy += 2;
      } else {
        dy += 1;
      }
    }

    style.zoom = s;
    style.left = Math.round(this.bounds.x + left_fix - w / 2) + 'px';
    style.top = Math.round(this.bounds.y + top_fix - h / 2 + dy) + 'px';
  }

  updateValue() {
    if (mxUtils.isNode(this.value)) {
      this.node.innerHTML = '';
      this.node.appendChild(this.value);
    } else {
      var val = this.value;

      if (this.dialect != mxConstants.DIALECT_STRICTHTML) {
        val = mxUtils.htmlEntities(val, false);
      }

      val = mxUtils.replaceTrailingNewlines(val, '<div><br></div>');
      val = this.replaceLinefeeds ? val.replace(/\n/g, '<br/>') : val;
      var bg = this.background != null && this.background != mxConstants.NONE ? this.background : null;
      var bd = this.border != null && this.border != mxConstants.NONE ? this.border : null;

      if (this.overflow == 'fill' || this.overflow == 'width') {
        if (bg != null) {
          this.node.style.backgroundColor = bg;
        }

        if (bd != null) {
          this.node.style.border = '1px solid ' + bd;
        }
      } else {
        var css = '';

        if (bg != null) {
          css += 'background-color:' + mxUtils.htmlEntities(bg) + ';';
        }

        if (bd != null) {
          css += 'border:1px solid ' + mxUtils.htmlEntities(bd) + ';';
        }

        var lh = mxConstants.ABSOLUTE_LINE_HEIGHT
          ? this.size * mxConstants.LINE_HEIGHT + 'px'
          : mxConstants.LINE_HEIGHT;
        val =
          '<div style="zoom:1;' +
          css +
          'display:inline-block;_display:inline;text-decoration:inherit;' +
          'padding-bottom:1px;padding-right:1px;line-height:' +
          lh +
          '">' +
          val +
          '</div>';
      }

      this.node.innerHTML = val;
      var divs = this.node.getElementsByTagName('div');

      if (divs.length > 0) {
        var dir = this.textDirection;

        if (dir == mxConstants.TEXT_DIRECTION_AUTO && this.dialect != mxConstants.DIALECT_STRICTHTML) {
          dir = this.getAutoDirection();
        }

        if (dir == mxConstants.TEXT_DIRECTION_LTR || dir == mxConstants.TEXT_DIRECTION_RTL) {
          divs[divs.length - 1].setAttribute('dir', dir);
        } else {
          divs[divs.length - 1].removeAttribute('dir');
        }
      }
    }
  }

  updateFont(node) {
    var style = node.style;
    style.lineHeight = mxConstants.ABSOLUTE_LINE_HEIGHT
      ? this.size * mxConstants.LINE_HEIGHT + 'px'
      : mxConstants.LINE_HEIGHT;
    style.fontSize = this.size + 'px';
    style.fontFamily = this.family;
    style.verticalAlign = 'top';
    style.color = this.color;

    if ((this.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      style.fontWeight = 'bold';
    } else {
      style.fontWeight = '';
    }

    if ((this.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      style.fontStyle = 'italic';
    } else {
      style.fontStyle = '';
    }

    var txtDecor = [];

    if ((this.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      txtDecor.push('underline');
    }

    if ((this.fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
      txtDecor.push('line-through');
    }

    style.textDecoration = txtDecor.join(' ');

    if (this.align == mxConstants.ALIGN_CENTER) {
      style.textAlign = 'center';
    } else if (this.align == mxConstants.ALIGN_RIGHT) {
      style.textAlign = 'right';
    } else {
      style.textAlign = 'left';
    }
  }

  updateSize(node, enableWrap) {
    var w = Math.max(0, Math.round(this.bounds.width / this.scale));
    var h = Math.max(0, Math.round(this.bounds.height / this.scale));
    var style = node.style;

    if (this.clipped) {
      style.overflow = 'hidden';

      if (!mxClient.IS_QUIRKS) {
        style.maxHeight = h + 'px';
        style.maxWidth = w + 'px';
      } else {
        style.width = w + 'px';
      }
    } else if (this.overflow == 'fill') {
      style.width = w + 1 + 'px';
      style.height = h + 1 + 'px';
      style.overflow = 'hidden';
    } else if (this.overflow == 'width') {
      style.width = w + 1 + 'px';
      style.maxHeight = h + 1 + 'px';
      style.overflow = 'hidden';
    }

    if (this.wrap && w > 0) {
      style.wordWrap = mxConstants.WORD_WRAP;
      style.whiteSpace = 'normal';
      style.width = w + 'px';

      if (enableWrap && this.overflow != 'fill' && this.overflow != 'width') {
        var sizeDiv = node;

        if (sizeDiv.firstChild != null && sizeDiv.firstChild.nodeName == 'DIV') {
          sizeDiv = sizeDiv.firstChild;

          if (node.style.wordWrap == 'break-word') {
            sizeDiv.style.width = '100%';
          }
        }

        var tmp = sizeDiv.offsetWidth;

        if (tmp == 0) {
          var prev = node.parentNode;
          node.style.visibility = 'hidden';
          document.body.appendChild(node);
          tmp = sizeDiv.offsetWidth;
          node.style.visibility = '';
          prev.appendChild(node);
        }

        tmp += 3;

        if (this.clipped) {
          tmp = Math.min(tmp, w);
        }

        style.width = tmp + 'px';
      }
    } else {
      style.whiteSpace = 'nowrap';
    }
  }

  updateMargin() {
    this.margin = mxUtils.getAlignmentAsPoint(this.align, this.valign);
  }

  getSpacing() {
    var dx = 0;
    var dy = 0;

    if (this.align == mxConstants.ALIGN_CENTER) {
      dx = (this.spacingLeft - this.spacingRight) / 2;
    } else if (this.align == mxConstants.ALIGN_RIGHT) {
      dx = -this.spacingRight - mxText.baseSpacingRight;
    } else {
      dx = this.spacingLeft + mxText.baseSpacingLeft;
    }

    if (this.valign == mxConstants.ALIGN_MIDDLE) {
      dy = (this.spacingTop - this.spacingBottom) / 2;
    } else if (this.valign == mxConstants.ALIGN_BOTTOM) {
      dy = -this.spacingBottom - mxText.baseSpacingBottom;
    } else {
      dy = this.spacingTop + mxText.baseSpacingTop;
    }

    return new mxPoint(dx, dy);
  }
}
