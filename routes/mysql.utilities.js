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
  .get('/backup', (req, res, next) => {

    const directory = './temp/';

    mkdirp(directory, (err) => {
      if (err) return console.error("mkdirp", err);

      mysqlDump({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ifNotExist: true, // Create table if not exist 
        dest: `${directory}${process.env.DB_NAME}_backup.sql` // destination file 
      },  (err) => {
        if (err) return console.error("mysqlDump", err);

        console.log("File created gg");
        res.download(`${directory}${process.env.DB_NAME}_backup.sql`);
        console.log("File sent gg");


      })


    });


    // mysqlDump({
    //   host: process.env.DB_HOST,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASS,
    //   database: process.env.DB_NAME,
    //   ifNotExist: true, // Create table if not exist 
    //   dest: `${directory}${process.env.DB_NAME}_backup.sql` // destination file 
    // }, function (err) {
    //   if (err) return false;

    //   console.log("File created gg");
    // })

  })

module.exports = router;