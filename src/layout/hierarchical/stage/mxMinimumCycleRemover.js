import { mxHierarchicalLayoutStage } from '@mxgraph/layout/hierarchical/stage/mxHierarchicalLayoutStage';
import { mxUtils } from '@mxgraph/util/mxUtils';
export class mxMinimumCycleRemover extends mxHierarchicalLayoutStage {
  constructor(layout) {
    super();
    this.layout = layout;
  }

  execute(parent) {
    var model = this.layout.getModel();
    var seenNodes = new Object();
    var unseenNodesArray = model.vertexMapper.getValues();
    var unseenNodes = new Object();

    for (var i = 0; i < unseenNodesArray.length; i++) {
      unseenNodes[unseenNodesArray[i].id] = unseenNodesArray[i];
    }

    var rootsArray = null;

    if (model.roots != null) {
      var modelRoots = model.roots;
      rootsArray = [];

      for (var i = 0; i < modelRoots.length; i++) {
        rootsArray[i] = model.vertexMapper.get(modelRoots[i]);
      }
    }

    model.visit(
      function (parent, node, connectingEdge, layer, seen) {
        if (node.isAncestor(parent)) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsSource);
          parent.connectsAsTarget.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsTarget);
          node.connectsAsSource.push(connectingEdge);
        }

        seenNodes[node.id] = node;
        delete unseenNodes[node.id];
      },
      rootsArray,
      true,
      null
    );
    var seenNodesCopy = mxUtils.clone(seenNodes, null, true);
    model.visit(
      function (parent, node, connectingEdge, layer, seen) {
        if (node.isAncestor(parent)) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsSource);
          node.connectsAsSource.push(connectingEdge);
          parent.connectsAsTarget.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsTarget);
        }

        seenNodes[node.id] = node;
        delete unseenNodes[node.id];
      },
      unseenNodes,
      true,
      seenNodesCopy
    );
  }
}
