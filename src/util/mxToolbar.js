import { mxEventSource } from '@mxgraph/util/mxEventSource';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxPopupMenu } from '@mxgraph/util/mxPopupMenu';
import { mxClient } from '@mxgraph/mxClient';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxToolbar extends mxEventSource {
  enabled = true;
  noReset = false;
  updateDefaultMode = true;

  constructor(container) {
    super();
    this.container = container;
  }

  addItem(title, icon, funct, pressedIcon, style, factoryMethod) {
    var img = document.createElement(icon != null ? 'img' : 'button');
    var initialClassName = style || (factoryMethod != null ? 'mxToolbarMode' : 'mxToolbarItem');
    img.className = initialClassName;
    img.setAttribute('src', icon);

    if (title != null) {
      if (icon != null) {
        img.setAttribute('title', title);
      } else {
        mxUtils.write(img, title);
      }
    }

    this.container.appendChild(img);

    if (funct != null) {
      mxEvent.addListener(img, 'click', funct);

      if (mxClient.IS_TOUCH) {
        mxEvent.addListener(img, 'touchend', funct);
      }
    }

    var mouseHandler = (evt) => {
      if (pressedIcon != null) {
        img.setAttribute('src', icon);
      } else {
        img.style.backgroundColor = '';
      }
    };

    mxEvent.addGestureListeners(
      img,
      (evt) => {
        if (pressedIcon != null) {
          img.setAttribute('src', pressedIcon);
        } else {
          img.style.backgroundColor = 'gray';
        }

        if (factoryMethod != null) {
          if (this.menu == null) {
            this.menu = new mxPopupMenu();
            this.menu.init();
          }

          var last = this.currentImg;

          if (this.menu.isMenuShowing()) {
            this.menu.hideMenu();
          }

          if (last != img) {
            this.currentImg = img;
            this.menu.factoryMethod = factoryMethod;
            var point = new mxPoint(img.offsetLeft, img.offsetTop + img.offsetHeight);
            this.menu.popup(point.x, point.y, null, evt);

            if (this.menu.isMenuShowing()) {
              img.className = initialClassName + 'Selected';

              this.menu.hideMenu = function () {
                mxPopupMenu.prototype.hideMenu.apply(this);
                img.className = initialClassName;
                this.currentImg = null;
              };
            }
          }
        }
      },
      null,
      mouseHandler
    );
    mxEvent.addListener(img, 'mouseout', mouseHandler);
    return img;
  }

  addCombo(style) {
    var div = document.createElement('div');
    div.style.display = 'inline';
    div.className = 'mxToolbarComboContainer';
    var select = document.createElement('select');
    select.className = style || 'mxToolbarCombo';
    div.appendChild(select);
    this.container.appendChild(div);
    return select;
  }

  addActionCombo(title, style) {
    var select = document.createElement('select');
    select.className = style || 'mxToolbarCombo';
    this.addOption(select, title, null);
    mxEvent.addListener(select, 'change', function (evt) {
      var value = select.options[select.selectedIndex];
      select.selectedIndex = 0;

      if (value.funct != null) {
        value.funct(evt);
      }
    });
    this.container.appendChild(select);
    return select;
  }

  addOption(combo, title, value) {
    var option = document.createElement('option');
    mxUtils.writeln(option, title);

    if (typeof value == 'function') {
      option.funct = value;
    } else {
      option.setAttribute('value', value);
    }

    combo.appendChild(option);
    return option;
  }

  addSwitchMode(title, icon, funct, pressedIcon, style) {
    var img = document.createElement('img');
    img.initialClassName = style || 'mxToolbarMode';
    img.className = img.initialClassName;
    img.setAttribute('src', icon);
    img.altIcon = pressedIcon;

    if (title != null) {
      img.setAttribute('title', title);
    }

    mxEvent.addListener(img, 'click', (evt) => {
      var tmp = this.selectedMode.altIcon;

      if (tmp != null) {
        this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
        this.selectedMode.setAttribute('src', tmp);
      } else {
        this.selectedMode.className = this.selectedMode.initialClassName;
      }

      if (this.updateDefaultMode) {
        this.defaultMode = img;
      }

      this.selectedMode = img;
      var tmp = img.altIcon;

      if (tmp != null) {
        img.altIcon = img.getAttribute('src');
        img.setAttribute('src', tmp);
      } else {
        img.className = img.initialClassName + 'Selected';
      }

      this.fireEvent(new mxEventObject(mxEvent.SELECT));
      funct();
    });
    this.container.appendChild(img);

    if (this.defaultMode == null) {
      this.defaultMode = img;
      this.selectMode(img);
      funct();
    }

    return img;
  }

  addMode(title, icon, funct, pressedIcon, style, toggle) {
    toggle = toggle != null ? toggle : true;
    var img = document.createElement(icon != null ? 'img' : 'button');
    img.initialClassName = style || 'mxToolbarMode';
    img.className = img.initialClassName;
    img.setAttribute('src', icon);
    img.altIcon = pressedIcon;

    if (title != null) {
      img.setAttribute('title', title);
    }

    if (this.enabled && toggle) {
      mxEvent.addListener(img, 'click', (evt) => {
        this.selectMode(img, funct);
        this.noReset = false;
      });
      mxEvent.addListener(img, 'dblclick', (evt) => {
        this.selectMode(img, funct);
        this.noReset = true;
      });

      if (this.defaultMode == null) {
        this.defaultMode = img;
        this.defaultFunction = funct;
        this.selectMode(img, funct);
      }
    }

    this.container.appendChild(img);
    return img;
  }

  selectMode(domNode, funct) {
    if (this.selectedMode != domNode) {
      if (this.selectedMode != null) {
        var tmp = this.selectedMode.altIcon;

        if (tmp != null) {
          this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
          this.selectedMode.setAttribute('src', tmp);
        } else {
          this.selectedMode.className = this.selectedMode.initialClassName;
        }
      }

      this.selectedMode = domNode;
      var tmp = this.selectedMode.altIcon;

      if (tmp != null) {
        this.selectedMode.altIcon = this.selectedMode.getAttribute('src');
        this.selectedMode.setAttribute('src', tmp);
      } else {
        this.selectedMode.className = this.selectedMode.initialClassName + 'Selected';
      }

      this.fireEvent(new mxEventObject(mxEvent.SELECT, 'function', funct));
    }
  }

  resetMode(forced) {
    if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
      this.selectMode(this.defaultMode, this.defaultFunction);
    }
  }

  addSeparator(icon) {
    return this.addItem(null, icon, null);
  }

  addBreak() {
    mxUtils.br(this.container);
  }

  addLine() {
    var hr = document.createElement('hr');
    hr.style.marginRight = '6px';
    hr.setAttribute('size', '1');
    this.container.appendChild(hr);
  }

  destroy() {
    mxEvent.release(this.container);
    this.container = null;
    this.defaultMode = null;
    this.defaultFunction = null;
    this.selectedMode = null;

    if (this.menu != null) {
      this.menu.destroy();
    }
  }
}
