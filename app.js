const express = require('express');
const connection = require('./config/db-connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

//Route importation.
const products = require('./routes/products');
const customer = require('./routes/customers');
const employee = require('./routes/employees');
const provider = require('./routes/providers');
const purchaseProduct = require('./routes/purchasesProduct');
const saleProduct = require('./routes/salesProduct');
const devolution = require('./routes/devolutions');

const app = express();

//CORS
app.use(cors());

app.use(morgan('dev'));

connection.connect( err => {
    if (err) {
        console.log('Error trying to connect with Data Base: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
});

app.use(bodyParser.json());

app.use('/product', products);
app.use('/customer', customer);
app.use('/employee', employee);
app.use('/provider', provider);

//Processes.
app.use('/purchaseProduct', purchaseProduct);
app.use('/saleProduct', saleProduct);
app.use('/devolution', devolution);

app.listen(3000);



