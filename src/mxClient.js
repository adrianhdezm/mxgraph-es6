import { mxResources } from '@mxgraph/util/mxResources';

export class mxClient {
  static VERSION = '@MXGRAPH-VERSION@';
  static IS_IE = navigator.userAgent != null && navigator.userAgent.indexOf('MSIE') >= 0;
  static IS_IE6 = navigator.userAgent != null && navigator.userAgent.indexOf('MSIE 6') >= 0;
  static IS_IE11 = navigator.userAgent != null && !!navigator.userAgent.match(/Trident\/7\./);
  static IS_EDGE = navigator.userAgent != null && !!navigator.userAgent.match(/Edge\//);
  static IS_QUIRKS =
    navigator.userAgent != null &&
    navigator.userAgent.indexOf('MSIE') >= 0 &&
    (document.documentMode == null || document.documentMode == 5);
  static IS_EM = 'spellcheck' in document.createElement('textarea') && document.documentMode == 8;
  static VML_PREFIX = 'v';
  static OFFICE_PREFIX = 'o';
  static IS_NS =
    navigator.userAgent != null &&
    navigator.userAgent.indexOf('Mozilla/') >= 0 &&
    navigator.userAgent.indexOf('MSIE') < 0 &&
    navigator.userAgent.indexOf('Edge/') < 0;
  static IS_OP =
    navigator.userAgent != null &&
    (navigator.userAgent.indexOf('Opera/') >= 0 || navigator.userAgent.indexOf('OPR/') >= 0);
  static IS_OT =
    navigator.userAgent != null &&
    navigator.userAgent.indexOf('Presto/') >= 0 &&
    navigator.userAgent.indexOf('Presto/2.4.') < 0 &&
    navigator.userAgent.indexOf('Presto/2.3.') < 0 &&
    navigator.userAgent.indexOf('Presto/2.2.') < 0 &&
    navigator.userAgent.indexOf('Presto/2.1.') < 0 &&
    navigator.userAgent.indexOf('Presto/2.0.') < 0 &&
    navigator.userAgent.indexOf('Presto/1.') < 0;
  static IS_SF = /Apple Computer, Inc/.test(navigator.vendor);
  static IS_ANDROID = navigator.appVersion.indexOf('Android') >= 0;
  static IS_IOS = /iP(hone|od|ad)/.test(navigator.platform);
  static IS_GC = /Google Inc/.test(navigator.vendor);
  // eslint-disable-next-line no-undef
  static IS_CHROMEAPP = window.chrome != null && chrome.app != null && chrome.app.runtime != null;
  static IS_FF = typeof InstallTrigger !== 'undefined';
  static IS_MT =
    (navigator.userAgent.indexOf('Firefox/') >= 0 &&
      navigator.userAgent.indexOf('Firefox/1.') < 0 &&
      navigator.userAgent.indexOf('Firefox/2.') < 0) ||
    (navigator.userAgent.indexOf('Iceweasel/') >= 0 &&
      navigator.userAgent.indexOf('Iceweasel/1.') < 0 &&
      navigator.userAgent.indexOf('Iceweasel/2.') < 0) ||
    (navigator.userAgent.indexOf('SeaMonkey/') >= 0 && navigator.userAgent.indexOf('SeaMonkey/1.') < 0) ||
    (navigator.userAgent.indexOf('Iceape/') >= 0 && navigator.userAgent.indexOf('Iceape/1.') < 0);
  static IS_VML = navigator.appName.toUpperCase() == 'MICROSOFT INTERNET EXPLORER';
  static IS_SVG = navigator.appName.toUpperCase() != 'MICROSOFT INTERNET EXPLORER';
  static NO_FO =
    !document.createElementNS ||
    document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject') != '[object SVGForeignObjectElement]' ||
    navigator.userAgent.indexOf('Opera/') >= 0;
  static IS_WIN = navigator.appVersion.indexOf('Win') > 0;
  static IS_MAC = navigator.appVersion.indexOf('Mac') > 0;
  static IS_CHROMEOS = /\bCrOS\b/.test(navigator.appVersion);
  static IS_TOUCH = 'ontouchstart' in document.documentElement;
  static IS_POINTER = window.PointerEvent != null && !(navigator.appVersion.indexOf('Mac') > 0);
  static IS_LOCAL = document.location.href.indexOf('http://') < 0 && document.location.href.indexOf('https://') < 0;
  static defaultBundles = [];

  static isBrowserSupported() {
    return mxClient.IS_SVG;
  }

  static link(rel, href, doc, id) {
    doc = doc || document;
    var link = doc.createElement('link');
    link.setAttribute('rel', rel);
    link.setAttribute('href', href);
    link.setAttribute('charset', 'UTF-8');
    link.setAttribute('type', 'text/css');

    if (id) {
      link.setAttribute('id', id);
    }

    var head = doc.getElementsByTagName('head')[0];
    head.appendChild(link);
  }

  static loadResources(fn, lan) {
    var pending = mxClient.defaultBundles.length;

    function callback() {
      if (--pending == 0) {
        fn();
      }
    }

    for (var i = 0; i < mxClient.defaultBundles.length; i++) {
      mxResources.add(mxClient.defaultBundles[i], lan, callback);
    }
  }

  static include(src) {
    document.write('<script src="' + src + '"></script>');
  }
}
