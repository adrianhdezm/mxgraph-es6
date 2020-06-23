import { mxHierarchicalLayoutStage } from '@mxgraph/layout/hierarchical/stage/mxHierarchicalLayoutStage';
import { mxCellPath } from '@mxgraph/model/mxCellPath';
import { mxUtils } from '@mxgraph/util/mxUtils';
export class mxSwimlaneOrdering extends mxHierarchicalLayoutStage {
  constructor(layout) {
    super();
    this.layout = layout;
  }

  execute(parent) {
    var model = this.layout.getModel();
    var seenNodes = new Object();
    var unseenNodes = mxUtils.clone(model.vertexMapper, null, true);
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
        var isAncestor = parent != null && parent.swimlaneIndex == node.swimlaneIndex && node.isAncestor(parent);
        var reversedOverSwimlane =
          parent != null &&
          connectingEdge != null &&
          parent.swimlaneIndex < node.swimlaneIndex &&
          connectingEdge.source == node;

        if (isAncestor) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsSource);
          node.connectsAsSource.push(connectingEdge);
          parent.connectsAsTarget.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsTarget);
        } else if (reversedOverSwimlane) {
          connectingEdge.invert();
          mxUtils.remove(connectingEdge, parent.connectsAsTarget);
          node.connectsAsTarget.push(connectingEdge);
          parent.connectsAsSource.push(connectingEdge);
          mxUtils.remove(connectingEdge, node.connectsAsSource);
        }

        var cellId = mxCellPath.create(node.cell);
        seenNodes[cellId] = node;
        delete unseenNodes[cellId];
      },
      rootsArray,
      true,
      null
    );
  }
}
