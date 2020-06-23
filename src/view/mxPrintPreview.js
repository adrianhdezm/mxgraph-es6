import { mxTemporaryCellStates } from '@mxgraph/view/mxTemporaryCellStates';
import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxClient } from '@mxgraph/mxClient';
import { mxRectangle } from '@mxgraph/util/mxRectangle';

export class mxPrintPreview {
  marginTop = 0;
  marginBottom = 0;
  autoOrigin = true;
  printOverlays = false;
  printControls = false;
  printBackgroundImage = false;
  backgroundColor = '#ffffff';
  wnd = null;
  targetWindow = null;
  pageCount = 0;
  clipping = true;

  constructor(graph, scale, pageFormat, border, x0, y0, borderColor, title, pageSelector) {
    this.graph = graph;
    this.scale = scale != null ? scale : 1 / graph.pageScale;
    this.border = border != null ? border : 0;
    this.pageFormat = mxRectangle.fromRectangle(pageFormat != null ? pageFormat : graph.pageFormat);
    this.title = title != null ? title : 'Printer-friendly version';
    this.x0 = x0 != null ? x0 : 0;
    this.y0 = y0 != null ? y0 : 0;
    this.borderColor = borderColor;
    this.pageSelector = pageSelector != null ? pageSelector : true;
  }

  getWindow() {
    return this.wnd;
  }

  getDoctype() {
    var dt = '';

    if (document.documentMode == 5) {
      dt = '<meta http-equiv="X-UA-Compatible" content="IE=5">';
    } else if (document.documentMode == 8) {
      dt = '<meta http-equiv="X-UA-Compatible" content="IE=8">';
    } else if (document.documentMode > 8) {
      dt = '<!--[if IE]><meta http-equiv="X-UA-Compatible" content="IE=edge"><![endif]-->';
    }

    return dt;
  }

  appendGraph(graph, scale, x0, y0, forcePageBreaks, keepOpen) {
    this.graph = graph;
    this.scale = scale != null ? scale : 1 / graph.pageScale;
    this.x0 = x0;
    this.y0 = y0;
    this.open(null, null, forcePageBreaks, keepOpen);
  }

  open(css, targetWindow, forcePageBreaks, keepOpen) {
    var previousInitializeOverlay = this.graph.cellRenderer.initializeOverlay;
    var div = null;

    try {
      if (this.printOverlays) {
        this.graph.cellRenderer.initializeOverlay = function (state, overlay) {
          overlay.init(state.view.getDrawPane());
        };
      }

      if (this.printControls) {
        this.graph.cellRenderer.initControl = function (state, control, handleEvents, clickHandler) {
          control.dialect = state.view.graph.dialect;
          control.init(state.view.getDrawPane());
        };
      }

      this.wnd = targetWindow != null ? targetWindow : this.wnd;
      var isNewWindow = false;

      if (this.wnd == null) {
        isNewWindow = true;
        this.wnd = window.open();
      }

      var doc = this.wnd.document;

      if (isNewWindow) {
        var dt = this.getDoctype();

        if (dt != null && dt.length > 0) {
          doc.writeln(dt);
        }

        if (document.compatMode === 'CSS1Compat') {
          doc.writeln('<!DOCTYPE html>');
        }

        doc.writeln('<html>');
        doc.writeln('<head>');
        this.writeHead(doc, css);
        doc.writeln('</head>');
        doc.writeln('<body class="mxPage">');
      }

      var bounds = this.graph.getGraphBounds().clone();
      var currentScale = this.graph.getView().getScale();
      var sc = currentScale / this.scale;
      var tr = this.graph.getView().getTranslate();

      if (!this.autoOrigin) {
        this.x0 -= tr.x * this.scale;
        this.y0 -= tr.y * this.scale;
        bounds.width += bounds.x;
        bounds.height += bounds.y;
        bounds.x = 0;
        bounds.y = 0;
        this.border = 0;
      }

      var availableWidth = this.pageFormat.width - this.border * 2;
      var availableHeight = this.pageFormat.height - this.border * 2;
      this.pageFormat.height += this.marginTop + this.marginBottom;
      bounds.width /= sc;
      bounds.height /= sc;
      var hpages = Math.max(1, Math.ceil((bounds.width + this.x0) / availableWidth));
      var vpages = Math.max(1, Math.ceil((bounds.height + this.y0) / availableHeight));
      this.pageCount = hpages * vpages;

      var writePageSelector = () => {
        if (this.pageSelector && (vpages > 1 || hpages > 1)) {
          var table = this.createPageSelector(vpages, hpages);
          doc.body.appendChild(table);
        }
      };

      var addPage = (div, addBreak) => {
        if (this.borderColor != null) {
          div.style.borderColor = this.borderColor;
          div.style.borderStyle = 'solid';
          div.style.borderWidth = '1px';
        }

        div.style.background = this.backgroundColor;

        if (forcePageBreaks || addBreak) {
          div.style.pageBreakAfter = 'always';
        }

        if (isNewWindow && (document.documentMode >= 11 || mxClient.IS_EDGE)) {
          doc.writeln(div.outerHTML);
          div.parentNode.removeChild(div);
        } else if (document.documentMode >= 11 || mxClient.IS_EDGE) {
          var clone = doc.createElement('div');
          clone.innerHTML = div.outerHTML;
          clone = clone.getElementsByTagName('div')[0];
          doc.body.appendChild(clone);
          div.parentNode.removeChild(div);
        } else {
          div.parentNode.removeChild(div);
          doc.body.appendChild(div);
        }

        if (forcePageBreaks || addBreak) {
          this.addPageBreak(doc);
        }
      };

      var cov = this.getCoverPages(this.pageFormat.width, this.pageFormat.height);

      if (cov != null) {
        for (var i = 0; i < cov.length; i++) {
          addPage(cov[i], true);
        }
      }

      var apx = this.getAppendices(this.pageFormat.width, this.pageFormat.height);

      for (var i = 0; i < vpages; i++) {
        var dy =
          (i * availableHeight) / this.scale - this.y0 / this.scale + (bounds.y - tr.y * currentScale) / currentScale;

        for (var j = 0; j < hpages; j++) {
          if (this.wnd == null) {
            return null;
          }

          var dx =
            (j * availableWidth) / this.scale - this.x0 / this.scale + (bounds.x - tr.x * currentScale) / currentScale;
          var pageNum = i * hpages + j + 1;
          var clip = new mxRectangle(dx, dy, availableWidth, availableHeight);
          div = this.renderPage(
            this.pageFormat.width,
            this.pageFormat.height,
            0,
            0,
            (div) => {
              this.addGraphFragment(-dx, -dy, this.scale, pageNum, div, clip);

              if (this.printBackgroundImage) {
                this.insertBackgroundImage(div, -dx, -dy);
              }
            },
            pageNum
          );
          div.setAttribute('id', 'mxPage-' + pageNum);
          addPage(div, apx != null || i < vpages - 1 || j < hpages - 1);
        }
      }

      if (apx != null) {
        for (var i = 0; i < apx.length; i++) {
          addPage(apx[i], i < apx.length - 1);
        }
      }

      if (isNewWindow && !keepOpen) {
        this.closeDocument();
        writePageSelector();
      }

      this.wnd.focus();
    } catch (e) {
      if (div != null && div.parentNode != null) {
        div.parentNode.removeChild(div);
      }
    } finally {
      this.graph.cellRenderer.initializeOverlay = previousInitializeOverlay;
    }

    return this.wnd;
  }

  addPageBreak(doc) {
    var hr = doc.createElement('hr');
    hr.className = 'mxPageBreak';
    doc.body.appendChild(hr);
  }

  closeDocument() {
    try {
      if (this.wnd != null && this.wnd.document != null) {
        var doc = this.wnd.document;
        this.writePostfix(doc);
        doc.writeln('</body>');
        doc.writeln('</html>');
        doc.close();
        mxEvent.release(doc.body);
      }
    } catch (e) {
      /* ignore */
    }
  }

  writeHead(doc, css) {
    if (this.title != null) {
      doc.writeln('<title>' + this.title + '</title>');
    }

    mxClient.link('stylesheet', mxClient.basePath + '/css/common.css', doc);
    doc.writeln('<style type="text/css">');
    doc.writeln('@media print {');
    doc.writeln('  * { -webkit-print-color-adjust: exact; }');
    doc.writeln('  table.mxPageSelector { display: none; }');
    doc.writeln('  hr.mxPageBreak { display: none; }');
    doc.writeln('}');
    doc.writeln('@media screen {');
    doc.writeln(
      '  table.mxPageSelector { position: fixed; right: 10px; top: 10px;' +
        'font-family: Arial; font-size:10pt; border: solid 1px darkgray;' +
        'background: white; border-collapse:collapse; }'
    );
    doc.writeln('  table.mxPageSelector td { border: solid 1px gray; padding:4px; }');
    doc.writeln('  body.mxPage { background: gray; }');
    doc.writeln('}');

    if (css != null) {
      doc.writeln(css);
    }

    doc.writeln('</style>');
  }

  writePostfix(doc) {}

  createPageSelector(vpages, hpages) {
    var doc = this.wnd.document;
    var table = doc.createElement('table');
    table.className = 'mxPageSelector';
    table.setAttribute('border', '0');
    var tbody = doc.createElement('tbody');

    for (var i = 0; i < vpages; i++) {
      var row = doc.createElement('tr');

      for (var j = 0; j < hpages; j++) {
        var pageNum = i * hpages + j + 1;
        var cell = doc.createElement('td');
        var a = doc.createElement('a');
        a.setAttribute('href', '#mxPage-' + pageNum);

        if (mxClient.IS_NS && !mxClient.IS_SF && !mxClient.IS_GC) {
          var js =
            "var page = document.getElementById('mxPage-" +
            pageNum +
            "');page.scrollIntoView(true);event.preventDefault();";
          a.setAttribute('onclick', js);
        }

        mxUtils.write(a, pageNum, doc);
        cell.appendChild(a);
        row.appendChild(cell);
      }

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    return table;
  }

  renderPage(w, h, dx, dy, content, pageNumber) {
    var doc = this.wnd.document;
    var div = document.createElement('div');
    var arg = null;

    try {
      if (dx != 0 || dy != 0) {
        div.style.position = 'relative';
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        div.style.pageBreakInside = 'avoid';
        var innerDiv = document.createElement('div');
        innerDiv.style.position = 'relative';
        innerDiv.style.top = this.border + 'px';
        innerDiv.style.left = this.border + 'px';
        innerDiv.style.width = w - 2 * this.border + 'px';
        innerDiv.style.height = h - 2 * this.border + 'px';
        innerDiv.style.overflow = 'hidden';
        var viewport = document.createElement('div');
        viewport.style.position = 'relative';
        viewport.style.marginLeft = dx + 'px';
        viewport.style.marginTop = dy + 'px';

        if (doc.documentMode == 8) {
          innerDiv.style.position = 'absolute';
          viewport.style.position = 'absolute';
        }

        if (doc.documentMode == 10) {
          viewport.style.width = '100%';
          viewport.style.height = '100%';
        }

        innerDiv.appendChild(viewport);
        div.appendChild(innerDiv);
        document.body.appendChild(div);
        arg = viewport;
      } else {
        div.style.width = w + 'px';
        div.style.height = h + 'px';
        div.style.overflow = 'hidden';
        div.style.pageBreakInside = 'avoid';

        if (doc.documentMode == 8) {
          div.style.position = 'relative';
        }

        var innerDiv = document.createElement('div');
        innerDiv.style.width = w - 2 * this.border + 'px';
        innerDiv.style.height = h - 2 * this.border + 'px';
        innerDiv.style.overflow = 'hidden';
        innerDiv.style.top = this.border + 'px';
        innerDiv.style.left = this.border + 'px';

        if (this.graph.dialect == mxConstants.DIALECT_VML) {
          innerDiv.style.position = 'absolute';
        }

        div.appendChild(innerDiv);
        document.body.appendChild(div);
        arg = innerDiv;
      }
    } catch (e) {
      div.parentNode.removeChild(div);
      div = null;
      throw e;
    }

    content(arg);
    return div;
  }

  getRoot() {
    var root = this.graph.view.currentRoot;

    if (root == null) {
      root = this.graph.getModel().getRoot();
    }

    return root;
  }

  addGraphFragment(dx, dy, scale, pageNumber, div, clip) {
    var view = this.graph.getView();
    var previousContainer = this.graph.container;
    this.graph.container = div;
    var canvas = view.getCanvas();
    var backgroundPane = view.getBackgroundPane();
    var drawPane = view.getDrawPane();
    var overlayPane = view.getOverlayPane();
    var realScale = scale;

    if (this.graph.dialect == mxConstants.DIALECT_SVG) {
      view.createSvg();

      if (!mxClient.NO_FO) {
        var g = view.getDrawPane().parentNode;
        var prev = g.getAttribute('transform');
        g.setAttribute('transformOrigin', '0 0');
        g.setAttribute('transform', 'scale(' + scale + ',' + scale + ')' + 'translate(' + dx + ',' + dy + ')');
        scale = 1;
        dx = 0;
        dy = 0;
      }
    } else if (this.graph.dialect == mxConstants.DIALECT_VML) {
      view.createVml();
    } else {
      view.createHtml();
    }

    var eventsEnabled = view.isEventsEnabled();
    view.setEventsEnabled(false);
    var graphEnabled = this.graph.isEnabled();
    this.graph.setEnabled(false);
    var translate = view.getTranslate();
    view.translate = new mxPoint(dx, dy);
    var redraw = this.graph.cellRenderer.redraw;
    var states = view.states;
    var s = view.scale;

    if (this.clipping) {
      var tempClip = new mxRectangle(
        (clip.x + translate.x) * s,
        (clip.y + translate.y) * s,
        (clip.width * s) / realScale,
        (clip.height * s) / realScale
      );

      this.graph.cellRenderer.redraw = function (state, force, rendering) {
        if (state != null) {
          var orig = states.get(state.cell);

          if (orig != null) {
            var bbox = view.getBoundingBox(orig, false);

            if (bbox != null && bbox.width > 0 && bbox.height > 0 && !mxUtils.intersects(tempClip, bbox)) {
              return;
            }
          }
        }

        redraw.apply(this, arguments);
      };
    }

    var temp = null;

    try {
      var cells = [this.getRoot()];
      temp = new mxTemporaryCellStates(view, scale, cells, null, (state) => {
        return this.getLinkForCellState(state);
      });
    } finally {
      var tmp = div.firstChild;

      while (tmp != null) {
        var next = tmp.nextSibling;
        var name = tmp.nodeName.toLowerCase();

        if (name == 'svg') {
          tmp.style.overflow = 'hidden';
          tmp.style.position = 'relative';
          tmp.style.top = this.marginTop + 'px';
          tmp.setAttribute('width', clip.width);
          tmp.setAttribute('height', clip.height);
          tmp.style.width = '';
          tmp.style.height = '';
        } else if (tmp.style.cursor != 'default' && name != 'div') {
          tmp.parentNode.removeChild(tmp);
        }

        tmp = next;
      }

      if (this.printBackgroundImage) {
        var svgs = div.getElementsByTagName('svg');

        if (svgs.length > 0) {
          svgs[0].style.position = 'absolute';
        }
      }

      view.overlayPane.parentNode.removeChild(view.overlayPane);
      this.graph.setEnabled(graphEnabled);
      this.graph.container = previousContainer;
      this.graph.cellRenderer.redraw = redraw;
      view.canvas = canvas;
      view.backgroundPane = backgroundPane;
      view.drawPane = drawPane;
      view.overlayPane = overlayPane;
      view.translate = translate;
      temp.destroy();
      view.setEventsEnabled(eventsEnabled);
    }
  }

  getLinkForCellState(state) {
    return this.graph.getLinkForCell(state.cell);
  }

  insertBackgroundImage(div, dx, dy) {
    var bg = this.graph.backgroundImage;

    if (bg != null) {
      var img = document.createElement('img');
      img.style.position = 'absolute';
      img.style.marginLeft = Math.round(dx * this.scale) + 'px';
      img.style.marginTop = Math.round(dy * this.scale) + 'px';
      img.setAttribute('width', Math.round(this.scale * bg.width));
      img.setAttribute('height', Math.round(this.scale * bg.height));
      img.src = bg.src;
      div.insertBefore(img, div.firstChild);
    }
  }

  getCoverPages() {
    return null;
  }

  getAppendices() {
    return null;
  }

  print(css) {
    var wnd = this.open(css);

    if (wnd != null) {
      wnd.print();
    }
  }

  close() {
    if (this.wnd != null) {
      this.wnd.close();
      this.wnd = null;
    }
  }
}
