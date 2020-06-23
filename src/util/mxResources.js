import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxXmlRequest } from '@mxgraph/util/mxXmlRequest';
import { mxClient } from '@mxgraph/mxClient';

export class mxResources {
  static resources = {};
  static extension = '.txt';
  static resourcesEncoded = false;
  static loadDefaultBundle = true;
  static loadSpecialBundle = true;

  static isLanguageSupported(lan) {
    if (mxClient.languages != null) {
      return mxClient.languages.indexOf(lan) >= 0;
    }

    return true;
  }

  static getDefaultBundle(basename, lan) {
    if (mxResources.loadDefaultBundle || !mxResources.isLanguageSupported(lan)) {
      return basename + mxResources.extension;
    } else {
      return null;
    }
  }

  static getSpecialBundle(basename, lan) {
    if (mxClient.languages == null || !this.isLanguageSupported(lan)) {
      var dash = lan.indexOf('-');

      if (dash > 0) {
        lan = lan.substring(0, dash);
      }
    }

    if (mxResources.loadSpecialBundle && mxResources.isLanguageSupported(lan) && lan != mxClient.defaultLanguage) {
      return basename + '_' + lan + mxResources.extension;
    } else {
      return null;
    }
  }

  static add(basename, lan, callback) {
    lan = lan != null ? lan : mxClient.language != null ? mxClient.language.toLowerCase() : mxConstants.NONE;

    if (lan != mxConstants.NONE) {
      var defaultBundle = mxResources.getDefaultBundle(basename, lan);
      var specialBundle = mxResources.getSpecialBundle(basename, lan);

      var loadSpecialBundle = function () {
        if (specialBundle != null) {
          if (callback) {
            mxXmlRequest.get(
              specialBundle,
              function (req) {
                mxResources.parse(req.getText());
                callback();
              },
              function () {
                callback();
              }
            );
          } else {
            try {
              var req = mxXmlRequest.load(specialBundle);

              if (req.isReady()) {
                mxResources.parse(req.getText());
              }
            } catch (e) {
              /* ignore */
            }
          }
        } else if (callback != null) {
          callback();
        }
      };

      if (defaultBundle != null) {
        if (callback) {
          mxXmlRequest.get(
            defaultBundle,
            function (req) {
              mxResources.parse(req.getText());
              loadSpecialBundle();
            },
            function () {
              loadSpecialBundle();
            }
          );
        } else {
          try {
            var req = mxXmlRequest.load(defaultBundle);

            if (req.isReady()) {
              mxResources.parse(req.getText());
            }

            loadSpecialBundle();
          } catch (e) {
            /* ignore */
          }
        }
      } else {
        loadSpecialBundle();
      }
    }
  }

  static parse(text) {
    if (text != null) {
      var lines = text.split('\n');

      for (var i = 0; i < lines.length; i++) {
        if (lines[i].charAt(0) != '#') {
          var index = lines[i].indexOf('=');

          if (index > 0) {
            var key = lines[i].substring(0, index);
            var idx = lines[i].length;

            if (lines[i].charCodeAt(idx - 1) == 13) {
              idx--;
            }

            var value = lines[i].substring(index + 1, idx);

            if (this.resourcesEncoded) {
              value = value.replace(/\\(?=u[a-fA-F\d]{4})/g, '%');
              mxResources.resources[key] = unescape(value);
            } else {
              mxResources.resources[key] = value;
            }
          }
        }
      }
    }
  }

  static get(key, params, defaultValue) {
    var value = mxResources.resources[key];

    if (value == null) {
      value = defaultValue;
    }

    if (value != null && params != null) {
      value = mxResources.replacePlaceholders(value, params);
    }

    return value;
  }

  static replacePlaceholders(value, params) {
    var result = [];
    var index = null;

    for (var i = 0; i < value.length; i++) {
      var c = value.charAt(i);

      if (c == '{') {
        index = '';
      } else if (index != null && c == '}') {
        index = parseInt(index) - 1;

        if (index >= 0 && index < params.length) {
          result.push(params[index]);
        }

        index = null;
      } else if (index != null) {
        index += c;
      } else {
        result.push(c);
      }
    }

    return result.join('');
  }

  static loadResources(callback) {
    mxResources.add(mxClient.basePath + '/resources/editor', null, function () {
      mxResources.add(mxClient.basePath + '/resources/graph', null, callback);
    });
  }
}
