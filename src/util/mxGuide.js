import { mxPoint } from '@mxgraph/util/mxPoint';
import { mxConstants } from '@mxgraph/util/mxConstants';
import { mxPolyline } from '@mxgraph/shape/mxPolyline';

export class mxGuide {
  states = null;
  horizontal = true;
  vertical = true;
  guideX = null;
  guideY = null;
  rounded = false;
  tolerance = 2;

  constructor(graph, states) {
    this.graph = graph;
    this.setStates(states);
  }

  setStates(states) {
    this.states = states;
  }

  isEnabledForEvent(evt) {
    return true;
  }

  getGuideTolerance(gridEnabled) {
    return gridEnabled && this.graph.gridEnabled ? this.graph.gridSize / 2 : this.tolerance;
  }

  createGuideShape(horizontal) {
    var guide = new mxPolyline([], mxConstants.GUIDE_COLOR, mxConstants.GUIDE_STROKEWIDTH);
    guide.isDashed = true;
    return guide;
  }

  isStateIgnored(state) {
    return false;
  }

  move(bounds, delta, gridEnabled, clone) {
    if (this.states != null && (this.horizontal || this.vertical) && bounds != null && delta != null) {
      var scale = this.graph.getView().scale;
      var tt = this.getGuideTolerance(gridEnabled) * scale;
      var b = bounds.clone();
      b.x += delta.x;
      b.y += delta.y;
      var overrideX = false;
      var stateX = null;
      var valueX = null;
      var overrideY = false;
      var stateY = null;
      var valueY = null;
      var ttX = tt;
      var ttY = tt;
      var left = b.x;
      var right = b.x + b.width;
      var center = b.getCenterX();
      var top = b.y;
      var bottom = b.y + b.height;
      var middle = b.getCenterY();

      function snapX(x, state, centerAlign) {
        var override = false;

        if (centerAlign && Math.abs(x - center) < ttX) {
          delta.x = x - bounds.getCenterX();
          ttX = Math.abs(x - center);
          override = true;
        } else if (!centerAlign) {
          if (Math.abs(x - left) < ttX) {
            delta.x = x - bounds.x;
            ttX = Math.abs(x - left);
            override = true;
          } else if (Math.abs(x - right) < ttX) {
            delta.x = x - bounds.x - bounds.width;
            ttX = Math.abs(x - right);
            override = true;
          }
        }

        if (override) {
          stateX = state;
          valueX = x;

          if (this.guideX == null) {
            this.guideX = this.createGuideShape(true);
            this.guideX.dialect =
              this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.guideX.pointerEvents = false;
            this.guideX.init(this.graph.getView().getOverlayPane());
          }
        }

        overrideX = overrideX || override;
      }

      function snapY(y, state, centerAlign) {
        var override = false;

        if (centerAlign && Math.abs(y - middle) < ttY) {
          delta.y = y - bounds.getCenterY();
          ttY = Math.abs(y - middle);
          override = true;
        } else if (!centerAlign) {
          if (Math.abs(y - top) < ttY) {
            delta.y = y - bounds.y;
            ttY = Math.abs(y - top);
            override = true;
          } else if (Math.abs(y - bottom) < ttY) {
            delta.y = y - bounds.y - bounds.height;
            ttY = Math.abs(y - bottom);
            override = true;
          }
        }

        if (override) {
          stateY = state;
          valueY = y;

          if (this.guideY == null) {
            this.guideY = this.createGuideShape(false);
            this.guideY.dialect =
              this.graph.dialect != mxConstants.DIALECT_SVG ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.guideY.pointerEvents = false;
            this.guideY.init(this.graph.getView().getOverlayPane());
          }
        }

        overrideY = overrideY || override;
      }

      for (var i = 0; i < this.states.length; i++) {
        var state = this.states[i];

        if (state != null && !this.isStateIgnored(state)) {
          if (this.horizontal) {
            snapX.call(this, state.getCenterX(), state, true);
            snapX.call(this, state.x, state, false);
            snapX.call(this, state.x + state.width, state, false);

            if (state.cell == null) {
              snapX.call(this, state.getCenterX(), state, false);
            }
          }

          if (this.vertical) {
            snapY.call(this, state.getCenterY(), state, true);
            snapY.call(this, state.y, state, false);
            snapY.call(this, state.y + state.height, state, false);

            if (state.cell == null) {
              snapY.call(this, state.getCenterY(), state, false);
            }
          }
        }
      }

      this.graph.snapDelta(delta, bounds, !gridEnabled, overrideX, overrideY);
      delta = this.getDelta(bounds, stateX, delta.x, stateY, delta.y);
      var c = this.graph.container;

      if (!overrideX && this.guideX != null) {
        this.guideX.node.style.visibility = 'hidden';
      } else if (this.guideX != null) {
        var minY = null;
        var maxY = null;

        if (stateX != null && bounds != null) {
          minY = Math.min(bounds.y + delta.y - this.graph.panDy, stateX.y);
          maxY = Math.max(bounds.y + bounds.height + delta.y - this.graph.panDy, stateX.y + stateX.height);
        }

        if (minY != null && maxY != null) {
          this.guideX.points = [new mxPoint(valueX, minY), new mxPoint(valueX, maxY)];
        } else {
          this.guideX.points = [
            new mxPoint(valueX, -this.graph.panDy),
            new mxPoint(valueX, c.scrollHeight - 3 - this.graph.panDy)
          ];
        }

        this.guideX.stroke = this.getGuideColor(stateX, true);
        this.guideX.node.style.visibility = 'visible';
        this.guideX.redraw();
      }

      if (!overrideY && this.guideY != null) {
        this.guideY.node.style.visibility = 'hidden';
      } else if (this.guideY != null) {
        var minX = null;
        var maxX = null;

        if (stateY != null && bounds != null) {
          minX = Math.min(bounds.x + delta.x - this.graph.panDx, stateY.x);
          maxX = Math.max(bounds.x + bounds.width + delta.x - this.graph.panDx, stateY.x + stateY.width);
        }

        if (minX != null && maxX != null) {
          this.guideY.points = [new mxPoint(minX, valueY), new mxPoint(maxX, valueY)];
        } else {
          this.guideY.points = [
            new mxPoint(-this.graph.panDx, valueY),
            new mxPoint(c.scrollWidth - 3 - this.graph.panDx, valueY)
          ];
        }

        this.guideY.stroke = this.getGuideColor(stateY, false);
        this.guideY.node.style.visibility = 'visible';
        this.guideY.redraw();
      }
    }

    return delta;
  }

  getDelta(bounds, stateX, dx, stateY, dy) {
    var s = this.graph.view.scale;

    if (this.rounded || (stateX != null && stateX.cell == null)) {
      dx = Math.round((bounds.x + dx) / s) * s - bounds.x;
    }

    if (this.rounded || (stateY != null && stateY.cell == null)) {
      dy = Math.round((bounds.y + dy) / s) * s - bounds.y;
    }

    return new mxPoint(dx, dy);
  }

  getGuideColor(state, horizontal) {
    return mxConstants.GUIDE_COLOR;
  }

  hide() {
    this.setVisible(false);
  }

  setVisible(visible) {
    if (this.guideX != null) {
      this.guideX.node.style.visibility = visible ? 'visible' : 'hidden';
    }

    if (this.guideY != null) {
      this.guideY.node.style.visibility = visible ? 'visible' : 'hidden';
    }
  }

  destroy() {
    if (this.guideX != null) {
      this.guideX.destroy();
      this.guideX = null;
    }

    if (this.guideY != null) {
      this.guideY.destroy();
      this.guideY = null;
    }
  }
}
