import { mxObjectCodec } from '@mxgraph/io/mxObjectCodec';
import { mxStyleRegistry } from '@mxgraph/view/mxStyleRegistry';
import { mxGraphView } from '@mxgraph/view/mxGraphView';

export class mxGraphViewCodec extends mxObjectCodec {
  constructor() {
    super(new mxGraphView());
  }

  encode(enc, view) {
    return this.encodeCell(enc, view, view.graph.getModel().getRoot());
  }

  encodeCell(enc, view, cell) {
    var model = view.graph.getModel();
    var state = view.getState(cell);
    var parent = model.getParent(cell);

    if (parent == null || state != null) {
      var childCount = model.getChildCount(cell);
      var geo = view.graph.getCellGeometry(cell);
      var name = null;

      if (parent == model.getRoot()) {
        name = 'layer';
      } else if (parent == null) {
        name = 'graph';
      } else if (model.isEdge(cell)) {
        name = 'edge';
      } else if (childCount > 0 && geo != null) {
        name = 'group';
      } else if (model.isVertex(cell)) {
        name = 'vertex';
      }

      if (name != null) {
        var node = enc.document.createElement(name);
        var lab = view.graph.getLabel(cell);

        if (lab != null) {
          node.setAttribute('label', view.graph.getLabel(cell));

          if (view.graph.isHtmlLabel(cell)) {
            node.setAttribute('html', true);
          }
        }

        if (parent == null) {
          var bounds = view.getGraphBounds();

          if (bounds != null) {
            node.setAttribute('x', Math.round(bounds.x));
            node.setAttribute('y', Math.round(bounds.y));
            node.setAttribute('width', Math.round(bounds.width));
            node.setAttribute('height', Math.round(bounds.height));
          }

          node.setAttribute('scale', view.scale);
        } else if (state != null && geo != null) {
          for (var i in state.style) {
            var value = state.style[i];

            if (typeof value == 'function' && typeof value == 'object') {
              value = mxStyleRegistry.getName(value);
            }

            if (value != null && typeof value != 'function' && typeof value != 'object') {
              node.setAttribute(i, value);
            }
          }

          var abs = state.absolutePoints;

          if (abs != null && abs.length > 0) {
            var pts = Math.round(abs[0].x) + ',' + Math.round(abs[0].y);

            for (var i = 1; i < abs.length; i++) {
              pts += ' ' + Math.round(abs[i].x) + ',' + Math.round(abs[i].y);
            }

            node.setAttribute('points', pts);
          } else {
            node.setAttribute('x', Math.round(state.x));
            node.setAttribute('y', Math.round(state.y));
            node.setAttribute('width', Math.round(state.width));
            node.setAttribute('height', Math.round(state.height));
          }

          var offset = state.absoluteOffset;

          if (offset != null) {
            if (offset.x != 0) {
              node.setAttribute('dx', Math.round(offset.x));
            }

            if (offset.y != 0) {
              node.setAttribute('dy', Math.round(offset.y));
            }
          }
        }

        for (var i = 0; i < childCount; i++) {
          var childNode = this.encodeCell(enc, view, model.getChildAt(cell, i));

          if (childNode != null) {
            node.appendChild(childNode);
          }
        }
      }
    }

    return node;
  }
}
