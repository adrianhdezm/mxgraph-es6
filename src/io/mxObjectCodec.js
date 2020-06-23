import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxGeometry } from '@mxgraph/model/mxGeometry';
import { mxLog } from '@mxgraph/util/mxLog';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxObjectCodec {
  static allowEval = false;

  constructor(template, exclude, idrefs, mapping) {
    this.template = template;
    this.exclude = exclude != null ? exclude : [];
    this.idrefs = idrefs != null ? idrefs : [];
    this.mapping = mapping != null ? mapping : [];
    this.reverse = new Object();

    for (var i in this.mapping) {
      this.reverse[this.mapping[i]] = i;
    }
  }

  getName() {
    return mxUtils.getFunctionName(this.template.constructor);
  }

  cloneTemplate() {
    return new this.template.constructor();
  }

  getFieldName(attributename) {
    if (attributename != null) {
      var mapped = this.reverse[attributename];

      if (mapped != null) {
        attributename = mapped;
      }
    }

    return attributename;
  }

  getAttributeName(fieldname) {
    if (fieldname != null) {
      var mapped = this.mapping[fieldname];

      if (mapped != null) {
        fieldname = mapped;
      }
    }

    return fieldname;
  }

  isExcluded(obj, attr, value, write) {
    return attr == mxObjectIdentity.FIELD_NAME || mxUtils.indexOf(this.exclude, attr) >= 0;
  }

  isReference(obj, attr, value, write) {
    return mxUtils.indexOf(this.idrefs, attr) >= 0;
  }

  encode(enc, obj) {
    var node = enc.document.createElement(this.getName());
    obj = this.beforeEncode(enc, obj, node);
    this.encodeObject(enc, obj, node);
    return this.afterEncode(enc, obj, node);
  }

  encodeObject(enc, obj, node) {
    enc.setAttribute(node, 'id', enc.getId(obj));

    for (var i in obj) {
      var name = i;
      var value = obj[name];

      if (value != null && !this.isExcluded(obj, name, value, true)) {
        if (mxUtils.isInteger(name)) {
          name = null;
        }

        this.encodeValue(enc, obj, name, value, node);
      }
    }
  }

  encodeValue(enc, obj, name, value, node) {
    if (value != null) {
      if (this.isReference(obj, name, value, true)) {
        var tmp = enc.getId(value);

        if (tmp == null) {
          mxLog.warn('mxObjectCodec.encode: No ID for ' + this.getName() + '.' + name + '=' + value);
          return;
        }

        value = tmp;
      }

      var defaultValue = this.template[name];

      if (name == null || enc.encodeDefaults || defaultValue != value) {
        name = this.getAttributeName(name);
        this.writeAttribute(enc, obj, name, value, node);
      }
    }
  }

  writeAttribute(enc, obj, name, value, node) {
    if (typeof value != 'object') {
      this.writePrimitiveAttribute(enc, obj, name, value, node);
    } else {
      this.writeComplexAttribute(enc, obj, name, value, node);
    }
  }

  writePrimitiveAttribute(enc, obj, name, value, node) {
    value = this.convertAttributeToXml(enc, obj, name, value, node);

    if (name == null) {
      var child = enc.document.createElement('add');

      if (typeof value == 'function') {
        child.appendChild(enc.document.createTextNode(value));
      } else {
        enc.setAttribute(child, 'value', value);
      }

      node.appendChild(child);
    } else if (typeof value != 'function') {
      enc.setAttribute(node, name, value);
    }
  }

  writeComplexAttribute(enc, obj, name, value, node) {
    var child = enc.encode(value);

    if (child != null) {
      if (name != null) {
        child.setAttribute('as', name);
      }

      node.appendChild(child);
    } else {
      mxLog.warn('mxObjectCodec.encode: No node for ' + this.getName() + '.' + name + ': ' + value);
    }
  }

  convertAttributeToXml(enc, obj, name, value) {
    if (this.isBooleanAttribute(enc, obj, name, value)) {
      value = value == true ? '1' : '0';
    }

    return value;
  }

  isBooleanAttribute(enc, obj, name, value) {
    return typeof value.length == 'undefined' && (value == true || value == false);
  }

  convertAttributeFromXml(dec, attr, obj) {
    var value = attr.value;

    if (this.isNumericAttribute(dec, attr, obj)) {
      value = parseFloat(value);

      if (isNaN(value) || !isFinite(value)) {
        value = 0;
      }
    }

    return value;
  }

  isNumericAttribute(dec, attr, obj) {
    var result =
      (obj.constructor == mxGeometry &&
        (attr.name == 'x' || attr.name == 'y' || attr.name == 'width' || attr.name == 'height')) ||
      (obj.constructor == mxPoint && (attr.name == 'x' || attr.name == 'y')) ||
      mxUtils.isNumeric(attr.value);
    return result;
  }

  beforeEncode(enc, obj, node) {
    return obj;
  }

  afterEncode(enc, obj, node) {
    return node;
  }

  decode(dec, node, into) {
    var id = node.getAttribute('id');
    var obj = dec.objects[id];

    if (obj == null) {
      obj = into || this.cloneTemplate();

      if (id != null) {
        dec.putObject(id, obj);
      }
    }

    node = this.beforeDecode(dec, node, obj);
    this.decodeNode(dec, node, obj);
    return this.afterDecode(dec, node, obj);
  }

  decodeNode(dec, node, obj) {
    if (node != null) {
      this.decodeAttributes(dec, node, obj);
      this.decodeChildren(dec, node, obj);
    }
  }

  decodeAttributes(dec, node, obj) {
    var attrs = node.attributes;

    if (attrs != null) {
      for (var i = 0; i < attrs.length; i++) {
        this.decodeAttribute(dec, attrs[i], obj);
      }
    }
  }

  isIgnoredAttribute(dec, attr, obj) {
    return attr.nodeName == 'as' || attr.nodeName == 'id';
  }

  decodeAttribute(dec, attr, obj) {
    if (!this.isIgnoredAttribute(dec, attr, obj)) {
      var name = attr.nodeName;
      var value = this.convertAttributeFromXml(dec, attr, obj);
      var fieldname = this.getFieldName(name);

      if (this.isReference(obj, fieldname, value, false)) {
        var tmp = dec.getObject(value);

        if (tmp == null) {
          mxLog.warn('mxObjectCodec.decode: No object for ' + this.getName() + '.' + name + '=' + value);
          return;
        }

        value = tmp;
      }

      if (!this.isExcluded(obj, name, value, false)) {
        obj[name] = value;
      }
    }
  }

  decodeChildren(dec, node, obj) {
    var child = node.firstChild;

    while (child != null) {
      var tmp = child.nextSibling;

      if (child.nodeType == mxConstants.NODETYPE_ELEMENT && !this.processInclude(dec, child, obj)) {
        this.decodeChild(dec, child, obj);
      }

      child = tmp;
    }
  }

  decodeChild(dec, child, obj) {
    var fieldname = this.getFieldName(child.getAttribute('as'));

    if (fieldname == null || !this.isExcluded(obj, fieldname, child, false)) {
      var template = this.getFieldTemplate(obj, fieldname, child);
      var value = null;

      if (child.nodeName == 'add') {
        value = child.getAttribute('value');

        if (value == null && mxObjectCodec.allowEval) {
          value = mxUtils.eval(mxUtils.getTextContent(child));
        }
      } else {
        value = dec.decode(child, template);
      }

      try {
        this.addObjectValue(obj, fieldname, value, template);
      } catch (e) {
        throw new Error(e.message + ' for ' + child.nodeName);
      }
    }
  }

  getFieldTemplate(obj, fieldname, child) {
    var template = obj[fieldname];

    if (template instanceof Array && template.length > 0) {
      template = null;
    }

    return template;
  }

  addObjectValue(obj, fieldname, value, template) {
    if (value != null && value != template) {
      if (fieldname != null && fieldname.length > 0) {
        obj[fieldname] = value;
      } else {
        obj.push(value);
      }
    }
  }

  processInclude(dec, node, into) {
    if (node.nodeName == 'include') {
      var name = node.getAttribute('name');

      if (name != null) {
        try {
          var xml = mxUtils.load(name).getDocumentElement();

          if (xml != null) {
            dec.decode(xml, into);
          }
        } catch (e) {
          /* ignore */
        }
      }

      return true;
    }

    return false;
  }

  beforeDecode(dec, node, obj) {
    return node;
  }

  afterDecode(dec, node, obj) {
    return obj;
  }
}
