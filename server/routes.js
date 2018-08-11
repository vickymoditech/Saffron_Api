/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
    // Insert routes below
    app.use('/api/Teams', require('./api/Team'));
    app.use('/api/Services', require('./api/Service'));
    app.use('/api/Gallerys', require('./api/Gallery'));
    app.use('/api/WebSiteHomes', require('./api/WebSiteHome'));
    app.use('/api/oauths', require('./api/oauth'));
    app.use('/api/things', require('./api/thing'));

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);

    // All other routes should redirect to the app.html
    app.route('/*')
        .get((req, res) => {
            res.sendFile(path.resolve(`${app.get('appPath')}/app.html`));
        });
}
