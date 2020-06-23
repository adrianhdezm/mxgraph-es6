export class mxGraphAbstractHierarchyCell {
  maxRank = -1;
  minRank = -1;
  width = 0;
  height = 0;
  nextLayerConnectedCells = null;
  previousLayerConnectedCells = null;

  constructor() {
    this.x = [];
    this.y = [];
    this.temp = [];
  }

  getNextLayerConnectedCells(layer) {
    return null;
  }

  getPreviousLayerConnectedCells(layer) {
    return null;
  }

  isEdge() {
    return false;
  }

  isVertex() {
    return false;
  }

  getGeneralPurposeVariable(layer) {
    return null;
  }

  setGeneralPurposeVariable(layer, value) {
    return null;
  }

  setX(layer, value) {
    if (this.isVertex()) {
      this.x[0] = value;
    } else if (this.isEdge()) {
      this.x[layer - this.minRank - 1] = value;
    }
  }

  getX(layer) {
    if (this.isVertex()) {
      return this.x[0];
    } else if (this.isEdge()) {
      return this.x[layer - this.minRank - 1];
    }

    return 0.0;
  }

  setY(layer, value) {
    if (this.isVertex()) {
      this.y[0] = value;
    } else if (this.isEdge()) {
      this.y[layer - this.minRank - 1] = value;
    }
  }
}
