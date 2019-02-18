/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';

mongoose.Promise = require('bluebird');
import config from './config/environment';
//import http from 'http';
import cors from 'cors';

import expressConfig from './config/express';
import registerRoutes from './routes';
import seedDatabaseIfNeeded from './config/seed';
import {socketOpen} from '../server/api/Socket';

//const http2 = require('http2');
let https = require('https');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');



mongoose.connect(config.mongo.uri, {useMongoClient: true});
mongoose.connection.on('error', function (err) {
    console.error(`MongoDB connection error: ${err}`);
    process.exit(-1); // eslint-disable-line no-process-exit
});

seedDatabaseIfNeeded();

// Setup server
let app = express();
console.log(__dirname);
app.use(cors());
app.use('/images', express.static(__dirname + '/images'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


var privateKey = fs.readFileSync('server-key.pem').toString();
var certificate = fs.readFileSync('server-crt.pem').toString();
var ca = fs.readFileSync('ca-crt.pem').toString();
var credentials = {
    key: privateKey, cert: certificate,
    requestCert: false,
    rejectUnauthorized: true
};

let server = https.createServer(credentials, app);
//server.setSecure(credentials);

socketOpen(server);
console.log("socket connection successfully created");
expressConfig(app);
registerRoutes(app);

// Start server
function startServer() {
    app.angularFullstack = server.listen(config.port, config.ip, function () {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
    });
}


setImmediate(startServer);

// Expose app
exports = module.exports = app;
