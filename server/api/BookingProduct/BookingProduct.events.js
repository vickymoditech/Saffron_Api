/**
 * BookingProduct model events
 */

import {EventEmitter} from 'events';
var BookingProductEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BookingProductEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(BookingProduct) {
  for(var e in events) {
    let event = events[e];
    BookingProduct.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    BookingProductEvents.emit(event + ':' + doc._id, doc);
    BookingProductEvents.emit(event, doc);
  };
}

export {registerEvents};
export default BookingProductEvents;
