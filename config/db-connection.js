const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

var conn = mysql.createConnection({ 
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

module.exports =  conn;