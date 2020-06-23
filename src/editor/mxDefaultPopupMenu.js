import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxResources } from '@mxgraph/util/mxResources';

export class mxDefaultPopupMenu {
  imageBasePath = null;

  constructor(config) {
    this.config = config;
  }

  createMenu(editor, menu, cell, evt) {
    if (this.config != null) {
      var conditions = this.createConditions(editor, cell, evt);
      var item = this.config.firstChild;
      this.addItems(editor, menu, cell, evt, conditions, item, null);
    }
  }

  addItems(editor, menu, cell, evt, conditions, item, parent) {
    var addSeparator = false;

    while (item != null) {
      if (item.nodeName == 'add') {
        var condition = item.getAttribute('if');

        if (condition == null || conditions[condition]) {
          var as = item.getAttribute('as');
          as = mxResources.get(as) || as;
          var funct = mxUtils.eval(mxUtils.getTextContent(item));
          var action = item.getAttribute('action');
          var icon = item.getAttribute('icon');
          var iconCls = item.getAttribute('iconCls');
          var enabledCond = item.getAttribute('enabled-if');
          var enabled = enabledCond == null || conditions[enabledCond];

          if (addSeparator) {
            menu.addSeparator(parent);
            addSeparator = false;
          }

          if (icon != null && this.imageBasePath) {
            icon = this.imageBasePath + icon;
          }

          var row = this.addAction(menu, editor, as, icon, funct, action, cell, parent, iconCls, enabled);
          this.addItems(editor, menu, cell, evt, conditions, item.firstChild, row);
        }
      } else if (item.nodeName == 'separator') {
        addSeparator = true;
      }

      item = item.nextSibling;
    }
  }

  addAction(menu, editor, lab, icon, funct, action, cell, parent, iconCls, enabled) {
    var clickHandler = function (evt) {
      if (typeof funct == 'function') {
        funct.call(editor, editor, cell, evt);
      }

      if (action != null) {
        editor.execute(action, cell, evt);
      }
    };

    return menu.addItem(lab, icon, clickHandler, parent, iconCls, enabled);
  }

  createConditions(editor, cell, evt) {
    var model = editor.graph.getModel();
    var childCount = model.getChildCount(cell);
    var conditions = [];
    conditions['nocell'] = cell == null;
    conditions['ncells'] = editor.graph.getSelectionCount() > 1;
    conditions['notRoot'] = model.getRoot() != model.getParent(editor.graph.getDefaultParent());
    conditions['cell'] = cell != null;
    var isCell = cell != null && editor.graph.getSelectionCount() == 1;
    conditions['nonEmpty'] = isCell && childCount > 0;
    conditions['expandable'] = isCell && editor.graph.isCellFoldable(cell, false);
    conditions['collapsable'] = isCell && editor.graph.isCellFoldable(cell, true);
    conditions['validRoot'] = isCell && editor.graph.isValidRoot(cell);
    conditions['emptyValidRoot'] = conditions['validRoot'] && childCount == 0;
    conditions['swimlane'] = isCell && editor.graph.isSwimlane(cell);
    var condNodes = this.config.getElementsByTagName('condition');

    for (var i = 0; i < condNodes.length; i++) {
      var funct = mxUtils.eval(mxUtils.getTextContent(condNodes[i]));
      var name = condNodes[i].getAttribute('name');

      if (name != null && typeof funct == 'function') {
        conditions[name] = funct(editor, cell, evt);
      }
    }

    return conditions;
  }
}
