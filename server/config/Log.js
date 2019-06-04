const SimpleNodeLogger = require('simple-node-logger');


class Log {
    // { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }
    static eLogLevel = {
        info: 1,
        warn: 2,
        error: 3
    };
    static Log;
    static opts = {
        logFilePath:'mylogfile.log',
        timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
    };

    constructor() {
        console.log('Log Successfully Initialized');
    }

    /* Init stackify object and logger objects */
    static logInit() {
        this.Log = SimpleNodeLogger.createSimpleLogger(this.opts);
    }

    /* Write log to file and/or stackify */
    static writeLog(Level, message) {
        switch (Level) {
            case 1:
                this.Log.info(message);
                break;
            case 2:
                this.Log.warn(message);
                break;
            case 3:
                this.Log.error(message);
                break;
        }
    }

}

// export the class
module.exports = Log;
