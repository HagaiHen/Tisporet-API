const express = require('express');
const {
    newCustomer,
    getCustomer,  
    newReview
} = require('../controllers/customerController');

const router = express.Router();

router.post('/user', newCustomer);//write
router.get('/user/:id', getCustomer);//read
router.post('/barber/:id/reviews', newReview);//write


module.exports = {
    routes: router
}