// Include the cluster module
const cluster = require('cluster');
const cpuCount = require('os').cpus().length;

if(cluster.isMaster){

  console.log(`Master ${process.pid} is running`);
  console.log(`Machine's CPUs: `, cpuCount);

  // Create a worker for each CPU
  for (let i = 0; i < cpuCount; i += 1) {
      cluster.fork();
  }

  // Listen for dying workers
  cluster.on('exit', (worker) => {

      // Replace the dead worker
      console.log(`Worker ${worker.id} died :(`);
      cluster.fork();

  });


} else {

  const express = require('express');
  const connection = require('./config/db-connection');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const morgan = require('morgan');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  const path = require('path');
  
  //Route importation.
  const products = require('./routes/products');
  const customer = require('./routes/customers');
  const employee = require('./routes/employees');
  const provider = require('./routes/providers');
  
  const purchaseProduct = require('./routes/purchasesProduct');
  const saleProduct = require('./routes/salesProduct');
  const devolution = require('./routes/devolutions');
  const payment = require('./routes/payments');
  const user = require('./routes/users');
  
  const reports = require('./routes/reports');
  
  const utilities = require('./routes/mysql.utilities');
  
  
  
  const app = express();
  
  //CORS
  app.use(cors({ origin:true, credentials: true }));
  
  app.use(morgan('dev'));
  
  app.use(bodyParser.json());
  
  // Point static path to dist
  app.use(express.static(path.join(__dirname, 'public')));
  
  //Warehouses
  app.use('/product', products);
  app.use('/customer', customer);
  app.use('/employee', employee);
  app.use('/provider', provider);
  app.use('/user', user);
  
  //Processes.
  app.use('/purchaseProduct', purchaseProduct);
  app.use('/saleProduct', saleProduct);
  app.use('/devolution', devolution);
  app.use('/payment', payment);
  
  //Reports
  app.use('/reports', reports)
  
  //Mysql utilities
  app.use('/utilities', utilities)
  
  
  app.listen(process.env.PORT || 5000);
  console.log(`Worker ${cluster.worker.id} running!`);
}
