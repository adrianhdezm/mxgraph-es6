export class MedianCellSorter {
  medianValue = 0;
  cell = false;

  constructor() {}

  static compare(a, b) {
    if (a != null && b != null) {
      if (b.medianValue > a.medianValue) {
        return -1;
      } else if (b.medianValue < a.medianValue) {
        return 1;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }
}
