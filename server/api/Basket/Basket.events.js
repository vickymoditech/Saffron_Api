/**
 * Basket model events
 */

import {EventEmitter} from 'events';
var BasketEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BasketEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Basket) {
  for(var e in events) {
    let event = events[e];
    Basket.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    BasketEvents.emit(event + ':' + doc._id, doc);
    BasketEvents.emit(event, doc);
  };
}

export {registerEvents};
export default BasketEvents;
