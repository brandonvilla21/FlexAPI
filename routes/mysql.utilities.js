//-------ATTENTION-------
//This JavaScript file is intented to be just for practical purposes. The usage of this file
//on production can be very dangerous, because it is manipulate from the client side. Which means
//that every user from the client side with the normal privilegies can perfom any destructive actions
//against the datababe from the client side. 
//DO NOT USE THIS MODULE ON PRODUCTION, SPECIALLY THE `/restore` route!.
//Apoko no karnal.
const express = require('express');
const router = express.Router();
const mysqlDump = require('mysqldump');
const fs = require('fs');
const async = require('async');
const mkdirp = require('mkdirp');

router
  .post('/backup', (req, res, next) => {

    const directory = './temp/';

    mkdirp(directory, (err) => {
      if (err) return res.status(500).json({message: "Error handling directories on the backend."});
      

      let db = {
        // host: req.body.host,
        username: req.body.username,
        password: req.body.password,
        // database: req.body.name
      }

      mysqlDump({
        host: process.env.HOST,
        database: process.env.DB_NAME,
        user: db.username,
        password: db.password,
        ifNotExist: true, // Create table if not exist 
        dest: `${directory}${process.env.DB_NAME}_backup.sql` // destination file 
      },  (err) => {
        if (err)
          return res.status(500).json({message: "Wrong credentials."});
        else
          return res.download(`${directory}${process.env.DB_NAME}_backup.sql`);

      })
    });

  })

module.exports = router;