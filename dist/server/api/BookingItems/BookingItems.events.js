'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerEvents = undefined;

var _events = require('events');

var BookingItemsEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
/**
 * BookingItems model events
 */

BookingItemsEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(BookingItems) {
  for (var e in events) {
    let event = events[e];
    BookingItems.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function (doc) {
    BookingItemsEvents.emit(event + ':' + doc._id, doc);
    BookingItemsEvents.emit(event, doc);
  };
}

exports.registerEvents = registerEvents;
exports.default = BookingItemsEvents;
//# sourceMappingURL=BookingItems.events.js.map
