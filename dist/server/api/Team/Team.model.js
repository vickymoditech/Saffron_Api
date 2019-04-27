'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Team = require('./Team.events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TeamSchema = new _mongoose2.default.Schema({
    id: String,
    name: String,
    image_url: String,
    description: String
});

(0, _Team.registerEvents)(TeamSchema);
exports.default = _mongoose2.default.model('Team', TeamSchema);
//# sourceMappingURL=Team.model.js.map
