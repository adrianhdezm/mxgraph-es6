export class mxUrlConverter {
  enabled = true;
  baseUrl = null;
  baseDomain = null;

  constructor() {}

  updateBaseUrl() {
    this.baseDomain = location.protocol + '//' + location.host;
    this.baseUrl = this.baseDomain + location.pathname;
    var tmp = this.baseUrl.lastIndexOf('/');

    if (tmp > 0) {
      this.baseUrl = this.baseUrl.substring(0, tmp + 1);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(value) {
    this.enabled = value;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setBaseUrl(value) {
    this.baseUrl = value;
  }

  getBaseDomain() {
    return this.baseDomain;
  }

  setBaseDomain(value) {
    this.baseDomain = value;
  }

  isRelativeUrl(url) {
    return (
      url != null &&
      url.substring(0, 2) != '//' &&
      url.substring(0, 7) != 'http://' &&
      url.substring(0, 8) != 'https://' &&
      url.substring(0, 10) != 'data:image' &&
      url.substring(0, 7) != 'file://'
    );
  }

  convert(url) {
    if (this.isEnabled() && this.isRelativeUrl(url)) {
      if (this.getBaseUrl() == null) {
        this.updateBaseUrl();
      }

      if (url.charAt(0) == '/') {
        url = this.getBaseDomain() + url;
      } else {
        url = this.getBaseUrl() + url;
      }
    }

    return url;
  }
}
