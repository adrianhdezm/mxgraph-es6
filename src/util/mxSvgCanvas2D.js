import { mxAbstractCanvas2D } from '@mxgraph/util/mxAbstractCanvas2D';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxClient } from '@mxgraph/mxClient';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxSvgCanvas2D extends mxAbstractCanvas2D {
  useDomParser = typeof DOMParser === 'function' && typeof XMLSerializer === 'function';
  node = null;
  matchHtmlAlignment = true;
  textEnabled = true;
  foEnabled = true;
  foAltText = '[Object]';
  foOffset = 0;
  textOffset = 0;
  imageOffset = 0;
  strokeTolerance = 0;
  minStrokeWidth = 1;
  refCount = 0;
  lineHeightCorrection = 1;
  pointerEventsValue = 'all';
  fontMetricsPadding = 10;
  cacheOffsetSize = true;

  constructor(root, styleEnabled) {
    super();
    this.root = root;
    this.gradients = [];
    this.defs = null;
    this.styleEnabled = styleEnabled != null ? styleEnabled : false;
    var svg = null;

    if (root.ownerDocument != document) {
      var node = root;

      while (node != null && node.nodeName != 'svg') {
        node = node.parentNode;
      }

      svg = node;
    }

    if (svg != null) {
      var tmp = svg.getElementsByTagName('defs');

      if (tmp.length > 0) {
        this.defs = svg.getElementsByTagName('defs')[0];
      }

      if (this.defs == null) {
        this.defs = this.createElement('defs');

        if (svg.firstChild != null) {
          svg.insertBefore(this.defs, svg.firstChild);
        } else {
          svg.appendChild(this.defs);
        }
      }

      if (this.styleEnabled) {
        this.defs.appendChild(this.createStyle());
      }
    }
  }

  format(value) {
    return parseFloat(parseFloat(value).toFixed(2));
  }

  getBaseUrl() {
    var href = window.location.href;
    var hash = href.lastIndexOf('#');

    if (hash > 0) {
      href = href.substring(0, hash);
    }

    return href;
  }

  reset() {
    super.reset();
    this.gradients = [];
  }

  createStyle(x) {
    var style = this.createElement('style');
    style.setAttribute('type', 'text/css');
    mxUtils.write(
      style,
      'svg{font-family:' +
        mxConstants.DEFAULT_FONTFAMILY +
        ';font-size:' +
        mxConstants.DEFAULT_FONTSIZE +
        ';fill:none;stroke-miterlimit:10}'
    );
    return style;
  }

  createElement(tagName, namespace) {
    if (this.root.ownerDocument.createElementNS != null) {
      return this.root.ownerDocument.createElementNS(namespace || mxConstants.NS_SVG, tagName);
    } else {
      var elt = this.root.ownerDocument.createElement(tagName);

      if (namespace != null) {
        elt.setAttribute('xmlns', namespace);
      }

      return elt;
    }
  }

  getAlternateText(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation) {
    return str != null ? this.foAltText : null;
  }

  createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation) {
    var text = this.getAlternateText(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);
    var s = this.state;

    if (text != null && s.fontSize > 0) {
      var dy = valign == mxConstants.ALIGN_TOP ? 1 : valign == mxConstants.ALIGN_BOTTOM ? 0 : 0.3;
      var anchor = align == mxConstants.ALIGN_RIGHT ? 'end' : align == mxConstants.ALIGN_LEFT ? 'start' : 'middle';
      var alt = this.createElement('text');
      alt.setAttribute('x', Math.round(x + s.dx));
      alt.setAttribute('y', Math.round(y + s.dy + dy * s.fontSize));
      alt.setAttribute('fill', s.fontColor || 'black');
      alt.setAttribute('font-family', s.fontFamily);
      alt.setAttribute('font-size', Math.round(s.fontSize) + 'px');

      if (anchor != 'start') {
        alt.setAttribute('text-anchor', anchor);
      }

      if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
        alt.setAttribute('font-weight', 'bold');
      }

      if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
        alt.setAttribute('font-style', 'italic');
      }

      var txtDecor = [];

      if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
        txtDecor.push('underline');
      }

      if ((s.fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
        txtDecor.push('line-through');
      }

      if (txtDecor.length > 0) {
        alt.setAttribute('text-decoration', txtDecor.join(' '));
      }

      mxUtils.write(alt, text);
      return alt;
    } else {
      return null;
    }
  }

  createGradientId(start, end, alpha1, alpha2, direction) {
    if (start.charAt(0) == '#') {
      start = start.substring(1);
    }

    if (end.charAt(0) == '#') {
      end = end.substring(1);
    }

    start = start.toLowerCase() + '-' + alpha1;
    end = end.toLowerCase() + '-' + alpha2;
    var dir = null;

    if (direction == null || direction == mxConstants.DIRECTION_SOUTH) {
      dir = 's';
    } else if (direction == mxConstants.DIRECTION_EAST) {
      dir = 'e';
    } else {
      var tmp = start;
      start = end;
      end = tmp;

      if (direction == mxConstants.DIRECTION_NORTH) {
        dir = 's';
      } else if (direction == mxConstants.DIRECTION_WEST) {
        dir = 'e';
      }
    }

    return 'mx-gradient-' + start + '-' + end + '-' + dir;
  }

  getSvgGradient(start, end, alpha1, alpha2, direction) {
    var id = this.createGradientId(start, end, alpha1, alpha2, direction);
    var gradient = this.gradients[id];

    if (gradient == null) {
      var svg = this.root.ownerSVGElement;
      var counter = 0;
      var tmpId = id + '-' + counter;

      if (svg != null) {
        gradient = svg.ownerDocument.getElementById(tmpId);

        while (gradient != null && gradient.ownerSVGElement != svg) {
          tmpId = id + '-' + counter++;
          gradient = svg.ownerDocument.getElementById(tmpId);
        }
      } else {
        tmpId = 'id' + ++this.refCount;
      }

      if (gradient == null) {
        gradient = this.createSvgGradient(start, end, alpha1, alpha2, direction);
        gradient.setAttribute('id', tmpId);

        if (this.defs != null) {
          this.defs.appendChild(gradient);
        } else {
          svg.appendChild(gradient);
        }
      }

      this.gradients[id] = gradient;
    }

    return gradient.getAttribute('id');
  }

  createSvgGradient(start, end, alpha1, alpha2, direction) {
    var gradient = this.createElement('linearGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '0%');

    if (direction == null || direction == mxConstants.DIRECTION_SOUTH) {
      gradient.setAttribute('y2', '100%');
    } else if (direction == mxConstants.DIRECTION_EAST) {
      gradient.setAttribute('x2', '100%');
    } else if (direction == mxConstants.DIRECTION_NORTH) {
      gradient.setAttribute('y1', '100%');
    } else if (direction == mxConstants.DIRECTION_WEST) {
      gradient.setAttribute('x1', '100%');
    }

    var op = alpha1 < 1 ? ';stop-opacity:' + alpha1 : '';
    var stop = this.createElement('stop');
    stop.setAttribute('offset', '0%');
    stop.setAttribute('style', 'stop-color:' + start + op);
    gradient.appendChild(stop);
    op = alpha2 < 1 ? ';stop-opacity:' + alpha2 : '';
    stop = this.createElement('stop');
    stop.setAttribute('offset', '100%');
    stop.setAttribute('style', 'stop-color:' + end + op);
    gradient.appendChild(stop);
    return gradient;
  }

  addNode(filled, stroked) {
    var node = this.node;
    var s = this.state;

    if (node != null) {
      if (node.nodeName == 'path') {
        if (this.path != null && this.path.length > 0) {
          node.setAttribute('d', this.path.join(' '));
        } else {
          return;
        }
      }

      if (filled && s.fillColor != null) {
        this.updateFill();
      } else if (!this.styleEnabled) {
        if (node.nodeName == 'ellipse' && mxClient.IS_FF) {
          node.setAttribute('fill', 'transparent');
        } else {
          node.setAttribute('fill', 'none');
        }

        filled = false;
      }

      if (stroked && s.strokeColor != null) {
        this.updateStroke();
      } else if (!this.styleEnabled) {
        node.setAttribute('stroke', 'none');
      }

      if (s.transform != null && s.transform.length > 0) {
        node.setAttribute('transform', s.transform);
      }

      if (s.shadow) {
        this.root.appendChild(this.createShadow(node));
      }

      if (this.strokeTolerance > 0 && !filled) {
        this.root.appendChild(this.createTolerance(node));
      }

      if (this.pointerEvents) {
        node.setAttribute('pointer-events', this.pointerEventsValue);
      } else if (!this.pointerEvents && this.originalRoot == null) {
        node.setAttribute('pointer-events', 'none');
      }

      if (
        (node.nodeName != 'rect' && node.nodeName != 'path' && node.nodeName != 'ellipse') ||
        (node.getAttribute('fill') != 'none' && node.getAttribute('fill') != 'transparent') ||
        node.getAttribute('stroke') != 'none' ||
        node.getAttribute('pointer-events') != 'none'
      ) {
        this.root.appendChild(node);
      }

      this.node = null;
    }
  }

  updateFill() {
    var s = this.state;

    if (s.alpha < 1 || s.fillAlpha < 1) {
      this.node.setAttribute('fill-opacity', s.alpha * s.fillAlpha);
    }

    if (s.fillColor != null) {
      if (s.gradientColor != null) {
        var id = this.getSvgGradient(
          String(s.fillColor),
          String(s.gradientColor),
          s.gradientFillAlpha,
          s.gradientAlpha,
          s.gradientDirection
        );

        if (!mxClient.IS_CHROMEAPP && !mxClient.IS_IE11 && !mxClient.IS_EDGE && this.root.ownerDocument == document) {
          var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
          this.node.setAttribute('fill', 'url(' + base + '#' + id + ')');
        } else {
          this.node.setAttribute('fill', 'url(#' + id + ')');
        }
      } else {
        this.node.setAttribute('fill', String(s.fillColor).toLowerCase());
      }
    }
  }

  getCurrentStrokeWidth() {
    return Math.max(this.minStrokeWidth, Math.max(0.01, this.format(this.state.strokeWidth * this.state.scale)));
  }

  updateStroke() {
    var s = this.state;
    this.node.setAttribute('stroke', String(s.strokeColor).toLowerCase());

    if (s.alpha < 1 || s.strokeAlpha < 1) {
      this.node.setAttribute('stroke-opacity', s.alpha * s.strokeAlpha);
    }

    var sw = this.getCurrentStrokeWidth();

    if (sw != 1) {
      this.node.setAttribute('stroke-width', sw);
    }

    if (this.node.nodeName == 'path') {
      this.updateStrokeAttributes();
    }

    if (s.dashed) {
      this.node.setAttribute('stroke-dasharray', this.createDashPattern((s.fixDash ? 1 : s.strokeWidth) * s.scale));
    }
  }

  updateStrokeAttributes() {
    var s = this.state;

    if (s.lineJoin != null && s.lineJoin != 'miter') {
      this.node.setAttribute('stroke-linejoin', s.lineJoin);
    }

    if (s.lineCap != null) {
      var value = s.lineCap;

      if (value == 'flat') {
        value = 'butt';
      }

      if (value != 'butt') {
        this.node.setAttribute('stroke-linecap', value);
      }
    }

    if (s.miterLimit != null && (!this.styleEnabled || s.miterLimit != 10)) {
      this.node.setAttribute('stroke-miterlimit', s.miterLimit);
    }
  }

  createDashPattern(scale) {
    var pat = [];

    if (typeof this.state.dashPattern === 'string') {
      var dash = this.state.dashPattern.split(' ');

      if (dash.length > 0) {
        for (var i = 0; i < dash.length; i++) {
          pat[i] = Number(dash[i]) * scale;
        }
      }
    }

    return pat.join(' ');
  }

  createTolerance(node) {
    var tol = node.cloneNode(true);
    var sw = parseFloat(tol.getAttribute('stroke-width') || 1) + this.strokeTolerance;
    tol.setAttribute('pointer-events', 'stroke');
    tol.setAttribute('visibility', 'hidden');
    tol.removeAttribute('stroke-dasharray');
    tol.setAttribute('stroke-width', sw);
    tol.setAttribute('fill', 'none');
    tol.setAttribute('stroke', mxClient.IS_OT ? 'none' : 'white');
    return tol;
  }

  createShadow(node) {
    var shadow = node.cloneNode(true);
    var s = this.state;

    if (shadow.getAttribute('fill') != 'none' && (!mxClient.IS_FF || shadow.getAttribute('fill') != 'transparent')) {
      shadow.setAttribute('fill', s.shadowColor);
    }

    if (shadow.getAttribute('stroke') != 'none') {
      shadow.setAttribute('stroke', s.shadowColor);
    }

    shadow.setAttribute(
      'transform',
      'translate(' +
        this.format(s.shadowDx * s.scale) +
        ',' +
        this.format(s.shadowDy * s.scale) +
        ')' +
        (s.transform || '')
    );
    shadow.setAttribute('opacity', s.shadowAlpha);
    return shadow;
  }

  setLink(link) {
    if (link == null) {
      this.root = this.originalRoot;
    } else {
      this.originalRoot = this.root;
      var node = this.createElement('a');

      if (node.setAttributeNS == null || (this.root.ownerDocument != document && document.documentMode == null)) {
        node.setAttribute('xlink:href', link);
      } else {
        node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', link);
      }

      this.root.appendChild(node);
      this.root = node;
    }
  }

  rotate(theta, flipH, flipV, cx, cy) {
    if (theta != 0 || flipH || flipV) {
      var s = this.state;
      cx += s.dx;
      cy += s.dy;
      cx *= s.scale;
      cy *= s.scale;
      s.transform = s.transform || '';

      if (flipH && flipV) {
        theta += 180;
      } else if (flipH != flipV) {
        var tx = flipH ? cx : 0;
        var sx = flipH ? -1 : 1;
        var ty = flipV ? cy : 0;
        var sy = flipV ? -1 : 1;
        s.transform +=
          'translate(' +
          this.format(tx) +
          ',' +
          this.format(ty) +
          ')' +
          'scale(' +
          this.format(sx) +
          ',' +
          this.format(sy) +
          ')' +
          'translate(' +
          this.format(-tx) +
          ',' +
          this.format(-ty) +
          ')';
      }

      if (flipH ? !flipV : flipV) {
        theta *= -1;
      }

      if (theta != 0) {
        s.transform += 'rotate(' + this.format(theta) + ',' + this.format(cx) + ',' + this.format(cy) + ')';
      }

      s.rotation = s.rotation + theta;
      s.rotationCx = cx;
      s.rotationCy = cy;
    }
  }

  begin() {
    super.begin();
    this.node = this.createElement('path');
  }

  rect(x, y, w, h) {
    var s = this.state;
    var n = this.createElement('rect');
    n.setAttribute('x', this.format((x + s.dx) * s.scale));
    n.setAttribute('y', this.format((y + s.dy) * s.scale));
    n.setAttribute('width', this.format(w * s.scale));
    n.setAttribute('height', this.format(h * s.scale));
    this.node = n;
  }

  roundrect(x, y, w, h, dx, dy) {
    this.rect(x, y, w, h);

    if (dx > 0) {
      this.node.setAttribute('rx', this.format(dx * this.state.scale));
    }

    if (dy > 0) {
      this.node.setAttribute('ry', this.format(dy * this.state.scale));
    }
  }

  ellipse(x, y, w, h) {
    var s = this.state;
    var n = this.createElement('ellipse');
    n.setAttribute('cx', this.format((x + w / 2 + s.dx) * s.scale));
    n.setAttribute('cy', this.format((y + h / 2 + s.dy) * s.scale));
    n.setAttribute('rx', (w / 2) * s.scale);
    n.setAttribute('ry', (h / 2) * s.scale);
    this.node = n;
  }

  image(x, y, w, h, src, aspect, flipH, flipV) {
    src = this.converter.convert(src);
    aspect = aspect != null ? aspect : true;
    flipH = flipH != null ? flipH : false;
    flipV = flipV != null ? flipV : false;
    var s = this.state;
    x += s.dx;
    y += s.dy;
    var node = this.createElement('image');
    node.setAttribute('x', this.format(x * s.scale) + this.imageOffset);
    node.setAttribute('y', this.format(y * s.scale) + this.imageOffset);
    node.setAttribute('width', this.format(w * s.scale));
    node.setAttribute('height', this.format(h * s.scale));

    if (node.setAttributeNS == null) {
      node.setAttribute('xlink:href', src);
    } else {
      node.setAttributeNS(mxConstants.NS_XLINK, 'xlink:href', src);
    }

    if (!aspect) {
      node.setAttribute('preserveAspectRatio', 'none');
    }

    if (s.alpha < 1 || s.fillAlpha < 1) {
      node.setAttribute('opacity', s.alpha * s.fillAlpha);
    }

    var tr = this.state.transform || '';

    if (flipH || flipV) {
      var sx = 1;
      var sy = 1;
      var dx = 0;
      var dy = 0;

      if (flipH) {
        sx = -1;
        dx = -w - 2 * x;
      }

      if (flipV) {
        sy = -1;
        dy = -h - 2 * y;
      }

      tr += 'scale(' + sx + ',' + sy + ')translate(' + dx * s.scale + ',' + dy * s.scale + ')';
    }

    if (tr.length > 0) {
      node.setAttribute('transform', tr);
    }

    if (!this.pointerEvents) {
      node.setAttribute('pointer-events', 'none');
    }

    this.root.appendChild(node);
  }

  convertHtml(val) {
    if (this.useDomParser) {
      var doc = new DOMParser().parseFromString(val, 'text/html');

      if (doc != null) {
        val = new XMLSerializer().serializeToString(doc.body);

        if (val.substring(0, 5) == '<body') {
          val = val.substring(val.indexOf('>', 5) + 1);
        }

        if (val.substring(val.length - 7, val.length) == '</body>') {
          val = val.substring(0, val.length - 7);
        }
      }
    } else if (document.implementation != null && document.implementation.createDocument != null) {
      var xd = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
      var xb = xd.createElement('body');
      xd.documentElement.appendChild(xb);
      var div = document.createElement('div');
      div.innerHTML = val;
      var child = div.firstChild;

      while (child != null) {
        var next = child.nextSibling;
        xb.appendChild(xd.adoptNode(child));
        child = next;
      }

      return xb.innerHTML;
    } else {
      var ta = document.createElement('textarea');
      ta.innerHTML = val
        .replace(/&amp;/g, '&amp;amp;')
        .replace(/&#60;/g, '&amp;lt;')
        .replace(/&#62;/g, '&amp;gt;')
        .replace(/&lt;/g, '&amp;lt;')
        .replace(/&gt;/g, '&amp;gt;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      val = ta.value
        .replace(/&/g, '&amp;')
        .replace(/&amp;lt;/g, '&lt;')
        .replace(/&amp;gt;/g, '&gt;')
        .replace(/&amp;amp;/g, '&amp;')
        .replace(/<br>/g, '<br />')
        .replace(/<hr>/g, '<hr />')
        .replace(/(<img[^>]+)>/gm, '$1 />');
    }

    return val;
  }

  createDiv(str) {
    var val = str;

    if (!mxUtils.isNode(val)) {
      val = '<div><div>' + this.convertHtml(val) + '</div></div>';
    }

    if (!mxClient.IS_IE11 && document.createElementNS) {
      var div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');

      if (mxUtils.isNode(val)) {
        var div2 = document.createElement('div');
        var div3 = div2.cloneNode(false);

        if (this.root.ownerDocument != document) {
          div2.appendChild(val.cloneNode(true));
        } else {
          div2.appendChild(val);
        }

        div3.appendChild(div2);
        div.appendChild(div3);
      } else {
        div.innerHTML = val;
      }

      return div;
    } else {
      if (mxUtils.isNode(val)) {
        val = '<div><div>' + mxUtils.getXml(val) + '</div></div>';
      }

      val = '<div xmlns="http://www.w3.org/1999/xhtml">' + val + '</div>';
      return mxUtils.parseXml(val).documentElement;
    }
  }

  updateText(x, y, w, h, align, valign, wrap, overflow, clip, rotation, node) {
    if (node != null && node.firstChild != null && node.firstChild.firstChild != null) {
      this.updateTextNodes(x, y, w, h, align, valign, wrap, overflow, clip, rotation, node.firstChild);
    }
  }

  addForeignObject(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir, div, root) {
    var group = this.createElement('g');
    var fo = this.createElement('foreignObject');
    fo.setAttribute('style', 'overflow: visible; text-align: left;');
    fo.setAttribute('pointer-events', 'none');

    if (div.ownerDocument != document) {
      div = mxUtils.importNodeImplementation(fo.ownerDocument, div, true);
    }

    fo.appendChild(div);
    group.appendChild(fo);
    this.updateTextNodes(x, y, w, h, align, valign, wrap, overflow, clip, rotation, group);

    if (this.root.ownerDocument != document) {
      var alt = this.createAlternateContent(fo, x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation);

      if (alt != null) {
        fo.setAttribute('requiredFeatures', 'http://www.w3.org/TR/SVG11/feature#Extensibility');
        var sw = this.createElement('switch');
        sw.appendChild(fo);
        sw.appendChild(alt);
        group.appendChild(sw);
      }
    }

    root.appendChild(group);
  }

  updateTextNodes(x, y, w, h, align, valign, wrap, overflow, clip, rotation, g) {
    var s = this.state.scale;
    mxSvgCanvas2D.createCss(
      w + 2,
      h,
      align,
      valign,
      wrap,
      overflow,
      clip,
      this.state.fontBackgroundColor != null ? this.state.fontBackgroundColor : null,
      this.state.fontBorderColor != null ? this.state.fontBorderColor : null,
      'display: flex; align-items: unsafe ' +
        (valign == mxConstants.ALIGN_TOP ? 'flex-start' : valign == mxConstants.ALIGN_BOTTOM ? 'flex-end' : 'center') +
        '; ' +
        'justify-content: unsafe ' +
        (align == mxConstants.ALIGN_LEFT ? 'flex-start' : align == mxConstants.ALIGN_RIGHT ? 'flex-end' : 'center') +
        '; ',
      this.getTextCss(),
      s,
      (dx, dy, flex, item, block) => {
        x += this.state.dx;
        y += this.state.dy;
        var fo = g.firstChild;
        var div = fo.firstChild;
        var box = div.firstChild;
        var text = box.firstChild;
        var r = (this.rotateHtml ? this.state.rotation : 0) + (rotation != null ? rotation : 0);
        var t =
          (this.foOffset != 0 ? 'translate(' + this.foOffset + ' ' + this.foOffset + ')' : '') +
          (s != 1 ? 'scale(' + s + ')' : '');
        text.setAttribute('style', block);
        box.setAttribute('style', item);
        fo.setAttribute('width', Math.ceil((1 / Math.min(1, s)) * 100) + '%');
        fo.setAttribute('height', Math.ceil((1 / Math.min(1, s)) * 100) + '%');
        var yp = Math.round(y + dy);

        if (yp < 0) {
          fo.setAttribute('y', yp);
        } else {
          fo.removeAttribute('y');
          flex += 'padding-top: ' + yp + 'px; ';
        }

        div.setAttribute('style', flex + 'margin-left: ' + Math.round(x + dx) + 'px;');
        t += r != 0 ? 'rotate(' + r + ' ' + x + ' ' + y + ')' : '';

        if (t != '') {
          g.setAttribute('transform', t);
        } else {
          g.removeAttribute('transform');
        }

        if (this.state.alpha != 1) {
          g.setAttribute('opacity', this.state.alpha);
        } else {
          g.removeAttribute('opacity');
        }
      }
    );
  }

  static createCss(w, h, align, valign, wrap, overflow, clip, bg, border, flex, block, s, callback) {
    var item =
      'box-sizing: border-box; font-size: 0; text-align: ' +
      (align == mxConstants.ALIGN_LEFT ? 'left' : align == mxConstants.ALIGN_RIGHT ? 'right' : 'center') +
      '; ';
    var pt = mxUtils.getAlignmentAsPoint(align, valign);
    var ofl = 'overflow: hidden; ';
    var fw = 'width: 1px; ';
    var fh = 'height: 1px; ';
    var dx = pt.x * w;
    var dy = pt.y * h;

    if (clip) {
      fw = 'width: ' + Math.round(w) + 'px; ';
      item += 'max-height: ' + Math.round(h) + 'px; ';
      dy = 0;
    } else if (overflow == 'fill') {
      fw = 'width: ' + Math.round(w) + 'px; ';
      fh = 'height: ' + Math.round(h) + 'px; ';
      block += 'width: 100%; height: 100%; ';
      item += fw + fh;
    } else if (overflow == 'width') {
      fw = 'width: ' + Math.round(w) + 'px; ';
      block += 'width: 100%; ';
      item += fw;
      dy = 0;

      if (h > 0) {
        item += 'max-height: ' + Math.round(h) + 'px; ';
      }
    } else {
      ofl = '';
      dy = 0;
    }

    var bgc = '';

    if (bg != null) {
      bgc += 'background-color: ' + bg + '; ';
    }

    if (border != null) {
      bgc += 'border: 1px solid ' + border + '; ';
    }

    if (ofl == '' || clip) {
      block += bgc;
    } else {
      item += bgc;
    }

    if (wrap && w > 0) {
      block += 'white-space: normal; word-wrap: ' + mxConstants.WORD_WRAP + '; ';
      fw = 'width: ' + Math.round(w) + 'px; ';

      if (ofl != '' && overflow != 'fill') {
        dy = 0;
      }
    } else {
      block += 'white-space: nowrap; ';

      if (ofl == '') {
        dx = 0;
      }
    }

    callback(dx, dy, flex + fw + fh, item + ofl, block, ofl);
  }

  getTextCss() {
    var s = this.state;
    var lh = mxConstants.ABSOLUTE_LINE_HEIGHT
      ? s.fontSize * mxConstants.LINE_HEIGHT + 'px'
      : mxConstants.LINE_HEIGHT * this.lineHeightCorrection;
    var css =
      'display: inline-block; font-size: ' +
      s.fontSize +
      'px; ' +
      'font-family: ' +
      s.fontFamily +
      '; color: ' +
      s.fontColor +
      '; line-height: ' +
      lh +
      '; pointer-events: ' +
      (this.pointerEvents ? this.pointerEventsValue : 'none') +
      '; ';

    if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      css += 'font-weight: bold; ';
    }

    if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      css += 'font-style: italic; ';
    }

    var deco = [];

    if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      deco.push('underline');
    }

    if ((s.fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
      deco.push('line-through');
    }

    if (deco.length > 0) {
      css += 'text-decoration: ' + deco.join(' ') + '; ';
    }

    return css;
  }

  text(x, y, w, h, str, align, valign, wrap, format, overflow, clip, rotation, dir) {
    if (this.textEnabled && str != null) {
      rotation = rotation != null ? rotation : 0;

      if (this.foEnabled && format == 'html') {
        var div = this.createDiv(str);

        if (div != null) {
          if (dir != null) {
            div.setAttribute('dir', dir);
          }

          this.addForeignObject(
            x,
            y,
            w,
            h,
            str,
            align,
            valign,
            wrap,
            format,
            overflow,
            clip,
            rotation,
            dir,
            div,
            this.root
          );
        }
      } else {
        this.plainText(
          x + this.state.dx,
          y + this.state.dy,
          w,
          h,
          str,
          align,
          valign,
          wrap,
          overflow,
          clip,
          rotation,
          dir
        );
      }
    }
  }

  createClip(x, y, w, h) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    var id = 'mx-clip-' + x + '-' + y + '-' + w + '-' + h;
    var counter = 0;
    var tmp = id + '-' + counter;

    while (document.getElementById(tmp) != null) {
      tmp = id + '-' + ++counter;
    }

    var clip = this.createElement('clipPath');
    clip.setAttribute('id', tmp);
    var rect = this.createElement('rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    clip.appendChild(rect);
    return clip;
  }

  plainText(x, y, w, h, str, align, valign, wrap, overflow, clip, rotation, dir) {
    rotation = rotation != null ? rotation : 0;
    var s = this.state;
    var size = s.fontSize;
    var node = this.createElement('g');
    var tr = s.transform || '';
    this.updateFont(node);

    if (rotation != 0) {
      tr += 'rotate(' + rotation + ',' + this.format(x * s.scale) + ',' + this.format(y * s.scale) + ')';
    }

    if (dir != null) {
      node.setAttribute('direction', dir);
    }

    if (clip && w > 0 && h > 0) {
      var cx = x;
      var cy = y;

      if (align == mxConstants.ALIGN_CENTER) {
        cx -= w / 2;
      } else if (align == mxConstants.ALIGN_RIGHT) {
        cx -= w;
      }

      if (overflow != 'fill') {
        if (valign == mxConstants.ALIGN_MIDDLE) {
          cy -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          cy -= h;
        }
      }

      var c = this.createClip(cx * s.scale - 2, cy * s.scale - 2, w * s.scale + 4, h * s.scale + 4);

      if (this.defs != null) {
        this.defs.appendChild(c);
      } else {
        this.root.appendChild(c);
      }

      if (!mxClient.IS_CHROMEAPP && !mxClient.IS_IE11 && !mxClient.IS_EDGE && this.root.ownerDocument == document) {
        var base = this.getBaseUrl().replace(/([\(\)])/g, '\\$1');
        node.setAttribute('clip-path', 'url(' + base + '#' + c.getAttribute('id') + ')');
      } else {
        node.setAttribute('clip-path', 'url(#' + c.getAttribute('id') + ')');
      }
    }

    var anchor = align == mxConstants.ALIGN_RIGHT ? 'end' : align == mxConstants.ALIGN_CENTER ? 'middle' : 'start';

    if (anchor != 'start') {
      node.setAttribute('text-anchor', anchor);
    }

    if (!this.styleEnabled || size != mxConstants.DEFAULT_FONTSIZE) {
      node.setAttribute('font-size', size * s.scale + 'px');
    }

    if (tr.length > 0) {
      node.setAttribute('transform', tr);
    }

    if (s.alpha < 1) {
      node.setAttribute('opacity', s.alpha);
    }

    var lines = str.split('\n');
    var lh = Math.round(size * mxConstants.LINE_HEIGHT);
    var textHeight = size + (lines.length - 1) * lh;
    var cy = y + size - 1;

    if (valign == mxConstants.ALIGN_MIDDLE) {
      if (overflow == 'fill') {
        cy -= h / 2;
      } else {
        var dy = (this.matchHtmlAlignment && clip && h > 0 ? Math.min(textHeight, h) : textHeight) / 2;
        cy -= dy;
      }
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      if (overflow == 'fill') {
        cy -= h;
      } else {
        var dy = this.matchHtmlAlignment && clip && h > 0 ? Math.min(textHeight, h) : textHeight;
        cy -= dy + 1;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].length > 0 && mxUtils.trim(lines[i]).length > 0) {
        var text = this.createElement('text');
        text.setAttribute('x', this.format(x * s.scale) + this.textOffset);
        text.setAttribute('y', this.format(cy * s.scale) + this.textOffset);
        mxUtils.write(text, lines[i]);
        node.appendChild(text);
      }

      cy += lh;
    }

    this.root.appendChild(node);
    this.addTextBackground(node, str, x, y, w, overflow == 'fill' ? h : textHeight, align, valign, overflow);
  }

  updateFont(node) {
    var s = this.state;
    node.setAttribute('fill', s.fontColor);

    if (!this.styleEnabled || s.fontFamily != mxConstants.DEFAULT_FONTFAMILY) {
      node.setAttribute('font-family', s.fontFamily);
    }

    if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
      node.setAttribute('font-weight', 'bold');
    }

    if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
      node.setAttribute('font-style', 'italic');
    }

    var txtDecor = [];

    if ((s.fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
      txtDecor.push('underline');
    }

    if ((s.fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
      txtDecor.push('line-through');
    }

    if (txtDecor.length > 0) {
      node.setAttribute('text-decoration', txtDecor.join(' '));
    }
  }

  addTextBackground(node, str, x, y, w, h, align, valign, overflow) {
    var s = this.state;

    if (s.fontBackgroundColor != null || s.fontBorderColor != null) {
      var bbox = null;

      if (overflow == 'fill' || overflow == 'width') {
        if (align == mxConstants.ALIGN_CENTER) {
          x -= w / 2;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          x -= w;
        }

        if (valign == mxConstants.ALIGN_MIDDLE) {
          y -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          y -= h;
        }

        bbox = new mxRectangle((x + 1) * s.scale, y * s.scale, (w - 2) * s.scale, (h + 2) * s.scale);
      } else if (node.getBBox != null && this.root.ownerDocument == document) {
        try {
          bbox = node.getBBox();
          bbox = new mxRectangle(bbox.x, bbox.y + 1, bbox.width, bbox.height);
        } catch (e) {
          /* ignore */
        }
      } else {
        var div = document.createElement('div');
        div.style.lineHeight = mxConstants.ABSOLUTE_LINE_HEIGHT
          ? s.fontSize * mxConstants.LINE_HEIGHT + 'px'
          : mxConstants.LINE_HEIGHT;
        div.style.fontSize = s.fontSize + 'px';
        div.style.fontFamily = s.fontFamily;
        div.style.whiteSpace = 'nowrap';
        div.style.position = 'absolute';
        div.style.visibility = 'hidden';
        div.style.display = mxClient.IS_QUIRKS ? 'inline' : 'inline-block';
        div.style.zoom = '1';

        if ((s.fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
          div.style.fontWeight = 'bold';
        }

        if ((s.fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
          div.style.fontStyle = 'italic';
        }

        str = mxUtils.htmlEntities(str, false);
        div.innerHTML = str.replace(/\n/g, '<br/>');
        document.body.appendChild(div);
        var w = div.offsetWidth;
        var h = div.offsetHeight;
        div.parentNode.removeChild(div);

        if (align == mxConstants.ALIGN_CENTER) {
          x -= w / 2;
        } else if (align == mxConstants.ALIGN_RIGHT) {
          x -= w;
        }

        if (valign == mxConstants.ALIGN_MIDDLE) {
          y -= h / 2;
        } else if (valign == mxConstants.ALIGN_BOTTOM) {
          y -= h;
        }

        bbox = new mxRectangle((x + 1) * s.scale, (y + 2) * s.scale, w * s.scale, (h + 1) * s.scale);
      }

      if (bbox != null) {
        var n = this.createElement('rect');
        n.setAttribute('fill', s.fontBackgroundColor || 'none');
        n.setAttribute('stroke', s.fontBorderColor || 'none');
        n.setAttribute('x', Math.floor(bbox.x - 1));
        n.setAttribute('y', Math.floor(bbox.y - 1));
        n.setAttribute('width', Math.ceil(bbox.width + 2));
        n.setAttribute('height', Math.ceil(bbox.height));
        var sw = s.fontBorderColor != null ? Math.max(1, this.format(s.scale)) : 0;
        n.setAttribute('stroke-width', sw);

        if (this.root.ownerDocument == document && mxUtils.mod(sw, 2) == 1) {
          n.setAttribute('transform', 'translate(0.5, 0.5)');
        }

        node.insertBefore(n, node.firstChild);
      }
    }
  }

  stroke() {
    this.addNode(false, true);
  }

  fill() {
    this.addNode(true, false);
  }

  fillAndStroke() {
    this.addNode(true, true);
  }
}
