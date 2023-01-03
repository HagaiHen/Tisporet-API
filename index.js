'use strict';
const express =require('express');
const cors = require('cors');
const bodyParser =require('body-parser')
const config = require('./config');
const barberRoutes = require('./routes/barber-routes');
const orderRoutes = require('./routes/order-routes');
const app = express();
require = require('moment')

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/api', barberRoutes.routes);
app.use('/api', orderRoutes.routes);

app.listen(config.port, ()=> console.log('App is listening on url http://localhost:' + config.port));
