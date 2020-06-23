import { mxText } from '@mxgraph/shape/mxText';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxRectangle } from '@mxgraph/util/mxRectangle';
import { mxClient } from '@mxgraph/mxClient';

export class mxCellEditor {
  textarea = null;
  editingCell = null;
  trigger = null;
  modified = false;
  autoSize = true;
  selectText = true;
  emptyLabelText = mxClient.IS_FF ? '<br>' : '';
  escapeCancelsEditing = true;
  textNode = '';
  zIndex = 5;
  minResize = new mxRectangle(0, 20);
  wordWrapPadding = mxClient.IS_QUIRKS ? 2 : !mxClient.IS_IE11 ? 1 : 0;
  blurEnabled = false;
  initialValue = null;
  align = null;

  constructor(graph) {
    this.graph = graph;

    this.zoomHandler = () => {
      if (this.graph.isEditing()) {
        this.resize();
      }
    };

    this.graph.view.addListener(mxEvent.SCALE, this.zoomHandler);
    this.graph.view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.zoomHandler);

    this.changeHandler = (sender) => {
      if (this.editingCell != null && this.graph.getView().getState(this.editingCell) == null) {
        this.stopEditing(true);
      }
    };

    this.graph.getModel().addListener(mxEvent.CHANGE, this.changeHandler);
  }

  init() {
    this.textarea = document.createElement('div');
    this.textarea.className = 'mxCellEditor mxPlainTextEditor';
    this.textarea.contentEditable = true;

    if (mxClient.IS_GC) {
      this.textarea.style.minHeight = '1em';
    }

    this.textarea.style.position = this.isLegacyEditor() ? 'absolute' : 'relative';
    this.installListeners(this.textarea);
  }

  applyValue(state, value) {
    this.graph.labelChanged(state.cell, value, this.trigger);
  }

  setAlign(align) {
    if (this.textarea != null) {
      this.textarea.style.textAlign = align;
    }

    this.align = align;
    this.resize();
  }

  getInitialValue(state, trigger) {
    var result = mxUtils.htmlEntities(this.graph.getEditingValue(state.cell, trigger), false);

    if (
      !mxClient.IS_QUIRKS &&
      document.documentMode != 8 &&
      document.documentMode != 9 &&
      document.documentMode != 10
    ) {
      result = mxUtils.replaceTrailingNewlines(result, '<div><br></div>');
    }

    return result.replace(/\n/g, '<br>');
  }

  getCurrentValue(state) {
    return mxUtils.extractTextWithWhitespace(this.textarea.childNodes);
  }

  isCancelEditingKeyEvent(evt) {
    return (
      this.escapeCancelsEditing || mxEvent.isShiftDown(evt) || mxEvent.isControlDown(evt) || mxEvent.isMetaDown(evt)
    );
  }

  installListeners(elt) {
    mxEvent.addListener(elt, 'dragstart', (evt) => {
      this.graph.stopEditing(false);
      mxEvent.consume(evt);
    });
    mxEvent.addListener(elt, 'blur', (evt) => {
      if (this.blurEnabled) {
        this.focusLost(evt);
      }
    });
    mxEvent.addListener(elt, 'keydown', (evt) => {
      if (!mxEvent.isConsumed(evt)) {
        if (this.isStopEditingEvent(evt)) {
          this.graph.stopEditing(false);
          mxEvent.consume(evt);
        } else if (evt.keyCode == 27) {
          this.graph.stopEditing(this.isCancelEditingKeyEvent(evt));
          mxEvent.consume(evt);
        }
      }
    });

    var keypressHandler = (evt) => {
      if (this.editingCell != null) {
        if (
          this.clearOnChange &&
          elt.innerHTML == this.getEmptyLabelText() &&
          (!mxClient.IS_FF || (evt.keyCode != 8 && evt.keyCode != 46))
        ) {
          this.clearOnChange = false;
          elt.innerHTML = '';
        }
      }
    };

    mxEvent.addListener(elt, 'keypress', keypressHandler);
    mxEvent.addListener(elt, 'paste', keypressHandler);

    var keyupHandler = (evt) => {
      if (this.editingCell != null) {
        if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>') {
          this.textarea.innerHTML = this.getEmptyLabelText();
          this.clearOnChange = this.textarea.innerHTML.length > 0;
        } else {
          this.clearOnChange = false;
        }
      }
    };

    mxEvent.addListener(elt, !mxClient.IS_IE11 ? 'input' : 'keyup', keyupHandler);
    mxEvent.addListener(elt, 'cut', keyupHandler);
    mxEvent.addListener(elt, 'paste', keyupHandler);
    var evtName = !mxClient.IS_IE11 ? 'input' : 'keydown';

    var resizeHandler = (evt) => {
      if (this.editingCell != null && this.autoSize && !mxEvent.isConsumed(evt)) {
        if (this.resizeThread != null) {
          window.clearTimeout(this.resizeThread);
        }

        this.resizeThread = window.setTimeout(() => {
          this.resizeThread = null;
          this.resize();
        }, 0);
      }
    };

    mxEvent.addListener(elt, evtName, resizeHandler);
    mxEvent.addListener(window, 'resize', resizeHandler);

    if (document.documentMode >= 9) {
      mxEvent.addListener(elt, 'DOMNodeRemoved', resizeHandler);
      mxEvent.addListener(elt, 'DOMNodeInserted', resizeHandler);
    } else {
      mxEvent.addListener(elt, 'cut', resizeHandler);
      mxEvent.addListener(elt, 'paste', resizeHandler);
    }
  }

  isStopEditingEvent(evt) {
    return (
      evt.keyCode == 113 ||
      (this.graph.isEnterStopsCellEditing() &&
        evt.keyCode == 13 &&
        !mxEvent.isControlDown(evt) &&
        !mxEvent.isShiftDown(evt))
    );
  }

  isEventSource(evt) {
    return mxEvent.getSource(evt) == this.textarea;
  }

  resize() {
    var state = this.graph.getView().getState(this.editingCell);

    if (state == null) {
      this.stopEditing(true);
    } else if (this.textarea != null) {
      var isEdge = this.graph.getModel().isEdge(state.cell);
      var scale = this.graph.getView().scale;
      var m = null;

      if (!this.autoSize || state.style[mxConstants.STYLE_OVERFLOW] == 'fill') {
        this.bounds = this.getEditorBounds(state);
        this.textarea.style.width = Math.round(this.bounds.width / scale) + 'px';
        this.textarea.style.height = Math.round(this.bounds.height / scale) + 'px';

        if (document.documentMode == 8 || mxClient.IS_QUIRKS) {
          this.textarea.style.left = Math.round(this.bounds.x) + 'px';
          this.textarea.style.top = Math.round(this.bounds.y) + 'px';
        } else {
          this.textarea.style.left = Math.max(0, Math.round(this.bounds.x + 1)) + 'px';
          this.textarea.style.top = Math.max(0, Math.round(this.bounds.y + 1)) + 'px';
        }

        if (
          this.graph.isWrapping(state.cell) &&
          (this.bounds.width >= 2 || this.bounds.height >= 2) &&
          this.textarea.innerHTML != this.getEmptyLabelText()
        ) {
          this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
          this.textarea.style.whiteSpace = 'normal';

          if (state.style[mxConstants.STYLE_OVERFLOW] != 'fill') {
            this.textarea.style.width = Math.round(this.bounds.width / scale) + this.wordWrapPadding + 'px';
          }
        } else {
          this.textarea.style.whiteSpace = 'nowrap';

          if (state.style[mxConstants.STYLE_OVERFLOW] != 'fill') {
            this.textarea.style.width = '';
          }
        }
      } else {
        var lw = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_WIDTH, null);
        m = state.text != null && this.align == null ? state.text.margin : null;

        if (m == null) {
          m = mxUtils.getAlignmentAsPoint(
            this.align || mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_CENTER),
            mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_ALIGN, mxConstants.ALIGN_MIDDLE)
          );
        }

        if (isEdge) {
          this.bounds = new mxRectangle(state.absoluteOffset.x, state.absoluteOffset.y, 0, 0);

          if (lw != null) {
            var tmp = (parseFloat(lw) + 2) * scale;
            this.bounds.width = tmp;
            this.bounds.x += m.x * tmp;
          }
        } else {
          var bds = mxRectangle.fromRectangle(state);
          var hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
          var vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
          bds =
            state.shape != null && hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE
              ? state.shape.getLabelBounds(bds)
              : bds;

          if (lw != null) {
            bds.width = parseFloat(lw) * scale;
          }

          if (!state.view.graph.cellRenderer.legacySpacing || state.style[mxConstants.STYLE_OVERFLOW] != 'width') {
            var spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 2) * scale;
            var spacingTop =
              (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0) + mxText.baseSpacingTop) * scale + spacing;
            var spacingRight =
              (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0) + mxText.baseSpacingRight) * scale + spacing;
            var spacingBottom =
              (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0) + mxText.baseSpacingBottom) * scale +
              spacing;
            var spacingLeft =
              (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0) + mxText.baseSpacingLeft) * scale + spacing;
            var hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
            var vpos = mxUtils.getValue(
              state.style,
              mxConstants.STYLE_VERTICAL_LABEL_POSITION,
              mxConstants.ALIGN_MIDDLE
            );
            bds = new mxRectangle(
              bds.x + spacingLeft,
              bds.y + spacingTop,
              bds.width - (hpos == mxConstants.ALIGN_CENTER && lw == null ? spacingLeft + spacingRight : 0),
              bds.height - (vpos == mxConstants.ALIGN_MIDDLE ? spacingTop + spacingBottom : 0)
            );
          }

          this.bounds = new mxRectangle(
            bds.x + state.absoluteOffset.x,
            bds.y + state.absoluteOffset.y,
            bds.width,
            bds.height
          );
        }

        if (
          this.graph.isWrapping(state.cell) &&
          (this.bounds.width >= 2 || this.bounds.height >= 2) &&
          this.textarea.innerHTML != this.getEmptyLabelText()
        ) {
          this.textarea.style.wordWrap = mxConstants.WORD_WRAP;
          this.textarea.style.whiteSpace = 'normal';
          var tmp = Math.round(this.bounds.width / (document.documentMode == 8 ? scale : scale)) + this.wordWrapPadding;

          if (this.textarea.style.position != 'relative') {
            this.textarea.style.width = tmp + 'px';

            if (this.textarea.scrollWidth > tmp) {
              this.textarea.style.width = this.textarea.scrollWidth + 'px';
            }
          } else {
            this.textarea.style.maxWidth = tmp + 'px';
          }
        } else {
          this.textarea.style.whiteSpace = 'nowrap';
          this.textarea.style.width = '';
        }

        if (document.documentMode == 8) {
          this.textarea.style.zoom = '1';
          this.textarea.style.height = 'auto';
        }

        var ow = this.textarea.scrollWidth;
        var oh = this.textarea.scrollHeight;

        if (document.documentMode == 8) {
          this.textarea.style.left =
            Math.max(
              0,
              Math.ceil(
                (this.bounds.x -
                  m.x * (this.bounds.width - (ow + 1) * scale) +
                  ow * (scale - 1) * 0 +
                  (m.x + 0.5) * 2) /
                  scale
              )
            ) + 'px';
          this.textarea.style.top =
            Math.max(
              0,
              Math.ceil(
                (this.bounds.y -
                  m.y * (this.bounds.height - (oh + 0.5) * scale) +
                  oh * (scale - 1) * 0 +
                  Math.abs(m.y + 0.5) * 1) /
                  scale
              )
            ) + 'px';
          this.textarea.style.width = Math.round(ow * scale) + 'px';
          this.textarea.style.height = Math.round(oh * scale) + 'px';
        } else if (mxClient.IS_QUIRKS) {
          this.textarea.style.left =
            Math.max(
              0,
              Math.ceil(
                this.bounds.x - m.x * (this.bounds.width - (ow + 1) * scale) + ow * (scale - 1) * 0 + (m.x + 0.5) * 2
              )
            ) + 'px';
          this.textarea.style.top =
            Math.max(
              0,
              Math.ceil(
                this.bounds.y -
                  m.y * (this.bounds.height - (oh + 0.5) * scale) +
                  oh * (scale - 1) * 0 +
                  Math.abs(m.y + 0.5) * 1
              )
            ) + 'px';
        } else {
          this.textarea.style.left = Math.max(0, Math.round(this.bounds.x - m.x * (this.bounds.width - 2)) + 1) + 'px';
          this.textarea.style.top =
            Math.max(0, Math.round(this.bounds.y - m.y * (this.bounds.height - 4) + (m.y == -1 ? 3 : 0)) + 1) + 'px';
        }
      }

      mxUtils.setPrefixedStyle(this.textarea.style, 'transformOrigin', '0px 0px');
      mxUtils.setPrefixedStyle(
        this.textarea.style,
        'transform',
        'scale(' + scale + ',' + scale + ')' + (m == null ? '' : ' translate(' + m.x * 100 + '%,' + m.y * 100 + '%)')
      );
    }
  }

  focusLost() {
    this.stopEditing(!this.graph.isInvokesStopCellEditing());
  }

  getBackgroundColor(state) {
    return null;
  }

  isLegacyEditor() {
    var absoluteRoot = false;

    if (mxClient.IS_SVG) {
      var root = this.graph.view.getDrawPane().ownerSVGElement;

      if (root != null) {
        var css = mxUtils.getCurrentStyle(root);

        if (css != null) {
          absoluteRoot = css.position == 'absolute';
        }
      }
    }

    return !absoluteRoot;
  }

  startEditing(cell, trigger) {
    this.stopEditing(true);
    this.align = null;

    if (this.textarea == null) {
      this.init();
    }

    if (this.graph.tooltipHandler != null) {
      this.graph.tooltipHandler.hideTooltip();
    }

    var state = this.graph.getView().getState(cell);

    if (state != null) {
      var scale = this.graph.getView().scale;
      var size = mxUtils.getValue(state.style, mxConstants.STYLE_FONTSIZE, mxConstants.DEFAULT_FONTSIZE);
      var family = mxUtils.getValue(state.style, mxConstants.STYLE_FONTFAMILY, mxConstants.DEFAULT_FONTFAMILY);
      var color = mxUtils.getValue(state.style, mxConstants.STYLE_FONTCOLOR, 'black');
      var align = mxUtils.getValue(state.style, mxConstants.STYLE_ALIGN, mxConstants.ALIGN_LEFT);
      var bold =
        (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_BOLD) ==
        mxConstants.FONT_BOLD;
      var italic =
        (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_ITALIC) ==
        mxConstants.FONT_ITALIC;
      var txtDecor = [];

      if (
        (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_UNDERLINE) ==
        mxConstants.FONT_UNDERLINE
      ) {
        txtDecor.push('underline');
      }

      if (
        (mxUtils.getValue(state.style, mxConstants.STYLE_FONTSTYLE, 0) & mxConstants.FONT_STRIKETHROUGH) ==
        mxConstants.FONT_STRIKETHROUGH
      ) {
        txtDecor.push('line-through');
      }

      this.textarea.style.lineHeight = mxConstants.ABSOLUTE_LINE_HEIGHT
        ? Math.round(size * mxConstants.LINE_HEIGHT) + 'px'
        : mxConstants.LINE_HEIGHT;
      this.textarea.style.backgroundColor = this.getBackgroundColor(state);
      this.textarea.style.textDecoration = txtDecor.join(' ');
      this.textarea.style.fontWeight = bold ? 'bold' : 'normal';
      this.textarea.style.fontStyle = italic ? 'italic' : '';
      this.textarea.style.fontSize = Math.round(size) + 'px';
      this.textarea.style.zIndex = this.zIndex;
      this.textarea.style.fontFamily = family;
      this.textarea.style.textAlign = align;
      this.textarea.style.outline = 'none';
      this.textarea.style.color = color;
      var dir = (this.textDirection = mxUtils.getValue(
        state.style,
        mxConstants.STYLE_TEXT_DIRECTION,
        mxConstants.DEFAULT_TEXT_DIRECTION
      ));

      if (dir == mxConstants.TEXT_DIRECTION_AUTO) {
        if (
          state != null &&
          state.text != null &&
          state.text.dialect != mxConstants.DIALECT_STRICTHTML &&
          !mxUtils.isNode(state.text.value)
        ) {
          dir = state.text.getAutoDirection();
        }
      }

      if (dir == mxConstants.TEXT_DIRECTION_LTR || dir == mxConstants.TEXT_DIRECTION_RTL) {
        this.textarea.setAttribute('dir', dir);
      } else {
        this.textarea.removeAttribute('dir');
      }

      this.textarea.innerHTML = this.getInitialValue(state, trigger) || '';
      this.initialValue = this.textarea.innerHTML;

      if (this.textarea.innerHTML.length == 0 || this.textarea.innerHTML == '<br>') {
        this.textarea.innerHTML = this.getEmptyLabelText();
        this.clearOnChange = true;
      } else {
        this.clearOnChange = this.textarea.innerHTML == this.getEmptyLabelText();
      }

      this.graph.container.appendChild(this.textarea);
      this.editingCell = cell;
      this.trigger = trigger;
      this.textNode = null;

      if (state.text != null && this.isHideLabel(state)) {
        this.textNode = state.text.node;
        this.textNode.style.visibility = 'hidden';
      }

      if (this.autoSize && (this.graph.model.isEdge(state.cell) || state.style[mxConstants.STYLE_OVERFLOW] != 'fill')) {
        window.setTimeout(() => {
          this.resize();
        }, 0);
      }

      this.resize();

      try {
        this.textarea.focus();

        if (
          this.isSelectText() &&
          this.textarea.innerHTML.length > 0 &&
          (this.textarea.innerHTML != this.getEmptyLabelText() || !this.clearOnChange)
        ) {
          document.execCommand('selectAll', false, null);
        }
      } catch (e) {
        /* ignore */
      }
    }
  }

  isSelectText() {
    return this.selectText;
  }

  clearSelection() {
    var selection = null;

    if (window.getSelection) {
      selection = window.getSelection();
    } else if (document.selection) {
      selection = document.selection;
    }

    if (selection != null) {
      if (selection.empty) {
        selection.empty();
      } else if (selection.removeAllRanges) {
        selection.removeAllRanges();
      }
    }
  }

  stopEditing(cancel) {
    cancel = cancel || false;

    if (this.editingCell != null) {
      if (this.textNode != null) {
        this.textNode.style.visibility = 'visible';
        this.textNode = null;
      }

      var state = !cancel ? this.graph.view.getState(this.editingCell) : null;
      var initial = this.initialValue;
      this.initialValue = null;
      this.editingCell = null;
      this.trigger = null;
      this.bounds = null;
      this.textarea.blur();
      this.clearSelection();

      if (this.textarea.parentNode != null) {
        this.textarea.parentNode.removeChild(this.textarea);
      }

      if (this.clearOnChange && this.textarea.innerHTML == this.getEmptyLabelText()) {
        this.textarea.innerHTML = '';
        this.clearOnChange = false;
      }

      if (state != null && (this.textarea.innerHTML != initial || this.align != null)) {
        this.prepareTextarea();
        var value = this.getCurrentValue(state);
        this.graph.getModel().beginUpdate();

        try {
          if (value != null) {
            this.applyValue(state, value);
          }

          if (this.align != null) {
            this.graph.setCellStyles(mxConstants.STYLE_ALIGN, this.align, [state.cell]);
          }
        } finally {
          this.graph.getModel().endUpdate();
        }
      }

      mxEvent.release(this.textarea);
      this.textarea = null;
      this.align = null;
    }
  }

  prepareTextarea() {
    if (this.textarea.lastChild != null && this.textarea.lastChild.nodeName == 'BR') {
      this.textarea.removeChild(this.textarea.lastChild);
    }
  }

  isHideLabel(state) {
    return true;
  }

  getMinimumSize(state) {
    var scale = this.graph.getView().scale;
    return new mxRectangle(
      0,
      0,
      state.text == null ? 30 : state.text.size * scale + 20,
      this.textarea.style.textAlign == 'left' ? 120 : 40
    );
  }

  getEditorBounds(state) {
    var isEdge = this.graph.getModel().isEdge(state.cell);
    var scale = this.graph.getView().scale;
    var minSize = this.getMinimumSize(state);
    var minWidth = minSize.width;
    var minHeight = minSize.height;
    var result = null;

    if (!isEdge && state.view.graph.cellRenderer.legacySpacing && state.style[mxConstants.STYLE_OVERFLOW] == 'fill') {
      result = state.shape.getLabelBounds(mxRectangle.fromRectangle(state));
    } else {
      var spacing = parseInt(state.style[mxConstants.STYLE_SPACING] || 0) * scale;
      var spacingTop =
        (parseInt(state.style[mxConstants.STYLE_SPACING_TOP] || 0) + mxText.baseSpacingTop) * scale + spacing;
      var spacingRight =
        (parseInt(state.style[mxConstants.STYLE_SPACING_RIGHT] || 0) + mxText.baseSpacingRight) * scale + spacing;
      var spacingBottom =
        (parseInt(state.style[mxConstants.STYLE_SPACING_BOTTOM] || 0) + mxText.baseSpacingBottom) * scale + spacing;
      var spacingLeft =
        (parseInt(state.style[mxConstants.STYLE_SPACING_LEFT] || 0) + mxText.baseSpacingLeft) * scale + spacing;
      result = new mxRectangle(
        state.x,
        state.y,
        Math.max(minWidth, state.width - spacingLeft - spacingRight),
        Math.max(minHeight, state.height - spacingTop - spacingBottom)
      );
      var hpos = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);
      var vpos = mxUtils.getValue(state.style, mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.ALIGN_MIDDLE);
      result =
        state.shape != null && hpos == mxConstants.ALIGN_CENTER && vpos == mxConstants.ALIGN_MIDDLE
          ? state.shape.getLabelBounds(result)
          : result;

      if (isEdge) {
        result.x = state.absoluteOffset.x;
        result.y = state.absoluteOffset.y;

        if (state.text != null && state.text.boundingBox != null) {
          if (state.text.boundingBox.x > 0) {
            result.x = state.text.boundingBox.x;
          }

          if (state.text.boundingBox.y > 0) {
            result.y = state.text.boundingBox.y;
          }
        }
      } else if (state.text != null && state.text.boundingBox != null) {
        result.x = Math.min(result.x, state.text.boundingBox.x);
        result.y = Math.min(result.y, state.text.boundingBox.y);
      }

      result.x += spacingLeft;
      result.y += spacingTop;

      if (state.text != null && state.text.boundingBox != null) {
        if (!isEdge) {
          result.width = Math.max(result.width, state.text.boundingBox.width);
          result.height = Math.max(result.height, state.text.boundingBox.height);
        } else {
          result.width = Math.max(minWidth, state.text.boundingBox.width);
          result.height = Math.max(minHeight, state.text.boundingBox.height);
        }
      }

      if (this.graph.getModel().isVertex(state.cell)) {
        var horizontal = mxUtils.getValue(state.style, mxConstants.STYLE_LABEL_POSITION, mxConstants.ALIGN_CENTER);

        if (horizontal == mxConstants.ALIGN_LEFT) {
          result.x -= state.width;
        } else if (horizontal == mxConstants.ALIGN_RIGHT) {
          result.x += state.width;
        }

        var vertical = mxUtils.getValue(
          state.style,
          mxConstants.STYLE_VERTICAL_LABEL_POSITION,
          mxConstants.ALIGN_MIDDLE
        );

        if (vertical == mxConstants.ALIGN_TOP) {
          result.y -= state.height;
        } else if (vertical == mxConstants.ALIGN_BOTTOM) {
          result.y += state.height;
        }
      }
    }

    return new mxRectangle(
      Math.round(result.x),
      Math.round(result.y),
      Math.round(result.width),
      Math.round(result.height)
    );
  }

  getEmptyLabelText(cell) {
    return this.emptyLabelText;
  }

  getEditingCell() {
    return this.editingCell;
  }

  destroy() {
    if (this.textarea != null) {
      mxEvent.release(this.textarea);

      if (this.textarea.parentNode != null) {
        this.textarea.parentNode.removeChild(this.textarea);
      }

      this.textarea = null;
    }

    if (this.changeHandler != null) {
      this.graph.getModel().removeListener(this.changeHandler);
      this.changeHandler = null;
    }

    if (this.zoomHandler) {
      this.graph.view.removeListener(this.zoomHandler);
      this.zoomHandler = null;
    }
  }
}
