const express = require('express');
const {
    newCustomer,
    getCustomer  
} = require('../controllers/customerController');

const router = express.Router();

router.post('/user', newCustomer);//write
router.get('/user/:id', getCustomer);//read


module.exports = {
    routes: router
}