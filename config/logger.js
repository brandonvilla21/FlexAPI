const winston = require('winston');
const dotenv = require('dotenv');

dotenv.config();

// Winston logging
const logger = new (winston.Logger)({
    transports: [ 
        new (winston.transports.File)({ filename: process.env.LOG_FILE_NAME })            
    ]
});

module.exports = logger;