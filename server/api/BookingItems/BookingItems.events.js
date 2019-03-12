/**
 * BookingItems model events
 */

import {EventEmitter} from 'events';
var BookingItemsEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
BookingItemsEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(BookingItems) {
  for(var e in events) {
    let event = events[e];
    BookingItems.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    BookingItemsEvents.emit(event + ':' + doc._id, doc);
    BookingItemsEvents.emit(event, doc);
  };
}

export {registerEvents};
export default BookingItemsEvents;
