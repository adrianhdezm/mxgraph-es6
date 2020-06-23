import { mxClient } from '@mxgraph/mxClient';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxXmlRequest {
  binary = false;
  withCredentials = false;
  request = null;
  decodeSimulateValues = false;
  create = (function () {
    if (window.XMLHttpRequest) {
      return function () {
        var req = new XMLHttpRequest();

        if (this.isBinary() && req.overrideMimeType) {
          req.overrideMimeType('text/plain; charset=x-user-defined');
        }

        return req;
      };
    } else if (typeof ActiveXObject != 'undefined') {
      return function () {
        // eslint-disable-next-line no-undef
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }
  })();

  constructor(url, params, method, async, username, password) {
    this.url = url;
    this.params = params;
    this.method = method || 'POST';
    this.async = async != null ? async : true;
    this.username = username;
    this.password = password;
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
      xml = mxUtils.parseXml(this.request.responseText);
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
        mxUtils.write(textarea, value);
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
