import { mxEventObject } from '@mxgraph/util/mxEventObject';

export class mxEventSource {
  eventListeners = null;
  eventsEnabled = true;
  eventSource = null;

  constructor(eventSource) {
    this.setEventSource(eventSource);
  }

  isEventsEnabled() {
    return this.eventsEnabled;
  }

  setEventsEnabled(value) {
    this.eventsEnabled = value;
  }

  getEventSource() {
    return this.eventSource;
  }

  setEventSource(value) {
    this.eventSource = value;
  }

  addListener(name, funct) {
    if (this.eventListeners == null) {
      this.eventListeners = [];
    }

    this.eventListeners.push(name);
    this.eventListeners.push(funct);
  }

  removeListener(funct) {
    if (this.eventListeners != null) {
      var i = 0;

      while (i < this.eventListeners.length) {
        if (this.eventListeners[i + 1] == funct) {
          this.eventListeners.splice(i, 2);
        } else {
          i += 2;
        }
      }
    }
  }

  fireEvent(evt, sender) {
    if (this.eventListeners != null && this.isEventsEnabled()) {
      if (evt == null) {
        evt = new mxEventObject();
      }

      if (sender == null) {
        sender = this.getEventSource();
      }

      if (sender == null) {
        sender = this;
      }

      var args = [sender, evt];

      for (var i = 0; i < this.eventListeners.length; i += 2) {
        var listen = this.eventListeners[i];

        if (listen == null || listen == evt.getName()) {
          this.eventListeners[i + 1].apply(this, args);
        }
      }
    }
  }
}
