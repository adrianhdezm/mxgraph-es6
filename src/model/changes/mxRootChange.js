export class mxRootChange {
  constructor(model, root) {
    this.model = model;
    this.root = root;
    this.previous = root;
  }

  execute() {
    this.root = this.previous;
    this.previous = this.model.rootChanged(this.previous);
  }
}
