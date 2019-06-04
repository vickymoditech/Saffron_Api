'use strict';
/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {
    // MongoDB connection options
    mongo: {
        //uri: 'mongodb://lanetteam.vicky:VICKYv78@ds135669.mlab.com:35669/online_database'
        //uri: 'mongodb://127.0.0.1:27017/saffron'
        uri: 'mongodb://202.71.13.239:27017/saffron'
    },

    // Seed database on startup
    seedDB: true
};
