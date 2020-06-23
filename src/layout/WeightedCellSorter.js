export class WeightedCellSorter {
  nudge = false;
  visited = false;
  rankIndex = null;

  constructor(cell, weightedValue) {
    this.cell = cell;
    this.weightedValue = weightedValue;
  }

  static compare(a, b) {
    if (a != null && b != null) {
      if (b.weightedValue > a.weightedValue) {
        return -1;
      } else if (b.weightedValue < a.weightedValue) {
        return 1;
      } else {
        if (b.nudge) {
          return -1;
        } else {
          return 1;
        }
      }
    } else {
      return 0;
    }
  }
}
