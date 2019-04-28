/**
 * Main application file
 */

'use strict';

var _setImmediate2 = require('babel-runtime/core-js/set-immediate');

var _setImmediate3 = _interopRequireDefault(_setImmediate2);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _environment = require('./config/environment');

var _environment2 = _interopRequireDefault(_environment);

require('../server/api/CronJob/index');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _express3 = require('./config/express');

var _express4 = _interopRequireDefault(_express3);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _seed = require('./config/seed');

var _seed2 = _interopRequireDefault(_seed);

var _Socket = require('../server/api/Socket');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');


//const http2 = require('http2');
let https = require('https');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

//todo Swagger
//const swaggerDocument = require('./swagger.json');


_mongoose2.default.connect(_environment2.default.mongo.uri, { useMongoClient: true });
_mongoose2.default.connection.on('error', function (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(-1); // eslint-disable-line no-process-exit
});

(0, _seed2.default)();

// Setup server
let app = (0, _express2.default)();
console.log(__dirname);
app.use((0, _cors2.default)());
app.use('/images', _express2.default.static(__dirname + '/images'));

//todo Swagger
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//var privateKey = fs.readFileSync('server-key.pem').toString();
//var certificate = fs.readFileSync('server-crt.pem').toString();
//var ca = fs.readFileSync('ca-crt.pem').toString();
/*var credentials = {
    key: privateKey, cert: certificate,
    requestCert: false,
    rejectUnauthorized: true
};*/

//let server = https.createServer(credentials, app);
let server = _http2.default.createServer(app);

(0, _Socket.socketOpen)(server);
console.log("socket connection successfully created");
(0, _express4.default)(app);
(0, _routes2.default)(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(_environment2.default.port, _environment2.default.ip, function () {
        console.log('Express server listening on %d, in %s mode', _environment2.default.port, app.get('env'));
    });
}

(0, _setImmediate3.default)(startServer);

// Expose app
exports = module.exports = app;
//# sourceMappingURL=app.js.map
