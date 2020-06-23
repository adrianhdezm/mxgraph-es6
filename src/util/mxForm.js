import { mxClient } from '@mxgraph/mxClient';
import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxResources } from '@mxgraph/util/mxResources';
import { mxUtils } from '@mxgraph/util/mxUtils';

export class mxForm {
  constructor(className) {
    this.table = document.createElement('table');
    this.table.className = className;
    this.body = document.createElement('tbody');
    this.table.appendChild(this.body);
  }

  getTable() {
    return this.table;
  }

  addButtons(okFunct, cancelFunct) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    tr.appendChild(td);
    td = document.createElement('td');
    var button = document.createElement('button');
    mxUtils.write(button, mxResources.get('ok') || 'OK');
    td.appendChild(button);
    mxEvent.addListener(button, 'click', function () {
      okFunct();
    });
    button = document.createElement('button');
    mxUtils.write(button, mxResources.get('cancel') || 'Cancel');
    td.appendChild(button);
    mxEvent.addListener(button, 'click', function () {
      cancelFunct();
    });
    tr.appendChild(td);
    this.body.appendChild(tr);
  }

  addText(name, value, type) {
    var input = document.createElement('input');
    input.setAttribute('type', type || 'text');
    input.value = value;
    return this.addField(name, input);
  }

  addCheckbox(name, value) {
    var input = document.createElement('input');
    input.setAttribute('type', 'checkbox');
    this.addField(name, input);

    if (value) {
      input.checked = true;
    }

    return input;
  }

  addTextarea(name, value, rows) {
    var input = document.createElement('textarea');

    if (mxClient.IS_NS) {
      rows--;
    }

    input.setAttribute('rows', rows || 2);
    input.value = value;
    return this.addField(name, input);
  }

  addCombo(name, isMultiSelect, size) {
    var select = document.createElement('select');

    if (size != null) {
      select.setAttribute('size', size);
    }

    if (isMultiSelect) {
      select.setAttribute('multiple', 'true');
    }

    return this.addField(name, select);
  }

  addOption(combo, label, value, isSelected) {
    var option = document.createElement('option');
    mxUtils.writeln(option, label);
    option.setAttribute('value', value);

    if (isSelected) {
      option.setAttribute('selected', isSelected);
    }

    combo.appendChild(option);
  }

  addField(name, input) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    mxUtils.write(td, name);
    tr.appendChild(td);
    td = document.createElement('td');
    td.appendChild(input);
    tr.appendChild(td);
    this.body.appendChild(tr);
    return input;
  }
}
