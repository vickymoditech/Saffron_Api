let homeDir = require('homedir');

// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP
        || process.env.ip
        || undefined,

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT
        || process.env.PORT
        || 9000,

    // MongoDB connection options
    mongo: {
        //uri: 'mongodb://lanetteam.vicky:VICKYv78@ds135669.mlab.com:35669/online_database'
        //uri: 'mongodb://127.0.0.1:27017/saffron'
        uri: 'mongodb://202.71.13.239:27017/saffron'
    },

    logFile: {
        filePath: homeDir() + '/Saffron'
    },

};
