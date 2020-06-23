export class mxClipboard {
  static STEPSIZE = 10;
  static insertCount = 1;
  static cells = null;

  static setCells(cells) {
    mxClipboard.cells = cells;
  }

  static getCells() {
    return mxClipboard.cells;
  }

  static isEmpty() {
    return mxClipboard.getCells() == null;
  }

  static cut(graph, cells) {
    cells = mxClipboard.copy(graph, cells);
    mxClipboard.insertCount = 0;
    mxClipboard.removeCells(graph, cells);
    return cells;
  }

  static removeCells(graph, cells) {
    graph.removeCells(cells);
  }

  static copy(graph, cells) {
    cells = cells || graph.getSelectionCells();
    var result = graph.getExportableCells(graph.model.getTopmostCells(cells));
    mxClipboard.insertCount = 1;
    mxClipboard.setCells(graph.cloneCells(result));
    return result;
  }

  static paste(graph) {
    var cells = null;

    if (!mxClipboard.isEmpty()) {
      cells = graph.getImportableCells(mxClipboard.getCells());
      var delta = mxClipboard.insertCount * mxClipboard.STEPSIZE;
      var parent = graph.getDefaultParent();
      cells = graph.importCells(cells, delta, delta, parent);
      mxClipboard.insertCount++;
      graph.setSelectionCells(cells);
    }

    return cells;
  }
}
