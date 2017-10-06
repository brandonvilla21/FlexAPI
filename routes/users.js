const express = require('express');
const router = express.Router();
const User = require("../models/user");

router
    .post('/register', (req, res, next) => {
        const user = {
            user_id: null,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        };

        User.register( user, ( error, data ) => {
            return User.response( res, error, data );
        });
    })
    .post('/login', (req, res, next) => {
        const email = req.body.email;
        const password = req.body.password;

        User.login( email, password, ( error, data ) => {
            return User.response( res, error, data );
        });
    })

module.exports = router;