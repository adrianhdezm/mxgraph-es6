import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxClient } from '@mxgraph/mxClient';

export class mxWindow extends mxEventSource {
  closeImage = mxClient.imageBasePath + '/close.gif';
  minimizeImage = mxClient.imageBasePath + '/minimize.gif';
  normalizeImage = mxClient.imageBasePath + '/normalize.gif';
  maximizeImage = mxClient.imageBasePath + '/maximize.gif';
  resizeImage = mxClient.imageBasePath + '/resize.gif';
  visible = false;
  minimumSize = new mxRectangle(0, 0, 50, 40);
  destroyOnClose = true;
  contentHeightCorrection = document.documentMode == 8 || document.documentMode == 7 ? 6 : 2;
  title = null;
  content = null;

  constructor(title, content, x, y, width, height, minimizable, movable, replaceNode, style) {
    super();

    if (content != null) {
      minimizable = minimizable != null ? minimizable : true;
      this.content = content;
      this.init(x, y, width, height, style);
      this.installMaximizeHandler();
      this.installMinimizeHandler();
      this.installCloseHandler();
      this.setMinimizable(minimizable);
      this.setTitle(title);

      if (movable == null || movable) {
        this.installMoveHandler();
      }

      if (replaceNode != null && replaceNode.parentNode != null) {
        replaceNode.parentNode.replaceChild(this.div, replaceNode);
      } else {
        document.body.appendChild(this.div);
      }
    }
  }

  init(x, y, width, height, style) {
    style = style != null ? style : 'mxWindow';
    this.div = document.createElement('div');
    this.div.className = style;
    this.div.style.left = x + 'px';
    this.div.style.top = y + 'px';
    this.table = document.createElement('table');
    this.table.className = style;

    if (mxClient.IS_POINTER) {
      this.div.style.touchAction = 'none';
    }

    if (width != null) {
      if (!mxClient.IS_QUIRKS) {
        this.div.style.width = width + 'px';
      }

      this.table.style.width = width + 'px';
    }

    if (height != null) {
      if (!mxClient.IS_QUIRKS) {
        this.div.style.height = height + 'px';
      }

      this.table.style.height = height + 'px';
    }

    var tbody = document.createElement('tbody');
    var tr = document.createElement('tr');
    this.title = document.createElement('td');
    this.title.className = style + 'Title';
    this.buttons = document.createElement('div');
    this.buttons.style.position = 'absolute';
    this.buttons.style.display = 'inline-block';
    this.buttons.style.right = '4px';
    this.buttons.style.top = '5px';
    this.title.appendChild(this.buttons);
    tr.appendChild(this.title);
    tbody.appendChild(tr);
    tr = document.createElement('tr');
    this.td = document.createElement('td');
    this.td.className = style + 'Pane';

    if (document.documentMode == 7) {
      this.td.style.height = '100%';
    }

    this.contentWrapper = document.createElement('div');
    this.contentWrapper.className = style + 'Pane';
    this.contentWrapper.style.width = '100%';
    this.contentWrapper.appendChild(this.content);

    if (mxClient.IS_QUIRKS || this.content.nodeName.toUpperCase() != 'DIV') {
      this.contentWrapper.style.height = '100%';
    }

    this.td.appendChild(this.contentWrapper);
    tr.appendChild(this.td);
    tbody.appendChild(tr);
    this.table.appendChild(tbody);
    this.div.appendChild(this.table);

    var activator = (evt) => {
      this.activate();
    };

    mxEvent.addGestureListeners(this.title, activator);
    mxEvent.addGestureListeners(this.table, activator);
    this.hide();
  }

  setTitle(title) {
    var child = this.title.firstChild;

    while (child != null) {
      var next = child.nextSibling;

      if (child.nodeType == mxConstants.NODETYPE_TEXT) {
        child.parentNode.removeChild(child);
      }

      child = next;
    }

    mxUtils.write(this.title, title || '');
    this.title.appendChild(this.buttons);
  }

  setScrollable(scrollable) {
    if (navigator.userAgent == null || navigator.userAgent.indexOf('Presto/2.5') < 0) {
      if (scrollable) {
        this.contentWrapper.style.overflow = 'auto';
      } else {
        this.contentWrapper.style.overflow = 'hidden';
      }
    }
  }

  activate() {
    if (mxWindow.activeWindow != this) {
      var style = mxUtils.getCurrentStyle(this.getElement());
      var index = style != null ? style.zIndex : 3;

      if (mxWindow.activeWindow) {
        var elt = mxWindow.activeWindow.getElement();

        if (elt != null && elt.style != null) {
          elt.style.zIndex = index;
        }
      }

      var previousWindow = mxWindow.activeWindow;
      this.getElement().style.zIndex = parseInt(index) + 1;
      this.fireEvent(new mxEventObject(mxEvent.ACTIVATE, 'previousWindow', previousWindow));
    }
  }

  getElement() {
    return this.div;
  }

  fit() {
    mxUtils.fit(this.div);
  }

  isResizable() {
    if (this.resize != null) {
      return this.resize.style.display != 'none';
    }

    return false;
  }

  setResizable(resizable) {
    if (resizable) {
      if (this.resize == null) {
        this.resize = document.createElement('img');
        this.resize.style.position = 'absolute';
        this.resize.style.bottom = '2px';
        this.resize.style.right = '2px';
        this.resize.setAttribute('src', this.resizeImage);
        this.resize.style.cursor = 'nw-resize';
        var startX = null;
        var startY = null;
        var width = null;
        var height = null;

        var start = (evt) => {
          this.activate();
          startX = mxEvent.getClientX(evt);
          startY = mxEvent.getClientY(evt);
          width = this.div.offsetWidth;
          height = this.div.offsetHeight;
          mxEvent.addGestureListeners(document, null, dragHandler, dropHandler);
          this.fireEvent(new mxEventObject(mxEvent.RESIZE_START, 'event', evt));
          mxEvent.consume(evt);
        };

        var dragHandler = (evt) => {
          if (startX != null && startY != null) {
            var dx = mxEvent.getClientX(evt) - startX;
            var dy = mxEvent.getClientY(evt) - startY;
            this.setSize(width + dx, height + dy);
            this.fireEvent(new mxEventObject(mxEvent.RESIZE, 'event', evt));
            mxEvent.consume(evt);
          }
        };

        var dropHandler = (evt) => {
          if (startX != null && startY != null) {
            startX = null;
            startY = null;
            mxEvent.removeGestureListeners(document, null, dragHandler, dropHandler);
            this.fireEvent(new mxEventObject(mxEvent.RESIZE_END, 'event', evt));
            mxEvent.consume(evt);
          }
        };

        mxEvent.addGestureListeners(this.resize, start, dragHandler, dropHandler);
        this.div.appendChild(this.resize);
      } else {
        this.resize.style.display = 'inline';
      }
    } else if (this.resize != null) {
      this.resize.style.display = 'none';
    }
  }

  setSize(width, height) {
    width = Math.max(this.minimumSize.width, width);
    height = Math.max(this.minimumSize.height, height);

    if (!mxClient.IS_QUIRKS) {
      this.div.style.width = width + 'px';
      this.div.style.height = height + 'px';
    }

    this.table.style.width = width + 'px';
    this.table.style.height = height + 'px';

    if (!mxClient.IS_QUIRKS) {
      this.contentWrapper.style.height =
        this.div.offsetHeight - this.title.offsetHeight - this.contentHeightCorrection + 'px';
    }
  }

  setMinimizable(minimizable) {
    this.minimize.style.display = minimizable ? '' : 'none';
  }

  getMinimumSize() {
    return new mxRectangle(0, 0, 0, this.title.offsetHeight);
  }

  installMinimizeHandler() {
    this.minimize = document.createElement('img');
    this.minimize.setAttribute('src', this.minimizeImage);
    this.minimize.setAttribute('title', 'Minimize');
    this.minimize.style.cursor = 'pointer';
    this.minimize.style.marginLeft = '2px';
    this.minimize.style.display = 'none';
    this.buttons.appendChild(this.minimize);
    var minimized = false;
    var maxDisplay = null;
    var height = null;

    var funct = (evt) => {
      this.activate();

      if (!minimized) {
        minimized = true;
        this.minimize.setAttribute('src', this.normalizeImage);
        this.minimize.setAttribute('title', 'Normalize');
        this.contentWrapper.style.display = 'none';
        maxDisplay = this.maximize.style.display;
        this.maximize.style.display = 'none';
        height = this.table.style.height;
        var minSize = this.getMinimumSize();

        if (minSize.height > 0) {
          if (!mxClient.IS_QUIRKS) {
            this.div.style.height = minSize.height + 'px';
          }

          this.table.style.height = minSize.height + 'px';
        }

        if (minSize.width > 0) {
          if (!mxClient.IS_QUIRKS) {
            this.div.style.width = minSize.width + 'px';
          }

          this.table.style.width = minSize.width + 'px';
        }

        if (this.resize != null) {
          this.resize.style.visibility = 'hidden';
        }

        this.fireEvent(new mxEventObject(mxEvent.MINIMIZE, 'event', evt));
      } else {
        minimized = false;
        this.minimize.setAttribute('src', this.minimizeImage);
        this.minimize.setAttribute('title', 'Minimize');
        this.contentWrapper.style.display = '';
        this.maximize.style.display = maxDisplay;

        if (!mxClient.IS_QUIRKS) {
          this.div.style.height = height;
        }

        this.table.style.height = height;

        if (this.resize != null) {
          this.resize.style.visibility = '';
        }

        this.fireEvent(new mxEventObject(mxEvent.NORMALIZE, 'event', evt));
      }

      mxEvent.consume(evt);
    };

    mxEvent.addGestureListeners(this.minimize, funct);
  }

  setMaximizable(maximizable) {
    this.maximize.style.display = maximizable ? '' : 'none';
  }

  installMaximizeHandler() {
    this.maximize = document.createElement('img');
    this.maximize.setAttribute('src', this.maximizeImage);
    this.maximize.setAttribute('title', 'Maximize');
    this.maximize.style.cursor = 'default';
    this.maximize.style.marginLeft = '2px';
    this.maximize.style.cursor = 'pointer';
    this.maximize.style.display = 'none';
    this.buttons.appendChild(this.maximize);
    var maximized = false;
    var x = null;
    var y = null;
    var height = null;
    var width = null;
    var minDisplay = null;

    var funct = (evt) => {
      this.activate();

      if (this.maximize.style.display != 'none') {
        if (!maximized) {
          maximized = true;
          this.maximize.setAttribute('src', this.normalizeImage);
          this.maximize.setAttribute('title', 'Normalize');
          this.contentWrapper.style.display = '';
          minDisplay = this.minimize.style.display;
          this.minimize.style.display = 'none';
          x = parseInt(this.div.style.left);
          y = parseInt(this.div.style.top);
          height = this.table.style.height;
          width = this.table.style.width;
          this.div.style.left = '0px';
          this.div.style.top = '0px';
          var docHeight = Math.max(document.body.clientHeight || 0, document.documentElement.clientHeight || 0);

          if (!mxClient.IS_QUIRKS) {
            this.div.style.width = document.body.clientWidth - 2 + 'px';
            this.div.style.height = docHeight - 2 + 'px';
          }

          this.table.style.width = document.body.clientWidth - 2 + 'px';
          this.table.style.height = docHeight - 2 + 'px';

          if (this.resize != null) {
            this.resize.style.visibility = 'hidden';
          }

          if (!mxClient.IS_QUIRKS) {
            var style = mxUtils.getCurrentStyle(this.contentWrapper);

            if (style.overflow == 'auto' || this.resize != null) {
              this.contentWrapper.style.height =
                this.div.offsetHeight - this.title.offsetHeight - this.contentHeightCorrection + 'px';
            }
          }

          this.fireEvent(new mxEventObject(mxEvent.MAXIMIZE, 'event', evt));
        } else {
          maximized = false;
          this.maximize.setAttribute('src', this.maximizeImage);
          this.maximize.setAttribute('title', 'Maximize');
          this.contentWrapper.style.display = '';
          this.minimize.style.display = minDisplay;
          this.div.style.left = x + 'px';
          this.div.style.top = y + 'px';

          if (!mxClient.IS_QUIRKS) {
            this.div.style.height = height;
            this.div.style.width = width;
            var style = mxUtils.getCurrentStyle(this.contentWrapper);

            if (style.overflow == 'auto' || this.resize != null) {
              this.contentWrapper.style.height =
                this.div.offsetHeight - this.title.offsetHeight - this.contentHeightCorrection + 'px';
            }
          }

          this.table.style.height = height;
          this.table.style.width = width;

          if (this.resize != null) {
            this.resize.style.visibility = '';
          }

          this.fireEvent(new mxEventObject(mxEvent.NORMALIZE, 'event', evt));
        }

        mxEvent.consume(evt);
      }
    };

    mxEvent.addGestureListeners(this.maximize, funct);
    mxEvent.addListener(this.title, 'dblclick', funct);
  }

  installMoveHandler() {
    this.title.style.cursor = 'move';
    mxEvent.addGestureListeners(this.title, (evt) => {
      var startX = mxEvent.getClientX(evt);
      var startY = mxEvent.getClientY(evt);
      var x = this.getX();
      var y = this.getY();

      var dragHandler = (evt) => {
        var dx = mxEvent.getClientX(evt) - startX;
        var dy = mxEvent.getClientY(evt) - startY;
        this.setLocation(x + dx, y + dy);
        this.fireEvent(new mxEventObject(mxEvent.MOVE, 'event', evt));
        mxEvent.consume(evt);
      };

      var dropHandler = (evt) => {
        mxEvent.removeGestureListeners(document, null, dragHandler, dropHandler);
        this.fireEvent(new mxEventObject(mxEvent.MOVE_END, 'event', evt));
        mxEvent.consume(evt);
      };

      mxEvent.addGestureListeners(document, null, dragHandler, dropHandler);
      this.fireEvent(new mxEventObject(mxEvent.MOVE_START, 'event', evt));
      mxEvent.consume(evt);
    });

    if (mxClient.IS_POINTER) {
      this.title.style.touchAction = 'none';
    }
  }

  setLocation(x, y) {
    this.div.style.left = x + 'px';
    this.div.style.top = y + 'px';
  }

  getX() {
    return parseInt(this.div.style.left);
  }

  getY() {
    return parseInt(this.div.style.top);
  }

  installCloseHandler() {
    this.closeImg = document.createElement('img');
    this.closeImg.setAttribute('src', this.closeImage);
    this.closeImg.setAttribute('title', 'Close');
    this.closeImg.style.marginLeft = '2px';
    this.closeImg.style.cursor = 'pointer';
    this.closeImg.style.display = 'none';
    this.buttons.appendChild(this.closeImg);
    mxEvent.addGestureListeners(this.closeImg, (evt) => {
      this.fireEvent(new mxEventObject(mxEvent.CLOSE, 'event', evt));

      if (this.destroyOnClose) {
        this.destroy();
      } else {
        this.setVisible(false);
      }

      mxEvent.consume(evt);
    });
  }

  setImage(image) {
    this.image = document.createElement('img');
    this.image.setAttribute('src', image);
    this.image.setAttribute('align', 'left');
    this.image.style.marginRight = '4px';
    this.image.style.marginLeft = '0px';
    this.image.style.marginTop = '-2px';
    this.title.insertBefore(this.image, this.title.firstChild);
  }

  setClosable(closable) {
    this.closeImg.style.display = closable ? '' : 'none';
  }

  isVisible() {
    if (this.div != null) {
      return this.div.style.display != 'none';
    }

    return false;
  }

  setVisible(visible) {
    if (this.div != null && this.isVisible() != visible) {
      if (visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  show() {
    this.div.style.display = '';
    this.activate();
    var style = mxUtils.getCurrentStyle(this.contentWrapper);

    if (
      !mxClient.IS_QUIRKS &&
      (style.overflow == 'auto' || this.resize != null) &&
      this.contentWrapper.style.display != 'none'
    ) {
      this.contentWrapper.style.height =
        this.div.offsetHeight - this.title.offsetHeight - this.contentHeightCorrection + 'px';
    }

    this.fireEvent(new mxEventObject(mxEvent.SHOW));
  }

  hide() {
    this.div.style.display = 'none';
    this.fireEvent(new mxEventObject(mxEvent.HIDE));
  }

  destroy() {
    this.fireEvent(new mxEventObject(mxEvent.DESTROY));

    if (this.div != null) {
      mxEvent.release(this.div);
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }

    this.title = null;
    this.content = null;
    this.contentWrapper = null;
  }
}
