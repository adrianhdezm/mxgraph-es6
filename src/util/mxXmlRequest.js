import { mxClient } from '@mxgraph/mxClient';

export class mxXmlRequest {
  binary = false;
  withCredentials = false;
  request = null;
  decodeSimulateValues = false;

  constructor(url, params, method, async, username, password) {
    this.url = url;
    this.params = params;
    this.method = method || 'POST';
    this.async = async != null ? async : true;
    this.username = username;
    this.password = password;
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

  static load(url) {
    var req = new mxXmlRequest(url, null, 'GET', false);
    req.send();
    return req;
  }

  create() {
    var req = new XMLHttpRequest();

    if (this.isBinary() && req.overrideMimeType) {
      req.overrideMimeType('text/plain; charset=x-user-defined');
    }

    return req;
  }

  isBinary() {
    return this.binary;
  }

  setBinary(value) {
    this.binary = value;
  }

  getText() {
    return this.request.responseText;
  }

  isReady() {
    return this.request.readyState == 4;
  }

  getDocumentElement() {
    var doc = this.getXml();

    if (doc != null) {
      return doc.documentElement;
    }

    return null;
  }

  getXml() {
    var xml = this.request.responseXML;

    if (document.documentMode >= 9 || xml == null || xml.documentElement == null) {
      var parser = new DOMParser();
      xml = parser.parseFromString(this.request.responseText, 'text/xml');
    }

    return xml;
  }

  getStatus() {
    return this.request != null ? this.request.status : null;
  }

  send(onload, onerror, timeout, ontimeout) {
    this.request = this.create();

    if (this.request != null) {
      if (onload != null) {
        this.request.onreadystatechange = () => {
          if (this.isReady()) {
            onload(this);
            this.request.onreadystatechange = null;
          }
        };
      }

      this.request.open(this.method, this.url, this.async, this.username, this.password);
      this.setRequestHeaders(this.request, this.params);

      if (window.XMLHttpRequest && this.withCredentials) {
        this.request.withCredentials = 'true';
      }

      if (
        !mxClient.IS_QUIRKS &&
        (document.documentMode == null || document.documentMode > 9) &&
        window.XMLHttpRequest &&
        timeout != null &&
        ontimeout != null
      ) {
        this.request.timeout = timeout;
        this.request.ontimeout = ontimeout;
      }

      this.request.send(this.params);
    }
  }

  setRequestHeaders(request, params) {
    if (params != null) {
      request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
  }

  simulate(doc, target) {
    doc = doc || document;
    var old = null;

    if (doc == document) {
      old = window.onbeforeunload;
      window.onbeforeunload = null;
    }

    var form = doc.createElement('form');
    form.setAttribute('method', this.method);
    form.setAttribute('action', this.url);

    if (target != null) {
      form.setAttribute('target', target);
    }

    form.style.display = 'none';
    form.style.visibility = 'hidden';
    var pars = this.params.indexOf('&') > 0 ? this.params.split('&') : this.params.split();

    for (var i = 0; i < pars.length; i++) {
      var pos = pars[i].indexOf('=');

      if (pos > 0) {
        var name = pars[i].substring(0, pos);
        var value = pars[i].substring(pos + 1);

        if (this.decodeSimulateValues) {
          value = decodeURIComponent(value);
        }

        var textarea = doc.createElement('textarea');
        textarea.setAttribute('wrap', 'off');
        textarea.setAttribute('name', name);

        var doc = textarea.ownerDocument;
        var node = doc.createTextNode(value);

        if (textarea != null) {
          textarea.appendChild(node);
        }

        form.appendChild(textarea);
      }
    }

    doc.body.appendChild(form);
    form.submit();

    if (form.parentNode != null) {
      form.parentNode.removeChild(form);
    }

    if (old != null) {
      window.onbeforeunload = old;
    }
  }
}
