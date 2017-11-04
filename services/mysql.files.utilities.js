const mysqlDump = require('mysqldump');
const multer = require('multer');
const async = require('async');
const importer = require('node-mysql-importer');
const mysql = require('mysql');

let MysqlUtilities = {};

MysqlUtilities.backup = (res, options) => {
  mysqlDump({
    host: process.env.HOST,
    database: process.env.DB_NAME,
    user: options.db.username,
    password: options.db.password,
    dest: `${options.directory}${process.env.DB_NAME}_backup.sql` // destination file 
  }, (err) => {
    if (err)
      return res.status(500).json({ message: "Wrong credentials." });
    else
      return res.download(`${options.directory}${process.env.DB_NAME}_backup.sql`);

  });
}

MysqlUtilities.restore = (req, res, options) => {

  async.waterfall([
    cb => { setFileEnvironment(req, res, options, cb) },
    (req, res, upload, cb) => { importDatabase(req, res, options.db.username, options.db.password, upload, cb) }
  ],

    error => {
      if (error) res.status(500).json(error);
      res.status(200).json({ message: "Success while restoring database." });
      console.log("Success en Waterfall :v");
    });

}


function importDatabase(req, res, username, password, upload, cb) {

  importer.config({
    'host': process.env.DB_HOST,
    'user': username,
    'password': password,
    'database': process.env.DB_NAME
  });

  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: username,
    password: password,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    multipleStatements: process.env.MULTI_STATEMENTS

  });

  conn.connect(err => {
    if (err) {
      console.log('Error trying to connect with Data Base: ' + err.stack);
      return cb(err);
    }

    console.log('Valid Credentials');



    conn.query("CALL procDropAllTables()", (error, result) => {
      if (error) return cb(error);

      //Importing database.
      importer.importSQL('./temp/uploadedRestore.sql')
        .then(() => {


          upload(req, res, err => {

            console.log(req.file);
            if (err) return cb(err);

            conn.end();
            return cb(null);

          });


        }).catch(err => {
          
          console.log(`error on Promise.catch: ${err}`);
          conn.end();
          return cb(err);

        })
    })

  });

}


function setFileEnvironment(req, res, options, cb) {

  let storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
      cb(null, options.directory);
    },
    filename: (req, file, cb) => {
      const datetimestamp = Date.now();
      cb(null, 'uploadedRestore' + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
  });


  let = upload = multer({ //multer settings
    storage: storage
  }).single('file');

  cb(null, req, res, upload);

}

module.exports = MysqlUtilities;