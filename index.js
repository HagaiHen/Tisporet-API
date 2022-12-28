'use strict';
const express =require('express');
const cors = require('cors');
const bodyParser =require('body-parser')
const config = require('./config');
const barberRoutes = require('./routes/barber-routes');
const customerRoutes = require('./routes/customer-routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/api', barberRoutes.routes,customerRoutes.routes);


app.listen(config.port, ()=> console.log('App is listening on url http://' + config.host + ':' + config.port));
