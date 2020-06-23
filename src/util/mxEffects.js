import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxStyleChange } from '@mxgraph/model/changes/mxStyleChange';
import { mxChildChange } from '@mxgraph/model/changes/mxChildChange';
import { mxValueChange } from '@mxgraph/model/changes/mxValueChange';
import { mxTerminalChange } from '@mxgraph/model/changes/mxTerminalChange';
import { mxGeometryChange } from '@mxgraph/model/changes/mxGeometryChange';

export class mxEffects {
  static animateChanges(graph, changes, done) {
    var maxStep = 10;
    var step = 0;

    var animate = function () {
      var isRequired = false;

      for (var i = 0; i < changes.length; i++) {
        var change = changes[i];

        if (
          change instanceof mxGeometryChange ||
          change instanceof mxTerminalChange ||
          change instanceof mxValueChange ||
          change instanceof mxChildChange ||
          change instanceof mxStyleChange
        ) {
          var state = graph.getView().getState(change.cell || change.child, false);

          if (state != null) {
            isRequired = true;

            if (change.constructor != mxGeometryChange || graph.model.isEdge(change.cell)) {
              mxUtils.setOpacity(state.shape.node, (100 * step) / maxStep);
            } else {
              var scale = graph.getView().scale;
              var dx = (change.geometry.x - change.previous.x) * scale;
              var dy = (change.geometry.y - change.previous.y) * scale;
              var sx = (change.geometry.width - change.previous.width) * scale;
              var sy = (change.geometry.height - change.previous.height) * scale;

              if (step == 0) {
                state.x -= dx;
                state.y -= dy;
                state.width -= sx;
                state.height -= sy;
              } else {
                state.x += dx / maxStep;
                state.y += dy / maxStep;
                state.width += sx / maxStep;
                state.height += sy / maxStep;
              }

              graph.cellRenderer.redraw(state);
              mxEffects.cascadeOpacity(graph, change.cell, (100 * step) / maxStep);
            }
          }
        }
      }

      if (step < maxStep && isRequired) {
        step++;
        window.setTimeout(animate, delay);
      } else if (done != null) {
        done();
      }
    };

    var delay = 30;
    animate();
  }

  static cascadeOpacity(graph, cell, opacity) {
    var childCount = graph.model.getChildCount(cell);

    for (var i = 0; i < childCount; i++) {
      var child = graph.model.getChildAt(cell, i);
      var childState = graph.getView().getState(child);

      if (childState != null) {
        mxUtils.setOpacity(childState.shape.node, opacity);
        mxEffects.cascadeOpacity(graph, child, opacity);
      }
    }

    var edges = graph.model.getEdges(cell);

    if (edges != null) {
      for (var i = 0; i < edges.length; i++) {
        var edgeState = graph.getView().getState(edges[i]);

        if (edgeState != null) {
          mxUtils.setOpacity(edgeState.shape.node, opacity);
        }
      }
    }
  }

  static fadeOut(node, from, remove, step, delay, isEnabled) {
    step = step || 40;
    delay = delay || 30;
    var opacity = from || 100;
    mxUtils.setOpacity(node, opacity);

    if (isEnabled || isEnabled == null) {
      var f = function () {
        opacity = Math.max(opacity - step, 0);
        mxUtils.setOpacity(node, opacity);

        if (opacity > 0) {
          window.setTimeout(f, delay);
        } else {
          node.style.visibility = 'hidden';

          if (remove && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        }
      };

      window.setTimeout(f, delay);
    } else {
      node.style.visibility = 'hidden';

      if (remove && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    }
  }
}
