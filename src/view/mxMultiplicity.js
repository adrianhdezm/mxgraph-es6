import { mxUtils } from '@mxgraph/util/mxUtils';
import { mxResources } from '@mxgraph/util/mxResources';

export class mxMultiplicity {
  constructor(source, type, attr, value, min, max, validNeighbors, countError, typeError, validNeighborsAllowed) {
    this.source = source;
    this.type = type;
    this.attr = attr;
    this.value = value;
    this.min = min != null ? min : 0;
    this.max = max != null ? max : 'n';
    this.validNeighbors = validNeighbors;
    this.countError = mxResources.get(countError) || countError;
    this.typeError = mxResources.get(typeError) || typeError;
    this.validNeighborsAllowed = validNeighborsAllowed != null ? validNeighborsAllowed : true;
  }

  check(graph, edge, source, target, sourceOut, targetIn) {
    var error = '';

    if (
      (this.source && this.checkTerminal(graph, source, edge)) ||
      (!this.source && this.checkTerminal(graph, target, edge))
    ) {
      if (
        this.countError != null &&
        ((this.source && (this.max == 0 || sourceOut >= this.max)) ||
          (!this.source && (this.max == 0 || targetIn >= this.max)))
      ) {
        error += this.countError + '\n';
      }

      if (this.validNeighbors != null && this.typeError != null && this.validNeighbors.length > 0) {
        var isValid = this.checkNeighbors(graph, edge, source, target);

        if (!isValid) {
          error += this.typeError + '\n';
        }
      }
    }

    return error.length > 0 ? error : null;
  }

  checkNeighbors(graph, edge, source, target) {
    var sourceValue = graph.model.getValue(source);
    var targetValue = graph.model.getValue(target);
    var isValid = !this.validNeighborsAllowed;
    var valid = this.validNeighbors;

    for (var j = 0; j < valid.length; j++) {
      if (this.source && this.checkType(graph, targetValue, valid[j])) {
        isValid = this.validNeighborsAllowed;
        break;
      } else if (!this.source && this.checkType(graph, sourceValue, valid[j])) {
        isValid = this.validNeighborsAllowed;
        break;
      }
    }

    return isValid;
  }

  checkTerminal(graph, terminal, edge) {
    var value = graph.model.getValue(terminal);
    return this.checkType(graph, value, this.type, this.attr, this.value);
  }

  checkType(graph, value, type, attr, attrValue) {
    if (value != null) {
      if (!isNaN(value.nodeType)) {
        return mxUtils.isNode(value, type, attr, attrValue);
      } else {
        return value == type;
      }
    }

    return false;
  }
}
