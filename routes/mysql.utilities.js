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

router
    .get('/create', (req, res, next) => {

      mysqlDump({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        ifNotExist:true, // Create table if not exist 
        dest:`./${process.env.DB_NAME}_backup.sql` // destination file 
     },function(err){
        if (err) return false;
        
        console.log("File created gg");
     })
        
    })

module.exports = router;