const mysqlDump = require('mysqldump');

let MysqlUtilities = {};

MysqlUtilities.backup = ( res, options ) => {
  mysqlDump({
    host: process.env.HOST,
    database: process.env.DB_NAME,
    user: options.db.username,
    password: options.db.password,
    ifNotExist: true, // Create table if not exist 
    dest: `${options.directory}${process.env.DB_NAME}_backup.sql` // destination file 
  },  (err) => {
    if (err)
      return res.status(500).json({message: "Wrong credentials."});
    else
      return res.download(`${options.directory}${process.env.DB_NAME}_backup.sql`);
  
  });
}

module.exports = MysqlUtilities;