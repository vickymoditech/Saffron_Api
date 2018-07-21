/**
 * WebSiteHome model events
 */

'use strict';

import {EventEmitter} from 'events';
var WebSiteHomeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
WebSiteHomeEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(WebSiteHome) {
  for(var e in events) {
    let event = events[e];
    WebSiteHome.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    WebSiteHomeEvents.emit(event + ':' + doc._id, doc);
    WebSiteHomeEvents.emit(event, doc);
  };
}

export {registerEvents};
export default WebSiteHomeEvents;
