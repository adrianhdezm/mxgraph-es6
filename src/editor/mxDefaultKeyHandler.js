import { mxEvent } from '@mxgraph/util/mxEvent';
import { mxEventObject } from '@mxgraph/util/mxEventObject';
import { mxKeyHandler } from '@mxgraph/handler/mxKeyHandler';

export class mxDefaultKeyHandler {
  editor = null;
  handler = null;

  constructor(editor) {
    if (editor != null) {
      this.editor = editor;
      this.handler = new mxKeyHandler(editor.graph);
      var old = this.handler.escape;

      this.handler.escape = function (evt) {
        old.apply(this, arguments);
        editor.hideProperties();
        editor.fireEvent(new mxEventObject(mxEvent.ESCAPE, 'event', evt));
      };
    }
  }

  bindAction(code, action, control) {
    var keyHandler = () => {
      this.editor.execute(action);
    };

    if (control) {
      this.handler.bindControlKey(code, keyHandler);
    } else {
      this.handler.bindKey(code, keyHandler);
    }
  }

  destroy() {
    this.handler.destroy();
    this.handler = null;
  }
}
