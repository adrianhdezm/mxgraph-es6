import { mxGraphAbstractHierarchyCell } from '@mxgraph/layout/hierarchical/model/mxGraphAbstractHierarchyCell';
import { mxObjectIdentity } from '@mxgraph/util/mxObjectIdentity';

export class mxGraphHierarchyNode extends mxGraphAbstractHierarchyCell {
  hashCode = false;

  constructor(cell) {
    super(cell);
    this.cell = cell;
    this.id = mxObjectIdentity.get(cell);
    this.connectsAsTarget = [];
    this.connectsAsSource = [];
  }

  getRankValue(layer) {
    return this.maxRank;
  }

  getNextLayerConnectedCells(layer) {
    if (this.nextLayerConnectedCells == null) {
      this.nextLayerConnectedCells = [];
      this.nextLayerConnectedCells[0] = [];

      for (var i = 0; i < this.connectsAsTarget.length; i++) {
        var edge = this.connectsAsTarget[i];

        if (edge.maxRank == -1 || edge.maxRank == layer + 1) {
          this.nextLayerConnectedCells[0].push(edge.source);
        } else {
          this.nextLayerConnectedCells[0].push(edge);
        }
      }
    }

    return this.nextLayerConnectedCells[0];
  }

  getPreviousLayerConnectedCells(layer) {
    if (this.previousLayerConnectedCells == null) {
      this.previousLayerConnectedCells = [];
      this.previousLayerConnectedCells[0] = [];

      for (var i = 0; i < this.connectsAsSource.length; i++) {
        var edge = this.connectsAsSource[i];

        if (edge.minRank == -1 || edge.minRank == layer - 1) {
          this.previousLayerConnectedCells[0].push(edge.target);
        } else {
          this.previousLayerConnectedCells[0].push(edge);
        }
      }
    }

    return this.previousLayerConnectedCells[0];
  }

  isVertex() {
    return true;
  }

  getGeneralPurposeVariable(layer) {
    return this.temp[0];
  }

  setGeneralPurposeVariable(layer, value) {
    this.temp[0] = value;
  }

  isAncestor(otherNode) {
    if (
      otherNode != null &&
      this.hashCode != null &&
      otherNode.hashCode != null &&
      this.hashCode.length < otherNode.hashCode.length
    ) {
      if (this.hashCode == otherNode.hashCode) {
        return true;
      }

      if (this.hashCode == null || this.hashCode == null) {
        return false;
      }

      for (var i = 0; i < this.hashCode.length; i++) {
        if (this.hashCode[i] != otherNode.hashCode[i]) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  getCoreCell() {
    return this.cell;
  }
}
