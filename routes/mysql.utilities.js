//-------ATTENTION-------
//This JavaScript file is intented to be just for practical purposes. The usage of this file
//on production can be very dangerous, because it is manipulate from the client side. Which means
//that every user from the client side with the normal privilegies can perfom any destructive actions
//against the datababe from the client side. 
//DO NOT USE THIS MODULE ON PRODUCTION, SPECIALLY THE `/restore` route!.
//Apoko no karnal.
const express = require('express');
const router = express.Router();
const fs = require('fs');
const async = require('async');
const mkdirp = require('mkdirp');
const MysqlUtilities = require('../services/mysql.files.utilities');
const directory = './temp/';

router
  .post('/backup', (req, res, next) => {

    mkdirp(directory, (err) => {
      if (err) return res.status(500).json({message: "Error handling directories on the backend."});
      
      const db = { username: req.body.username, password: req.body.password }
      const options = { directory, db }

      return MysqlUtilities.backup(res, options);
    });

  })

  .post('/restore', (req, res, next) => {
        mkdirp(directory, (err) => {
          if (err) return res.status(500).json({message: "Error handling directories on the backend."});
          
          const db = { username: req.get('username'), password: req.get('pass') }
          const options = { directory, db }
    
          return MysqlUtilities.restore(req, res, options);
        });
    
      })



module.exports = router;