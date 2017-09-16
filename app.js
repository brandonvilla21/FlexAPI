const express = require('express');
const connection = require('./config/db-connection');
const bodyParser = require('body-parser');
const cors = require('cors');

//Route importation.
const products = require('./routes/products');
const customer = require('./routes/customers');
const employee = require('./routes/employees');
const provider = require('./routes/providers');
const purchaseProduct = require('./routes/purchasesProduct');

const app = express();

//CORS
app.use(cors());


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


app.listen(3000);



