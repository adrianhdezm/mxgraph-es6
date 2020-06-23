export class mxStencilRegistry {
  static stencils = {};

  static addStencil(name, stencil) {
    mxStencilRegistry.stencils[name] = stencil;
  }

  static getStencil(name) {
    return mxStencilRegistry.stencils[name];
  }
}
