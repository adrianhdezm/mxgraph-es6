import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxClient } from '@mxgraph/mxClient';

export class mxPopupMenu extends mxEventSource {
  submenuImage = mxClient.imageBasePath + '/submenu.gif';
  zIndex = 10006;
  useLeftButtonForPopup = false;
  enabled = true;
  itemCount = 0;
  autoExpand = false;
  smartSeparators = false;
  labels = true;

  constructor(factoryMethod) {
    super();
    this.factoryMethod = factoryMethod;

    if (factoryMethod != null) {
      this.init();
    }
  }

  init() {
    this.table = document.createElement('table');
    this.table.className = 'mxPopupMenu';
    this.tbody = document.createElement('tbody');
    this.table.appendChild(this.tbody);
    this.div = document.createElement('div');
    this.div.className = 'mxPopupMenu';
    this.div.style.display = 'inline';
    this.div.style.zIndex = this.zIndex;
    this.div.appendChild(this.table);
    mxEvent.disableContextMenu(this.div);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isPopupTrigger(me) {
    return me.isPopupTrigger() || (this.useLeftButtonForPopup && mxEvent.isLeftMouseButton(me.getEvent()));
  }

  addItem(title, image, funct, parent, iconCls, enabled, active, noHover) {
    parent = parent || this;
    this.itemCount++;

    if (parent.willAddSeparator) {
      if (parent.containsItems) {
        this.addSeparator(parent, true);
      }

      parent.willAddSeparator = false;
    }

    parent.containsItems = true;
    var tr = document.createElement('tr');
    tr.className = 'mxPopupMenuItem';
    var col1 = document.createElement('td');
    col1.className = 'mxPopupMenuIcon';

    if (image != null) {
      var img = document.createElement('img');
      img.src = image;
      col1.appendChild(img);
    } else if (iconCls != null) {
      var div = document.createElement('div');
      div.className = iconCls;
      col1.appendChild(div);
    }

    tr.appendChild(col1);

    if (this.labels) {
      var col2 = document.createElement('td');
      col2.className = 'mxPopupMenuItem' + (enabled != null && !enabled ? ' mxDisabled' : '');
      mxUtils.write(col2, title);
      col2.align = 'left';
      tr.appendChild(col2);
      var col3 = document.createElement('td');
      col3.className = 'mxPopupMenuItem' + (enabled != null && !enabled ? ' mxDisabled' : '');
      col3.style.paddingRight = '6px';
      col3.style.textAlign = 'right';
      tr.appendChild(col3);

      if (parent.div == null) {
        this.createSubmenu(parent);
      }
    }

    parent.tbody.appendChild(tr);

    if (active != false && enabled != false) {
      var currentSelection = null;
      mxEvent.addGestureListeners(
        tr,
        (evt) => {
          this.eventReceiver = tr;

          if (parent.activeRow != tr && parent.activeRow != parent) {
            if (parent.activeRow != null && parent.activeRow.div.parentNode != null) {
              this.hideSubmenu(parent);
            }

            if (tr.div != null) {
              this.showSubmenu(parent, tr);
              parent.activeRow = tr;
            }
          }

          if (document.selection != null && (mxClient.IS_QUIRKS || document.documentMode == 8)) {
            currentSelection = document.selection.createRange();
          }

          mxEvent.consume(evt);
        },
        (evt) => {
          if (parent.activeRow != tr && parent.activeRow != parent) {
            if (parent.activeRow != null && parent.activeRow.div.parentNode != null) {
              this.hideSubmenu(parent);
            }

            if (this.autoExpand && tr.div != null) {
              this.showSubmenu(parent, tr);
              parent.activeRow = tr;
            }
          }

          if (!noHover) {
            tr.className = 'mxPopupMenuItemHover';
          }
        },
        (evt) => {
          if (this.eventReceiver == tr) {
            if (parent.activeRow != tr) {
              this.hideMenu();
            }

            if (currentSelection != null) {
              try {
                currentSelection.select();
              } catch (e) {
                /* ignore */
              }

              currentSelection = null;
            }

            if (funct != null) {
              funct(evt);
            }
          }

          this.eventReceiver = null;
          mxEvent.consume(evt);
        }
      );

      if (!noHover) {
        mxEvent.addListener(tr, 'mouseout', (evt) => {
          tr.className = 'mxPopupMenuItem';
        });
      }
    }

    return tr;
  }

  addCheckmark(item, img) {
    var td = item.firstChild.nextSibling;
    td.style.backgroundImage = "url('" + img + "')";
    td.style.backgroundRepeat = 'no-repeat';
    td.style.backgroundPosition = '2px 50%';
  }

  createSubmenu(parent) {
    parent.table = document.createElement('table');
    parent.table.className = 'mxPopupMenu';
    parent.tbody = document.createElement('tbody');
    parent.table.appendChild(parent.tbody);
    parent.div = document.createElement('div');
    parent.div.className = 'mxPopupMenu';
    parent.div.style.position = 'absolute';
    parent.div.style.display = 'inline';
    parent.div.style.zIndex = this.zIndex;
    parent.div.appendChild(parent.table);
    var img = document.createElement('img');
    img.setAttribute('src', this.submenuImage);
    var td = parent.firstChild.nextSibling.nextSibling;
    td.appendChild(img);
  }

  showSubmenu(parent, row) {
    if (row.div != null) {
      row.div.style.left = parent.div.offsetLeft + row.offsetLeft + row.offsetWidth - 1 + 'px';
      row.div.style.top = parent.div.offsetTop + row.offsetTop + 'px';
      document.body.appendChild(row.div);
      var left = parseInt(row.div.offsetLeft);
      var width = parseInt(row.div.offsetWidth);
      var offset = mxUtils.getDocumentScrollOrigin(document);
      var b = document.body;
      var d = document.documentElement;
      var right = offset.x + (b.clientWidth || d.clientWidth);

      if (left + width > right) {
        row.div.style.left = Math.max(0, parent.div.offsetLeft - width + -6) + 'px';
      }

      mxUtils.fit(row.div);
    }
  }

  addSeparator(parent, force) {
    parent = parent || this;

    if (this.smartSeparators && !force) {
      parent.willAddSeparator = true;
    } else if (parent.tbody != null) {
      parent.willAddSeparator = false;
      var tr = document.createElement('tr');
      var col1 = document.createElement('td');
      col1.className = 'mxPopupMenuIcon';
      col1.style.padding = '0 0 0 0px';
      tr.appendChild(col1);
      var col2 = document.createElement('td');
      col2.style.padding = '0 0 0 0px';
      col2.setAttribute('colSpan', '2');
      var hr = document.createElement('hr');
      hr.setAttribute('size', '1');
      col2.appendChild(hr);
      tr.appendChild(col2);
      parent.tbody.appendChild(tr);
    }
  }

  popup(x, y, cell, evt) {
    if (this.div != null && this.tbody != null && this.factoryMethod != null) {
      this.div.style.left = x + 'px';
      this.div.style.top = y + 'px';

      while (this.tbody.firstChild != null) {
        mxEvent.release(this.tbody.firstChild);
        this.tbody.removeChild(this.tbody.firstChild);
      }

      this.itemCount = 0;
      this.factoryMethod(this, cell, evt);

      if (this.itemCount > 0) {
        this.showMenu();
        this.fireEvent(new mxEventObject(mxEvent.SHOW));
      }
    }
  }

  isMenuShowing() {
    return this.div != null && this.div.parentNode == document.body;
  }

  showMenu() {
    if (document.documentMode >= 9) {
      this.div.style.filter = 'none';
    }

    document.body.appendChild(this.div);
    mxUtils.fit(this.div);
  }

  hideMenu() {
    if (this.div != null) {
      if (this.div.parentNode != null) {
        this.div.parentNode.removeChild(this.div);
      }

      this.hideSubmenu(this);
      this.containsItems = false;
      this.fireEvent(new mxEventObject(mxEvent.HIDE));
    }
  }

  hideSubmenu(parent) {
    if (parent.activeRow != null) {
      this.hideSubmenu(parent.activeRow);

      if (parent.activeRow.div.parentNode != null) {
        parent.activeRow.div.parentNode.removeChild(parent.activeRow.div);
      }

      parent.activeRow = null;
    }
  }

  destroy() {
    if (this.div != null) {
      mxEvent.release(this.div);

      if (this.div.parentNode != null) {
        this.div.parentNode.removeChild(this.div);
      }

      this.div = null;
    }
  }
}
