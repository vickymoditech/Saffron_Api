/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import Thing from '../api/thing/thing.model';
import Oauth from '../api/oauth/oauth.model';
import WebsiteHome from '../api/WebSiteHome/WebSiteHome.model';

import {getGuid} from './commonHelper';
import config from './environment/';

export default function seedDatabaseIfNeeded() {
    if(!config.seedDB) {
        return Promise.resolve();
    }


    let promises = [];

    let thingPromise = Thing.find({}).remove()
    .then(() => Thing.create({
        name: 'Development Tools',
        info: 'Integration with popular tools such as Webpack, Babel, TypeScript, Karma, Mocha, ESLint, Protractor, '
              + 'Pug, Stylus, Sass, and Less.'
    }, {
        name: 'Server and Client integration',
        info: 'Built with a powerful and fun stack: MongoDB, Express, Angular, and Node.'
    }, {
        name: 'Smart Build System',
        info: 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of '
              + 'scripts and styles into your app.html'
    }, {
        name: 'Modular Structure',
        info: 'Best practice client and server structures allow for more code reusability and maximum scalability'
    }, {
        name: 'Optimized Build',
        info: 'Build process packs up your templates as a single JavaScript payload, minifies your '
                + 'scripts/css/images, and rewrites asset names for caching.'
    }, {
        name: 'Deployment Ready',
        info: 'Easily deploy your app to Heroku or Openshift with the heroku and openshift subgenerators'
    }))
    .then(() => console.log('finished populating things'))
    .catch(err => console.log('error populating things', err));

    let oauthPromise = Oauth.find({}).remove()
        .then(() => Oauth.create({
            id: getGuid(),
            first_name: "vicky",
            last_name : "modi",
            contact_no : 8401060120,
            email_id : "vicky123modi@gmail.com",
            role : true,
            userId: 'vicky123modi@gmail.com',
            password: 'vicky123'
        }))
        .then(() => console.log('finished populating oauth'))
        .catch(err => console.log('error populating oauth', err));

    let WebsiteHomePromise = WebsiteHome.find({}).remove()
        .then(() => WebsiteHome.create({
            id: getGuid(),
            image_url: "vicky",
            visible:true
        }))
        .then(() => console.log('finished populating WebsiteHome'))
        .catch(err => console.log('error populating WebsiteHome', err));


    promises.push(thingPromise);
    promises.push(oauthPromise);
    promises.push(WebsiteHomePromise);


    return Promise.all(promises);
}
