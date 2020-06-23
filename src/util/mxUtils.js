import { mxDragSource } from '@mxgraph/util/mxDragSource';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxWindow } from '@mxgraph/util/mxWindow';
import { mxCodec } from '@mxgraph/io/mxCodec';
import { mxTemporaryCellStates } from '@mxgraph/view/mxTemporaryCellStates';
import { mxCellPath } from '@mxgraph/model/mxCellPath';
import { mxEffects } from '@mxgraph/util/mxEffects';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxDictionary } from '@mxgraph/util/mxDictionary';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';
import { mxXmlRequest } from '@mxgraph/util/mxXmlRequest';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxClient } from '@mxgraph/mxClient';

export class mxUtils {
  static errorResource = mxClient.language != 'none' ? 'error' : '';
  static closeResource = mxClient.language != 'none' ? 'close' : '';
  static errorImage = mxClient.imageBasePath + '/error.gif';

  static removeCursors(element) {
    if (element.style != null) {
      element.style.cursor = '';
    }

    var children = element.childNodes;

    if (children != null) {
      var childCount = children.length;

      for (var i = 0; i < childCount; i += 1) {
        mxUtils.removeCursors(children[i]);
      }
    }
  }

  static getCurrentStyle(element) {
    return element != null ? window.getComputedStyle(element, '') : null;
  }

  static parseCssNumber(value) {
    if (value == 'thin') {
      value = '2';
    } else if (value == 'medium') {
      value = '4';
    } else if (value == 'thick') {
      value = '6';
    }

    value = parseFloat(value);

    if (isNaN(value)) {
      value = 0;
    }

    return value;
  }

  static setPrefixedStyle = (function () {
    var prefix = null;

    if (mxClient.IS_OT) {
      prefix = 'O';
    } else if (mxClient.IS_SF || mxClient.IS_GC) {
      prefix = 'Webkit';
    } else if (mxClient.IS_MT) {
      prefix = 'Moz';
    }

    return function (style, name, value) {
      style[name] = value;

      if (prefix != null && name.length > 0) {
        name = prefix + name.substring(0, 1).toUpperCase() + name.substring(1);
        style[name] = value;
      }
    };
  })();

  static hasScrollbars(node) {
    var style = mxUtils.getCurrentStyle(node);
    return style != null && (style.overflow == 'scroll' || style.overflow == 'auto');
  }

  static bind(scope, funct) {
    return function () {
      return funct.apply(scope, arguments);
    };
  }

  static eval(expr) {
    var result = null;

    if (expr.indexOf('function') >= 0) {
      try {
        eval('var _mxJavaScriptExpression=' + expr);
        // eslint-disable-next-line no-undef
        result = _mxJavaScriptExpression;
        // eslint-disable-next-line no-undef
        _mxJavaScriptExpression = null;
      } catch (e) {
        mxLog.warn(e.message + ' while evaluating ' + expr);
      }
    } else {
      try {
        result = eval(expr);
      } catch (e) {
        mxLog.warn(e.message + ' while evaluating ' + expr);
      }
    }

    return result;
  }

  static findNode(node, attr, value) {
    if (node.nodeType == mxConstants.NODETYPE_ELEMENT) {
      var tmp = node.getAttribute(attr);

      if (tmp != null && tmp == value) {
        return node;
      }
    }

    node = node.firstChild;

    while (node != null) {
      var result = mxUtils.findNode(node, attr, value);

      if (result != null) {
        return result;
      }

      node = node.nextSibling;
    }

    return null;
  }

  static getFunctionName(f) {
    var str = null;

    if (f != null) {
      if (f.name != null) {
        str = f.name;
      } else {
        str = mxUtils.trim(f.toString());

        if (/^function\s/.test(str)) {
          str = mxUtils.ltrim(str.substring(9));
          var idx2 = str.indexOf('(');

          if (idx2 > 0) {
            str = str.substring(0, idx2);
          }
        }
      }
    }

    return str;
  }

  static indexOf(array, obj) {
    if (array != null && obj != null) {
      for (var i = 0; i < array.length; i++) {
        if (array[i] == obj) {
          return i;
        }
      }
    }

    return -1;
  }

  static forEach(array, fn) {
    if (array != null && fn != null) {
      for (var i = 0; i < array.length; i++) {
        fn(array[i]);
      }
    }

    return array;
  }

  static remove(obj, array) {
    var result = null;

    if (typeof array == 'object') {
      var index = mxUtils.indexOf(array, obj);

      while (index >= 0) {
        array.splice(index, 1);
        result = obj;
        index = mxUtils.indexOf(array, obj);
      }
    }

    for (var key in array) {
      if (array[key] == obj) {
        delete array[key];
        result = obj;
      }
    }

    return result;
  }

  static isNode(value, nodeName, attributeName, attributeValue) {
    if (
      value != null &&
      !isNaN(value.nodeType) &&
      (nodeName == null || value.nodeName.toLowerCase() == nodeName.toLowerCase())
    ) {
      return attributeName == null || value.getAttribute(attributeName) == attributeValue;
    }

    return false;
  }

  static isAncestorNode(ancestor, child) {
    var parent = child;

    while (parent != null) {
      if (parent == ancestor) {
        return true;
      }

      parent = parent.parentNode;
    }

    return false;
  }

  static getChildNodes(node, nodeType) {
    nodeType = nodeType || mxConstants.NODETYPE_ELEMENT;
    var children = [];
    var tmp = node.firstChild;

    while (tmp != null) {
      if (tmp.nodeType == nodeType) {
        children.push(tmp);
      }

      tmp = tmp.nextSibling;
    }

    return children;
  }

  static importNode(doc, node, allChildren) {
    return doc.importNode(node, allChildren);
  }

  static importNodeImplementation(doc, node, allChildren) {
    switch (node.nodeType) {
      case 1: {
        var newNode = doc.createElement(node.nodeName);

        if (node.attributes && node.attributes.length > 0) {
          for (var i = 0; i < node.attributes.length; i++) {
            newNode.setAttribute(node.attributes[i].nodeName, node.getAttribute(node.attributes[i].nodeName));
          }
        }

        if (allChildren && node.childNodes && node.childNodes.length > 0) {
          for (var i = 0; i < node.childNodes.length; i++) {
            newNode.appendChild(mxUtils.importNodeImplementation(doc, node.childNodes[i], allChildren));
          }
        }

        return newNode;
      }

      case 3:
      case 4:
      case 8: {
        return doc.createTextNode(node.nodeValue != null ? node.nodeValue : node.value);
      }
    }
  }

  static createXmlDocument() {
    var doc = null;

    if (document.implementation && document.implementation.createDocument) {
      doc = document.implementation.createDocument('', '', null);
    } else if ('ActiveXObject' in window) {
      doc = mxUtils.createMsXmlDocument();
    }

    return doc;
  }

  static createMsXmlDocument() {
    // eslint-disable-next-line no-undef
    var doc = new ActiveXObject('Microsoft.XMLDOM');
    doc.async = false;
    doc.validateOnParse = false;
    doc.resolveExternals = false;
    return doc;
  }

  static parseXml(xml) {
    var parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
  }

  static clearSelection = (function () {
    if (document.selection) {
      return function () {
        document.selection.empty();
      };
    } else if (window.getSelection) {
      return function () {
        if (window.getSelection().empty) {
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {
          window.getSelection().removeAllRanges();
        }
      };
    } else {
      return function () {};
    }
  })();

  static removeWhitespace(node, before) {
    var tmp = before ? node.previousSibling : node.nextSibling;

    while (tmp != null && tmp.nodeType == mxConstants.NODETYPE_TEXT) {
      var next = before ? tmp.previousSibling : tmp.nextSibling;
      var text = mxUtils.getTextContent(tmp);

      if (mxUtils.trim(text).length == 0) {
        tmp.parentNode.removeChild(tmp);
      }

      tmp = next;
    }
  }

  static htmlEntities(s, newline) {
    s = String(s || '');
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/"/g, '&quot;');
    s = s.replace(/\'/g, '&#39;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');

    if (newline == null || newline) {
      s = s.replace(/\n/g, '&#xa;');
    }

    return s;
  }

  static isVml(node) {
    return node != null && node.tagUrn == 'urn:schemas-microsoft-com:vml';
  }

  static getXml(node, linefeed) {
    var xml = '';

    if (mxClient.IS_IE11) {
      xml = mxUtils.getPrettyXml(node, '', '', '');
    } else if (window.XMLSerializer != null) {
      var xmlSerializer = new XMLSerializer();
      xml = xmlSerializer.serializeToString(node);
    } else if (node.xml != null) {
      xml = node.xml
        .replace(/\r\n\t[\t]*/g, '')
        .replace(/>\r\n/g, '>')
        .replace(/\r\n/g, '\n');
    }

    linefeed = linefeed || '&#xa;';
    xml = xml.replace(/\n/g, linefeed);
    return xml;
  }

  static getPrettyXml(node, tab, indent, newline, ns) {
    var result = [];

    if (node != null) {
      tab = tab != null ? tab : '  ';
      indent = indent != null ? indent : '';
      newline = newline != null ? newline : '\n';

      if (node.namespaceURI != null && node.namespaceURI != ns) {
        ns = node.namespaceURI;

        if (node.getAttribute('xmlns') == null) {
          node.setAttribute('xmlns', node.namespaceURI);
        }
      }

      if (node.nodeType == mxConstants.NODETYPE_DOCUMENT) {
        result.push(mxUtils.getPrettyXml(node.documentElement, tab, indent, newline, ns));
      } else if (node.nodeType == mxConstants.NODETYPE_DOCUMENT_FRAGMENT) {
        var tmp = node.firstChild;

        if (tmp != null) {
          while (tmp != null) {
            result.push(mxUtils.getPrettyXml(tmp, tab, indent, newline, ns));
            tmp = tmp.nextSibling;
          }
        }
      } else if (node.nodeType == mxConstants.NODETYPE_COMMENT) {
        var value = mxUtils.getTextContent(node);

        if (value.length > 0) {
          result.push(indent + '<!--' + value + '-->' + newline);
        }
      } else if (node.nodeType == mxConstants.NODETYPE_TEXT) {
        var value = mxUtils.getTextContent(node);

        if (value.length > 0) {
          result.push(indent + mxUtils.htmlEntities(mxUtils.trim(value), false) + newline);
        }
      } else if (node.nodeType == mxConstants.NODETYPE_CDATA) {
        var value = mxUtils.getTextContent(node);

        if (value.length > 0) {
          result.push(indent + '<![CDATA[' + value + ']]' + newline);
        }
      } else {
        result.push(indent + '<' + node.nodeName);
        var attrs = node.attributes;

        if (attrs != null) {
          for (var i = 0; i < attrs.length; i++) {
            var val = mxUtils.htmlEntities(attrs[i].value);
            result.push(' ' + attrs[i].nodeName + '="' + val + '"');
          }
        }

        var tmp = node.firstChild;

        if (tmp != null) {
          result.push('>' + newline);

          while (tmp != null) {
            result.push(mxUtils.getPrettyXml(tmp, tab, indent + tab, newline, ns));
            tmp = tmp.nextSibling;
          }

          result.push(indent + '</' + node.nodeName + '>' + newline);
        } else {
          result.push(' />' + newline);
        }
      }
    }

    return result.join('');
  }

  static extractTextWithWhitespace(elems) {
    var blocks = ['BLOCKQUOTE', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'OL', 'P', 'PRE', 'TABLE', 'UL'];
    var ret = [];

    function doExtract(elts) {
      if (elts.length == 1 && (elts[0].nodeName == 'BR' || elts[0].innerHTML == '\n')) {
        return;
      }

      for (var i = 0; i < elts.length; i++) {
        var elem = elts[i];

        if (
          elem.nodeName == 'BR' ||
          elem.innerHTML == '\n' ||
          ((elts.length == 1 || i == 0) && elem.nodeName == 'DIV' && elem.innerHTML.toLowerCase() == '<br>')
        ) {
          ret.push('\n');
        } else {
          if (elem.nodeType === 3 || elem.nodeType === 4) {
            if (elem.nodeValue.length > 0) {
              ret.push(elem.nodeValue);
            }
          } else if (elem.nodeType !== 8 && elem.childNodes.length > 0) {
            doExtract(elem.childNodes);
          }

          if (i < elts.length - 1 && mxUtils.indexOf(blocks, elts[i + 1].nodeName) >= 0) {
            ret.push('\n');
          }
        }
      }
    }

    doExtract(elems);
    return ret.join('');
  }

  static replaceTrailingNewlines(str, pattern) {
    var postfix = '';

    while (str.length > 0 && str.charAt(str.length - 1) == '\n') {
      str = str.substring(0, str.length - 1);
      postfix += pattern;
    }

    return str + postfix;
  }

  static getTextContent(node) {
    return node != null ? node[node.textContent === undefined ? 'text' : 'textContent'] : '';
  }

  static setTextContent(node, text) {
    if (node.innerText !== undefined) {
      node.innerText = text;
    } else {
      node[node.textContent === undefined ? 'text' : 'textContent'] = text;
    }
  }

  static getInnerHtml(node) {
    if (node != null) {
      var serializer = new XMLSerializer();
      return serializer.serializeToString(node);
    }

    return '';
  }

  static getOuterHtml(node) {
    if (node != null) {
      var serializer = new XMLSerializer();
      return serializer.serializeToString(node);
    }

    return '';
  }

  static write(parent, text) {
    var doc = parent.ownerDocument;
    var node = doc.createTextNode(text);

    if (parent != null) {
      parent.appendChild(node);
    }

    return node;
  }

  static writeln(parent, text) {
    var doc = parent.ownerDocument;
    var node = doc.createTextNode(text);

    if (parent != null) {
      parent.appendChild(node);
      parent.appendChild(document.createElement('br'));
    }

    return node;
  }

  static br(parent, count) {
    count = count || 1;
    var br = null;

    for (var i = 0; i < count; i++) {
      if (parent != null) {
        br = parent.ownerDocument.createElement('br');
        parent.appendChild(br);
      }
    }

    return br;
  }

  static button(label, funct, doc) {
    doc = doc != null ? doc : document;
    var button = doc.createElement('button');
    mxUtils.write(button, label);
    mxEvent.addListener(button, 'click', function (evt) {
      funct(evt);
    });
    return button;
  }

  static para(parent, text) {
    var p = document.createElement('p');
    mxUtils.write(p, text);

    if (parent != null) {
      parent.appendChild(p);
    }

    return p;
  }

  static addTransparentBackgroundFilter(node) {
    node.style.filter +=
      "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" +
      mxClient.imageBasePath +
      "/transparent.gif', sizingMethod='scale')";
  }

  static linkAction(parent, text, editor, action, pad) {
    return mxUtils.link(
      parent,
      text,
      function () {
        editor.execute(action);
      },
      pad
    );
  }

  static linkInvoke(parent, text, editor, functName, arg, pad) {
    return mxUtils.link(
      parent,
      text,
      function () {
        editor[functName](arg);
      },
      pad
    );
  }

  static link(parent, text, funct, pad) {
    var a = document.createElement('span');
    a.style.color = 'blue';
    a.style.textDecoration = 'underline';
    a.style.cursor = 'pointer';

    if (pad != null) {
      a.style.paddingLeft = pad + 'px';
    }

    mxEvent.addListener(a, 'click', funct);
    mxUtils.write(a, text);

    if (parent != null) {
      parent.appendChild(a);
    }

    return a;
  }

  static getDocumentSize() {
    var b = document.body;
    var d = document.documentElement;

    try {
      return new mxRectangle(0, 0, b.clientWidth || d.clientWidth, Math.max(b.clientHeight || 0, d.clientHeight));
    } catch (e) {
      return new mxRectangle();
    }
  }

  static fit(node) {
    var ds = mxUtils.getDocumentSize();
    var left = parseInt(node.offsetLeft);
    var width = parseInt(node.offsetWidth);
    var offset = mxUtils.getDocumentScrollOrigin(node.ownerDocument);
    var sl = offset.x;
    var st = offset.y;
    var b = document.body;
    var d = document.documentElement;
    var right = sl + ds.width;

    if (left + width > right) {
      node.style.left = Math.max(sl, right - width) + 'px';
    }

    var top = parseInt(node.offsetTop);
    var height = parseInt(node.offsetHeight);
    var bottom = st + ds.height;

    if (top + height > bottom) {
      node.style.top = Math.max(st, bottom - height) + 'px';
    }
  }

  static load(url) {
    var req = new mxXmlRequest(url, null, 'GET', false);
    req.send();
    return req;
  }

  static get(url, onload, onerror, binary, timeout, ontimeout, headers) {
    var req = new mxXmlRequest(url, null, 'GET');
    var setRequestHeaders = req.setRequestHeaders;

    if (headers) {
      req.setRequestHeaders = function (request, params) {
        setRequestHeaders.apply(this, arguments);

        for (var key in headers) {
          request.setRequestHeader(key, headers[key]);
        }
      };
    }

    if (binary != null) {
      req.setBinary(binary);
    }

    req.send(onload, onerror, timeout, ontimeout);
    return req;
  }

  static getAll(urls, onload, onerror) {
    var remain = urls.length;
    var result = [];
    var errors = 0;

    var err = function () {
      if (errors == 0 && onerror != null) {
        onerror();
      }

      errors++;
    };

    for (var i = 0; i < urls.length; i++) {
      (function (url, index) {
        mxUtils.get(
          url,
          function (req) {
            var status = req.getStatus();

            if (status < 200 || status > 299) {
              err();
            } else {
              result[index] = req;
              remain--;

              if (remain == 0) {
                onload(result);
              }
            }
          },
          err
        );
      })(urls[i], i);
    }

    if (remain == 0) {
      onload(result);
    }
  }

  static post(url, params, onload, onerror) {
    return new mxXmlRequest(url, params).send(onload, onerror);
  }

  static submit(url, params, doc, target) {
    return new mxXmlRequest(url, params).simulate(doc, target);
  }

  static loadInto(url, doc, onload) {
    doc.addEventListener('load', onload, false);
    doc.load(url);
  }

  static getValue(array, key, defaultValue) {
    var value = array != null ? array[key] : null;

    if (value == null) {
      value = defaultValue;
    }

    return value;
  }

  static getNumber(array, key, defaultValue) {
    var value = array != null ? array[key] : null;

    if (value == null) {
      value = defaultValue || 0;
    }

    return Number(value);
  }

  static getColor(array, key, defaultValue) {
    var value = array != null ? array[key] : null;

    if (value == null) {
      value = defaultValue;
    } else if (value == mxConstants.NONE) {
      value = null;
    }

    return value;
  }

  static clone(obj, transients, shallow) {
    shallow = shallow != null ? shallow : false;
    var clone = null;

    if (obj != null && typeof obj.constructor == 'function') {
      clone = new obj.constructor();

      for (var i in obj) {
        if (i != mxObjectIdentity.FIELD_NAME && (transients == null || mxUtils.indexOf(transients, i) < 0)) {
          if (!shallow && typeof obj[i] == 'object') {
            clone[i] = mxUtils.clone(obj[i]);
          } else {
            clone[i] = obj[i];
          }
        }
      }
    }

    return clone;
  }

  static equalPoints(a, b) {
    if ((a == null && b != null) || (a != null && b == null) || (a != null && b != null && a.length != b.length)) {
      return false;
    } else if (a != null && b != null) {
      for (var i = 0; i < a.length; i++) {
        if (
          (a[i] != null && b[i] == null) ||
          (a[i] == null && b[i] != null) ||
          (a[i] != null && b[i] != null && (a[i].x != b[i].x || a[i].y != b[i].y))
        ) {
          return false;
        }
      }
    }

    return true;
  }

  static equalEntries(a, b) {
    var count = 0;

    if ((a == null && b != null) || (a != null && b == null) || (a != null && b != null && a.length != b.length)) {
      return false;
    } else if (a != null && b != null) {
      for (var key in b) {
        count++;
      }

      for (var key in a) {
        count--;

        if ((!mxUtils.isNaN(a[key]) || !mxUtils.isNaN(b[key])) && a[key] != b[key]) {
          return false;
        }
      }
    }

    return count == 0;
  }

  static removeDuplicates(arr) {
    var dict = new mxDictionary();
    var result = [];

    for (var i = 0; i < arr.length; i++) {
      if (!dict.get(arr[i])) {
        result.push(arr[i]);
        dict.put(arr[i], true);
      }
    }

    return result;
  }

  static isNaN(value) {
    return typeof value == 'number' && isNaN(value);
  }

  static extend(ctor, superCtor) {
    var f = function () {};

    f.prototype = superCtor.prototype;
    ctor.prototype = new f();
    ctor.prototype.constructor = ctor;
  }

  static toString(obj) {
    var output = '';

    for (var i in obj) {
      try {
        if (obj[i] == null) {
          output += i + ' = [null]\n';
        } else if (typeof obj[i] == 'function') {
          output += i + ' => [Function]\n';
        } else if (typeof obj[i] == 'object') {
          var ctor = mxUtils.getFunctionName(obj[i].constructor);
          output += i + ' => [' + ctor + ']\n';
        } else {
          output += i + ' = ' + obj[i] + '\n';
        }
      } catch (e) {
        output += i + '=' + e.message;
      }
    }

    return output;
  }

  static toRadians(deg) {
    return (Math.PI * deg) / 180;
  }

  static toDegree(rad) {
    return (rad * 180) / Math.PI;
  }

  static arcToCurves(x0, y0, r1, r2, angle, largeArcFlag, sweepFlag, x, y) {
    x -= x0;
    y -= y0;

    if (r1 === 0 || r2 === 0) {
      return result;
    }

    var fS = sweepFlag;
    var psai = angle;
    r1 = Math.abs(r1);
    r2 = Math.abs(r2);
    var ctx = -x / 2;
    var cty = -y / 2;
    var cpsi = Math.cos((psai * Math.PI) / 180);
    var spsi = Math.sin((psai * Math.PI) / 180);
    var rxd = cpsi * ctx + spsi * cty;
    var ryd = -1 * spsi * ctx + cpsi * cty;
    var rxdd = rxd * rxd;
    var rydd = ryd * ryd;
    var r1x = r1 * r1;
    var r2y = r2 * r2;
    var lamda = rxdd / r1x + rydd / r2y;
    var sds;

    if (lamda > 1) {
      r1 = Math.sqrt(lamda) * r1;
      r2 = Math.sqrt(lamda) * r2;
      sds = 0;
    } else {
      var seif = 1;

      if (largeArcFlag === fS) {
        seif = -1;
      }

      sds = seif * Math.sqrt((r1x * r2y - r1x * rydd - r2y * rxdd) / (r1x * rydd + r2y * rxdd));
    }

    var txd = (sds * r1 * ryd) / r2;
    var tyd = (-1 * sds * r2 * rxd) / r1;
    var tx = cpsi * txd - spsi * tyd + x / 2;
    var ty = spsi * txd + cpsi * tyd + y / 2;
    var rad = Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1) - Math.atan2(0, 1);
    var s1 = rad >= 0 ? rad : 2 * Math.PI + rad;
    rad = Math.atan2((-ryd - tyd) / r2, (-rxd - txd) / r1) - Math.atan2((ryd - tyd) / r2, (rxd - txd) / r1);
    var dr = rad >= 0 ? rad : 2 * Math.PI + rad;

    if (fS == 0 && dr > 0) {
      dr -= 2 * Math.PI;
    } else if (fS != 0 && dr < 0) {
      dr += 2 * Math.PI;
    }

    var sse = (dr * 2) / Math.PI;
    var seg = Math.ceil(sse < 0 ? -1 * sse : sse);
    var segr = dr / seg;
    var t = ((8 / 3) * Math.sin(segr / 4) * Math.sin(segr / 4)) / Math.sin(segr / 2);
    var cpsir1 = cpsi * r1;
    var cpsir2 = cpsi * r2;
    var spsir1 = spsi * r1;
    var spsir2 = spsi * r2;
    var mc = Math.cos(s1);
    var ms = Math.sin(s1);
    var x2 = -t * (cpsir1 * ms + spsir2 * mc);
    var y2 = -t * (spsir1 * ms - cpsir2 * mc);
    var x3 = 0;
    var y3 = 0;
    var result = [];

    for (var n = 0; n < seg; ++n) {
      s1 += segr;
      mc = Math.cos(s1);
      ms = Math.sin(s1);
      x3 = cpsir1 * mc - spsir2 * ms + tx;
      y3 = spsir1 * mc + cpsir2 * ms + ty;
      var dx = -t * (cpsir1 * ms + spsir2 * mc);
      var dy = -t * (spsir1 * ms - cpsir2 * mc);
      var index = n * 6;
      result[index] = Number(x2 + x0);
      result[index + 1] = Number(y2 + y0);
      result[index + 2] = Number(x3 - dx + x0);
      result[index + 3] = Number(y3 - dy + y0);
      result[index + 4] = Number(x3 + x0);
      result[index + 5] = Number(y3 + y0);
      x2 = x3 + dx;
      y2 = y3 + dy;
    }

    return result;
  }

  static getBoundingBox(rect, rotation, cx) {
    var result = null;

    if (rect != null && rotation != null && rotation != 0) {
      var rad = mxUtils.toRadians(rotation);
      var cos = Math.cos(rad);
      var sin = Math.sin(rad);
      cx = cx != null ? cx : new mxPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      var p1 = new mxPoint(rect.x, rect.y);
      var p2 = new mxPoint(rect.x + rect.width, rect.y);
      var p3 = new mxPoint(p2.x, rect.y + rect.height);
      var p4 = new mxPoint(rect.x, p3.y);
      p1 = mxUtils.getRotatedPoint(p1, cos, sin, cx);
      p2 = mxUtils.getRotatedPoint(p2, cos, sin, cx);
      p3 = mxUtils.getRotatedPoint(p3, cos, sin, cx);
      p4 = mxUtils.getRotatedPoint(p4, cos, sin, cx);
      result = new mxRectangle(p1.x, p1.y, 0, 0);
      result.add(new mxRectangle(p2.x, p2.y, 0, 0));
      result.add(new mxRectangle(p3.x, p3.y, 0, 0));
      result.add(new mxRectangle(p4.x, p4.y, 0, 0));
    }

    return result;
  }

  static getRotatedPoint(pt, cos, sin, c) {
    c = c != null ? c : new mxPoint();
    var x = pt.x - c.x;
    var y = pt.y - c.y;
    var x1 = x * cos - y * sin;
    var y1 = y * cos + x * sin;
    return new mxPoint(x1 + c.x, y1 + c.y);
  }

  static getPortConstraints(terminal, edge, source, defaultValue) {
    var value = mxUtils.getValue(
      terminal.style,
      mxConstants.STYLE_PORT_CONSTRAINT,
      mxUtils.getValue(
        edge.style,
        source ? mxConstants.STYLE_SOURCE_PORT_CONSTRAINT : mxConstants.STYLE_TARGET_PORT_CONSTRAINT,
        null
      )
    );

    if (value == null) {
      return defaultValue;
    } else {
      var directions = value.toString();
      var returnValue = mxConstants.DIRECTION_MASK_NONE;
      var constraintRotationEnabled = mxUtils.getValue(terminal.style, mxConstants.STYLE_PORT_CONSTRAINT_ROTATION, 0);
      var rotation = 0;

      if (constraintRotationEnabled == 1) {
        rotation = mxUtils.getValue(terminal.style, mxConstants.STYLE_ROTATION, 0);
      }

      var quad = 0;

      if (rotation > 45) {
        quad = 1;

        if (rotation >= 135) {
          quad = 2;
        }
      } else if (rotation < -45) {
        quad = 3;

        if (rotation <= -135) {
          quad = 2;
        }
      }

      if (directions.indexOf(mxConstants.DIRECTION_NORTH) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;

          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;

          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;

          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;
        }
      }

      if (directions.indexOf(mxConstants.DIRECTION_WEST) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;

          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;

          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;

          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;
        }
      }

      if (directions.indexOf(mxConstants.DIRECTION_SOUTH) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;

          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;

          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;

          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;
        }
      }

      if (directions.indexOf(mxConstants.DIRECTION_EAST) >= 0) {
        switch (quad) {
          case 0:
            returnValue |= mxConstants.DIRECTION_MASK_EAST;
            break;

          case 1:
            returnValue |= mxConstants.DIRECTION_MASK_SOUTH;
            break;

          case 2:
            returnValue |= mxConstants.DIRECTION_MASK_WEST;
            break;

          case 3:
            returnValue |= mxConstants.DIRECTION_MASK_NORTH;
            break;
        }
      }

      return returnValue;
    }
  }

  static reversePortConstraints(constraint) {
    var result = 0;
    result = (constraint & mxConstants.DIRECTION_MASK_WEST) << 3;
    result |= (constraint & mxConstants.DIRECTION_MASK_NORTH) << 1;
    result |= (constraint & mxConstants.DIRECTION_MASK_SOUTH) >> 1;
    result |= (constraint & mxConstants.DIRECTION_MASK_EAST) >> 3;
    return result;
  }

  static findNearestSegment(state, x, y) {
    var index = -1;

    if (state.absolutePoints.length > 0) {
      var last = state.absolutePoints[0];
      var min = null;

      for (var i = 1; i < state.absolutePoints.length; i++) {
        var current = state.absolutePoints[i];
        var dist = mxUtils.ptSegDistSq(last.x, last.y, current.x, current.y, x, y);

        if (min == null || dist < min) {
          min = dist;
          index = i - 1;
        }

        last = current;
      }
    }

    return index;
  }

  static getDirectedBounds(rect, m, style, flipH, flipV) {
    var d = mxUtils.getValue(style, mxConstants.STYLE_DIRECTION, mxConstants.DIRECTION_EAST);
    flipH = flipH != null ? flipH : mxUtils.getValue(style, mxConstants.STYLE_FLIPH, false);
    flipV = flipV != null ? flipV : mxUtils.getValue(style, mxConstants.STYLE_FLIPV, false);
    m.x = Math.round(Math.max(0, Math.min(rect.width, m.x)));
    m.y = Math.round(Math.max(0, Math.min(rect.height, m.y)));
    m.width = Math.round(Math.max(0, Math.min(rect.width, m.width)));
    m.height = Math.round(Math.max(0, Math.min(rect.height, m.height)));

    if (
      (flipV && (d == mxConstants.DIRECTION_SOUTH || d == mxConstants.DIRECTION_NORTH)) ||
      (flipH && (d == mxConstants.DIRECTION_EAST || d == mxConstants.DIRECTION_WEST))
    ) {
      var tmp = m.x;
      m.x = m.width;
      m.width = tmp;
    }

    if (
      (flipH && (d == mxConstants.DIRECTION_SOUTH || d == mxConstants.DIRECTION_NORTH)) ||
      (flipV && (d == mxConstants.DIRECTION_EAST || d == mxConstants.DIRECTION_WEST))
    ) {
      var tmp = m.y;
      m.y = m.height;
      m.height = tmp;
    }

    var m2 = mxRectangle.fromRectangle(m);

    if (d == mxConstants.DIRECTION_SOUTH) {
      m2.y = m.x;
      m2.x = m.height;
      m2.width = m.y;
      m2.height = m.width;
    } else if (d == mxConstants.DIRECTION_WEST) {
      m2.y = m.height;
      m2.x = m.width;
      m2.width = m.x;
      m2.height = m.y;
    } else if (d == mxConstants.DIRECTION_NORTH) {
      m2.y = m.width;
      m2.x = m.y;
      m2.width = m.height;
      m2.height = m.x;
    }

    return new mxRectangle(rect.x + m2.x, rect.y + m2.y, rect.width - m2.width - m2.x, rect.height - m2.height - m2.y);
  }

  static getPerimeterPoint(pts, center, point) {
    var min = null;

    for (var i = 0; i < pts.length - 1; i++) {
      var pt = mxUtils.intersection(
        pts[i].x,
        pts[i].y,
        pts[i + 1].x,
        pts[i + 1].y,
        center.x,
        center.y,
        point.x,
        point.y
      );

      if (pt != null) {
        var dx = point.x - pt.x;
        var dy = point.y - pt.y;
        var ip = {
          p: pt,
          distSq: dy * dy + dx * dx
        };

        if (ip != null && (min == null || min.distSq > ip.distSq)) {
          min = ip;
        }
      }
    }

    return min != null ? min.p : null;
  }

  static rectangleIntersectsSegment(bounds, p1, p2) {
    var top = bounds.y;
    var left = bounds.x;
    var bottom = top + bounds.height;
    var right = left + bounds.width;
    var minX = p1.x;
    var maxX = p2.x;

    if (p1.x > p2.x) {
      minX = p2.x;
      maxX = p1.x;
    }

    if (maxX > right) {
      maxX = right;
    }

    if (minX < left) {
      minX = left;
    }

    if (minX > maxX) {
      return false;
    }

    var minY = p1.y;
    var maxY = p2.y;
    var dx = p2.x - p1.x;

    if (Math.abs(dx) > 0.0000001) {
      var a = (p2.y - p1.y) / dx;
      var b = p1.y - a * p1.x;
      minY = a * minX + b;
      maxY = a * maxX + b;
    }

    if (minY > maxY) {
      var tmp = maxY;
      maxY = minY;
      minY = tmp;
    }

    if (maxY > bottom) {
      maxY = bottom;
    }

    if (minY < top) {
      minY = top;
    }

    if (minY > maxY) {
      return false;
    }

    return true;
  }

  static contains(bounds, x, y) {
    return bounds.x <= x && bounds.x + bounds.width >= x && bounds.y <= y && bounds.y + bounds.height >= y;
  }

  static intersects(a, b) {
    var tw = a.width;
    var th = a.height;
    var rw = b.width;
    var rh = b.height;

    if (rw <= 0 || rh <= 0 || tw <= 0 || th <= 0) {
      return false;
    }

    var tx = a.x;
    var ty = a.y;
    var rx = b.x;
    var ry = b.y;
    rw += rx;
    rh += ry;
    tw += tx;
    th += ty;
    return (rw < rx || rw > tx) && (rh < ry || rh > ty) && (tw < tx || tw > rx) && (th < ty || th > ry);
  }

  static intersectsHotspot(state, x, y, hotspot, min, max) {
    hotspot = hotspot != null ? hotspot : 1;
    min = min != null ? min : 0;
    max = max != null ? max : 0;

    if (hotspot > 0) {
      var cx = state.getCenterX();
      var cy = state.getCenterY();
      var w = state.width;
      var h = state.height;
      var start = mxUtils.getValue(state.style, mxConstants.STYLE_STARTSIZE) * state.view.scale;

      if (start > 0) {
        if (mxUtils.getValue(state.style, mxConstants.STYLE_HORIZONTAL, true)) {
          cy = state.y + start / 2;
          h = start;
        } else {
          cx = state.x + start / 2;
          w = start;
        }
      }

      w = Math.max(min, w * hotspot);
      h = Math.max(min, h * hotspot);

      if (max > 0) {
        w = Math.min(w, max);
        h = Math.min(h, max);
      }

      var rect = new mxRectangle(cx - w / 2, cy - h / 2, w, h);
      var alpha = mxUtils.toRadians(mxUtils.getValue(state.style, mxConstants.STYLE_ROTATION) || 0);

      if (alpha != 0) {
        var cos = Math.cos(-alpha);
        var sin = Math.sin(-alpha);
        var cx = new mxPoint(state.getCenterX(), state.getCenterY());
        var pt = mxUtils.getRotatedPoint(new mxPoint(x, y), cos, sin, cx);
        x = pt.x;
        y = pt.y;
      }

      return mxUtils.contains(rect, x, y);
    }

    return true;
  }

  static getOffset(container, scrollOffset) {
    var offsetLeft = 0;
    var offsetTop = 0;
    var fixed = false;
    var node = container;
    var b = document.body;
    var d = document.documentElement;

    while (node != null && node != b && node != d && !fixed) {
      var style = mxUtils.getCurrentStyle(node);

      if (style != null) {
        fixed = fixed || style.position == 'fixed';
      }

      node = node.parentNode;
    }

    if (!scrollOffset && !fixed) {
      var offset = mxUtils.getDocumentScrollOrigin(container.ownerDocument);
      offsetLeft += offset.x;
      offsetTop += offset.y;
    }

    var r = container.getBoundingClientRect();

    if (r != null) {
      offsetLeft += r.left;
      offsetTop += r.top;
    }

    return new mxPoint(offsetLeft, offsetTop);
  }

  static getDocumentScrollOrigin(doc) {
    if (mxClient.IS_QUIRKS) {
      return new mxPoint(doc.body.scrollLeft, doc.body.scrollTop);
    } else {
      var wnd = doc.defaultView || doc.parentWindow;
      var x =
        wnd != null && window.pageXOffset !== undefined
          ? window.pageXOffset
          : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
      var y =
        wnd != null && window.pageYOffset !== undefined
          ? window.pageYOffset
          : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      return new mxPoint(x, y);
    }
  }

  static getScrollOrigin(node, includeAncestors, includeDocument) {
    includeAncestors = includeAncestors != null ? includeAncestors : false;
    includeDocument = includeDocument != null ? includeDocument : true;
    var doc = node != null ? node.ownerDocument : document;
    var b = doc.body;
    var d = doc.documentElement;
    var result = new mxPoint();
    var fixed = false;

    while (node != null && node != b && node != d) {
      if (!isNaN(node.scrollLeft) && !isNaN(node.scrollTop)) {
        result.x += node.scrollLeft;
        result.y += node.scrollTop;
      }

      var style = mxUtils.getCurrentStyle(node);

      if (style != null) {
        fixed = fixed || style.position == 'fixed';
      }

      node = includeAncestors ? node.parentNode : null;
    }

    if (!fixed && includeDocument) {
      var origin = mxUtils.getDocumentScrollOrigin(doc);
      result.x += origin.x;
      result.y += origin.y;
    }

    return result;
  }

  static convertPoint(container, x, y) {
    var origin = mxUtils.getScrollOrigin(container, false);
    var offset = mxUtils.getOffset(container);
    offset.x -= origin.x;
    offset.y -= origin.y;
    return new mxPoint(x - offset.x, y - offset.y);
  }

  static ltrim(str, chars) {
    chars = chars || '\\s';
    return str != null ? str.replace(new RegExp('^[' + chars + ']+', 'g'), '') : null;
  }

  static rtrim(str, chars) {
    chars = chars || '\\s';
    return str != null ? str.replace(new RegExp('[' + chars + ']+$', 'g'), '') : null;
  }

  static trim(str, chars) {
    return mxUtils.ltrim(mxUtils.rtrim(str, chars), chars);
  }

  static isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n) && (typeof n != 'string' || n.toLowerCase().indexOf('0x') < 0);
  }

  static isInteger(n) {
    return String(parseInt(n)) === String(n);
  }

  static mod(n, m) {
    return ((n % m) + m) % m;
  }

  static intersection(x0, y0, x1, y1, x2, y2, x3, y3) {
    var denom = (y3 - y2) * (x1 - x0) - (x3 - x2) * (y1 - y0);
    var nume_a = (x3 - x2) * (y0 - y2) - (y3 - y2) * (x0 - x2);
    var nume_b = (x1 - x0) * (y0 - y2) - (y1 - y0) * (x0 - x2);
    var ua = nume_a / denom;
    var ub = nume_b / denom;

    if (ua >= 0.0 && ua <= 1.0 && ub >= 0.0 && ub <= 1.0) {
      var x = x0 + ua * (x1 - x0);
      var y = y0 + ua * (y1 - y0);
      return new mxPoint(x, y);
    }

    return null;
  }

  static ptSegDistSq(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    var dotprod = px * x2 + py * y2;
    var projlenSq;

    if (dotprod <= 0.0) {
      projlenSq = 0.0;
    } else {
      px = x2 - px;
      py = y2 - py;
      dotprod = px * x2 + py * y2;

      if (dotprod <= 0.0) {
        projlenSq = 0.0;
      } else {
        projlenSq = (dotprod * dotprod) / (x2 * x2 + y2 * y2);
      }
    }

    var lenSq = px * px + py * py - projlenSq;

    if (lenSq < 0) {
      lenSq = 0;
    }

    return lenSq;
  }

  static ptLineDist(x1, y1, x2, y2, px, py) {
    return (
      Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) /
      Math.sqrt((y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1))
    );
  }

  static relativeCcw(x1, y1, x2, y2, px, py) {
    x2 -= x1;
    y2 -= y1;
    px -= x1;
    py -= y1;
    var ccw = px * y2 - py * x2;

    if (ccw == 0.0) {
      ccw = px * x2 + py * y2;

      if (ccw > 0.0) {
        px -= x2;
        py -= y2;
        ccw = px * x2 + py * y2;

        if (ccw < 0.0) {
          ccw = 0.0;
        }
      }
    }

    return ccw < 0.0 ? -1 : ccw > 0.0 ? 1 : 0;
  }

  static animateChanges(graph, changes) {
    mxEffects.animateChanges.apply(this, arguments);
  }

  static cascadeOpacity(graph, cell, opacity) {
    mxEffects.cascadeOpacity.apply(this, arguments);
  }

  static fadeOut(node, from, remove, step, delay, isEnabled) {
    mxEffects.fadeOut.apply(this, arguments);
  }

  static setOpacity(node, value) {
    if (mxUtils.isVml(node)) {
      if (value >= 100) {
        node.style.filter = '';
      } else {
        node.style.filter = 'alpha(opacity=' + value / 5 + ')';
      }
    } else {
      node.style.opacity = value / 100;
    }
  }

  static createImage(src) {
    var imageNode = null;
    imageNode = document.createElement('img');
    imageNode.setAttribute('src', src);
    imageNode.setAttribute('border', '0');
    return imageNode;
  }

  static sortCells(cells, ascending) {
    ascending = ascending != null ? ascending : true;
    var lookup = new mxDictionary();
    cells.sort(function (o1, o2) {
      var p1 = lookup.get(o1);

      if (p1 == null) {
        p1 = mxCellPath.create(o1).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(o1, p1);
      }

      var p2 = lookup.get(o2);

      if (p2 == null) {
        p2 = mxCellPath.create(o2).split(mxCellPath.PATH_SEPARATOR);
        lookup.put(o2, p2);
      }

      var comp = mxCellPath.compare(p1, p2);
      return comp == 0 ? 0 : comp > 0 == ascending ? 1 : -1;
    });
    return cells;
  }

  static getStylename(style) {
    if (style != null) {
      var pairs = style.split(';');
      var stylename = pairs[0];

      if (stylename.indexOf('=') < 0) {
        return stylename;
      }
    }

    return '';
  }

  static getStylenames(style) {
    var result = [];

    if (style != null) {
      var pairs = style.split(';');

      for (var i = 0; i < pairs.length; i++) {
        if (pairs[i].indexOf('=') < 0) {
          result.push(pairs[i]);
        }
      }
    }

    return result;
  }

  static indexOfStylename(style, stylename) {
    if (style != null && stylename != null) {
      var tokens = style.split(';');
      var pos = 0;

      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] == stylename) {
          return pos;
        }

        pos += tokens[i].length + 1;
      }
    }

    return -1;
  }

  static addStylename(style, stylename) {
    if (mxUtils.indexOfStylename(style, stylename) < 0) {
      if (style == null) {
        style = '';
      } else if (style.length > 0 && style.charAt(style.length - 1) != ';') {
        style += ';';
      }

      style += stylename;
    }

    return style;
  }

  static removeStylename(style, stylename) {
    var result = [];

    if (style != null) {
      var tokens = style.split(';');

      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i] != stylename) {
          result.push(tokens[i]);
        }
      }
    }

    return result.join(';');
  }

  static removeAllStylenames(style) {
    var result = [];

    if (style != null) {
      var tokens = style.split(';');

      for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].indexOf('=') >= 0) {
          result.push(tokens[i]);
        }
      }
    }

    return result.join(';');
  }

  static setCellStyles(model, cells, key, value) {
    if (cells != null && cells.length > 0) {
      model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          if (cells[i] != null) {
            var style = mxUtils.setStyle(model.getStyle(cells[i]), key, value);
            model.setStyle(cells[i], style);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  static setStyle(style, key, value) {
    var isValue = value != null && (typeof value.length == 'undefined' || value.length > 0);

    if (style == null || style.length == 0) {
      if (isValue) {
        style = key + '=' + value + ';';
      }
    } else {
      if (style.substring(0, key.length + 1) == key + '=') {
        var next = style.indexOf(';');

        if (isValue) {
          style = key + '=' + value + (next < 0 ? ';' : style.substring(next));
        } else {
          style = next < 0 || next == style.length - 1 ? '' : style.substring(next + 1);
        }
      } else {
        var index = style.indexOf(';' + key + '=');

        if (index < 0) {
          if (isValue) {
            var sep = style.charAt(style.length - 1) == ';' ? '' : ';';
            style = style + sep + key + '=' + value + ';';
          }
        } else {
          var next = style.indexOf(';', index + 1);

          if (isValue) {
            style = style.substring(0, index + 1) + key + '=' + value + (next < 0 ? ';' : style.substring(next));
          } else {
            style = style.substring(0, index) + (next < 0 ? ';' : style.substring(next));
          }
        }
      }
    }

    return style;
  }

  static setCellStyleFlags(model, cells, key, flag, value) {
    if (cells != null && cells.length > 0) {
      model.beginUpdate();

      try {
        for (var i = 0; i < cells.length; i++) {
          if (cells[i] != null) {
            var style = mxUtils.setStyleFlag(model.getStyle(cells[i]), key, flag, value);
            model.setStyle(cells[i], style);
          }
        }
      } finally {
        model.endUpdate();
      }
    }
  }

  static setStyleFlag(style, key, flag, value) {
    if (style == null || style.length == 0) {
      if (value || value == null) {
        style = key + '=' + flag;
      } else {
        style = key + '=0';
      }
    } else {
      var index = style.indexOf(key + '=');

      if (index < 0) {
        var sep = style.charAt(style.length - 1) == ';' ? '' : ';';

        if (value || value == null) {
          style = style + sep + key + '=' + flag;
        } else {
          style = style + sep + key + '=0';
        }
      } else {
        var cont = style.indexOf(';', index);
        var tmp = '';

        if (cont < 0) {
          tmp = style.substring(index + key.length + 1);
        } else {
          tmp = style.substring(index + key.length + 1, cont);
        }

        if (value == null) {
          tmp = parseInt(tmp) ^ flag;
        } else if (value) {
          tmp = parseInt(tmp) | flag;
        } else {
          tmp = parseInt(tmp) & ~flag;
        }

        style = style.substring(0, index) + key + '=' + tmp + (cont >= 0 ? style.substring(cont) : '');
      }
    }

    return style;
  }

  static getAlignmentAsPoint(align, valign) {
    var dx = -0.5;
    var dy = -0.5;

    if (align == mxConstants.ALIGN_LEFT) {
      dx = 0;
    } else if (align == mxConstants.ALIGN_RIGHT) {
      dx = -1;
    }

    if (valign == mxConstants.ALIGN_TOP) {
      dy = 0;
    } else if (valign == mxConstants.ALIGN_BOTTOM) {
      dy = -1;
    }

    return new mxPoint(dx, dy);
  }

  static getSizeForString(text, fontSize, fontFamily, textWidth, fontStyle) {
    fontSize = fontSize != null ? fontSize : mxConstants.DEFAULT_FONTSIZE;
    fontFamily = fontFamily != null ? fontFamily : mxConstants.DEFAULT_FONTFAMILY;
    var div = document.createElement('div');
    div.style.fontFamily = fontFamily;
    div.style.fontSize = Math.round(fontSize) + 'px';
    div.style.lineHeight = Math.round(fontSize * mxConstants.LINE_HEIGHT) + 'px';

    if (fontStyle != null) {
      if ((fontStyle & mxConstants.FONT_BOLD) == mxConstants.FONT_BOLD) {
        div.style.fontWeight = 'bold';
      }

      if ((fontStyle & mxConstants.FONT_ITALIC) == mxConstants.FONT_ITALIC) {
        div.style.fontStyle = 'italic';
      }

      var txtDecor = [];

      if ((fontStyle & mxConstants.FONT_UNDERLINE) == mxConstants.FONT_UNDERLINE) {
        txtDecor.push('underline');
      }

      if ((fontStyle & mxConstants.FONT_STRIKETHROUGH) == mxConstants.FONT_STRIKETHROUGH) {
        txtDecor.push('line-through');
      }

      if (txtDecor.length > 0) {
        div.style.textDecoration = txtDecor.join(' ');
      }
    }

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.display = mxClient.IS_QUIRKS ? 'inline' : 'inline-block';
    div.style.zoom = '1';

    if (textWidth != null) {
      div.style.width = textWidth + 'px';
      div.style.whiteSpace = 'normal';
    } else {
      div.style.whiteSpace = 'nowrap';
    }

    div.innerHTML = text;
    document.body.appendChild(div);
    var size = new mxRectangle(0, 0, div.offsetWidth, div.offsetHeight);
    document.body.removeChild(div);
    return size;
  }

  static getViewXml(graph, scale, cells, x0, y0) {
    x0 = x0 != null ? x0 : 0;
    y0 = y0 != null ? y0 : 0;
    scale = scale != null ? scale : 1;

    if (cells == null) {
      var model = graph.getModel();
      cells = [model.getRoot()];
    }

    var view = graph.getView();
    var result = null;
    var eventsEnabled = view.isEventsEnabled();
    view.setEventsEnabled(false);
    var drawPane = view.drawPane;
    var overlayPane = view.overlayPane;

    if (graph.dialect == mxConstants.DIALECT_SVG) {
      view.drawPane = document.createElementNS(mxConstants.NS_SVG, 'g');
      view.canvas.appendChild(view.drawPane);
      view.overlayPane = document.createElementNS(mxConstants.NS_SVG, 'g');
      view.canvas.appendChild(view.overlayPane);
    } else {
      view.drawPane = view.drawPane.cloneNode(false);
      view.canvas.appendChild(view.drawPane);
      view.overlayPane = view.overlayPane.cloneNode(false);
      view.canvas.appendChild(view.overlayPane);
    }

    var translate = view.getTranslate();
    view.translate = new mxPoint(x0, y0);
    var temp = new mxTemporaryCellStates(graph.getView(), scale, cells);

    try {
      var enc = new mxCodec();
      result = enc.encode(graph.getView());
    } finally {
      temp.destroy();
      view.translate = translate;
      view.canvas.removeChild(view.drawPane);
      view.canvas.removeChild(view.overlayPane);
      view.drawPane = drawPane;
      view.overlayPane = overlayPane;
      view.setEventsEnabled(eventsEnabled);
    }

    return result;
  }

  static getScaleForPageCount(pageCount, graph, pageFormat, border) {
    if (pageCount < 1) {
      return 1;
    }

    pageFormat = pageFormat != null ? pageFormat : mxConstants.PAGE_FORMAT_A4_PORTRAIT;
    border = border != null ? border : 0;
    var availablePageWidth = pageFormat.width - border * 2;
    var availablePageHeight = pageFormat.height - border * 2;
    var graphBounds = graph.getGraphBounds().clone();
    var sc = graph.getView().getScale();
    graphBounds.width /= sc;
    graphBounds.height /= sc;
    var graphWidth = graphBounds.width;
    var graphHeight = graphBounds.height;
    var scale = 1;
    var pageFormatAspectRatio = availablePageWidth / availablePageHeight;
    var graphAspectRatio = graphWidth / graphHeight;
    var pagesAspectRatio = graphAspectRatio / pageFormatAspectRatio;
    var pageRoot = Math.sqrt(pageCount);
    var pagesAspectRatioSqrt = Math.sqrt(pagesAspectRatio);
    var numRowPages = pageRoot * pagesAspectRatioSqrt;
    var numColumnPages = pageRoot / pagesAspectRatioSqrt;

    if (numRowPages < 1 && numColumnPages > pageCount) {
      var scaleChange = numColumnPages / pageCount;
      numColumnPages = pageCount;
      numRowPages /= scaleChange;
    }

    if (numColumnPages < 1 && numRowPages > pageCount) {
      var scaleChange = numRowPages / pageCount;
      numRowPages = pageCount;
      numColumnPages /= scaleChange;
    }

    var currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);
    var numLoops = 0;

    while (currentTotalPages > pageCount) {
      var roundRowDownProportion = Math.floor(numRowPages) / numRowPages;
      var roundColumnDownProportion = Math.floor(numColumnPages) / numColumnPages;

      if (roundRowDownProportion == 1) {
        roundRowDownProportion = Math.floor(numRowPages - 1) / numRowPages;
      }

      if (roundColumnDownProportion == 1) {
        roundColumnDownProportion = Math.floor(numColumnPages - 1) / numColumnPages;
      }

      var scaleChange = 1;

      if (roundRowDownProportion > roundColumnDownProportion) {
        scaleChange = roundRowDownProportion;
      } else {
        scaleChange = roundColumnDownProportion;
      }

      numRowPages = numRowPages * scaleChange;
      numColumnPages = numColumnPages * scaleChange;
      currentTotalPages = Math.ceil(numRowPages) * Math.ceil(numColumnPages);
      numLoops++;

      if (numLoops > 10) {
        break;
      }
    }

    var posterWidth = availablePageWidth * numRowPages;
    scale = posterWidth / graphWidth;
    return scale * 0.99999;
  }

  static show(graph, doc, x0, y0, w, h) {
    x0 = x0 != null ? x0 : 0;
    y0 = y0 != null ? y0 : 0;

    if (doc == null) {
      var wnd = window.open();
      doc = wnd.document;
    } else {
      doc.open();
    }

    if (document.documentMode == 9) {
      doc.writeln('<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=9"><![endif]-->');
    }

    var bounds = graph.getGraphBounds();
    var dx = Math.ceil(x0 - bounds.x);
    var dy = Math.ceil(y0 - bounds.y);

    if (w == null) {
      w = Math.ceil(bounds.width + x0) + Math.ceil(Math.ceil(bounds.x) - bounds.x);
    }

    if (h == null) {
      h = Math.ceil(bounds.height + y0) + Math.ceil(Math.ceil(bounds.y) - bounds.y);
    }

    if (document.documentMode == 11) {
      var html = '<html><head>';
      var base = document.getElementsByTagName('base');

      for (var i = 0; i < base.length; i++) {
        html += base[i].outerHTML;
      }

      html += '<style>';

      for (var i = 0; i < document.styleSheets.length; i++) {
        try {
          html += document.styleSheets[i].cssText;
        } catch (e) {
          /* ignore */
        }
      }

      html += '</style></head><body style="margin:0px;">';
      html +=
        '<div style="position:absolute;overflow:hidden;width:' +
        w +
        'px;height:' +
        h +
        'px;"><div style="position:relative;left:' +
        dx +
        'px;top:' +
        dy +
        'px;">';
      html += graph.container.innerHTML;
      html += '</div></div></body><html>';
      doc.writeln(html);
      doc.close();
    } else {
      doc.writeln('<html><head>');
      var base = document.getElementsByTagName('base');

      for (var i = 0; i < base.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(base[i]));
      }

      var links = document.getElementsByTagName('link');

      for (var i = 0; i < links.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(links[i]));
      }

      var styles = document.getElementsByTagName('style');

      for (var i = 0; i < styles.length; i++) {
        doc.writeln(mxUtils.getOuterHtml(styles[i]));
      }

      doc.writeln('</head><body style="margin:0px;"></body></html>');
      doc.close();
      var outer = doc.createElement('div');
      outer.position = 'absolute';
      outer.overflow = 'hidden';
      outer.style.width = w + 'px';
      outer.style.height = h + 'px';
      var div = doc.createElement('div');
      div.style.position = 'absolute';
      div.style.left = dx + 'px';
      div.style.top = dy + 'px';
      var node = graph.container.firstChild;
      var svg = null;

      while (node != null) {
        var clone = node.cloneNode(true);

        if (node == graph.view.drawPane.ownerSVGElement) {
          outer.appendChild(clone);
          svg = clone;
        } else {
          div.appendChild(clone);
        }

        node = node.nextSibling;
      }

      doc.body.appendChild(outer);

      if (div.firstChild != null) {
        doc.body.appendChild(div);
      }

      if (svg != null) {
        svg.style.minWidth = '';
        svg.style.minHeight = '';
        svg.firstChild.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
      }
    }

    mxUtils.removeCursors(doc.body);
    return doc;
  }

  static printScreen(graph) {
    var wnd = window.open();
    var bounds = graph.getGraphBounds();
    mxUtils.show(graph, wnd.document);

    var print = function () {
      wnd.focus();
      wnd.print();
      wnd.close();
    };

    if (mxClient.IS_GC) {
      wnd.setTimeout(print, 500);
    } else {
      print();
    }
  }

  static popup(content, isInternalWindow) {
    if (isInternalWindow) {
      var div = document.createElement('div');
      div.style.overflow = 'scroll';
      div.style.width = '636px';
      div.style.height = '460px';
      var pre = document.createElement('pre');
      pre.innerHTML = mxUtils.htmlEntities(content, false).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
      div.appendChild(pre);
      var w = document.body.clientWidth;
      var h = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight);
      var wnd = new mxWindow('Popup Window', div, w / 2 - 320, h / 2 - 240, 640, 480, false, true);
      wnd.setClosable(true);
      wnd.setVisible(true);
    } else {
      if (mxClient.IS_NS) {
        var wnd = window.open();
        wnd.document.writeln('<pre>' + mxUtils.htmlEntities(content) + '</pre');
        wnd.document.close();
      } else {
        var wnd = window.open();
        var pre = wnd.document.createElement('pre');
        pre.innerHTML = mxUtils.htmlEntities(content, false).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
        wnd.document.body.appendChild(pre);
      }
    }
  }

  static alert(message) {
    alert(message);
  }

  static prompt(message, defaultValue) {
    return prompt(message, defaultValue != null ? defaultValue : '');
  }

  static confirm(message) {
    return confirm(message);
  }

  static error(message, width, close, icon) {
    var div = document.createElement('div');
    div.style.padding = '20px';
    var img = document.createElement('img');
    img.setAttribute('src', icon || mxUtils.errorImage);
    img.setAttribute('valign', 'bottom');
    img.style.verticalAlign = 'middle';
    div.appendChild(img);
    div.appendChild(document.createTextNode('\u00a0'));
    div.appendChild(document.createTextNode('\u00a0'));
    div.appendChild(document.createTextNode('\u00a0'));
    mxUtils.write(div, message);
    var w = document.body.clientWidth;
    var h = document.body.clientHeight || document.documentElement.clientHeight;
    var warn = new mxWindow(
      mxResources.get(mxUtils.errorResource) || mxUtils.errorResource,
      div,
      (w - width) / 2,
      h / 4,
      width,
      null,
      false,
      true
    );

    if (close) {
      mxUtils.br(div);
      var tmp = document.createElement('p');
      var button = document.createElement('button');
      button.setAttribute('style', 'float:right');
      mxEvent.addListener(button, 'click', function (evt) {
        warn.destroy();
      });
      mxUtils.write(button, mxResources.get(mxUtils.closeResource) || mxUtils.closeResource);
      tmp.appendChild(button);
      div.appendChild(tmp);
      mxUtils.br(div);
      warn.setClosable(true);
    }

    warn.setVisible(true);
    return warn;
  }

  static makeDraggable(
    element,
    graphF,
    funct,
    dragElement,
    dx,
    dy,
    autoscroll,
    scalePreview,
    highlightDropTargets,
    getDropTarget
  ) {
    var dragSource = new mxDragSource(element, funct);
    dragSource.dragOffset = new mxPoint(dx != null ? dx : 0, dy != null ? dy : mxConstants.TOOLTIP_VERTICAL_OFFSET);
    dragSource.autoscroll = autoscroll;
    dragSource.setGuidesEnabled(false);

    if (highlightDropTargets != null) {
      dragSource.highlightDropTargets = highlightDropTargets;
    }

    if (getDropTarget != null) {
      dragSource.getDropTarget = getDropTarget;
    }

    dragSource.getGraphForEvent = function (evt) {
      return typeof graphF == 'function' ? graphF(evt) : graphF;
    };

    if (dragElement != null) {
      dragSource.createDragElement = function () {
        return dragElement.cloneNode(true);
      };

      if (scalePreview) {
        dragSource.createPreviewElement = function (graph) {
          var elt = dragElement.cloneNode(true);
          var w = parseInt(elt.style.width);
          var h = parseInt(elt.style.height);
          elt.style.width = Math.round(w * graph.view.scale) + 'px';
          elt.style.height = Math.round(h * graph.view.scale) + 'px';
          return elt;
        };
      }
    }

    return dragSource;
  }
}
