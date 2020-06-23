import { mxMouseEvent } from '@mxgraph/util/mxMouseEvent';
import { mxClient } from '@mxgraph/mxClient';

export class mxEvent {
  static addListener = (function () {
    var updateListenerList = function (element, eventName, funct) {
      if (element.mxListenerList == null) {
        element.mxListenerList = [];
      }

      var entry = {
        name: eventName,
        f: funct
      };
      element.mxListenerList.push(entry);
    };

    if (window.addEventListener) {
      return function (element, eventName, funct) {
        element.addEventListener(eventName, funct, false);
        updateListenerList(element, eventName, funct);
      };
    } else {
      return function (element, eventName, funct) {
        element.attachEvent('on' + eventName, funct);
        updateListenerList(element, eventName, funct);
      };
    }
  })();
  static removeListener = (function () {
    var updateListener = function (element, eventName, funct) {
      if (element.mxListenerList != null) {
        var listenerCount = element.mxListenerList.length;

        for (var i = 0; i < listenerCount; i++) {
          var entry = element.mxListenerList[i];

          if (entry.f == funct) {
            element.mxListenerList.splice(i, 1);
            break;
          }
        }

        if (element.mxListenerList.length == 0) {
          element.mxListenerList = null;
        }
      }
    };

    if (window.removeEventListener) {
      return function (element, eventName, funct) {
        element.removeEventListener(eventName, funct, false);
        updateListener(element, eventName, funct);
      };
    } else {
      return function (element, eventName, funct) {
        element.detachEvent('on' + eventName, funct);
        updateListener(element, eventName, funct);
      };
    }
  })();

  static removeAllListeners(element) {
    var list = element.mxListenerList;

    if (list != null) {
      while (list.length > 0) {
        var entry = list[0];
        mxEvent.removeListener(element, entry.name, entry.f);
      }
    }
  }

  static addGestureListeners(node, startListener, moveListener, endListener) {
    if (startListener != null) {
      mxEvent.addListener(node, mxClient.IS_POINTER ? 'pointerdown' : 'mousedown', startListener);
    }

    if (moveListener != null) {
      mxEvent.addListener(node, mxClient.IS_POINTER ? 'pointermove' : 'mousemove', moveListener);
    }

    if (endListener != null) {
      mxEvent.addListener(node, mxClient.IS_POINTER ? 'pointerup' : 'mouseup', endListener);
    }

    if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
      if (startListener != null) {
        mxEvent.addListener(node, 'touchstart', startListener);
      }

      if (moveListener != null) {
        mxEvent.addListener(node, 'touchmove', moveListener);
      }

      if (endListener != null) {
        mxEvent.addListener(node, 'touchend', endListener);
      }
    }
  }

  static removeGestureListeners(node, startListener, moveListener, endListener) {
    if (startListener != null) {
      mxEvent.removeListener(node, mxClient.IS_POINTER ? 'pointerdown' : 'mousedown', startListener);
    }

    if (moveListener != null) {
      mxEvent.removeListener(node, mxClient.IS_POINTER ? 'pointermove' : 'mousemove', moveListener);
    }

    if (endListener != null) {
      mxEvent.removeListener(node, mxClient.IS_POINTER ? 'pointerup' : 'mouseup', endListener);
    }

    if (!mxClient.IS_POINTER && mxClient.IS_TOUCH) {
      if (startListener != null) {
        mxEvent.removeListener(node, 'touchstart', startListener);
      }

      if (moveListener != null) {
        mxEvent.removeListener(node, 'touchmove', moveListener);
      }

      if (endListener != null) {
        mxEvent.removeListener(node, 'touchend', endListener);
      }
    }
  }

  static redirectMouseEvents(node, graph, state, down, move, up, dblClick) {
    var getState = function (evt) {
      return typeof state == 'function' ? state(evt) : state;
    };

    mxEvent.addGestureListeners(
      node,
      function (evt) {
        if (down != null) {
          down(evt);
        } else if (!mxEvent.isConsumed(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_DOWN, new mxMouseEvent(evt, getState(evt)));
        }
      },
      function (evt) {
        if (move != null) {
          move(evt);
        } else if (!mxEvent.isConsumed(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_MOVE, new mxMouseEvent(evt, getState(evt)));
        }
      },
      function (evt) {
        if (up != null) {
          up(evt);
        } else if (!mxEvent.isConsumed(evt)) {
          graph.fireMouseEvent(mxEvent.MOUSE_UP, new mxMouseEvent(evt, getState(evt)));
        }
      }
    );
    mxEvent.addListener(node, 'dblclick', function (evt) {
      if (dblClick != null) {
        dblClick(evt);
      } else if (!mxEvent.isConsumed(evt)) {
        var tmp = getState(evt);
        graph.dblClick(evt, tmp != null ? tmp.cell : null);
      }
    });
  }

  static release(element) {
    try {
      if (element != null) {
        mxEvent.removeAllListeners(element);
        var children = element.childNodes;

        if (children != null) {
          var childCount = children.length;

          for (var i = 0; i < childCount; i += 1) {
            mxEvent.release(children[i]);
          }
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  static addMouseWheelListener(funct, target) {
    if (funct != null) {
      var wheelHandler = function (evt) {
        if (evt == null) {
          evt = window.event;
        }

        if (evt.ctrlKey) {
          evt.preventDefault();
        }

        var delta = -evt.deltaY;

        if (Math.abs(evt.deltaX) > 0.5 || Math.abs(evt.deltaY) > 0.5) {
          funct(evt, evt.deltaY == 0 ? -evt.deltaX > 0 : -evt.deltaY > 0);
        }
      };

      target = target != null ? target : window;

      if (mxClient.IS_SF && !mxClient.IS_TOUCH) {
        var scale = 1;
        mxEvent.addListener(target, 'gesturestart', function (evt) {
          mxEvent.consume(evt);
          scale = 1;
        });
        mxEvent.addListener(target, 'gesturechange', function (evt) {
          mxEvent.consume(evt);
          var diff = scale - evt.scale;

          if (Math.abs(diff) > 0.2) {
            funct(evt, diff < 0, true);
            scale = evt.scale;
          }
        });
        mxEvent.addListener(target, 'gestureend', function (evt) {
          mxEvent.consume(evt);
        });
      }

      mxEvent.addListener(target, 'wheel', wheelHandler);
    }
  }

  static disableContextMenu(element) {
    mxEvent.addListener(element, 'contextmenu', function (evt) {
      if (evt.preventDefault) {
        evt.preventDefault();
      }

      return false;
    });
  }

  static getSource(evt) {
    return evt.srcElement != null ? evt.srcElement : evt.target;
  }

  static isConsumed(evt) {
    return evt.isConsumed != null && evt.isConsumed;
  }

  static isTouchEvent(evt) {
    return evt.pointerType != null
      ? evt.pointerType == 'touch' || evt.pointerType === evt.MSPOINTER_TYPE_TOUCH
      : evt.mozInputSource != null
      ? evt.mozInputSource == 5
      : evt.type.indexOf('touch') == 0;
  }

  static isPenEvent(evt) {
    return evt.pointerType != null
      ? evt.pointerType == 'pen' || evt.pointerType === evt.MSPOINTER_TYPE_PEN
      : evt.mozInputSource != null
      ? evt.mozInputSource == 2
      : evt.type.indexOf('pen') == 0;
  }

  static isMultiTouchEvent(evt) {
    return evt.type != null && evt.type.indexOf('touch') == 0 && evt.touches != null && evt.touches.length > 1;
  }

  static isMouseEvent(evt) {
    return evt.pointerType != null
      ? evt.pointerType == 'mouse' || evt.pointerType === evt.MSPOINTER_TYPE_MOUSE
      : evt.mozInputSource != null
      ? evt.mozInputSource == 1
      : evt.type.indexOf('mouse') == 0;
  }

  static isLeftMouseButton(evt) {
    if ('buttons' in evt && (evt.type == 'mousedown' || evt.type == 'mousemove')) {
      return evt.buttons == 1;
    } else if ('which' in evt) {
      return evt.which === 1;
    } else {
      return evt.button === 1;
    }
  }

  static isMiddleMouseButton(evt) {
    if ('which' in evt) {
      return evt.which === 2;
    } else {
      return evt.button === 4;
    }
  }

  static isRightMouseButton(evt) {
    if ('which' in evt) {
      return evt.which === 3;
    } else {
      return evt.button === 2;
    }
  }

  static isPopupTrigger(evt) {
    return (
      mxEvent.isRightMouseButton(evt) ||
      (mxClient.IS_MAC &&
        mxEvent.isControlDown(evt) &&
        !mxEvent.isShiftDown(evt) &&
        !mxEvent.isMetaDown(evt) &&
        !mxEvent.isAltDown(evt))
    );
  }

  static isShiftDown(evt) {
    return evt != null ? evt.shiftKey : false;
  }

  static isAltDown(evt) {
    return evt != null ? evt.altKey : false;
  }

  static isControlDown(evt) {
    return evt != null ? evt.ctrlKey : false;
  }

  static isMetaDown(evt) {
    return evt != null ? evt.metaKey : false;
  }

  static getMainEvent(e) {
    if ((e.type == 'touchstart' || e.type == 'touchmove') && e.touches != null && e.touches[0] != null) {
      e = e.touches[0];
    } else if (e.type == 'touchend' && e.changedTouches != null && e.changedTouches[0] != null) {
      e = e.changedTouches[0];
    }

    return e;
  }

  static getClientX(e) {
    return mxEvent.getMainEvent(e).clientX;
  }

  static getClientY(e) {
    return mxEvent.getMainEvent(e).clientY;
  }

  static consume(evt, preventDefault, stopPropagation) {
    preventDefault = preventDefault != null ? preventDefault : true;
    stopPropagation = stopPropagation != null ? stopPropagation : true;

    if (preventDefault) {
      if (evt.preventDefault) {
        if (stopPropagation) {
          evt.stopPropagation();
        }

        evt.preventDefault();
      } else if (stopPropagation) {
        evt.cancelBubble = true;
      }
    }

    evt.isConsumed = true;

    if (!evt.preventDefault) {
      evt.returnValue = false;
    }
  }

  static LABEL_HANDLE = -1;
  static ROTATION_HANDLE = -2;
  static CUSTOM_HANDLE = -100;
  static VIRTUAL_HANDLE = -100000;
  static MOUSE_DOWN = 'mouseDown';
  static MOUSE_MOVE = 'mouseMove';
  static MOUSE_UP = 'mouseUp';
  static ACTIVATE = 'activate';
  static RESIZE_START = 'resizeStart';
  static RESIZE = 'resize';
  static RESIZE_END = 'resizeEnd';
  static MOVE_START = 'moveStart';
  static MOVE = 'move';
  static MOVE_END = 'moveEnd';
  static PAN_START = 'panStart';
  static PAN = 'pan';
  static PAN_END = 'panEnd';
  static MINIMIZE = 'minimize';
  static NORMALIZE = 'normalize';
  static MAXIMIZE = 'maximize';
  static HIDE = 'hide';
  static SHOW = 'show';
  static CLOSE = 'close';
  static DESTROY = 'destroy';
  static REFRESH = 'refresh';
  static SIZE = 'size';
  static SELECT = 'select';
  static FIRED = 'fired';
  static FIRE_MOUSE_EVENT = 'fireMouseEvent';
  static GESTURE = 'gesture';
  static TAP_AND_HOLD = 'tapAndHold';
  static GET = 'get';
  static RECEIVE = 'receive';
  static CONNECT = 'connect';
  static DISCONNECT = 'disconnect';
  static SUSPEND = 'suspend';
  static RESUME = 'resume';
  static MARK = 'mark';
  static ROOT = 'root';
  static POST = 'post';
  static OPEN = 'open';
  static SAVE = 'save';
  static BEFORE_ADD_VERTEX = 'beforeAddVertex';
  static ADD_VERTEX = 'addVertex';
  static AFTER_ADD_VERTEX = 'afterAddVertex';
  static DONE = 'done';
  static EXECUTE = 'execute';
  static EXECUTED = 'executed';
  static BEGIN_UPDATE = 'beginUpdate';
  static START_EDIT = 'startEdit';
  static END_UPDATE = 'endUpdate';
  static END_EDIT = 'endEdit';
  static BEFORE_UNDO = 'beforeUndo';
  static UNDO = 'undo';
  static REDO = 'redo';
  static CHANGE = 'change';
  static NOTIFY = 'notify';
  static LAYOUT_CELLS = 'layoutCells';
  static CLICK = 'click';
  static SCALE = 'scale';
  static TRANSLATE = 'translate';
  static SCALE_AND_TRANSLATE = 'scaleAndTranslate';
  static UP = 'up';
  static DOWN = 'down';
  static ADD = 'add';
  static REMOVE = 'remove';
  static CLEAR = 'clear';
  static ADD_CELLS = 'addCells';
  static CELLS_ADDED = 'cellsAdded';
  static MOVE_CELLS = 'moveCells';
  static CELLS_MOVED = 'cellsMoved';
  static RESIZE_CELLS = 'resizeCells';
  static CELLS_RESIZED = 'cellsResized';
  static TOGGLE_CELLS = 'toggleCells';
  static CELLS_TOGGLED = 'cellsToggled';
  static ORDER_CELLS = 'orderCells';
  static CELLS_ORDERED = 'cellsOrdered';
  static REMOVE_CELLS = 'removeCells';
  static CELLS_REMOVED = 'cellsRemoved';
  static GROUP_CELLS = 'groupCells';
  static UNGROUP_CELLS = 'ungroupCells';
  static REMOVE_CELLS_FROM_PARENT = 'removeCellsFromParent';
  static FOLD_CELLS = 'foldCells';
  static CELLS_FOLDED = 'cellsFolded';
  static ALIGN_CELLS = 'alignCells';
  static LABEL_CHANGED = 'labelChanged';
  static CONNECT_CELL = 'connectCell';
  static CELL_CONNECTED = 'cellConnected';
  static SPLIT_EDGE = 'splitEdge';
  static FLIP_EDGE = 'flipEdge';
  static START_EDITING = 'startEditing';
  static EDITING_STARTED = 'editingStarted';
  static EDITING_STOPPED = 'editingStopped';
  static ADD_OVERLAY = 'addOverlay';
  static REMOVE_OVERLAY = 'removeOverlay';
  static UPDATE_CELL_SIZE = 'updateCellSize';
  static ESCAPE = 'escape';
  static DOUBLE_CLICK = 'doubleClick';
  static START = 'start';
  static RESET = 'reset';
}
