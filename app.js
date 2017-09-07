const express = require('express');
const connection = require('./config/db-connection');
const bodyParser = require('body-parser');
const products = require('./routes/products');
const customer = require('./routes/customers');

connection.connect( err => {
    if (err) {
        console.log('Error trying to connect with Data Base: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
});

const app = express();

app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-type");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

app.use('/product', products);
app.use('/customer', customer);

app.listen(3000);



