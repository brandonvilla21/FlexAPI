const mysqlDump = require('mysqldump');
const multer = require('multer');

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

  
  uploadRestoreFile(req, res, options);

}

function uploadRestoreFile( req, res, options ) {
  let storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
      cb(null, options.directory);
    },
    filename: (req, file, cb) => {
      const datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
  });


  let = upload = multer({ //multer settings
    storage: storage
  }).single('file');


  upload(req, res, err => {
    console.log(req.file);
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    res.json({ error_code: 0, err_desc: null });
  });
}

module.exports = MysqlUtilities;